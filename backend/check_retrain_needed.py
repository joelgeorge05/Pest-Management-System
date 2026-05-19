import os
import json

BASE_DIR = r"c:\Users\Acer\OneDrive\Videos\Pictures\Documents\Desktop\pest\backend"
train_dir = os.path.join(BASE_DIR, "data", "final_complete_dataset", "train")
indices_path = os.path.join(BASE_DIR, "class_indices_improved.json")

def check():
    if not os.path.exists(indices_path):
        print("Model indices not found. Retraining needed.")
        return

    with open(indices_path, "r") as f:
        indices = json.load(f)
    
    # Depending on json format (k:v or v:k)
    try:
        first_val = list(indices.values())[0]
        if isinstance(first_val, int):
            model_classes = set(indices.keys())
        else:
            model_classes = set(indices.values())
    except:
        model_classes = set()

    if not os.path.exists(train_dir):
        print("Training directory not found.")
        return

    train_classes = set([d for d in os.listdir(train_dir) if os.path.isdir(os.path.join(train_dir, d))])
    
    new_classes = train_classes - model_classes
    if new_classes:
        print(f"YES. The AI model needs retraining. Found {len(new_classes)} new classes in the dataset not present in the model.")
        for c in list(new_classes)[:5]:
            print(f" - {c}")
        if len(new_classes) > 5:
            print("   ...")
    else:
        print("NO. All classes in the dataset are known to the model.")
        print("However, if new images were added to existing classes, retraining might improve accuracy.")

if __name__ == "__main__":
    check()
