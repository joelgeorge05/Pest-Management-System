import os
import shutil
import random
import argparse

def split_dataset(source_dir, dest_dir, split_ratio=0.8):
    """
    Splits a dataset into train and validation sets.
    
    Structure of source_dir:
    source_dir/
        class_1/
            img1.jpg
            ...
        class_2/
            ...
            
    Structure of dest_dir:
    dest_dir/
        train/
            class_1/
            class_2/
        validation/
            class_1/
            class_2/
    """
    
    if not os.path.exists(source_dir):
        print(f"Error: Source directory '{source_dir}' not found.")
        return

    train_dir = os.path.join(dest_dir, 'train')
    val_dir = os.path.join(dest_dir, 'validation')

    # Create destination directories
    os.makedirs(train_dir, exist_ok=True)
    os.makedirs(val_dir, exist_ok=True)

    classes = [d for d in os.listdir(source_dir) if os.path.isdir(os.path.join(source_dir, d))]
    
    print(f"Found {len(classes)} classes in '{source_dir}'.")
    print(f"Splitting into '{train_dir}' and '{val_dir}' with ratio {split_ratio}...")

    total_images = 0
    
    for class_name in classes:
        src_class_path = os.path.join(source_dir, class_name)
        train_class_path = os.path.join(train_dir, class_name)
        val_class_path = os.path.join(val_dir, class_name)
        
        os.makedirs(train_class_path, exist_ok=True)
        os.makedirs(val_class_path, exist_ok=True)
        
        images = [f for f in os.listdir(src_class_path) if f.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp', '.tiff'))]
        random.shuffle(images)
        
        split_point = int(len(images) * split_ratio)
        train_images = images[:split_point]
        val_images = images[split_point:]
        
        # Copy files
        for img in train_images:
            shutil.copy2(os.path.join(src_class_path, img), os.path.join(train_class_path, img))
            
        for img in val_images:
            shutil.copy2(os.path.join(src_class_path, img), os.path.join(val_class_path, img))
            
        print(f"  {class_name}: {len(train_images)} train, {len(val_images)} val")
        total_images += len(images)

    print(f"\nSuccess! Processed {total_images} images.")
    print(f"Dataset ready at: {dest_dir}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Split dataset into train/validation')
    parser.add_argument('--source', type=str, required=True, help='Path to source folder containing class subfolders')
    parser.add_argument('--dest', type=str, default=os.path.join(os.path.dirname(__file__), 'data', 'final_complete_dataset'), help='Destination directory')
    parser.add_argument('--ratio', type=float, default=0.8, help='Training split ratio (0.0 to 1.0)')
    
    args = parser.parse_args()
    
    split_dataset(args.source, args.dest, args.ratio)
