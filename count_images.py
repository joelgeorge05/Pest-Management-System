import os

def count_images():
    train_dir = r"c:\Users\Acer\OneDrive\Videos\Pictures\Documents\Desktop\pest\backend\data\final_complete_dataset\train"
    classes = [d for d in os.listdir(train_dir) if os.path.isdir(os.path.join(train_dir, d))]
    low_classes = []
    
    for c in classes:
        path = os.path.join(train_dir, c)
        count = len([f for f in os.listdir(path) if os.path.isfile(os.path.join(path, f))])
        low_classes.append((c, count))
        
    low_classes.sort(key=lambda x: x[1])
    
    print("Classes that need more images (< 200):")
    for c, count in low_classes:
        if count < 200:
            print(f"- {c}: {count} images")

    under_500 = [c for c, count in low_classes if count < 500]
    print(f"\nTotal classes below 200 images: {len([c for c, cnt in low_classes if cnt < 200])}")
    print(f"Total classes below 500 images: {len(under_500)}")
    return low_classes

if __name__ == "__main__":
    count_images()
