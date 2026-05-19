import os
import shutil
import tarfile
import zipfile
import xml.etree.ElementTree as ET
import random


# Configuration
DATA_ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend', 'data')
IP102_ROOT = os.path.join(DATA_ROOT, 'IP102_v1.1', 'Detection', 'VOC2007')
IMAGES_TAR = os.path.join(IP102_ROOT, 'JPEGImages.tar')
ANNOTATIONS_TAR = os.path.join(IP102_ROOT, 'Annotations.tar')
CLASSES_TXT = os.path.join(DATA_ROOT, 'IP102_repo', 'classes.txt')

OUTPUT_DIR = os.path.join(DATA_ROOT, 'IP102', 'formatted')

def parse_classes(classes_file):
    class_map = {}
    if not os.path.exists(classes_file):
        # Fallback search
        alt_path = os.path.join(DATA_ROOT, 'IP102_v1.1', 'Classification', 'classes.txt')
        if os.path.exists(alt_path):
            classes_file = alt_path
        else:
            print("Error: classes.txt not found!")
            return {}

    with open(classes_file, 'r') as f:
        for line in f:
            parts = line.strip().split()
            if len(parts) >= 2:
                cid = parts[0]
                cname = " ".join(parts[1:])
                # Clean name
                cname = cname.replace(' ', '_').replace('(', '').replace(')', '')
                class_map[cid] = cname
    return class_map

def extract_tars():
    global IMAGES_TAR, ANNOTATIONS_TAR, IP102_ROOT
    print("Extracting tars...")
    if not os.path.exists(IMAGES_TAR) or not os.path.exists(ANNOTATIONS_TAR):
        print(f"Error: Tars not found in {IP102_ROOT}")
        print("Searching recursively...")
        # Emergency search
        for root, dirs, files in os.walk(DATA_ROOT):
            if 'JPEGImages.tar' in files:

                IP102_ROOT = root
                IMAGES_TAR = os.path.join(root, 'JPEGImages.tar')
                ANNOTATIONS_TAR = os.path.join(root, 'Annotations.tar')
                print(f"Found at {IP102_ROOT}")
                break
    
    # Extract to temp dirs
    if os.path.exists(IMAGES_TAR):
        with tarfile.open(IMAGES_TAR, 'r') as t:
            t.extractall(IP102_ROOT)
    
    if os.path.exists(ANNOTATIONS_TAR):
        with tarfile.open(ANNOTATIONS_TAR, 'r') as t:
            t.extractall(IP102_ROOT)

def process_dataset(class_map):
    annotations_dir = os.path.join(IP102_ROOT, 'Annotations')
    images_dir = os.path.join(IP102_ROOT, 'JPEGImages')
    
    if not os.path.exists(annotations_dir):
        print("Annotations folder not extracted!")
        return

    xml_files = [f for f in os.listdir(annotations_dir) if f.endswith('.xml')]
    print(f"Found {len(xml_files)} annotations.")
    
    random.shuffle(xml_files)
    split_idx = int(len(xml_files) * 0.8)
    train_files = xml_files[:split_idx]
    val_files = xml_files[split_idx:]
    
    def process_batch(files, split_name):
        print(f"Processing {split_name} ({len(files)} images)...")
        success_count = 0
        
        for xml_file in files:
            try:
                tree = ET.parse(os.path.join(annotations_dir, xml_file))
                root = tree.getroot()
                
                # Get Filename
                filename = root.find('filename').text
                if not filename.endswith('.jpg'):
                    filename += '.jpg'
                    
                # Get Class ID
                obj = root.find('object')
                if obj is None: continue
                
                class_id = obj.find('name').text
                
                if class_id not in class_map:
                    continue
                    
                class_name = class_map[class_id]
                
                # Copy Image
                src_img = os.path.join(images_dir, filename)
                if not os.path.exists(src_img):
                    # Try finding it
                    src_img = os.path.join(images_dir, xml_file.replace('.xml', '.jpg'))
                
                if os.path.exists(src_img):
                    dest_dir = os.path.join(OUTPUT_DIR, split_name, class_name)
                    os.makedirs(dest_dir, exist_ok=True)
                    shutil.copy2(src_img, os.path.join(dest_dir, filename))
                    success_count += 1
            except Exception as e:
                # print(f"Error processing {xml_file}: {e}")
                pass
        print(f"Successfully processed {success_count} images for {split_name}")

    process_batch(train_files, 'train')
    process_batch(val_files, 'validation')

def main():
    print("--- IP102 (Detection) Dataset Organizer ---")
    
    extract_tars()
    
    class_map = parse_classes(CLASSES_TXT)
    print(f"Loaded {len(class_map)} classes.")
    
    process_dataset(class_map)
    
    print("\nOrganization complete!")
    print(f"Data ready in {OUTPUT_DIR}")

if __name__ == "__main__":
    main()
