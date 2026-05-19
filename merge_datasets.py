import os
import shutil


# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'backend', 'data')

SOURCE_OLD = os.path.join(DATA_DIR, 'merged_dataset') # PlantVillage + Augmentation
SOURCE_NEW = os.path.join(DATA_DIR, 'IP102', 'formatted') # IP102 Detection

DEST_DIR = os.path.join(DATA_DIR, 'final_complete_dataset')

import random

def copy_dataset(src_root, dest_root, suffix="", is_flat=False):
    """
    Copies images. 
    If is_flat=True, splits classes into train/validation (80/20) at dest.
    If is_flat=False, expects src_root/train and src_root/validation.
    """
    if not os.path.exists(src_root):
        print(f"Source not found: {src_root}")
        return

    if is_flat:
        # Source has classes directly: src/Apple_scab/...
        print(f"Processing FLAT dataset from {src_root}...")
        classes = [d for d in os.listdir(src_root) if os.path.isdir(os.path.join(src_root, d))]
        
        for cls in classes:
            src_cls_dir = os.path.join(src_root, cls)
            if not os.path.isdir(src_cls_dir): continue
            
            dest_cls_name = cls + suffix
            
            # Get images
            images = [f for f in os.listdir(src_cls_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png', '.bmp'))]
            random.shuffle(images)
            
            split_idx = int(len(images) * 0.8)
            train_imgs = images[:split_idx]
            val_imgs = images[split_idx:]
            
            # Copy Train
            dest_train = os.path.join(dest_root, 'train', dest_cls_name)
            os.makedirs(dest_train, exist_ok=True)
            for img in train_imgs:
                 shutil.copy2(os.path.join(src_cls_dir, img), os.path.join(dest_train, img))
                 
            # Copy Val
            dest_val = os.path.join(dest_root, 'validation', dest_cls_name)
            os.makedirs(dest_val, exist_ok=True)
            for img in val_imgs:
                 shutil.copy2(os.path.join(src_cls_dir, img), os.path.join(dest_val, img))
                 
    else:
        # Source has train/validation subfolders
        for split in ['train', 'validation']:
            src_split = os.path.join(src_root, split)
            dest_split = os.path.join(dest_root, split)
            
            if not os.path.exists(src_split):
                continue
                
            print(f"Processing {split} from {src_root}...")
            
            classes = os.listdir(src_split)
            for cls in classes:
                src_cls_dir = os.path.join(src_split, cls)
                if not os.path.isdir(src_cls_dir):
                    continue
                    
                dest_cls_dir = os.path.join(dest_split, cls + suffix)
                os.makedirs(dest_cls_dir, exist_ok=True)
                
                # Copy images
                for img in os.listdir(src_cls_dir):
                    src_img = os.path.join(src_cls_dir, img)
                    dest_img = os.path.join(dest_cls_dir, img)
                    
                    if not os.path.exists(dest_img):
                        shutil.copy2(src_img, dest_img)

def main():
    print("--- Merging Datasets ---")
    print(f"Source 1 (Old): {SOURCE_OLD}")
    print(f"Source 2 (New): {SOURCE_NEW}")
    print(f"Destination: {DEST_DIR}")
    
    # 1. Copy Old Dataset (Assume Flat based on inspection)
    # The 'merged_dataset' is typically flat after the previous merge step (Step 1 of project)
    copy_dataset(SOURCE_OLD, DEST_DIR, is_flat=True)
    
    # 2. Copy New Dataset (Formatted by prepare_ip102.py, so it has train/val)
    copy_dataset(SOURCE_NEW, DEST_DIR, is_flat=False)
    
    print("\nMerge Complete!")
    
    # helper stat
    train_dir = os.path.join(DEST_DIR, 'train')
    if os.path.exists(train_dir):
        msg = f"Total Classes: {len(os.listdir(train_dir))}"
        print(msg)

if __name__ == "__main__":
    main()
