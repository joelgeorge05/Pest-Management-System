import json
import os
import re

def normalize_key(key):
    # Try different normalization strategies
    # 1. Replace ___ with _
    k1 = key.replace('___', '_')
    # 2. Remove (maize) or other text in parens if needed? 
    # Let's just return basic variations
    return k1

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    class_indices_path = os.path.join(base_dir, 'class_indices_final.json')
    treatments_path = os.path.join(base_dir, 'data', 'existing_treatments.json')
    output_path = os.path.join(base_dir, 'data', 'model_treatment_map.json')

    with open(class_indices_path, 'r') as f:
        class_indices = json.load(f) # {"ClassName": 0, ...}
    
    with open(treatments_path, 'r') as f:
        treatments = json.load(f) # {"Key": {...}, ...}

    # Invert class_indices just in case we need index -> treatment, 
    # but app.py uses labels. So we need Label -> Treatment Data.
    
    treatment_keys = set(treatments.keys())
    model_classes = list(class_indices.keys())

    mapping = {}
    
    matched_count = 0
    
    print(f"Total Model Classes: {len(model_classes)}")
    print(f"Total Treatment Keys: {len(treatment_keys)}")

    # Strategy: standardize both sides to find matches
    # We want a map: Model_Class_Name -> Treatment_Key_In_Json
    
    # Heuristic normalization helper
    def clean(s):
        s = s.replace('___', '_')
        s = s.replace('(', '').replace(')', '')
        s = s.replace(' ', '_')
        s = s.lower()
        return s

    # Create a lookup for treatment keys based on cleaned version
    treatment_lookup = {clean(k): k for k in treatment_keys}

    for model_class in model_classes:
        # Direct match?
        if model_class in treatments:
            mapping[model_class] = model_class
            matched_count += 1
            continue

        # Cleaned match?
        cleaned_model = clean(model_class)
        # Attempt to match against cleaned treatment keys
        
        # Specific fix for Corn (maize) -> Corn
        # The model has "Corn_Common_rust", treatment has "Corn_(maize)___Common_rust_"
        
        # Custom fixes for known discrepancies
        if "cherry" in cleaned_model and "sour" not in cleaned_model:
             # Try matching against the (including_sour) version
             alt_key = cleaned_model.replace("cherry", "cherry_including_sour")
             if alt_key in treatment_lookup:
                 mapping[model_class] = treatment_lookup[alt_key]
                 matched_count += 1
                 continue
        
        if "corn" in cleaned_model and "maize" not in cleaned_model:
             alt_key = cleaned_model.replace("corn", "corn_maize")
             # Also handle the Common_rust case which might have a trailing underscore or different spacing
             if alt_key in treatment_lookup:
                 mapping[model_class] = treatment_lookup[alt_key]
                 matched_count += 1
                 continue
             # Try other variations for corn
             # e.g. corn_common_rust -> corn_maize_common_rust_
             if "common_rust" in cleaned_model:
                 # Check specific lookup
                 target = "corn_maize_common_rust_"
                 if target in treatment_lookup:
                      mapping[model_class] = treatment_lookup[target]
                      matched_count += 1
                      continue

        if "tomato_spider_mites" in cleaned_model:
             # Handle hyphen mismatch: two_spotted vs two-spotted
             alt_key = cleaned_model.replace("two_spotted", "two-spotted")
             if alt_key in treatment_lookup:
                 mapping[model_class] = treatment_lookup[alt_key]
                 matched_count += 1
                 continue
        
        if "yellowleaf" in cleaned_model:
             # Handle YellowLeaf vs Yellow_Leaf
             alt_key = cleaned_model.replace("yellowleaf", "yellow_leaf")
             if alt_key in treatment_lookup:
                 mapping[model_class] = treatment_lookup[alt_key]
                 matched_count += 1
                 continue

        if cleaned_model in treatment_lookup:
            mapping[model_class] = treatment_lookup[cleaned_model]
            matched_count += 1
        else:
             # Print potential misses that look like they might belong (heuristic: contains similar words?)
             # Just print all misses for now if they start with a known crop
             known_crops = set([k.split('_')[0] for k in treatment_lookup.keys()])
             crop_prefix = cleaned_model.split('_')[0]
             if crop_prefix in known_crops:
                 print(f"Missed PV-like: {model_class} (Cleaned: {cleaned_model})")

    print(f"Successfully mapped: {matched_count} / {len(model_classes)}")
    
    # Save the mapping
    with open(output_path, 'w') as f:
        json.dump(mapping, f, indent=2)
    
    print(f"Mapping saved to {output_path}")

    # Also, let's create a full merged JSON for easier loading: { "ModelClass": { ...treatment_data... } }
    full_db = {}
    for model_cls, treat_key in mapping.items():
        full_db[model_cls] = treatments[treat_key]
    
    # For classes without treatments, we can verify what's missing
    # IP102 classes won't be in PlantVillage treatments
    
    full_db_path = os.path.join(base_dir, 'data', 'treatment_lookup.json')
    with open(full_db_path, 'w') as f:
        json.dump(full_db, f, indent=2)
    print(f"Full lookup DB saved to {full_db_path}")

if __name__ == "__main__":
    main()
