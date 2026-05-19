
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam
import os
import json

# Configuration
DATA_DIR = os.path.join(os.path.dirname(__file__), "data", "IP102", "formatted")
MODEL_SAVE_PATH = os.path.join(os.path.dirname(__file__), "model_ip102.h5")
INDICES_SAVE_PATH = os.path.join(os.path.dirname(__file__), "class_indices_ip102.json")
IMG_SIZE = (224, 224)
BATCH_SIZE = 32 # Detailed classes might need smaller batch if memory is tight, or larger.
EPOCHS = 10 # More classes might need more epochs

def train():
    print(f"Checking data directory: {DATA_DIR}")
    if not os.path.exists(DATA_DIR):
        print("Data directory not found!")
        return
        
    train_dir = os.path.join(DATA_DIR, 'train')
    val_dir = os.path.join(DATA_DIR, 'validation')

    if not os.path.exists(train_dir) or not os.path.exists(val_dir):
        print(f"Train/Val directories missing in {DATA_DIR}")
        return

    # Data Generators
    train_datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=20,
        width_shift_range=0.2,
        height_shift_range=0.2,
        shear_range=0.2,
        zoom_range=0.2,
        horizontal_flip=True
    )

    val_datagen = ImageDataGenerator(rescale=1./255)

    print("Loading training data...")
    train_generator = train_datagen.flow_from_directory(
        train_dir,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical'
    )

    print("Loading validation data...")
    validation_generator = val_datagen.flow_from_directory(
        val_dir,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical'
    )

    # Save class indices
    class_indices = train_generator.class_indices
    with open(INDICES_SAVE_PATH, 'w') as f:
        json.dump(class_indices, f)
    print(f"Class indices saved to {INDICES_SAVE_PATH}")
    print(f"Found {len(class_indices)} classes.")

    # Model Building (Transfer Learning with MobileNetV2)
    base_model = MobileNetV2(
        weights='imagenet',
        include_top=False,
        input_shape=(IMG_SIZE[0], IMG_SIZE[1], 3)
    )
    
    # Freeze base model
    base_model.trainable = False

    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = Dense(256, activation='relu')(x) # Increased dense layer size for 102 classes
    x = Dropout(0.3)(x)
    predictions = Dense(len(class_indices), activation='softmax')(x)

    model = Model(inputs=base_model.input, outputs=predictions)

    model.compile(
        optimizer=Adam(learning_rate=0.0001),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )

    print("Starting training...")
    history = model.fit(
        train_generator,
        epochs=EPOCHS,
        validation_data=validation_generator
    )

    print("Saving model...")
    model.save(MODEL_SAVE_PATH)
    print(f"Model saved to {MODEL_SAVE_PATH}")

if __name__ == "__main__":
    train()
