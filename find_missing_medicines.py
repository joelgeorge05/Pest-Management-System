import json
import os

def find_missing_medicines():
    base_dir = r"c:\Users\Acer\OneDrive\Videos\Pictures\Documents\Desktop\pest\backend"
    class_idx_path = os.path.join(base_dir, "class_indices_final.json")
    treat_map_path = os.path.join(base_dir, "data", "model_treatment_map.json")
    
    with open(class_idx_path, 'r') as f:
        classes = list(json.load(f).keys())
        
    with open(treat_map_path, 'r') as f:
        mapped = list(json.load(f).keys())
        
    missing = set(classes) - set(mapped)
    
    print(f"Total classes: {len(classes)}")
    print(f"Mapped classes (have medicine): {len(mapped)}")
    print(f"Classes WITHOUT medicine recommendations: {len(missing)}\n")
    
    print("List of pests/diseases with NO medicine:")
    for c in sorted(list(missing)):
        print(f"- {c}")

if __name__ == "__main__":
    find_missing_medicines()
