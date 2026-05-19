
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense
from tensorflow.keras.optimizers import Adam

# Parameters matching backend/app.py
IMG_SIZE = (48, 48)
INPUT_SHAPE = (48, 48, 1) # Grayscale
NUM_CLASSES = 34 # As determined from NOTEBOOK_CLASSES in app.py

def create_model():
    print(f"Creating model with input {INPUT_SHAPE} and {NUM_CLASSES} classes...")
    model = Sequential([
        Conv2D(32, (3, 3), activation='relu', input_shape=INPUT_SHAPE),
        MaxPooling2D((2, 2)),
        Conv2D(64, (3, 3), activation='relu'),
        MaxPooling2D((2, 2)),
        Flatten(),
        Dense(128, activation='relu'),
        Dense(NUM_CLASSES, activation='softmax')
    ])
    
    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
    
    # Create dummy data to initialize weights (1 sample)
    X_dummy = np.random.random((1, *INPUT_SHAPE))
    y_dummy = np.zeros((1, NUM_CLASSES))
    y_dummy[0, 0] = 1
    
    # Train for 1 epoch to finalize
    model.fit(X_dummy, y_dummy, epochs=1, verbose=1)
    
    # Save model to backend folder
    model.save('backend/model.h5')
    print("Model saved to backend/model.h5")

if __name__ == "__main__":
    create_model()
