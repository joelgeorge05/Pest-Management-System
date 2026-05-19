import json
import os

def generate_markdown():
    path = "backend/class_indices_final.json"
    if not os.path.exists(path):
        print("File not found")
        return

    with open(path, 'r') as f:
        # The file format we saw was {"Label": index}
        data = json.load(f)
        
    # Invert to get list of names
    labels = sorted(data.keys())
    
    # Categorize
    diseases = {} # crop -> [diseases]
    pests = []
    
    for label in labels:
        if "_" in label and label[0].isupper() and "healthy" not in label.lower():
            # Likely a PlantVillage disease (e.g. Apple_Black_rot)
            # Exception: Some pests might be Capitalized? IP102 has some like 'Adristyrannus'
            # Heuristic: PlantVillage usually format is Crop_Disease
            parts = label.split('_', 1)
            if len(parts) == 2:
                crop = parts[0]
                disease = parts[1].replace("_", " ")
                if crop not in diseases: diseases[crop] = []
                diseases[crop].append(disease)
            else:
                pests.append(label)
        elif "healthy" in label.lower():
            # Healthy plants
            parts = label.split('_')
            crop = parts[0]
            if crop not in diseases: diseases[crop] = []
            diseases[crop].append("Healthy")
        else:
            # Likely a pest (lowercase or single word)
            pests.append(label)

    print("## Supported Pests & Diseases")
    print("\n### 🌿 Crop Diseases (PlantVillage)")
    print("| Crop | Conditions Detected |")
    print("| :--- | :--- |")
    for crop, conditions in diseases.items():
        print(f"| **{crop}** | {', '.join(conditions)} |")

    print("\n### 🐛 Pests (IP102)")
    # Group pests in chunks of 3 for readability
    print("| Common Name | Scientific/Other Name |")
    print("| :--- | :--- |")
    
    # Just list them nicely
    # Since IP102 is mixed, let's just output a list or table
    # Let's simple list them
    
    print("\n**Detected Pests:**")
    print(", ".join([p.replace("_", " ") for p in pests]))

if __name__ == "__main__":
    generate_markdown()
