import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, models, transforms
from torch.utils.data import DataLoader, WeightedRandomSampler
import os
import json
import time
import copy
import numpy as np

# Configuration
DATA_DIR = os.path.join(os.path.dirname(__file__), "data", "final_complete_dataset")
MODEL_SAVE_PATH = os.path.join(os.path.dirname(__file__), "model_swin.pth")
INDICES_SAVE_PATH = os.path.join(os.path.dirname(__file__), "class_indices_improved.json")
LOG_PATH = os.path.join(os.path.dirname(__file__), "training_swin.log")

IMG_SIZE = (224, 224)
BATCH_SIZE = 32  # Optimized Batch Size
EPOCHS_HEAD = 3 # Reduced from 5
EPOCHS_FINE = 7 # Reduced from 15

# Early Stopping Class
class EarlyStopping:
    def __init__(self, patience=3, min_delta=0.0):
        self.patience = patience
        self.min_delta = min_delta
        self.counter = 0
        self.best_loss = None
        self.early_stop = False

    def __call__(self, val_loss):
        if self.best_loss is None:
            self.best_loss = val_loss
        elif val_loss > self.best_loss - self.min_delta:
            self.counter += 1
            if self.counter >= self.patience:
                self.early_stop = True
        else:
            self.best_loss = val_loss
            self.counter = 0

def get_class_weights(dataset):
    targets = torch.tensor(dataset.targets)
    class_sample_count = torch.tensor(
        [(targets == t).sum() for t in torch.unique(targets, sorted=True)])
    weight = 1. / class_sample_count.float()
    samples_weight = torch.tensor([weight[t] for t in targets])
    return samples_weight

def train_model(model, dataloaders, dataset_sizes, criterion, optimizer, scheduler, num_epochs=25, device='cpu', dry_run=False):
    pass # Replaced by train_with_checkpoint logic below

def main():
    import argparse
    parser = argparse.ArgumentParser(description='Train Swin Transformer')
    parser.add_argument('--epochs', type=int, default=10, help='Total epochs')
    parser.add_argument('--dry-run', action='store_true', help='Run a short training for testing')
    args = parser.parse_args()

    global EPOCHS_HEAD, EPOCHS_FINE
    if args.dry_run:
        print("DRY RUN MODE ENABLED")
        EPOCHS_HEAD = 1
        EPOCHS_FINE = 1
    
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")

    # Data Transforms (Same sturdy augmentation)
    data_transforms = {
        'train': transforms.Compose([
            transforms.RandomResizedCrop(IMG_SIZE, scale=(0.8, 1.0)),
            transforms.RandomRotation(30),
            transforms.RandomHorizontalFlip(),
            transforms.RandomVerticalFlip(p=0.2),
            transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
            transforms.RandomAffine(degrees=0, translate=(0.1, 0.1)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ]),
        'validation': transforms.Compose([
            transforms.Resize((256, 256)),
            transforms.CenterCrop(IMG_SIZE),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ]),
    }

    print(f"Loading data from {DATA_DIR}...")
    image_datasets = {x: datasets.ImageFolder(os.path.join(DATA_DIR, x), data_transforms[x])
                      for x in ['train', 'validation']}
    
    print("Computing class weights...")
    samples_weight = get_class_weights(image_datasets['train'])
    sampler = WeightedRandomSampler(samples_weight, len(samples_weight))

    dataloaders = {
        'train': DataLoader(image_datasets['train'], batch_size=BATCH_SIZE, sampler=sampler, num_workers=4, pin_memory=True),
        'validation': DataLoader(image_datasets['validation'], batch_size=BATCH_SIZE, shuffle=False, num_workers=4, pin_memory=True)
    }
    
    dataset_sizes = {x: len(image_datasets[x]) for x in ['train', 'validation']}
    class_names = image_datasets['train'].classes
    
    print(f"Classes: {len(class_names)}")
    
    
    # Checkpoint Logic
    CHECKPOINT_FILE = "checkpoint_swin.pth"
    CHECKPOINT_PATH = os.path.join(os.path.dirname(__file__), CHECKPOINT_FILE)
    
    start_epoch = 0
    start_phase = 'head' # 'head' or 'fine'
    
    
    # Init Swin Transformer
    print("Initializing Swin Transformer (Tiny)...")
    try:
        weights = models.Swin_T_Weights.IMAGENET1K_V1
    except AttributeError:
        weights = 'DEFAULT'
        
    model = models.swin_t(weights=weights)

    # Freeze all layers initially
    for param in model.parameters():
        param.requires_grad = False

    # Replace Head
    num_ftrs = model.head.in_features
    # Start with standard head for new architecture
    model.head = nn.Sequential(
        nn.Dropout(p=0.3),
        nn.Linear(num_ftrs, len(class_names))
    )

    model = model.to(device)
    criterion = nn.CrossEntropyLoss()
    
    # Optimizers
    optimizer_head = optim.Adam(model.head.parameters(), lr=0.001)
    optimizer_fine = optim.Adam(model.parameters(), lr=0.00005)
    scheduler = optim.lr_scheduler.StepLR(optimizer_fine, step_size=5, gamma=0.1)

    # Check for resume or transfer from previous model (Smart Weight Expansion)
    if os.path.exists(CHECKPOINT_PATH):
        print(f"Resuming from checkpoint: {CHECKPOINT_PATH}")
        try:
            checkpoint = torch.load(CHECKPOINT_PATH)
            # Check for class mismatch in checkpoint vs current
            saved_classes = checkpoint.get('class_names', [])
            if len(saved_classes) != len(class_names):
                 print(f"⚠️ Class mismatch in checkpoint! Saved: {len(saved_classes)}, Current: {len(class_names)}. Starting fresh head training.")
                 # We can't easily resume optimizer state if shapes changed, so we treat as Transfer Learning
                 # Load backbone weights? No, checkpoint has full model state.
                 # Better to load MODEL_SAVE_PATH if exists for Transfer Learning
            else:
                model.load_state_dict(checkpoint['model_state_dict'])
                start_epoch = checkpoint['epoch'] + 1
                start_phase = checkpoint['phase']
                
                if start_phase == 'head':
                    optimizer_head.load_state_dict(checkpoint['optimizer_state_dict'])
                elif start_phase == 'fine':
                    for param in model.parameters():
                        param.requires_grad = True
                    optimizer_fine.load_state_dict(checkpoint['optimizer_state_dict'])
                    if 'scheduler_state_dict' in checkpoint and checkpoint['scheduler_state_dict']:
                        scheduler.load_state_dict(checkpoint['scheduler_state_dict'])
                
                print(f"Resuming at Phase: {start_phase}, Epoch: {start_epoch}")
        except Exception as e:
            print(f"Error loading checkpoint: {e}")

    # Transfer Learning from previous best model (if no active checkpoint)
    if start_epoch == 0 and os.path.exists(MODEL_SAVE_PATH):
         print(f"Loading previous best model from {MODEL_SAVE_PATH} for incremental training...")
         try:
             state_dict = torch.load(MODEL_SAVE_PATH, map_location=device)
             
             # Check Head Shape
             # Swin Head is often named 'head.1.weight' and 'head.1.bias' in Sequential
             # or 'head.weight' / 'head.bias' depending on definition.
             # Our definition: model.head = Sequential(Dropout, Linear) -> Linear is module[1]
             
             layer_name_weight = 'head.1.weight'
             layer_name_bias = 'head.1.bias'
             
             if layer_name_weight in state_dict:
                 saved_weight = state_dict[layer_name_weight]
                 saved_bias = state_dict[layer_name_bias]
                 
                 saved_out_features = saved_weight.shape[0]
                 current_out_features = len(class_names)
                 
                 if saved_out_features != current_out_features:
                     print(f"♻️ Detected Class Expansion: {saved_out_features} -> {current_out_features}")
                     
                     # 1. Load Backbone (everything except head)
                     model_dict = model.state_dict()
                     # Filter out head keys
                     pretrained_dict = {k: v for k, v in state_dict.items() if 'head.1.' not in k}
                     model_dict.update(pretrained_dict)
                     model.load_state_dict(model_dict, strict=False)
                     
                     # 2. Smart Weight Expansion for Head
                     # Create new head layer
                     # Copy old weights to corresponding indices
                     # We need to map old class names to new indices if order changed (assuming sorted alphabetical)
                     
                     # Simplest assumption: New classes are added, or we align by name
                     # Let's try to align by name if possible, or just copy first N if appended.
                     # Since we sort classes alphabetically, insertions happen in middle.
                     # We MUST use class names to map correctly.
                     
                     # Check if we have saved class names in a sidecar file?
                     # INDICES_SAVE_PATH has them.
                     prev_indices = {}
                     if os.path.exists(INDICES_SAVE_PATH):
                         with open(INDICES_SAVE_PATH, 'r') as f:
                             prev_indices = json.load(f) # {name: idx} due to previous dump logic?
                             # Logic was: json.dump(class_indices, f) -> {name: idx}
                     
                     if prev_indices:
                         print("Mapping weights by class name...")
                         new_weight = model.head[1].weight.data.clone()
                         new_bias = model.head[1].bias.data.clone()
                         
                         mapped_count = 0
                         for name, old_idx in prev_indices.items():
                             if name in class_names:
                                 new_idx = class_names.index(name)
                                 # Copy weight/bias
                                 if old_idx < saved_out_features:
                                     new_weight[new_idx] = saved_weight[old_idx]
                                     new_bias[new_idx] = saved_bias[old_idx]
                                     mapped_count += 1
                                     
                         print(f"Transferred weights for {mapped_count} classes.")
                         model.head[1].weight.data = new_weight
                         model.head[1].bias.data = new_bias
                     else:
                         print("⚠️ No index file found. Skipping smart weight transfer (training head from scratch).")
                         
                 else:
                     print("Class count matches. Loading full state dict.")
                     model.load_state_dict(state_dict)
             else:
                 print("Could not find head weights in state dict. Loading what matches.")
                 model.load_state_dict(state_dict, strict=False)
                 
         except Exception as e:
             print(f"Error loading previous model: {e}")

    # Training Function with Checkpointing & AMP & Early Stopping
    def train_with_checkpoint(model, optimizer, scheduler, num_epochs, phase_name, start_ep=0):
        since = time.time()
        best_model_wts = copy.deepcopy(model.state_dict())
        best_acc = 0.0
        
        early_stopping = EarlyStopping(patience=3, min_delta=0.01)
        scaler = torch.cuda.amp.GradScaler()
        
        for epoch in range(start_ep, num_epochs):
            print(f'Epoch {epoch}/{num_epochs - 1}')
            print('-' * 10)

            epoch_val_loss = 0.0

            for phase in ['train', 'validation']:
                if phase == 'train':
                    model.train()
                else:
                    model.eval()

                running_loss = 0.0
                running_corrects = 0

                batch_count = 0
                for inputs, labels in dataloaders[phase]:
                    inputs = inputs.to(device)
                    labels = labels.to(device)

                    optimizer.zero_grad()

                    with torch.set_grad_enabled(phase == 'train'):
                        with torch.cuda.amp.autocast(enabled=(phase=='train')):
                            outputs = model(inputs)
                            _, preds = torch.max(outputs, 1)
                            loss = criterion(outputs, labels)

                        if phase == 'train':
                            scaler.scale(loss).backward()
                            scaler.step(optimizer)
                            scaler.update()

                    running_loss += loss.item() * inputs.size(0)
                    running_corrects += torch.sum(preds == labels.data)
                    
                    batch_count += 1
                    if batch_count % 10 == 0:
                         print(f"  Batch {batch_count}/{len(dataloaders[phase])}..")

                    if args.dry_run and batch_count >= 5:
                        break
                
                if phase == 'train' and scheduler:
                    scheduler.step()
                
                current_dataset_size = dataset_sizes[phase]
                if args.dry_run:
                     current_dataset_size = batch_count * dataloaders[phase].batch_size

                epoch_loss = running_loss / current_dataset_size
                epoch_acc = running_corrects.double() / current_dataset_size

                print(f'{phase} Loss: {epoch_loss:.4f} Acc: {epoch_acc:.4f}')

                if phase == 'validation':
                    epoch_val_loss = epoch_loss
                    if epoch_acc > best_acc:
                        best_acc = epoch_acc
                        best_model_wts = copy.deepcopy(model.state_dict())
            
            # Save Checkpoint
            torch.save({
                'epoch': epoch,
                'phase': phase_name,
                'model_state_dict': model.state_dict(),
                'optimizer_state_dict': optimizer.state_dict(),
                'scheduler_state_dict': scheduler.state_dict() if scheduler else None,
                'class_names': class_names
            }, CHECKPOINT_PATH)
            
            # Check Early Stopping (Only in Fine Tuning usually, or both)
            if phase_name == 'fine':
                 early_stopping(epoch_val_loss)
                 if early_stopping.early_stop:
                    print("Early stopping triggered.")
                    break

            print()

        return model

    # Phase 1: Train Head
    if start_phase == 'head':
        print("\nPhase 1: Training Head...")
        model = train_with_checkpoint(model, optimizer_head, None, EPOCHS_HEAD, 'head', start_ep=start_epoch)
        # End of Phase 1, reset for Phase 2
        start_epoch = 0 
        start_phase = 'fine'
        
        torch.save({
                'epoch': -1, 
                'phase': 'fine',
                'model_state_dict': model.state_dict(),
                'optimizer_state_dict': optimizer_fine.state_dict(), 
                'scheduler_state_dict': None,
                 'class_names': class_names
            }, CHECKPOINT_PATH)


    # Phase 2: Fine Tuning
    if start_phase == 'fine':
        print("\nPhase 2: Fine Tuning...")
        for param in model.parameters():
            param.requires_grad = True
        
        model = train_with_checkpoint(model, optimizer_fine, scheduler, EPOCHS_FINE, 'fine', start_ep=start_epoch)

    print(f"Final Swin Model saved to {MODEL_SAVE_PATH}")
    torch.save(model.state_dict(), MODEL_SAVE_PATH)
    
    # Cleanup Checkpoint
    if os.path.exists(CHECKPOINT_PATH):
        os.remove(CHECKPOINT_PATH)
        print("Training complete. Checkpoint removed.")

if __name__ == "__main__":
    main()
