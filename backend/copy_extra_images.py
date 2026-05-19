import os
import shutil
import difflib

src_dir = r"C:\Users\Acer\OneDrive\Videos\Pictures\Documents\Desktop\pest\backend\data\dieases"
dest_dir = r"C:\Users\Acer\OneDrive\Videos\Pictures\Documents\Desktop\pest\backend\data\final_complete_dataset\train"

src_folders = [f for f in os.listdir(src_dir) if os.path.isdir(os.path.join(src_dir, f))]
dest_folders = [f for f in os.listdir(dest_dir) if os.path.isdir(os.path.join(dest_dir, f))]

def normalize_name(name):
    return name.lower().replace(" ", "").replace("_", "")

dest_map = {normalize_name(d): d for d in dest_folders}

total_copied = 0
for src in src_folders:
    src_norm = normalize_name(src)
    
    # Try exact match on normalized name
    match = dest_map.get(src_norm)
    
    # If not found, try fuzzy match
    if not match:
        matches = difflib.get_close_matches(src_norm, dest_map.keys(), n=1, cutoff=0.7)
        if matches:
            match = dest_map[matches[0]]
            
    if match:
        print(f"Mapping '{src}' to '{match}'")
        s_path = os.path.join(src_dir, src)
        d_path = os.path.join(dest_dir, match)
        
        files = [f for f in os.listdir(s_path) if os.path.isfile(os.path.join(s_path, f))]
        for f in files:
            shutil.copy2(os.path.join(s_path, f), os.path.join(d_path, f))
        print(f"  Copied {len(files)} images.")
        total_copied += len(files)
    else:
        print(f"WARNING: Could not find matching destination folder for '{src}'")

print(f"\nTotal images copied: {total_copied}")
