
import os
import shutil
import re

# Config
BASE_DIR = os.path.dirname(__file__)
SOURCE_DIRS = [
    os.path.join(BASE_DIR, "data", "PlantVillage", "PlantVillage"),
    os.path.join(BASE_DIR, "data", "Plant_leave_diseases_dataset_with_augmentation")
]
DEST_DIR = os.path.join(BASE_DIR, "data", "merged_dataset")

def normalize_class_name(name):
    # Specific fix for PlantVillage weirdness: "Pepper__bell" vs "Pepper,_bell"
    # Strategy: Replace comma with nothing or underscore, replace double underscores with single
    # Goal: "Pepper_bell_Bacterial_spot"
    
    # 1. Replace ",_" with "_"
    name = name.replace(",_", "_")
    name = name.replace(",", "_")
    
    # 2. Replace double/triple underscores with single
    name = re.sub(r'_{2,}', '_', name)
    
    # 3. Handle specific formatting if needed (e.g. space to underscore)
    name = name.replace(" ", "_")
    
    return name

def merge_datasets():
    print(f"Merging datasets into {DEST_DIR}...")
    
    if os.path.exists(DEST_DIR):
        print("Cleaning previous merged dataset...")
        shutil.rmtree(DEST_DIR)
    
    os.makedirs(DEST_DIR)
    
    total_images = 0
    
    for source in SOURCE_DIRS:
        print(f"\nProcessing source: {source}")
        if not os.path.exists(source):
            print(f"Skipping (not found): {source}")
            continue
            
        for class_name in os.listdir(source):
            class_path = os.path.join(source, class_name)
            if not os.path.isdir(class_path):
                continue
                
            normalized_name = normalize_class_name(class_name)
            dest_class_path = os.path.join(DEST_DIR, normalized_name)
            
            if not os.path.exists(dest_class_path):
                os.makedirs(dest_class_path)
                
            # Copy files
            files = os.listdir(class_path)
            print(f"  Mapping '{class_name}' -> '{normalized_name}' ({len(files)} files)")
            
            for f in files:
                src_file = os.path.join(class_path, f)
                # To avoid name collisions, prefix with source folder hash or just random unique str if needed
                # But simple copy often works if filenames are unique enough
                # safeguard: if file exists, append a suffix
                try:
                    if os.path.isfile(src_file):
                        dest_file = os.path.join(dest_class_path, f)
                        if os.path.exists(dest_file):
                            name, ext = os.path.splitext(f)
                            dest_file = os.path.join(dest_class_path, f"{name}_dup{ext}")
                        
                        shutil.copy2(src_file, dest_file)
                        total_images += 1
                except Exception as e:
                    print(f"Error copying {f}: {e}")

    print(f"\nMerge Complete! Total Images: {total_images}")
    print(f"Output Directory: {DEST_DIR}")

if __name__ == "__main__":
    merge_datasets()
