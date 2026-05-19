import os
import io
import torch
import torch.nn as nn
from torchvision import models, transforms
# import tensorflow as tf # Removed for PyTorch migration
# from tensorflow.keras.models import load_model
# from tensorflow.keras.preprocessing import image
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from PIL import Image, UnidentifiedImageError
import pymongo
from pymongo import MongoClient
from bson.objectid import ObjectId
from datetime import datetime, timedelta
import datetime
from dotenv import load_dotenv
# Removed password hashing imports as per user requestv
from werkzeug.utils import secure_filename
import json
import csv
import re
import difflib # For local fuzzy matching
import zipfile
import tarfile
import shutil
import random
from split_dataset import split_dataset # Helper script

# Load environment variables
# Load environment variables correctly from backend/.env
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, '.env'))


# Loaded via explicit logic above


# --- Flask App Initialization ---
app = Flask(__name__, static_folder="../dist", static_url_path="/")
CORS(app)  # Enable CORS for all routes

# Configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(os.path.join(UPLOAD_FOLDER, 'profiles'), exist_ok=True)
os.makedirs(os.path.join(UPLOAD_FOLDER, 'medicines'), exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024 # 16MB max limit

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/uploads/<path:filename>')
def serve_uploads(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


@app.route('/api/admin/health', methods=['GET'])
def health_check():
    # Debug specific ID
    target_id = "Apple_Cedar_apple_rust"
    in_cache = target_id in DISEASE_DATA_DICT
    in_db = treatments_collection.find_one({"_id": target_id}) is not None if treatments_collection is not None else False
    
    status = {
        "db_connected": client is not None,
        "treatments_count": treatments_collection.count_documents({}) if treatments_collection is not None else 0,
        "disease_cache_size": len(DISEASE_DATA_DICT),
        "mongo_uri_masked": MONGO_URI.replace(MONGO_URI.split("@")[0].split("//")[1], "***") if "@" in MONGO_URI else "localhost",
        "debug_target": {
            "id": target_id,
            "in_cache": in_cache,
            "in_db": in_db,
            "cache_entry": str(DISEASE_DATA_DICT.get(target_id, "MISSING"))[:100]
        }
    }
    return jsonify(status), 200

@app.route("/")
def serve_index():
    return send_from_directory(app.static_folder, "index.html")

@app.errorhandler(404)
def not_found(e):
    # If the request is for an API endpoint, return JSON 404
    if request.path.startswith(('/auth', '/admin', '/medicines', '/shops', '/consultations', '/messages', '/predict', '/treatments', '/subsidies', '/forum')):
         return jsonify({"error": "Endpoint not found"}), 404
         
    # Support for React Client-Side Routing
    return send_from_directory(app.static_folder, "index.html")

# --- Database Setup (MongoDB) ---
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
DB_NAME = "pest_control_db"
client = None
db = None
users_collection = None
activity_collection = None
shops_collection = None
medicines_collection = None
messages_collection = None
consultations_collection = None

def connect_db(uri):
    try:
        c = MongoClient(uri, serverSelectionTimeoutMS=5000) # Increased timeout
        c.admin.command('ping')
        return c
    except Exception as e:
        print(f"Connection failed to {uri}: {e}")
        return None

client = connect_db(MONGO_URI)

# Fallback to 127.0.0.1 if localhost failed and URI was default
if client is None and "localhost" in MONGO_URI:
    print("Retrying with 127.0.0.1...")
    fallback_uri = MONGO_URI.replace("localhost", "127.0.0.1")
    client = connect_db(fallback_uri)

if client:
    db = client[DB_NAME]
    users_collection = db["users"]
    activity_collection = db["activity_log"]
    shops_collection = db["shops"]
    medicines_collection = db["medicines"]
    treatments_collection = db["treatments"] # New collection for treatment overrides
    subsidies_collection = db["subsidies"]
    forum_collection = db["forum_posts"]
    proposals_collection = db["treatment_proposals"]
    messages_collection = db["messages"]
    consultations_collection = db["consultations"]
    feedback_collection = db["feedback"]
    announcements_collection = db["announcements"]
    print(f"SUCCESS: Connected to MongoDB")
else:
    print("WARNING: Could not connect to MongoDB. Auth features will be disabled.")

def init_db():
    if users_collection is None:
        return # Skip if DB not connected
        
    try:
        # Check if admin exists
        if users_collection.count_documents({"username": "admin"}) == 0:
            users_collection.insert_one({
                "username": "admin", 
                "password": "admin123", 
                "role": "admin"
            })
            print("Default admin created: admin/admin123")
    except Exception as e:
        print(f"DB Init Error: {e}")

init_db()

# --- Model Configuration ---
# --- Model Configuration (Hybrid Ensemble) ---
MODEL_PATH_EFF = os.path.join(os.path.dirname(__file__), "model_efficientnet.pth")
MODEL_PATH_SWIN = os.path.join(os.path.dirname(__file__), "model_swin.pth")

model_eff = None
model_swin = None

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

# Load Disease Data from CSV
CSV_PATH = os.path.join(os.path.dirname(__file__), "data", "treatments.csv")
INDICES_PATH = os.path.join(os.path.dirname(__file__), "class_indices_improved.json")
DISEASE_DATA_DICT = {}
CLASS_LABELS = []
SEARCH_INDEX = {}


def refresh_disease_data():
    """Reloads Data from MongoDB (Single Source of Truth)"""
    global DISEASE_DATA_DICT, CLASS_LABELS
    DISEASE_DATA_DICT = {} # Reset
    CLASS_LABELS = [] # Reset

    # 1. Load Model Classes First (Source of Truth for Detection)
    model_classes = []
    if os.path.exists(INDICES_PATH):
        try:
            with open(INDICES_PATH, 'r') as f:
                indices = json.load(f)
                if indices:
                     first_v = list(indices.values())[0]
                     if isinstance(first_v, int):
                         model_classes = list(indices.keys())
                     else:
                         model_classes = list(indices.values())
        except Exception as e:
            print(f"Error loading indices for data merge: {e}")

    # 2. Fetch ALL Treatments from MongoDB
    db_treatments = {}
    if treatments_collection is not None:
        try:
            # tailored find to get everything
            docs = list(treatments_collection.find({}))
            print(f"Loaded {len(docs)} treatments from MongoDB.")
            
            for doc in docs:
                d_id = doc['_id']
                # Ensure structure matches what frontend expects
                db_treatments[d_id] = doc
                
                # Ensure 'id' legacy field exists for frontend
                if 'id' not in doc:
                    doc['id'] = d_id
                
                DISEASE_DATA_DICT[d_id] = doc
                
                if d_id not in CLASS_LABELS:
                    CLASS_LABELS.append(d_id)
                    
        except Exception as e:
            print(f"Error loading treatments from DB: {e}")

    # 3. Ensure ALL Model Classes exist in Dictionary
    for cls in model_classes:
        if cls not in DISEASE_DATA_DICT:
            # Create a placeholder entry in MEMORY only (until saved)
            DISEASE_DATA_DICT[cls] = {
                'id': cls,
                'name': cls.replace('___', ' ').replace('_', ' '),
                'description': 'No description available. (Add via Admin Panel)',
                'symptoms': [],
                'treatments': { 'organic': [], 'inorganic': [], 'homemade': [] },
                'prevention': ''
            }
            if cls not in CLASS_LABELS:
                CLASS_LABELS.append(cls)
    
    print(f"Total Combined Classes: {len(DISEASE_DATA_DICT)}")

    # 4. Build Chatbot Search Index (Reverse Index)
    global SEARCH_INDEX
    SEARCH_INDEX = {}
    print("Building Chatbot Search Index...")
    for d_id, data in DISEASE_DATA_DICT.items():
        # Tokens from Name
        name_tokens = set(data.get('name', '').lower().replace('_', ' ').split())
        # Tokens from ID
        id_tokens = set(d_id.lower().replace('_', ' ').split())
        
        all_tokens = name_tokens.union(id_tokens)
        
        # Add to index
        for token in all_tokens:
            if len(token) < 3: continue # Skip short words
            if token not in SEARCH_INDEX:
                SEARCH_INDEX[token] = []
            SEARCH_INDEX[token].append(d_id)
            
    print(f"Search Index built with {len(SEARCH_INDEX)} keywords.")

# Call initially to load data
refresh_disease_data()


# Load Class Indices
LABELS_MAP = {}

if os.path.exists(INDICES_PATH):
    import json
    with open(INDICES_PATH, 'r') as f:
        LABELS_MAP = json.load(f)
        # The JSON is { "Label": index }, we need { index: "Label" }
        LABELS_MAP = {v: k for k, v in LABELS_MAP.items()}
    print(f"Loaded {len(LABELS_MAP)} class labels from JSON.")
else:
    print("WARNING: class_indices_improved.json not found. Prediction labels might be incorrect.")

# Hybrid Ensemble Loader
def get_ensemble_models():
    global model_eff, model_swin
    
    # Load EfficientNet (Texture Expert)
    if model_eff is None and os.path.exists(MODEL_PATH_EFF):
        try:
            print(f"Loading EfficientNet from {MODEL_PATH_EFF}...")
            model_eff = models.efficientnet_b0(weights=None)
            num_ftrs = model_eff.classifier[1].in_features
            model_eff.classifier = nn.Sequential(
                nn.Dropout(p=0.3, inplace=True),
                nn.Linear(num_ftrs, len(LABELS_MAP) if LABELS_MAP else 135)
            )
            model_eff.load_state_dict(torch.load(MODEL_PATH_EFF, map_location=device))
            model_eff.to(device)
            model_eff.eval()
            print("EfficientNet Loaded.")
        except Exception as e:
            print(f"Error loading EfficientNet: {e}")

    # Load Swin Transformer (Shape/Context Expert)
    if model_swin is None and os.path.exists(MODEL_PATH_SWIN):
        try:
            print(f"Loading Swin Transformer from {MODEL_PATH_SWIN}...")
            # We must use correct architecture 'swin_t'
            model_swin = models.swin_t(weights=None)
            num_ftrs = model_swin.head.in_features
            model_swin.head = nn.Sequential(
                nn.Dropout(p=0.3),
                nn.Linear(num_ftrs, len(LABELS_MAP) if LABELS_MAP else 135)
            )
            model_swin.load_state_dict(torch.load(MODEL_PATH_SWIN, map_location=device))
            model_swin.to(device)
            model_swin.eval()
            print("Swin Transformer Loaded.")
        except Exception as e:
            print(f"Error loading Swin Transformer: {e}")

    return model_eff, model_swin


# --- Image Preprocessing & TTA ---
def get_tta_transforms(img_pil):
    """
    Generates 3 views for Test Time Augmentation:
    1. Original Resized
    2. Horizontal Flip
    3. Center Crop (Zoom)
    """
    base_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])
    
    # View 1: Standard
    v1 = base_transform(img_pil)
    
    # View 2: Flip
    v2 = base_transform(transforms.functional.hflip(img_pil))
    
    # View 3: Zoom (Center Crop then Resize)
    # Resize to slightly larger first, then crop to 224
    zoom_transform = transforms.Compose([
        transforms.Resize((256, 256)),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])
    v3 = zoom_transform(img_pil)
    
    return torch.stack([v1, v2, v3]) # Shape: [3, 3, 224, 224]


import subprocess
import threading

# Global training lock/status
training_status = {
    "is_training": False,
    "start_time": None,
    "last_completed": None,
    "logs": []
}

def run_retraining(fast_retrain=False):
    global training_status
    training_status["is_training"] = True
    training_status["start_time"] = datetime.datetime.now()
    training_status["logs"] = []
    training_status["progress"] = 0.0
    
    # Constants for progress calculation
    TOTAL_EPOCHS_PER_MODEL = 10 # 3 Head + 7 Fine
    if fast_retrain:
        TOTAL_EPOCHS_PER_MODEL = 5 # 5 Head only (approx)
        training_status["logs"].append("⚡ Fast Incremental Retraining Mode Enabled")
    
    try:
        # 1. Train Swin Transformer (0-50%)
        training_status["logs"].append("Starting Phase 1: Swin Transformer Training...")
        
        cmd1 = ['python', '-u', 'train_transformer.py']
        if fast_retrain:
             # We can pass a flag if script supports it, or rely on script's smart loading
             # But if we want to skip Fine Tuning phase for speed, we need a flag.
             # Let's add --fast-mode to scripts later?
             # For now, the scripts automatically detect class expansion. 
             # To make it "Fast", we should probably limit epochs via args if possible, 
             # or just rely on the fact that Head training (3 epochs) is fast.
             # Let's assume standard training for now but it will be faster due to pre-trained weights.
             pass

        process1 = subprocess.Popen(
            cmd1, 
            cwd=BASE_DIR, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, bufsize=1
        )
        for line in process1.stdout:
            line_str = line.strip()
            if line_str.startswith("Epoch"): 
                try:
                    # Parse "Epoch 0/4" or "Epoch 0/14"
                    parts = line_str.split()[1].split('/')
                    current = int(parts[0])
                    total = int(parts[1])
                    
                    # Normalize to 0-1 range for this phase
                    # We might have 2 separate loops (head then fine), so this is an approximation
                    # Simple heuristic: Just increment progress slowly or use the epoch number
                    # Better: define global progress based on accumulated epochs? 
                    # Let's rely on the fact that we have ~20 epochs total per script.
                    
                    # If we see "Phase 2", we know we are halfway through this script
                    pass
                except: pass
                
                training_status["logs"].append(f"[Swin] {line_str}")
                
            # Heuristic Progress Update
            if "Epoch" in line_str:
                # Increment progress slightly for every epoch log
                # Linear interpolation:
                # Phase 1: 0 -> 50%
                # Phase 2: 50 -> 100% (handled below)
                
                training_status["progress"] = min(49.0, training_status["progress"] + (50.0 / TOTAL_EPOCHS_PER_MODEL))
            
            # ETA Calculation
            if training_status["progress"] > 5 and training_status["start_time"]:
                elapsed = (datetime.datetime.now() - training_status["start_time"]).total_seconds()
                # progress is 0-100
                if training_status["progress"] > 0:
                    total_estimated = elapsed / (training_status["progress"] / 100.0)
                    remaining = total_estimated - elapsed
                    
                    # Format remaining time
                    if remaining < 60:
                        training_status["time_remaining"] = f"{int(remaining)}s"
                    elif remaining < 3600:
                        training_status["time_remaining"] = f"{int(remaining // 60)}m {int(remaining % 60)}s"
                    else:
                        training_status["time_remaining"] = f"{int(remaining // 3600)}h {int((remaining % 3600) // 60)}m"
            
            print(f"TRAIN-SWIN: {line_str}")
        process1.wait()
        
        if process1.returncode != 0: raise Exception("Swin Training Failed")
        training_status["progress"] = 50.0 # Force sync

        # 2. Train EfficientNet (50-100%)
        training_status["logs"].append("Starting Phase 2: EfficientNet Training...")
        process2 = subprocess.Popen(
            ['python', '-u', 'train_improved.py'], 
            cwd=BASE_DIR, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, bufsize=1
        )
        for line in process2.stdout:
            line_str = line.strip()
            if line_str.startswith("Epoch"): 
                training_status["logs"].append(f"[EffNet] {line_str}")
            
            if "Epoch" in line_str:
                 # Increment progress from 50% to 100%
                 training_status["progress"] = min(99.0, training_status["progress"] + (50.0 / TOTAL_EPOCHS_PER_MODEL))

            # ETA Calculation (Phase 2)
            if training_status["progress"] > 5 and training_status["start_time"]:
                elapsed = (datetime.datetime.now() - training_status["start_time"]).total_seconds()
                if training_status["progress"] > 0:
                    total_estimated = elapsed / (training_status["progress"] / 100.0)
                    remaining = total_estimated - elapsed
                    
                    if remaining < 60:
                        training_status["time_remaining"] = f"{int(remaining)}s"
                    elif remaining < 3600:
                        training_status["time_remaining"] = f"{int(remaining // 60)}m {int(remaining % 60)}s"
                    else:
                        training_status["time_remaining"] = f"{int(remaining // 3600)}h {int((remaining % 3600) // 60)}m"

            print(f"TRAIN-EFF: {line_str}")
        process2.wait()
        
        if process2.returncode != 0: raise Exception("EfficientNet Training Failed")

        training_status["logs"].append("Ensemble Training Completed Successfully.")
        training_status["progress"] = 100.0
        training_status["last_completed"] = datetime.datetime.now()
            
    except Exception as e:
        training_status["logs"].append(f"Error: {str(e)}")
        print(f"Training Error: {e}")
    finally:
        training_status["is_training"] = False

@app.route('/api/admin/retrain', methods=['POST'])
def trigger_retraining():
    if training_status["is_training"]:
        return jsonify({"message": "Training is already in progress.", "status": "running"}), 409
    
    thread = threading.Thread(target=run_retraining)
    thread.start()
    
    return jsonify({"message": "Ensemble Training started.", "status": "started"}), 202

@app.route('/api/admin/dataset/upload', methods=['POST'])
def upload_dataset():
    if training_status["is_training"]:
        return jsonify({"message": "Cannot upload while training is in progress."}), 409

    try:
        # Check upload type: 'archive' or 'single_class'
        upload_type = request.form.get('type', 'archive')
        
        target_dir = os.path.join(BASE_DIR, "data", "final_complete_dataset")
        os.makedirs(target_dir, exist_ok=True)

        if upload_type == 'archive':
            if 'file' not in request.files:
                return jsonify({"error": "No file part"}), 400
            
            file = request.files['file']
            if file.filename == '':
                return jsonify({"error": "No selected file"}), 400
            
            filename = secure_filename(file.filename)
            temp_extract_dir = os.path.join(app.config['UPLOAD_FOLDER'], 'temp_dataset_extract')
            
            # Clean temp dir
            if os.path.exists(temp_extract_dir):
                shutil.rmtree(temp_extract_dir)
            os.makedirs(temp_extract_dir)
            
            try:
                # Extract
                if filename.endswith('.zip'):
                    with zipfile.ZipFile(file, 'r') as zip_ref:
                        zip_ref.extractall(temp_extract_dir)
                elif filename.endswith(('.tar', '.tar.gz', '.tgz')):
                    with tarfile.open(fileobj=file.stream, mode='r:*') as tar_ref:
                        tar_ref.extractall(temp_extract_dir)
                else:
                    return jsonify({"error": "Unsupported archive format"}), 400
                
                # Process with split_dataset logic
                # Note: The temp_extract_dir might contain a root folder or direct classes.
                # split_dataset expects direct classes.
                # Heuristic: if only 1 folder inside temp, use that as source.
                items = os.listdir(temp_extract_dir)
                source_dir = temp_extract_dir
                if len(items) == 1 and os.path.isdir(os.path.join(temp_extract_dir, items[0])):
                    source_dir = os.path.join(temp_extract_dir, items[0])
                
                # Merge into final dataset
                # We can't use split_dataset directly to *merge*, it overwrites or expects empty dest usually.
                # Let's adapt logic: Iterate classes in source, for each file, randomness decide train/val
                
                classes = [d for d in os.listdir(source_dir) if os.path.isdir(os.path.join(source_dir, d))]
                count = 0
                
                for cls in classes:
                    src_cls = os.path.join(source_dir, cls)
                    # Normalize class name? maybe not, trust user's folder name
                    # Just ensure dest exists
                    train_cls_dest = os.path.join(target_dir, 'train', cls)
                    val_cls_dest = os.path.join(target_dir, 'validation', cls)
                    os.makedirs(train_cls_dest, exist_ok=True)
                    os.makedirs(val_cls_dest, exist_ok=True)
                    
                    files = [f for f in os.listdir(src_cls) if os.path.isfile(os.path.join(src_cls, f))]
                    for f in files:
                        src_file = os.path.join(src_cls, f)
                        # 20% validation
                        if random.random() < 0.2:
                            shutil.copy2(src_file, os.path.join(val_cls_dest, f))
                        else:
                            shutil.copy2(src_file, os.path.join(train_cls_dest, f))
                        count += 1
                        
                return jsonify({"message": f"Archive processed. Added {count} images."}), 200
                
            except Exception as e:
                return jsonify({"error": f"Extraction failed: {str(e)}"}), 500
            finally:
                # Cleanup temp
                if os.path.exists(temp_extract_dir):
                    shutil.rmtree(temp_extract_dir)

        elif upload_type == 'single_class':
            class_name = request.form.get('class_name')
            if not class_name:
                return jsonify({"error": "Class name required"}), 400
            
            # Sanitize
            class_name = secure_filename(class_name)
            
            files = request.files.getlist('files[]')
            if not files:
                 return jsonify({"error": "No files uploaded"}), 400
                 
            train_dest = os.path.join(target_dir, 'train', class_name)
            val_dest = os.path.join(target_dir, 'validation', class_name)
            os.makedirs(train_dest, exist_ok=True)
            os.makedirs(val_dest, exist_ok=True)
            
            count = 0
            for file in files:
                if file and allowed_file(file.filename):
                    filename = secure_filename(f"{int(datetime.datetime.now().timestamp())}_{file.filename}")
                    
                    # 20% validation logic
                    if random.random() < 0.2:
                        file.save(os.path.join(val_dest, filename))
                    else:
                        file.save(os.path.join(train_dest, filename))
                    count += 1
            
            return jsonify({"message": f"Uploaded {count} images to class '{class_name}'"}), 200

        else:
            return jsonify({"error": "Invalid upload type"}), 400

    except Exception as e:
        print(f"Upload Error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/retrain/status', methods=['GET'])
def get_training_status():
    return jsonify({
        "is_training": training_status["is_training"],
        "start_time": training_status["start_time"],
        "last_completed": training_status["last_completed"],
        "progress": training_status.get("progress", 0),
        "recent_logs": training_status["logs"][-5:],
        "logs": training_status["logs"] # Return full logs for the modal
    })

@app.route('/api/admin/dataset/create_class', methods=['POST'])
def create_dataset_class():
    if training_status["is_training"]:
        return jsonify({"message": "Cannot modify dataset while training is in progress."}), 409

    try:
        data = request.json
        class_name = data.get('class_name')
        
        if not class_name:
            return jsonify({"error": "Class name required"}), 400
            
        # Sanitize
        class_name = secure_filename(class_name)
        if not class_name:
             return jsonify({"error": "Invalid class name"}), 400
             
        target_dir = os.path.join(BASE_DIR, "data", "final_complete_dataset")
        train_dest = os.path.join(target_dir, 'train', class_name)
        val_dest = os.path.join(target_dir, 'validation', class_name)
        
        if os.path.exists(train_dest) or os.path.exists(val_dest):
             return jsonify({"error": f"Class '{class_name}' already exists"}), 400
             
        os.makedirs(train_dest, exist_ok=True)
        os.makedirs(val_dest, exist_ok=True)
        
        # Determine Category based on keywords (heuristic)
        category = "Unknown"
        lower_name = class_name.lower()
        if "mild" in lower_name or "blight" in lower_name or "spot" in lower_name or "rot" in lower_name or "rust" in lower_name:
            category = "Disease"
        elif "bug" in lower_name or "mite" in lower_name or "borer" in lower_name:
            category = "Pest"
            
        # Add to DISEASE_DATA_DICT immediately so it shows up in UI
        if class_name not in DISEASE_DATA_DICT:
             DISEASE_DATA_DICT[class_name] = {
                'id': class_name,
                'name': class_name.replace('___', ' ').replace('_', ' '),
                'description': 'Newly created class. (Add details)',
                'symptoms': [],
                'treatments': { 'organic': [], 'inorganic': [], 'homemade': [] },
                'prevention': '',
                'category': category
            }
        
        return jsonify({"message": f"Class '{class_name}' created successfully."}), 201
        
    except Exception as e:
        print(f"Create Class Error: {e}")
        return jsonify({"error": str(e)}), 500


# --- Auth Routes ---
@app.route('/auth/register', methods=['POST'])
def register():
    if users_collection is None:
        return jsonify({"error": "Database unavailable. Auth features disabled."}), 503

    data = request.json
    username = data.get('username')
    password = data.get('password')
    # Force role to be 'farmer' for public registration
    role = 'farmer' 
    
    name = data.get('name', '')
    email = data.get('email', '')
    address = data.get('address', '')
    pincode = data.get('pincode', '')
    phone = data.get('phone', '') 
    
    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400
        
    if not re.match(r"^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{6,}$", password):
        return jsonify({"error": "Password must be alphanumeric and at least 6 characters long"}), 400
        
    if not re.match(r"^\d{10}$", phone):
        return jsonify({"error": "Mobile number must be exactly 10 digits"}), 400
    
    if users_collection.find_one({"username": username}):
        return jsonify({"error": "Username exists"}), 400

    users_collection.insert_one({
        "username": username,
        "password": password,
        "role": role,
        "name": name,
        "email": email,
        "address": address,
        "pincode": pincode,
        "phone": phone,
        "is_suspended": False
    })
    return jsonify({"message": "User registered"}), 201

@app.route('/auth/login', methods=['POST'])
def login():
    if users_collection is None:
        return jsonify({"error": "Database unavailable. Auth features disabled."}), 503

    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    user = users_collection.find_one({"username": username})
    
    if user and user['password'] == password:
        # Check if suspended
        if user.get('is_suspended', False):
             return jsonify({"error": "Account suspended. Contact admin."}), 403

        # Log activity
        if activity_collection is not None:
            activity_collection.insert_one({
                "user_id": user['_id'], # Store ObjectId
                "username": user['username'], # Store username for easier readout if needed
                "action": "Logged in",
                "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            })
        
        return jsonify({
            "message": "Login successful", 
            "user": {
                "id": str(user['_id']), # Return ID as string
                "username": user['username'], 
                "role": user['role'],
                "name": user.get('name', ''),
                "email": user.get('email', ''),
                "phone": user.get('phone', ''),
                "address": user.get('address', ''),
                "pincode": user.get('pincode', ''),
                "profile_image": user.get('profile_image', ''),
                "specialization": user.get('specialization', '')
            }
        }), 200
        
    return jsonify({"error": "Invalid credentials"}), 401

@app.route('/auth/me', methods=['PUT'])
def update_profile():
    if users_collection is None: return jsonify("DB Error"), 503
    # Support both Form (for images) and JSON
    data = request.form if request.form else request.json
    if not data: data = {}
    user = users_collection.find_one({"username": data.get("username")})
    
    if not user:
        return jsonify({"error": "User not found"}), 404

    update_data = {
        "name": data.get("name"),
        "email": data.get("email"),
        "address": data.get("address"),
        "pincode": data.get("pincode"),
        "phone": data.get("phone")
    }
    
    # Handle Profile Picture
    if 'profile_image' in request.files:
        file = request.files['profile_image']
        if file and allowed_file(file.filename):
            filename = secure_filename(f"{user['_id']}_{int(datetime.datetime.now().timestamp())}_{file.filename}")
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], 'profiles', filename))
            update_data['profile_image'] = f"profiles/{filename}"

    users_collection.update_one(
        {"username": data.get("username")},
        {"$set": update_data}
    )
    
    updated_user = users_collection.find_one({"username": data.get("username")})
    updated_user['_id'] = str(updated_user['_id'])
    
    return jsonify({"message": "Profile updated", "user": updated_user}), 200

@app.route('/admin/users/create', methods=['POST'])
def create_user():
    if users_collection is None: return jsonify("DB Error"), 503
    
    # Handle Form Data for Image
    data = request.form if request.form else request.json
    if not data: data = {}
    
    username = data.get('username')
    password = data.get('password')
    role = data.get('role', 'farmer') # Default to farmer if not specified
    
    if not username or not password:
        return jsonify({"error": "Username and Password required"}), 400
        
    if users_collection.find_one({"username": username}):
        return jsonify({"error": "Username exists"}), 400
        
    user_data = {
        "username": username,
        "password": password,
        "role": role,
        "name": data.get('name', 'User'),
        "phone": data.get('phone', ''),
        "is_suspended": False,
        "profile_image": None
    }

    if role == 'expert':
        user_data['specialization'] = data.get('specialization', 'General Agriculture')
    
    # Handle Profile Picture
    if 'profile_image' in request.files:
        file = request.files['profile_image']
        if file and allowed_file(file.filename):
            # Create a localized timestamp/filename
            filename = secure_filename(f"{role}_{int(datetime.datetime.now().timestamp())}_{file.filename}")
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], 'profiles', filename))
            user_data['profile_image'] = f"profiles/{filename}"

    users_collection.insert_one(user_data)
    return jsonify({"message": f"{role.capitalize()} account created"}), 201

# --- User Management Routes ---
@app.route('/admin/users', methods=['GET'])
def get_users():
    if users_collection is None:
        return jsonify("Database error"), 503
    
    users = list(users_collection.find({}, {})) # Include password
    for u in users:
        u['_id'] = str(u['_id'])
    return jsonify(users), 200

@app.route('/admin/users/<user_id>/suspend', methods=['PUT'])
def suspend_user(user_id):
    if users_collection is None: return jsonify("DB Error"), 503
    
    try:
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user: return jsonify({"error": "User not found"}), 404
        
        # Toggle suspension
        new_status = not user.get('is_suspended', False)
        users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"is_suspended": new_status}}
        )
        return jsonify({"message": f"User {'suspended' if new_status else 'activated'}", "is_suspended": new_status}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/admin/users/<user_id>', methods=['DELETE'])
def delete_user(user_id):
    if users_collection is None: return jsonify("DB Error"), 503
    
    try:
        res = users_collection.delete_one({"_id": ObjectId(user_id)})
        if res.deleted_count == 0: return jsonify({"error": "User not found"}), 404
        return jsonify({"message": "User deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/admin/users/<user_id>', methods=['PUT'])
def update_user_admin(user_id):
    if users_collection is None: return jsonify("DB Error"), 503
    
    data = request.json
    try:
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user: return jsonify({"error": "User not found"}), 404
        
        update_fields = {}
        if data.get('username'):
            # Check unique if changed
            if data['username'] != user['username']:
                if users_collection.find_one({"username": data['username']}):
                    return jsonify({"error": "Username already taken"}), 400
            update_fields['username'] = data['username']
            
        if data.get('password'):
            update_fields['password'] = data['password']
            
        if data.get('name'):
            update_fields['name'] = data['name']
            
        if data.get('role'):
            update_fields['role'] = data['role']
            
        if not update_fields:
            return jsonify({"message": "No changes provided"}), 200
            
        users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_fields}
        )
        return jsonify({"message": "User updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/admin/history', methods=['GET'])
def get_history():
    if activity_collection is None:
         return jsonify([]), 200 # Return empty list if DB down
    
    # Fetch recent activity
    # In MongoDB, we might want to sort by latest
    try:
        logs = activity_collection.find().sort("timestamp", -1)
        
        history = []
        for log in logs:
            # We stored username in activity log, so we don't strictly need a join.
            # But if we want role, we might need to lookup user again or assume it hasn't changed.
            # For simplicity, let's fetch user role if not stored, or just display what we have.
            # The previous SQL query joined to get user role.
            
            # Let's see if we can get the user role efficiently.
            role = "Unknown"
            if users_collection is not None:
                user = users_collection.find_one({"_id": log.get("user_id")})
                if user:
                    role = user['role']
            
            history.append({
                "timestamp": log.get("timestamp"),
                "username": log.get("username", "Unknown"), # Fallback if not stored
                "role": role,
                "action": log.get("action")
            })
            
        return jsonify(history), 200
    except Exception as e:
        print(f"History Fetch Error: {e}")
        return jsonify({"error": str(e)}), 500



@app.route('/history/my', methods=['GET'])
def get_my_history():
    if activity_collection is None: return jsonify([]), 200
    user_id = request.args.get('user_id')
    if not user_id: return jsonify({"error": "User ID required"}), 400
    
    try:
        # Try converting to ObjectId if possible
        uid = ObjectId(user_id) if len(user_id) == 24 else user_id
        # Also try fetching by string ID if ObjectId fetch yields nothing (legacy data)
        logs = list(activity_collection.find({"user_id": uid}).sort("timestamp", -1))
        if not logs and isinstance(uid, ObjectId):
             logs = list(activity_collection.find({"user_id": str(user_id)}).sort("timestamp", -1))
             
        # Clean _id
        history = []
        for log in logs:
            history.append({
                "timestamp": log.get("timestamp"),
                "action": log.get("action")
            })
        return jsonify(history), 200
    except Exception as e:
         return jsonify({"error": str(e)}), 500

# --- Announcement Routes ---
@app.route('/api/admin/announcements', methods=['POST'])
def create_announcement():
    if users_collection is None: return jsonify("DB Error"), 503
    
    data = request.json
    if not data or not data.get('title') or not data.get('content'):
        return jsonify({"error": "Title and Content are required"}), 400
        
    announcement = {
        "title": data['title'],
        "content": data['content'],
        "date": datetime.datetime.now().strftime("%Y-%m-%d"),
        "timestamp": datetime.datetime.now(),
        "author": "Admin" # Simplified for now
    }
    
    try:
        announcements_collection.insert_one(announcement)
        return jsonify({"message": "Announcement created successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/announcements/<announcement_id>', methods=['DELETE'])
def delete_announcement(announcement_id):
    if announcements_collection is None: return jsonify("DB Error"), 503
    
    try:
        res = announcements_collection.delete_one({"_id": ObjectId(announcement_id)})
        if res.deleted_count == 0:
            return jsonify({"error": "Announcement not found"}), 404
        return jsonify({"message": "Announcement deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/announcements', methods=['GET'])
def get_announcements():
    if announcements_collection is None: return jsonify([]), 200
    
    try:
        # Sort by timestamp descending
        announcements = list(announcements_collection.find().sort("timestamp", -1))
        for a in announcements:
            a['_id'] = str(a['_id'])
        return jsonify(announcements), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# --- Disease Management Routes (Admin) ---
@app.route('/api/diseases', methods=['GET'])
def get_all_diseases():
    # Return list of all diseases with their current data
    return jsonify(DISEASE_DATA_DICT), 200

    try:
        # Upsert into treatments collection
        treatments_collection.update_one(
            {"_id": disease_id},
            {"$set": update_fields},
            upsert=True
        )
        
        # Refresh local cache
        refresh_disease_data()
        
        return jsonify({"message": "Disease data updated successfully", "disease": DISEASE_DATA_DICT[disease_id]}), 200
    except Exception as e:
        print(f"Update error: {e}")
        return jsonify({"error": str(e)}), 500

# --- Load Treatment Data ---
# treatment_lookup is now DISEASE_DATA_DICT, managed by refresh_disease_data()

# --- Prediction Route ---
@app.route('/predict', methods=['POST'])
def predict():
    disease_name_manual = request.form.get('disease_name', '').strip()
    symptoms_manual = request.form.get('symptoms', '').strip()
    user_crop = request.form.get('crop_name', '').strip().lower()

    if disease_name_manual or symptoms_manual:
        # Fast Path Bypass
        search_query = f"{user_crop} {disease_name_manual} {symptoms_manual}".strip().lower()
        user_tokens = set(search_query.split())
        stopwords = {'the', 'is', 'a', 'an', 'in', 'on', 'of', 'for', 'to', 'my', 'has', 'have', 'i', 'it'}
        user_tokens = {t for t in user_tokens if t not in stopwords and len(t) > 2}
        
        candidate_scores = {}
        for token in user_tokens:
            if token in SEARCH_INDEX:
                for d_id in SEARCH_INDEX[token]:
                    candidate_scores[d_id] = candidate_scores.get(d_id, 0) + 1
            else:
                 matches = difflib.get_close_matches(token, SEARCH_INDEX.keys(), n=1, cutoff=0.85)
                 if matches:
                     matched_key = matches[0]
                     for d_id in SEARCH_INDEX[matched_key]:
                          candidate_scores[d_id] = candidate_scores.get(d_id, 0) + 0.8
        
        if candidate_scores:
            best_id = max(candidate_scores, key=candidate_scores.get)
            treatment_info = DISEASE_DATA_DICT.get(best_id)
            if treatment_info:
                 import copy
                 treatment_info = copy.deepcopy(treatment_info)
                 if 'treatments' not in treatment_info:
                     treatment_info['treatments'] = { "organic": [], "inorganic": [], "homemade": [] }
                 
                 final_class = best_id
                 
                 # Dynamic Lookup
                 if medicines_collection is not None:
                      try:
                          search_term = final_class.replace("___", " ").replace("_", " ") 
                          import re
                          regex_pattern = f"({re.escape(final_class)}|{re.escape(search_term)})"
                          dynamic_meds = medicines_collection.find({"diseases": {"$regex": regex_pattern, "$options": "i"}})
                          for med in dynamic_meds:
                              m_name = med.get('name', 'Unknown')
                              m_usage = med.get('usage', '')
                              m_type = med.get('type', '').lower()
                              entry = f"{m_name} (Community): {m_usage}"
                              
                              if 'organic' in m_type: treatment_info['treatments']['organic'].append(entry)
                              elif 'inorganic' in m_type or 'chemical' in m_type: treatment_info['treatments']['inorganic'].append(entry)
                              elif 'homemade' in m_type: treatment_info['treatments']['homemade'].append(entry)
                      except Exception as e:
                          print(f"Dynamic medicine lookup failed: {e}")
                 
                 return jsonify({
                     'class': final_class,
                     'confidence': 0.99,
                     'model': 'Manual Override Fast-Path',
                     'treatment': treatment_info
                 })

    if 'image' not in request.files:
        if disease_name_manual or symptoms_manual:
             return jsonify({'error': 'No confident match found for the provided text. Please try different keywords or upload an image.'}), 400
        return jsonify({'error': 'No image uploaded and no text provided.'}), 400
        
    file = request.files['image']
    if not file:
        return jsonify({'error': 'Empty file'}), 400

    try:
        # Load Ensemble Models
        model_eff, model_swin = get_ensemble_models()
        
        if model_eff is None and model_swin is None:
             return jsonify({'error': 'No models available. Please retrain first.'}), 503

        img_bytes = file.read()
        
        # 1. Prepare TTA Batch (3 views)
        try:
            img = Image.open(io.BytesIO(img_bytes))
            if img.mode != 'RGB': img = img.convert('RGB')
            
            # shape: [3, 3, 224, 224]
            input_tensor = get_tta_transforms(img).to(device) 
        except UnidentifiedImageError:
            return jsonify({'error': 'Invalid image file.'}), 400
        
        # 2. Ensemble Inference
        combined_probs = None
        
        with torch.no_grad():
            # Model A: EfficientNet
            if model_eff:
                outputs_eff = model_eff(input_tensor) # [3, num_classes]
                probs_eff = torch.nn.functional.softmax(outputs_eff, dim=1)
                avg_eff = torch.mean(probs_eff, dim=0) # Average over 3 views
                
                combined_probs = avg_eff
                
            # Model B: Swin Transformer
            if model_swin:
                outputs_swin = model_swin(input_tensor)
                probs_swin = torch.nn.functional.softmax(outputs_swin, dim=1)
                avg_swin = torch.mean(probs_swin, dim=0)
                
                if combined_probs is not None:
                    combined_probs = (combined_probs + avg_swin) / 2.0 # Average both models
                else:
                    combined_probs = avg_swin

        # 3. Post-Processing & Filtering
        # Convert to list for easier manipulation
        final_probs = combined_probs.cpu().numpy()
        
        # Get Crop Constraint
        user_crop = request.form.get('crop_name', '').strip().lower()
        
        final_class = "Unknown"
        final_confidence = 0.0
        
        # Create a list of (index, probability)
        class_probs = []
        for idx, prob in enumerate(final_probs):
            if LABELS_MAP:
                label = LABELS_MAP.get(idx, f"Class_{idx}")
            else:
                label = "Unknown"
                
            # Strict Filtering: Zero out if crop name doesn't match
            # We assume label format: "CropName___DiseaseName"
            if user_crop:
                # e.g. user_crop="tomato", label="Tomato___Bacterial_spot" -> Match
                # e.g. user_crop="tomato", label="Apple___Scab" -> No Match
                if user_crop not in label.lower().split('_')[0]: 
                    prob = 0.0
            
            class_probs.append((label, prob))
            
        # Re-sort after filtering
        class_probs.sort(key=lambda x: x[1], reverse=True)
        
        top_match = class_probs[0]
        top_label = top_match[0]
        top_conf = float(top_match[1])
        
        # 4. Confidence Threshold
        # With TTA and Ensemble, we expect high confidence for valid images.
        THRESHOLD = 0.45 # 45% minimum to accept
        
        if top_conf < THRESHOLD:
            final_class = "Unknown / Unsure"
            final_confidence = top_conf
            description = f"The system is unsure using {user_crop or 'no'} filter. Top guess was {top_label} ({top_conf:.2f}). Please upload a clearer image of a single leaf."
            treatment_info = {
                "name": "Unknown Disease",
                "description": description,
                "treatments": {"organic": [], "inorganic": [], "homemade": []}
            }
        else:
            final_class = top_label
            final_confidence = top_conf
            
            # Fetch Data
            treatment_info = DISEASE_DATA_DICT.get(final_class)
            
            if not treatment_info:
                treatment_info = {
                    "name": final_class.replace("___", " ").replace("_", " "),
                    "description": "No static description available.",
                    "treatments": { "organic": [], "inorganic": [], "homemade": [] }
                }
            else:
                 import copy
                 treatment_info = copy.deepcopy(treatment_info)
                 if 'treatments' not in treatment_info:
                     treatment_info['treatments'] = { "organic": [], "inorganic": [], "homemade": [] }

            # Dynamic Lookup (User Submitted & Approved Medicines)
            if medicines_collection is not None:
                 try:
                     search_term = final_class.replace("___", " ").replace("_", " ") 
                     regex_pattern = f"({re.escape(final_class)}|{re.escape(search_term)})"
                     
                     dynamic_meds = medicines_collection.find({
                         "diseases": {"$regex": regex_pattern, "$options": "i"}
                     })
                     
                     for med in dynamic_meds:
                         m_name = med.get('name', 'Unknown')
                         m_usage = med.get('usage', '')
                         m_type = med.get('type', '').lower()
                         entry = f"{m_name} (Community): {m_usage}"
                         
                         if 'organic' in m_type: treatment_info['treatments']['organic'].append(entry)
                         elif 'inorganic' in m_type or 'chemical' in m_type: treatment_info['treatments']['inorganic'].append(entry)
                         elif 'homemade' in m_type: treatment_info['treatments']['homemade'].append(entry)
                             
                 except Exception as e:
                     print(f"Dynamic medicine lookup failed: {e}")
        
        # Log Activity
        user_id = request.form.get('user_id')
        if user_id and activity_collection is not None:
            try:
                activity_collection.insert_one({
                    "user_id": ObjectId(user_id) if len(user_id) == 24 else user_id,
                    "username": request.form.get('username', 'Unknown'),
                    "action": f"Scanned: {final_class} ({final_confidence:.2f}) [Ensemble]",
                    "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                })
            except Exception as e:
                print(f"Failed to log prediction: {e}")

        model_source = "Hybrid Ensemble (EfficientNet + Swin Transformer)"
        
        return jsonify({
            'class': final_class,
            'confidence': final_confidence,
            'model': model_source,
            'treatment': treatment_info
        })

    except Exception as e:
        print(f"Prediction Error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get('message', '').strip().lower()
    
    if not user_message:
        return jsonify({"error": "Message required"}), 400
        
    try:
        # --- Database Fallback Logic ---
        
        # 1. Greetings
        if any(word in user_message for word in ['hello', 'hi', 'hey', 'start']):
            return jsonify({"reply": "Hello! I am your offline Plant Doctor. Ask me about crop diseases, ask me to list diseases for a specific crop, ask about government schemes, ask for the latest announcements, or ask me for statistics about the platform (e.g., 'How many users?', 'Are there shops?')."}), 200

        # 2. General Queries (Subsidy/Schemes, Announcements, Time, Weather, General Info)
        if any(w in user_message for w in ['announcement', 'announcements', 'news', 'update', 'updates']):
            if announcements_collection is not None:
                # get up to 2 latest announcements
                announcements = list(announcements_collection.find().sort("timestamp", -1).limit(2))
                if announcements:
                    count = announcements_collection.count_documents({})
                    reply = f"There are **{count} announcements** from the admin.\n\nHere are the latest ones:\n"
                    for idx, a in enumerate(announcements):
                        title = a.get('title', 'No Title')
                        date = a.get('date', 'Unknown Date')
                        content = a.get('content', '')
                        reply += f"**{idx+1}. {title}** *(Posted on: {date})*\n{content}\n\n"
                    return jsonify({"reply": reply}), 200
            return jsonify({"reply": "There are no new announcements from the admin at this time."}), 200

        if any(w in user_message for w in ['scheme', 'schemes', 'schema', 'schemas', 'government', 'subsidy', 'subsidies', 'policy', 'aid']):
            if subsidies_collection is not None:
                # get up to 3 latest schemes
                schemes = list(subsidies_collection.find().sort("date_posted", -1).limit(3))
                if schemes:
                    count = subsidies_collection.count_documents({})
                    reply = f"There are currently **{count} government schemes** available.\n\nHere are the latest ones:\n"
                    for idx, s in enumerate(schemes):
                        title = s.get('title', 'Unknown Scheme')
                        amount = s.get('amount', 'N/A')
                        desc = s.get('description', '')
                        reply += f"**{idx+1}. {title}**\n* Amount: {amount}\n* {desc[:150]}...\n\n"
                    reply += "Check the 'Government Subsidies' section in the app for more details."
                    return jsonify({"reply": reply}), 200
            return jsonify({"reply": "Check the 'Government Subsidies' section in the app for financial aid information."}), 200
            
        if 'time' in user_message:
            current_time = datetime.datetime.now().strftime("%I:%M %p")
            return jsonify({"reply": f"The current server time is {current_time}."}), 200

        if 'date' in user_message or 'today' in user_message:
            current_date = datetime.datetime.now().strftime("%B %d, %Y")
            return jsonify({"reply": f"Today's date is {current_date}."}), 200

        if any(w in user_message for w in ['temperature', 'weather', 'hot', 'cold']):
            return jsonify({"reply": "I cannot check live weather yet, but generally:\n- **Tomatoes**: Thrive in 20-30°C.\n- **Potatoes**: Prefer cool weather (15-20°C).\n- **Maize**: Needs warm weather (25-35°C)."}), 200
            
        # 3. Dynamic Database Statistical Queries
        if ('how many' in user_message or 'count' in user_message or 'total' in user_message or 'number of' in user_message) and 'user' in user_message or 'farmer' in user_message:
             if users_collection is not None:
                  count = users_collection.count_documents({})
                  return jsonify({"reply": f"We currently have **{count} registered users** on the platform!"}), 200
                  
        if 'shop' in user_message or 'store' in user_message or 'buy' in user_message:
             if shops_collection is not None:
                  count = shops_collection.count_documents({})
                  if count == 0:
                      return jsonify({"reply": "There are no shops registered nearby at the moment."}), 200
                  
                  reply = f"Here is a list of registered shops nearby:\n\n"
                  shops = list(shops_collection.find().limit(5))
                  if shops:
                       for idx, s in enumerate(shops):
                           name = s.get("name", "Unknown Shop")
                           address = s.get("address", "No address provided")
                           map_link = s.get("map_link", "")
                           reply += f"**{idx + 1}. {name}**\n* Address: {address}\n"
                           if map_link:
                               reply += f"* [Google Maps Location]({map_link})\n"
                           reply += "\n"
                  return jsonify({"reply": reply.strip()}), 200
                  
        if 'medicine' in user_message or 'pesticide' in user_message or 'treatment' in user_message:
             if medicines_collection is not None:
                  count = medicines_collection.count_documents({})
                  reply = f"Our local inventories currently list **{count} medicines/treatments**. "
                  # List a few
                  meds = list(medicines_collection.aggregate([{"$sample": {"size": 3}}]))
                  if meds:
                       names = [m.get("name", "Unknown") for m in meds]
                       reply += f"Some available options include: {', '.join(names)}."
                  return jsonify({"reply": reply}), 200
                  
        if 'consultation' in user_message or 'expert' in user_message or 'help' in user_message:
              if consultations_collection is not None:
                  total = consultations_collection.count_documents({})
                  resolved = consultations_collection.count_documents({"status": "Resolved"})
                  return jsonify({"reply": f"Our experts have handled a total of **{total} consultation requests**, with **{resolved} already resolved**."}), 200

        if any(phrases in user_message for phrases in ['and so on', 'etc', 'what else']):
             return jsonify({"reply": "I can help you identify plant diseases, suggest treatments, find local shops for medicines, provide platform statistics, summarize recent government schemes, list common diseases for your crops, and fetch the latest admin announcements! How can I help you today?"}), 200

        # 4. Search for Disease Matches in DISEASE_DATA_DICT
        # Optimized Keyword Scoring
        user_tokens = set(user_message.split())
        # Filter stopwords
        stopwords = {'the', 'is', 'a', 'an', 'in', 'on', 'of', 'for', 'to', 'my', 'has', 'have', 'i', 'it', 'what', 'are', 'list', 'related', 'specific', 'species', 'about', 'diseases', 'disease', 'show', 'tell', 'me'}
        user_tokens = {t for t in user_tokens if t not in stopwords and len(t) > 2}
        
        # Check if asking to LIST diseases for a specific crop/species
        if any(w in user_message for w in ['list', 'related to', 'affecting', 'for']):
            # Filter tokens to find potential species
            species_candidates = list(user_tokens)
            if species_candidates:
                # Let's try to match them against our data
                related_diseases = []
                # grab the best keyword heuristically (e.g. longest or first)
                for crop_token in species_candidates:
                    matches_for_crop = []
                    for d_id, data in DISEASE_DATA_DICT.items():
                        if crop_token in d_id.lower() or crop_token in data.get('name', '').lower():
                            matches_for_crop.append(data.get('name', d_id))
                    
                    if len(matches_for_crop) > len(related_diseases):
                        related_diseases = matches_for_crop
                        best_crop = crop_token

                if related_diseases:
                    reply = f"Here are some diseases commonly related to **{best_crop.capitalize()}**:\n\n"
                    # Return top 5
                    for idx, name in enumerate(related_diseases[:5]):
                        reply += f"{idx+1}. {name}\n"
                    if len(related_diseases) > 5:
                        reply += f"\n...and {len(related_diseases) - 5} more."
                    return jsonify({"reply": reply}), 200
        
        candidate_scores = {}
        
        for token in user_tokens:
            # Check for exact matches in index
            if token in SEARCH_INDEX:
                for d_id in SEARCH_INDEX[token]:
                    candidate_scores[d_id] = candidate_scores.get(d_id, 0) + 1
                    
            # Optional: Check for partial matches
            else:
                 matches = difflib.get_close_matches(token, SEARCH_INDEX.keys(), n=1, cutoff=0.85)
                 if matches:
                     matched_key = matches[0]
                     for d_id in SEARCH_INDEX[matched_key]:
                          candidate_scores[d_id] = candidate_scores.get(d_id, 0) + 0.8 # Slightly lower score
        
        # Sort mechanisms
        if not candidate_scores:
             return jsonify({"reply": "I couldn't find a specific disease matching your description, and I don't see any matching system commands. Please try mentioning a crop name (e.g. 'Tomato') and symptoms, ask for diseases related to a crop, ask about government schemes, or ask me for platform statistics!"}), 200
             
        # Get top match
        best_id = max(candidate_scores, key=candidate_scores.get)
        best_score = candidate_scores[best_id]
        
        # Threshold check - at least 1 strong match
        if best_score < 0.8:
            return jsonify({"reply": "I'm not sure which disease or command you are referring to. Please be more specific."}), 200

        best_match = DISEASE_DATA_DICT[best_id]
        
        # Construct response
        reply = f"**{best_match['name']}**\n\n"
        desc = best_match.get('description', 'No description available.')
        reply += f"**Description:**\n{desc[:300]}...\n\n" # Truncate description

        symptoms = best_match.get('symptoms', [])
        if symptoms:
            reply += "**Symptoms:**\n"
            if isinstance(symptoms, list):
                for sym in symptoms:
                    reply += f"- {sym}\n"
            else:
                reply += f"{symptoms}\n"
            reply += "\n"
        
        reply += "**Treatments (Medicines):**\n"
        treatments = best_match.get('treatments', {})
        
        has_treatment = False
        if treatments.get('organic') and treatments['organic']:
            reply += f"- **Organic**: {treatments['organic'][0]}\n"
            has_treatment = True
        if treatments.get('inorganic') and treatments['inorganic']:
            reply += f"- **Chemical**: {treatments['inorganic'][0]}\n"
            has_treatment = True
        if treatments.get('homemade') and treatments['homemade']:
            reply += f"- **Home Remedy**: {treatments['homemade'][0]}\n"
            has_treatment = True
            
        if not has_treatment:
            reply += "No specific treatments listed yet.\n"
            
        return jsonify({"reply": reply}), 200

    except Exception as e:
        print(f"Chatbot API Error: {e}")
        return jsonify({"reply": "I'm having trouble connecting to my local database right now. Please try again later."}), 500


@app.route('/treatments', methods=['GET'])
def get_treatments():
    # Merge CSV data with DB data
    db_medicines = []
    if medicines_collection is not None:
        cursor = medicines_collection.find({}, {'_id': 0}) # Exclude ID for simplicity or convert it
        for doc in cursor:
            # Format to match the structure if possible, or just append
            db_medicines.append(doc)
            
    # Combine or return as separate keys
    return jsonify({
        "csv_data": DISEASE_DATA_DICT, # Now includes DB overrides
        "db_data": db_medicines
    })

# --- Shop Routes ---
@app.route('/shops', methods=['GET'])
def get_shops():
    if shops_collection is None:
        return jsonify([])
    shops = list(shops_collection.find())
    for shop in shops:
        shop['_id'] = str(shop['_id'])
    return jsonify(shops)

@app.route('/admin/shops', methods=['POST'])
def add_shop():
    if shops_collection is None:
        return jsonify({"error": "Database unavailable"}), 503
        
    # Support both Form (for images) and JSON
    data = request.form if request.form else request.json
    if not data: data = {}

    # Basic validation
    required = ['name', 'address', 'contact']
    if not all(k in data for k in required):
        return jsonify({"error": "Missing fields"}), 400
    
    shop_data = {
        "name": data.get('name'),
        "address": data.get('address'),
        "contact": data.get('contact'),
        "location": data.get('location', ''),
        "map_link": data.get('map_link', ''),
        "photo": data.get('photo', '') # Fallback to URL if provided text
    }

    # Handle Image Upload
    if 'image' in request.files:
        file = request.files['image']
        if file and allowed_file(file.filename):
            shops_dir = os.path.join(app.config['UPLOAD_FOLDER'], 'shops')
            os.makedirs(shops_dir, exist_ok=True)
            
            filename = secure_filename(f"shop_{int(datetime.datetime.now().timestamp())}_{file.filename}")
            file.save(os.path.join(shops_dir, filename))
            shop_data['photo'] = f"http://localhost:5000/uploads/shops/{filename}"

    shops_collection.insert_one(shop_data)
    return jsonify({"message": "Shop added"}), 201

@app.route('/admin/shops/<shop_id>', methods=['PUT'])
def update_shop(shop_id):
    if shops_collection is None:
        return jsonify({"error": "Database unavailable"}), 503
    
    # Support both Form (for images) and JSON
    data = request.form if request.form else request.json
    if not data: data = {}
    
    update_data = {
        "name": data.get('name'),
        "address": data.get('address'),
        "contact": data.get('contact'),
        "location": data.get('location'),
        "map_link": data.get('map_link')
    }
    
    # Prune None
    update_data = {k: v for k, v in update_data.items() if v is not None}
    
    if 'photo' in data and data['photo']:
         update_data['photo'] = data['photo']

    # Handle Image Upload
    if 'image' in request.files:
        file = request.files['image']
        if file and allowed_file(file.filename):
            shops_dir = os.path.join(app.config['UPLOAD_FOLDER'], 'shops')
            os.makedirs(shops_dir, exist_ok=True)
            
            filename = secure_filename(f"shop_{int(datetime.datetime.now().timestamp())}_{file.filename}")
            file.save(os.path.join(shops_dir, filename))
            update_data['photo'] = f"http://localhost:5000/uploads/shops/{filename}"

    try:
        result = shops_collection.update_one(
            {"_id": ObjectId(shop_id)},
            {"$set": update_data}
        )
        if result.matched_count == 0:
            return jsonify({"error": "Shop not found"}), 404
        return jsonify({"message": "Shop updated"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/admin/shops/<shop_id>', methods=['DELETE'])
def delete_shop(shop_id):
    if shops_collection is None:
        return jsonify({"error": "Database unavailable"}), 503
        
    try:
        result = shops_collection.delete_one({"_id": ObjectId(shop_id)})
        if result.deleted_count == 0:
            return jsonify({"error": "Shop not found"}), 404
        return jsonify({"message": "Shop deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# --- Medicine Routes ---
@app.route('/medicines', methods=['GET'])
def get_medicines():
    if medicines_collection is None:
        return jsonify([])
    medicines = list(medicines_collection.find())
    for med in medicines:
        med['_id'] = str(med['_id'])
    return jsonify(medicines)

@app.route('/admin/medicines', methods=['POST'])
def add_medicine():
    if medicines_collection is None: return jsonify({"error": "DB Error"}), 500
    
    # Handle both JSON and Form data for flexibility, though images require Form
    data = request.form if request.form else request.json
    if not data: data = {}
    
    name = data.get('name')
    if not name: return jsonify({"error": "Name required"}), 400
    
    new_med = {
        "name": name,
        "plant": data.get('plant', ''),
        "diseases": data.get('diseases', ''),
        "symptoms": data.get('symptoms', ''),
        "usage": data.get('usage', ''),
        "type": data.get('type', 'Organic'),
        "image": None
    }
    
    if 'image' in request.files:
        file = request.files['image']
        if file and allowed_file(file.filename):
            filename = secure_filename(f"med_{int(datetime.datetime.now().timestamp())}_{file.filename}")
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], 'medicines', filename))
            new_med['image'] = f"medicines/{filename}"

    try:
        res = medicines_collection.insert_one(new_med)
        new_med['_id'] = str(res.inserted_id)
        return jsonify(new_med), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/admin/medicines/<id>', methods=['PUT'])
def update_medicine(id):
    if medicines_collection is None: return jsonify({"error": "DB Error"}), 500
    
    data = request.form if request.form else request.json
    if not data: data = {}
    
    update_data = {
        "name": data.get('name'),
        "plant": data.get('plant'),
        "diseases": data.get('diseases'),
        "symptoms": data.get('symptoms'),
        "usage": data.get('usage'),
        "type": data.get('type')
    }
    
    # Prune None
    update_data = {k: v for k, v in update_data.items() if v is not None}
    
    if 'image' in request.files:
        file = request.files['image']
        if file and allowed_file(file.filename):
            filename = secure_filename(f"med_{int(datetime.datetime.now().timestamp())}_{file.filename}")
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], 'medicines', filename))
            update_data['image'] = f"medicines/{filename}"

    try:
        result = medicines_collection.update_one({"_id": ObjectId(id)}, {"$set": update_data})
        if result.matched_count == 0:
            return jsonify({"error": "Medicine not found"}), 404
        return jsonify({"message": "Updated"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/admin/medicines/<med_id>', methods=['DELETE'])
def delete_medicine(med_id):
    if medicines_collection is None:
        return jsonify({"error": "Database unavailable"}), 503
        
    try:
        result = medicines_collection.delete_one({"_id": ObjectId(med_id)})
        if result.deleted_count == 0:
            return jsonify({"error": "Medicine not found"}), 404
        return jsonify({"message": "Medicine deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/medicines/suggest', methods=['POST'])
def suggest_medicine():
    if medicines_collection is None:
        return jsonify({"error": "Database unavailable"}), 503
        
    data = request.json
    plant = data.get('plant')
    disease = data.get('disease')
    
    if not plant or not disease:
        return jsonify({"error": "Please provide plant and disease names"}), 400
        
    # Search in 'diseases' field (which might be comma-separated)
    query = {
        "plant": {"$regex": f"^{plant}$", "$options": "i"},
        "diseases": {"$regex": f"{disease}", "$options": "i"}
    }
    
    results = list(medicines_collection.find(query))
    
    if not results:
        return jsonify({"message": "Not found sorry for inconvenience", "data": []}), 200
        
    for res in results:
        res['_id'] = str(res['_id'])
        
    return jsonify({"message": "Medicines found", "data": results}), 200

# --- Subsidy Routes ---
@app.route('/subsidies', methods=['GET'])
def get_subsidies():
    if subsidies_collection is None: return jsonify([]), 200
    subsidies = list(subsidies_collection.find().sort("date_posted", -1))
    for s in subsidies: s['_id'] = str(s['_id'])
    return jsonify(subsidies), 200

@app.route('/admin/subsidies', methods=['POST'])
def add_subsidy():
    if subsidies_collection is None: return jsonify("DB Error"), 503
    
    # Handle Form Data
    data = request.form if request.form else request.json
    if not data: data = {}
    
    title = data.get('title')
    description = data.get('description')
    
    if not title or not description:
        return jsonify({"error": "Title and Description required"}), 400
    
    subsidy = {
        "title": title,
        "description": description,
        "link": data.get('link', ''),
        "date_posted": datetime.datetime.now().strftime("%Y-%m-%d"),
        "image": None
    }

    # Handle Image Upload
    if 'image' in request.files:
        file = request.files['image']
        if file and allowed_file(file.filename):
            subsidies_dir = os.path.join(app.config['UPLOAD_FOLDER'], 'subsidies')
            os.makedirs(subsidies_dir, exist_ok=True)
            
            filename = secure_filename(f"scheme_{int(datetime.datetime.now().timestamp())}_{file.filename}")
            file.save(os.path.join(subsidies_dir, filename))
            subsidy['image'] = f"subsidies/{filename}"

    # Handle Brochure Upload
    if 'brochure' in request.files:
        file = request.files['brochure']
        # Allow PDF and Images
        if file and (allowed_file(file.filename) or file.filename.lower().endswith('.pdf')):
            subsidies_dir = os.path.join(app.config['UPLOAD_FOLDER'], 'subsidies')
            os.makedirs(subsidies_dir, exist_ok=True)
            
            filename = secure_filename(f"brochure_{int(datetime.datetime.now().timestamp())}_{file.filename}")
            file.save(os.path.join(subsidies_dir, filename))
            subsidy['brochure'] = f"subsidies/{filename}"
    
    subsidies_collection.insert_one(subsidy)
    return jsonify({"message": "Subsidy added"}), 201

@app.route('/admin/subsidies/<id>', methods=['DELETE'])
def delete_subsidy(id):
    if subsidies_collection is None: return jsonify("DB Error"), 503
    subsidies_collection.delete_one({"_id": ObjectId(id)})
    return jsonify({"message": "Subsidy deleted"}), 200

# --- Forum Routes ---
@app.route('/forum/posts', methods=['GET'])
def get_forum_posts():
    if forum_collection is None: return jsonify([]), 200
    
    # Public endpoint: Filter out hidden posts
    query = {"is_hidden": {"$ne": True}}
    posts = list(forum_collection.find(query).sort("timestamp", -1))
    
    for p in posts: p['_id'] = str(p['_id'])
    return jsonify(posts), 200

@app.route('/api/admin/forum/posts', methods=['GET'])
def get_admin_forum_posts():
    if forum_collection is None: return jsonify([]), 200
    
    # Admin endpoint: Return ALL posts
    posts = list(forum_collection.find().sort("timestamp", -1))
    
    for p in posts: p['_id'] = str(p['_id'])
    return jsonify(posts), 200

@app.route('/api/admin/forum/posts/<id>/toggle-hidden', methods=['PUT'])
def toggle_forum_post_hidden(id):
    if forum_collection is None: return jsonify("DB Error"), 503
    
    try:
        post = forum_collection.find_one({"_id": ObjectId(id)})
        if not post: return jsonify({"error": "Post not found"}), 404
        
        new_status = not post.get('is_hidden', False)
        
        forum_collection.update_one(
            {"_id": ObjectId(id)},
            {"$set": {"is_hidden": new_status}}
        )
        return jsonify({"message": f"Post {'hidden' if new_status else 'visible'}", "is_hidden": new_status}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/admin/forum/posts/<id>', methods=['DELETE'])
def delete_forum_post(id):
    if forum_collection is None: return jsonify("DB Error"), 503
    
    try:
        res = forum_collection.delete_one({"_id": ObjectId(id)})
        if res.deleted_count == 0:
            return jsonify({"error": "Post not found"}), 404
        return jsonify({"message": "Post permanently deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/forum/posts', methods=['POST'])
def create_forum_post():
    if forum_collection is None: return jsonify("DB Error"), 503
    data = request.json
    if not data.get('question') or not data.get('author'):
        return jsonify({"error": "Question and Author required"}), 400
    
    post = {
        "question": data['question'],
        "author": data['author'],
        "description": data.get('description', ''),
        "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "answers": [],
        "is_hidden": False
    }
    forum_collection.insert_one(post)
    return jsonify({"message": "Post created"}), 201

@app.route('/forum/posts/<id>/answers', methods=['POST'])
def add_forum_answer(id):
    if forum_collection is None: return jsonify("DB Error"), 503
    data = request.json
    if not data.get('answer') or not data.get('author'):
        return jsonify({"error": "Answer and Author required"}), 400
    
    answer = {
        "answer": data['answer'],
        "author": data['author'],
        "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    
    forum_collection.update_one(
        {"_id": ObjectId(id)},
        {"$push": {"answers": answer}}
    )
    return jsonify({"message": "Answer added"}), 201

# --- Medicine Proposal Routes ---
@app.route('/medicines/propose', methods=['POST'])
def propose_medicine():
    if proposals_collection is None: return jsonify("DB Error"), 503
    data = request.json
    required = ['name', 'plant', 'diseases', 'symptoms', 'usage', 'type']
    if not all(k in data for k in required):
        return jsonify({"error": "Missing fields"}), 400
    
    data['status'] = 'pending'
    data['submitted_by'] = data.get('submitted_by', 'Anonymous')
    # Use user_id if provided
    if 'user_id' in data:
         data['user_id'] = data['user_id']
         
    data['timestamp'] = datetime.datetime.now().strftime("%Y-%m-%d")
    
    proposals_collection.insert_one(data)
    
    # Log Activity
    if activity_collection is not None and 'user_id' in data:
         try:
            uid = data['user_id']
            # Convert to ObjectId if valid to match login format? 
            # Actually history route handles both string and ObjectId now.
            # But let's try to be consistent with how login does it (ObjectId)
            if isinstance(uid, str) and len(uid) == 24:
                uid = ObjectId(uid)
                
            activity_collection.insert_one({
                "user_id": uid,
                "username": data.get('submitted_by', 'User'),
                "action": f"Proposed Remedy: {data['name']}",
                "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            })
         except Exception as e:
            print(f"Log Proposal Error: {e}")



    return jsonify({"message": "Proposal submitted for review"}), 201

@app.route('/api/admin/proposals', methods=['GET'])
def get_all_proposals():
    if proposals_collection is None: return jsonify([]), 200
    
    proposals = list(proposals_collection.find().sort("timestamp", -1))
    
    # Enrichment: Get User Image if available
    for p in proposals:
        p['_id'] = str(p['_id'])
        
        # If user_id exists, fetch profile image
        if 'user_id' in p:
            try:
                user = users_collection.find_one({"_id": ObjectId(p['user_id'])})
                if user and 'profile_image' in user:
                    p['user_image'] = user['profile_image']
            except: pass
            
    return jsonify(proposals), 200



@app.route('/api/proposals/my', methods=['GET'])
def get_my_proposals():
    if proposals_collection is None: return jsonify([]), 200
    user_id = request.args.get('user_id')
    if not user_id: return jsonify({"error": "User ID required"}), 400
    try:
         query = {"user_id": user_id} 
         proposals = list(proposals_collection.find(query).sort("timestamp", -1))
         for p in proposals: p['_id'] = str(p['_id'])
         return jsonify(proposals), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- Analytics Routes ---
@app.route('/api/admin/analytics/usage', methods=['GET'])
def get_usage_analytics():
    try:
        # Helper to get unique count based on a field
        def get_unique_count(collection, query, field):
            if collection is None: return 0
            return len(collection.distinct(field, query))

        # 1. Feature Usage (All Time Unique Users)
        stats = {
            "detection_users": 0,
            "forum_users": 0,
            "messaging_users": 0,
            "expert_users": 0,
            "proposal_users": 0
        }

        # Detection: Users who have scanned (action starts with "Scanned")
        if activity_collection is not None:
             stats["detection_users"] = get_unique_count(activity_collection, {"action": {"$regex": "^Scanned"}}, "user_id")

        # Forum: Unique authors
        if forum_collection is not None:
            stats["forum_users"] = get_unique_count(forum_collection, {}, "author")

        # Messaging: Unique senders
        if messages_collection is not None:
            stats["messaging_users"] = get_unique_count(messages_collection, {}, "sender")
            
            # Expert Interaction: Users who messaged experts or 'expert' role
            # Note: This is an approximation. Ideally we check if recipient is an expert.
            # Simplified: Senders where recipient_type is 'expert'
            stats["expert_users"] = get_unique_count(messages_collection, {"recipient_type": "expert"}, "sender")

        # Proposals: Unique submitters
        if proposals_collection is not None:
             # Identify by user_id if present, else submitted_by name
             # Using submitted_by for broader coverage of anonymous submissions if allowed
             stats["proposal_users"] = get_unique_count(proposals_collection, {}, "submitted_by")

        # 2. Disease Insights (Last 30 Days)
        insights = {
            "most_affected_plant": "N/A",
            "top_disease": "N/A",
            "total_scans_30d": 0
        }
        
        if activity_collection is not None:
            thirty_days_ago = datetime.datetime.now() - datetime.timedelta(days=30)
            # Find scans in last 30 days
            recent_scans = list(activity_collection.find({
                "action": {"$regex": "^Scanned"},
                "timestamp": {"$gte": thirty_days_ago.strftime("%Y-%m-%d")}
            }))
            
            insights["total_scans_30d"] = len(recent_scans)
            
            if recent_scans:
                plant_counts = {}
                disease_counts = {}
                
                for scan in recent_scans:
                    # Action format: "Scanned: Plant___Disease (Confidence)"
                    try:
                        # Extract "Plant___Disease"
                        content = scan['action'].split("Scanned: ")[1].split(" (")[0]
                        parts = content.split("___")
                        
                        if len(parts) >= 2:
                            plant = parts[0]
                            disease = parts[1].replace("_", " ")
                            
                            plant_counts[plant] = plant_counts.get(plant, 0) + 1
                            disease_counts[disease] = disease_counts.get(disease, 0) + 1
                    except: continue

                if plant_counts:
                    insights["most_affected_plant"] = max(plant_counts, key=plant_counts.get)
                
                if disease_counts:
                    insights["top_disease"] = max(disease_counts, key=disease_counts.get)

        return jsonify({
            "usage": stats,
            "insights": insights
        }), 200

    except Exception as e:
        print(f"Analytics Error: {e}")
        return jsonify({"error": str(e)}), 500



# --- Treatment Management Routes (Admin/Expert) ---

@app.route('/admin/treatments/<id>', methods=['PUT'])
def update_treatment(id):
    """
    Updates treatments for a specific disease ID.
    Body: { "organic": [...], "inorganic": [...], "homemade": [...] }
    """
    if treatments_collection is None: return jsonify("DB Error"), 503
    data = request.json
    
    # Validation
    if id not in DISEASE_DATA_DICT:
        return jsonify({"error": "Invalid Disease ID"}), 404
        
    update_data = {}
    if 'organic' in data: update_data['treatments.organic'] = data['organic']
    if 'inorganic' in data: update_data['treatments.inorganic'] = data['inorganic']
    if 'homemade' in data: update_data['treatments.homemade'] = data['homemade']
    
    if not update_data:
        return jsonify({"error": "No treatment data provided"}), 400

    # Upsert into MongoDB
    # structure: { _id: "Tomato___healthy", treatments: { organic: [], ... } }
    treatments_collection.update_one(
        {"_id": id},
        {"$set": update_data},
        upsert=True
    )
    
    # Refresh In-Memory Data
    refresh_disease_data()
    
    return jsonify({"message": "Treatments updated successfully", "data": DISEASE_DATA_DICT[id]}), 200

# --- Messaging Routes ---
@app.route('/messages', methods=['POST'])
def send_message():
    if messages_collection is None: return jsonify("DB Error"), 503
    data = request.json
    
    required = ['sender', 'recipient_type', 'content'] # recipient_type: 'admin', 'official'
    if not all(k in data for k in required):
        return jsonify({"error": "Missing fields"}), 400
        
    msg = {
        "sender": data['sender'],
        "recipient_type": data['recipient_type'],
        "recipient": data.get('recipient'), # Optional: Specific username to reply to
        "content": data['content'],
        "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "status": "sent"
    }
    messages_collection.insert_one(msg)
    return jsonify({"message": "Message sent"}), 201

@app.route('/messages', methods=['GET'])
def get_messages():
    if messages_collection is None: return jsonify([]), 200
    
    username = request.args.get('username')
    role = request.args.get('role')
    contact = request.args.get('contact') # For Admin/Expert to view specific chat
    
    query = {}
    
    if role in ['admin', 'expert', 'user', 'farmer']:
        if contact:
            # View chat with specific user
            me = username 
            other = contact
            
            # 1. Me -> Other
            # 2. Other -> Me (or Other -> My Role)
            
            role_type = 'admin' if role == 'admin' else 'official'
            # For farmers, they don't have a 'recipient_type' that targets them generally, 
            # so we just look for direct messages.
            
            or_conditions = [
                {"sender": me, "recipient": other},
                {"sender": other, "recipient": me}
            ]
            
            # If I am admin/expert, I also receive messages sent to my role type
            if role in ['admin', 'expert']:
                 or_conditions.append({"sender": other, "recipient_type": role_type})

            query = {"$or": or_conditions}
            
        else:
            # No specific contact 
            if role == 'admin':
                 pass # Sees all
            elif role == 'expert':
                query = {
                    "$or": [
                        {"recipient_type": "official"},
                        {"recipient": username},
                        {"sender": username}
                    ]
                }
            elif role == 'user' or role == 'farmer':
                # Farmer sees everything involving them
                 query = {
                    "$or": [
                        {"sender": username},
                        {"recipient": username}
                    ]
                }
    else:
        return jsonify([]), 200

    msgs = list(messages_collection.find(query).sort("timestamp", 1)) # Ascending for chat window
    for m in msgs: m['_id'] = str(m['_id'])
    return jsonify(msgs), 200

@app.route('/api/chat/search', methods=['GET'])
def search_chat_users():
    """
    Search for users to start a chat with.
    Supports filtering by role for "List all Experts" feature.
    Restricts Farmers from searching other Farmers.
    """
    if users_collection is None: return jsonify([]), 200
    
    query_str = request.args.get('q', '').strip()
    role_filter = request.args.get('role', None) # Optional: 'expert', 'admin', 'user'
    requester_role = request.args.get('requester_role', None) # Optional: to enforce rules

    try:
        # --- 1. Build Base Query ---
        base_query = {}
        
        # Restriction: Farmers cannot see other Farmers
        if requester_role in ['user', 'farmer']:
            # Can only see admins and experts
            base_query['role'] = {'$in': ['admin', 'expert']}

        # Restriction: Experts cannot see other Experts
        if requester_role == 'expert':
             # Can only see users/farmers and admin. NOT other experts.
             base_query['role'] = {'$in': ['user', 'farmer', 'admin']}
            
        # Role Filter (e.g. "Show me all Experts")
        if role_filter:
            # If requester is farmer and tries to filter by 'user', block it (redundant check but safe)
            if requester_role in ['user', 'farmer'] and role_filter in ['user', 'farmer']:
                return jsonify([]), 200
            
            # If requester is expert and checks 'expert', return empty
            if requester_role == 'expert' and role_filter == 'expert':
                return jsonify([]), 200
            
            if role_filter == 'farmer':
                base_query['role'] = {'$in': ['user', 'farmer']}
            else:
                base_query['role'] = role_filter

        # --- 2. Text Search ---
        if query_str:
            regex = {"$regex": query_str, "$options": "i"}
            base_query["$or"] = [{"username": regex}, {"name": regex}]
            limit = 20
        else:
            # If no query string, default to returning all (or many) for the "List All" feature
            # Only do this if a role filter is present (e.g. "List ALL Experts")
            if role_filter:
                limit = 100 # Reasonable limit for list
            else:
                limit = 20 # Default recent users

        # --- 3. Execute Query ---
        users = list(users_collection.find(
            base_query,
            {"password": 0, "email": 0, "phone": 0, "address": 0} 
        ).sort("username", 1).limit(limit))
        
        for u in users:
            u['_id'] = str(u['_id'])
            # Add role for frontend display
            if 'role' not in u: u['role'] = 'user'
            
        return jsonify(users), 200
    except Exception as e:
        print(f"Search Error: {e}")
        return jsonify({"error": str(e)}), 500
            
        return jsonify(users), 200
    except Exception as e:
        print(f"User Search Error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/chat/users', methods=['GET'])
def get_chat_users():
    """
    Returns a list of users who have chatted with the role (admin/expert).
    Used to populate the sidebar contact list.
    """
    if messages_collection is None: return jsonify([]), 200
    
    role = request.args.get('role') # 'admin' or 'expert'
    username = request.args.get('username')
    
    if not role: return jsonify({"error": "Role required"}), 400
    
    # Generic logic for any user to find who they talked to
    
    match_conditions = [
        {"recipient": username}, # Sent to me directly
        {"sender": username}     # Sent BY me
    ]
    
    # If I am admin/expert, I also see messages sent to my role
    if role in ['admin', 'expert']:
        recipient_type = 'admin' if role == 'admin' else 'official'
        match_conditions.append({"recipient_type": recipient_type})

    
    try:
        # Pipeline to get unique contacts
        pipeline = [
            {
                "$match": {
                    "$or": match_conditions
                }
            },
            {
                "$facet": {
                    "incoming": [
                        {"$match": {"sender": {"$ne": username}}}, # Exclude self
                        {"$group": {"_id": "$sender"}} 
                    ],
                    "outgoing": [
                        {"$match": {"sender": username}},
                        {"$group": {"_id": "$recipient"}}
                    ]
                }
            }
        ]
        
        results = list(messages_collection.aggregate(pipeline))
        
        # Combine unique users
        unique_users = set()
        
        if results:
            for item in results[0]['incoming']:
                if item['_id']: unique_users.add(item['_id'])
            for item in results[0]['outgoing']:
                if item['_id']: unique_users.add(item['_id'])
                
        # Filter out 'admin'/'expert' generic names if any
        # Fetch user details (optional) or just return names
        
        users_list = []
        for u_name in unique_users:
            # Optionally fetch profile image
            user_info = {"username": u_name}
            if users_collection is not None:
                 u_doc = users_collection.find_one({"username": u_name})
                 if u_doc:
                     user_info['role'] = u_doc.get('role', 'farmer')
                     user_info['profile_image'] = u_doc.get('profile_image')
                     if user_info['role'] == 'expert':
                         user_info['specialization'] = u_doc.get('specialization')
            
            # Simple Last Message Fetch (Inefficient but works for small scale)
            last_msg = messages_collection.find_one(
                {"$or": [{"sender": u_name}, {"recipient": u_name}]},
                sort=[("timestamp", -1)]
            )
            if last_msg:
                user_info['last_message'] = last_msg.get('content', '')[:30] + '...'
                user_info['last_timestamp'] = last_msg.get('timestamp')
            
            # --- Unread Count Logic ---
            unread_query = {
                "sender": u_name,
                "read": {"$ne": True}, # read is missing or false
                "$or": [
                    {"recipient": username},
                    {"recipient_type": 'admin' if role == 'admin' else ('official' if role == 'expert' else 'user')}
                ]
            }
            # Adjust query based on role specifically if needed
            if role == 'user' or role == 'farmer':
                 unread_query = {
                    "sender": u_name,
                    "recipient": username,
                     "read": {"$ne": True}
                }
            
            user_info['unread_count'] = messages_collection.count_documents(unread_query)
                
            users_list.append(user_info)
            
        # Sort by latest timestamp
        users_list.sort(key=lambda x: x.get('last_timestamp', ''), reverse=True)
            
        return jsonify(users_list), 200
    except Exception as e:
        print(f"Chat Users Error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/chat/read', methods=['POST'])
def mark_messages_read():
    """
    Mark all messages from a specific sender to the specific user (me) as read.
    """
    if messages_collection is None: return jsonify({"error": "DB Error"}), 503
    
    data = request.json
    my_username = data.get('username')
    my_role = data.get('role')
    sender = data.get('sender') # The person I am talking to
    
    if not all([my_username, my_role, sender]):
        return jsonify({"error": "Missing data"}), 400
        
    try:
        # Update messages where sender is the contact AND recipient is me (or my group)
        query = {
            "sender": sender,
            "read": {"$ne": True}
        }
        
        if my_role == 'user':
            query["recipient"] = my_username
        else:
            # Admin/Expert might receive role-based messages or direct ones
            query["$or"] = [
                {"recipient": my_username},
                {"recipient_type": 'admin' if my_role == 'admin' else 'official'}
            ]
            
        result = messages_collection.update_many(
            query,
            {"$set": {"read": True}}
        )
        
        return jsonify({"message": "Marked read", "count": result.modified_count}), 200
    except Exception as e:
        print(f"Mark Read Error: {e}")
        return jsonify({"error": str(e)}), 500
        
    except Exception as e:
        print(f"Error fetching chat users: {e}")
        return jsonify({"error": str(e)}), 500

# --- History Routes ---
@app.route('/history/my', methods=['GET'])
def get_user_history():
    if activity_collection is None: return jsonify([]), 200
    user_id = request.args.get('user_id')
    if not user_id: return jsonify({"error": "User ID required"}), 400
    
    try:
        # Match by user_id (string or ObjectId)
        # Handle potential ObjectId conversion issues
        try:
            uid = ObjectId(user_id)
        except:
            uid = user_id
            
        
        filter_query = {"$or": [{"user_id": str(user_id)}, {"user_id": uid}]}
        
        # Determine if user_id is stored as string or ObjectId in specific docs
        # But $or handles both.
        
        history = list(activity_collection.find(filter_query).sort("timestamp", -1).limit(50))


        
        for h in history:
            h['_id'] = str(h['_id'])
            if 'user_id' in h and isinstance(h['user_id'], ObjectId):
                h['user_id'] = str(h['user_id'])
                
        return jsonify(history), 200
    except Exception as e:
        print(f"History Fetch Error: {e}")
        return jsonify({"error": str(e)}), 500

# --- Consultation Routes ---
@app.route('/consultations', methods=['POST'])
def request_consultation():
    if consultations_collection is None: return jsonify("DB Error"), 503
    data = request.json
    required = ['farmer', 'crop', 'disease', 'description']
    if not all(k in data for k in required):
        return jsonify({"error": "Missing fields"}), 400
        
    consultation = {
        "farmer": data['farmer'],
        "crop": data['crop'],
        "disease": data['disease'],
        "description": data['description'],
        "image": data.get('image'), # URL or base64 placeholder
        "status": "pending",
        "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "replies": []
    }
    
    consultations_collection.insert_one(consultation)
    
    # Log Activity
    if activity_collection is not None and 'farmer' in data: # farmer field is usually ID
         try:
            uid = data['farmer']
            if isinstance(uid, str) and len(uid) == 24:
                uid = ObjectId(uid)
                
            activity_collection.insert_one({
                "user_id": uid,
                "username": "Farmer", # We might not have username easily here without lookup
                "action": f"Requested Consultation: {data['crop']} - {data['disease']}",
                "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            })
         except Exception as e:
            print(f"Log Consultation Error: {e}")

    return jsonify({"message": "Consultation requested"}), 201

# --- Feedback Routes ---
@app.route('/feedback', methods=['POST'])
def submit_feedback():
    if feedback_collection is None: return jsonify("DB Error"), 503
    data = request.json
    required = ['user_id', 'role', 'rating', 'feedback', 'username']
    if not all(k in data for k in required):
        return jsonify({"error": "Missing fields"}), 400
        
    feedback_entry = {
        "user_id": data['user_id'],
        "username": data['username'],
        "role": data['role'],
        "rating": data['rating'],
        "feedback": data['feedback'],
        "admin_reply": None,
        "reply_timestamp": None,
        "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    feedback_collection.insert_one(feedback_entry)
    
    # Log Activity
    if activity_collection is not None:
        activity_collection.insert_one({
            "user_id": ObjectId(data['user_id']) if len(str(data['user_id'])) == 24 else data['user_id'],
            "username": data['username'],
            "action": f"Submitted Feedback: {data['rating']} Stars",
            "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        })

    return jsonify({"message": "Feedback submitted"}), 201

@app.route('/feedback/my', methods=['GET'])
def get_my_feedback():
    if feedback_collection is None: return jsonify([]), 200
    user_id = request.args.get('user_id')
    if not user_id: return jsonify({"error": "User ID required"}), 400
    
    feedbacks = list(feedback_collection.find({"user_id": user_id}).sort("timestamp", -1))
    for f in feedbacks: f['_id'] = str(f['_id'])
    return jsonify(feedbacks), 200

@app.route('/admin/feedback', methods=['GET'])
def get_all_feedback():
    if feedback_collection is None: return jsonify([]), 200
    feedbacks = list(feedback_collection.find().sort("timestamp", -1))
    for f in feedbacks: f['_id'] = str(f['_id'])
    return jsonify(feedbacks), 200

@app.route('/admin/feedback/<id>/reply', methods=['POST'])
def reply_feedback(id):
    if feedback_collection is None: return jsonify("DB Error"), 503
    data = request.json
    reply = data.get('reply')
    if not reply: return jsonify({"error": "Reply required"}), 400
    
    result = feedback_collection.update_one(
        {"_id": ObjectId(id)},
        {"$set": {
            "admin_reply": reply,
            "reply_timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }}
    )
    if result.matched_count == 0: return jsonify({"error": "Not found"}), 404
    return jsonify({"message": "Reply sent"}), 200



@app.route('/consultations/replies/<consultation_id>', methods=['POST'])
def reply_consultation_admin(consultation_id):
    if consultations_collection is None: return jsonify("DB Error"), 503
    
    data = request.json
    reply_text = data.get('reply')
    expert_name = data.get('expert_name', 'Expert')
    
    if not reply_text: return jsonify({"error": "Reply required"}), 400
    
    try:
        consultations_collection.update_one(
            {"_id": ObjectId(consultation_id)},
            {
                "$set": {
                    "status": "responded",
                    "reply": reply_text,
                    "replied_by": expert_name,
                    "replied_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                }
            }
        )
        return jsonify({"message": "Reply sent"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/consultations/my', methods=['GET'])
def get_my_consultations():
    if consultations_collection is None: return jsonify([]), 200
    
    user_id = request.args.get('user_id')
    if not user_id: return jsonify({"error": "User ID required"}), 400
    
    try:
        # Match by farmer_id (string or ObjectId)
        uid = ObjectId(user_id) if len(user_id) == 24 else user_id
        
        # We need to check both string and ObjectId formats potentially, or standardize
        # The create_consultation uses user['id'] which is string version of ObjectId usually
        
        filter_query = {"$or": [{"farmer": str(user_id)}, {"farmer": uid}]}
        
        consultations = list(consultations_collection.find(filter_query).sort("timestamp", -1))
        
        for c in consultations:
            c['_id'] = str(c['_id'])
            if isinstance(c.get('farmer'), ObjectId):
                c['farmer'] = str(c['farmer'])
                
        return jsonify(consultations), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/consultations', methods=['GET'])
def get_consultations():
    if consultations_collection is None: return jsonify([]), 200
    consultations = list(consultations_collection.find().sort("timestamp", -1))
    for c in consultations: c['_id'] = str(c['_id'])
    return jsonify(consultations), 200

@app.route('/consultations/<id>/reply', methods=['POST'])
def reply_consultation(id):
    if consultations_collection is None: return jsonify("DB Error"), 503
    data = request.json
    if not data.get('expert') or not data.get('message'):
        return jsonify({"error": "Expert and Message required"}), 400
        
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    reply = {
        "expert": data['expert'],
        "message": data['message'],
        "timestamp": timestamp
    }
    
    consultations_collection.update_one(
        {"_id": ObjectId(id)},
        {
            "$push": {"replies": reply},
            "$set": {
                "status": "responded",
                "reply": data['message'], # For History.jsx compatibility
                "replied_by": data['expert'],
                "replied_at": timestamp
            }
        }
    )
    return jsonify({"message": "Reply added"}), 200

# -------------------------------------------------------------------
# Dataset Classes Endpoint
# -------------------------------------------------------------------
@app.route('/classes', methods=['GET'])
def get_dataset_classes():
    """
    Returns the list of 135 classes used in training,
    enriched with details from treatments.csv where available.
    """
    try:
        # 1. Load Class Indices
        # Use global INDICES_PATH defined at start of file
        json_path = INDICES_PATH
        if not os.path.exists(json_path):
            return jsonify({"error": "Model class indices not found."}), 404
            
        with open(json_path, 'r') as f:
            class_indices = json.load(f)
            
        # 2. Load Treatments/Details CSV
        csv_path = os.path.join(app.root_path, 'data', 'treatments.csv')
        treatments_map = {}
        if os.path.exists(csv_path):
            with open(csv_path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    key = row['id'].strip()
                    treatments_map[key] = row

        # 3. Construct Response
        classes_list = []
        for class_name, index in class_indices.items():
            
            # Categorize
            pv_crops = ["Apple", "Blueberry", "Cherry", "Corn", "Grape", "Orange", "Peach", "Pepper", "Potato", "Raspberry", "Soybean", "Squash", "Strawberry", "Tomato", "Rice", "Banana"]
            category = "Insect Pest"
            display_name = class_name
            
            for crop in pv_crops:
                if class_name.startswith(crop):
                    category = f"{crop} Disease"
                    break
            
            # Match details
            details = None
            if class_name in treatments_map:
                details = treatments_map[class_name]
            else:
                # Try replacing ONLY the first underscore with triple underscore
                # e.g. "Apple_Black_rot" -> "Apple___Black_rot" (Correct)
                # vs "Apple___Black___rot" (Incorrect)
                parts = class_name.split("_", 1)
                if len(parts) == 2:
                    potential_key = f"{parts[0]}___{parts[1]}"
                    if potential_key in treatments_map:
                        details = treatments_map[potential_key]
                
                # Fallback: Try exact replace if the above didn't work (legacy support)
                if not details and class_name.replace("_", "___") in treatments_map:
                     details = treatments_map[class_name.replace("_", "___")]
            
            if details:
                display_name = details.get('name', display_name)

            classes_list.append({
                "id": index,
                "original_name": class_name,
                "display_name": display_name,
                "category": category,
                "description": details.get('description', 'No description available.') if details else 'No description available.',
                "symptoms": details.get('symptoms', '') if details else '',
                "treatment_organic": details.get('treatment_organic', '') if details else '',
                "prevention": details.get('prevention', '') if details else ''
            })

        classes_list.sort(key=lambda x: (x['category'], x['display_name']))
        return jsonify(classes_list), 200

    except Exception as e:
        print(f"Error fetching classes: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/disease/update', methods=['POST'])
def update_disease_details():
    if treatments_collection is None: return jsonify({"error": "DB Error"}), 503
    data = request.json
    id = data.get('id')
    if not id: return jsonify({"error": "ID required"}), 400
    
    # Upsert logic
    update_data = {}
    if 'description' in data: update_data['description'] = data['description']
    if 'symptoms' in data: update_data['symptoms'] = data['symptoms']
    if 'prevention' in data: update_data['prevention'] = data['prevention']
    if 'name' in data: update_data['name'] = data['name']
    
    # Handle nested treatments
    treatments_payload = data.get('treatments', {})
    if 'organic' in treatments_payload: update_data['treatments.organic'] = treatments_payload['organic']
    if 'inorganic' in treatments_payload: update_data['treatments.inorganic'] = treatments_payload['inorganic']
    if 'homemade' in treatments_payload: update_data['treatments.homemade'] = treatments_payload['homemade']

    try:
        treatments_collection.update_one(
            {"_id": id},
            {"$set": update_data},
            upsert=True
        )
        refresh_disease_data()
        return jsonify({"message": "Disease data updated successfully", "disease": DISEASE_DATA_DICT.get(id, {})}), 200
    except Exception as e:
        print(f"Error updating disease: {e}")
        return jsonify({"error": str(e)}), 500



@app.route('/api/admin/import/treatments', methods=['POST'])
def import_treatments_csv():
    if treatments_collection is None: return jsonify({"error": "DB Error"}), 503
    
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file part"}), 400
            
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400
            
        if not (file.filename.endswith('.csv') or file.filename.endswith('.pdf')):
            return jsonify({"error": "File must be a CSV or PDF"}), 400


        # PDF Handling
        if file.filename.endswith('.pdf'):
            try:
                from pypdf import PdfReader
                reader = PdfReader(file)
                text = ""
                for page in reader.pages:
                    text += page.extract_text() + "\n"
                
                print(f"DEBUG PDF EXTRACT (First 500 chars):\n{text[:500]}")
                with open("debug_pdf_log.txt", "w", encoding="utf-8") as f:
                    f.write(text)
                
                # User's PDF Format Parser
                # Structure detected from logs:
                # 1. Pest Name (Standalone line)
                # 2. "<Name> infestation shows symptoms such as..." (Symptoms)
                # 3. "Neem oil / biopesticide (2%): ..." (Organic)
                # 4. "Chemical pesticide: ..." (Inorganic)
                # 5. "Homemade remedy: ..." (Homemade)
                
                rows = []
                lines = text.split('\n')
                current_doc = {}
                
                # Keywords to skip or identify sections
                headers_to_skip = ["Pest Name", "Symptoms", "Organic", "Inorganic", "Homemade", "General preventive measures:"]

                for i, line in enumerate(lines):
                    line = line.strip()
                    if not line or line in headers_to_skip: continue
                    
                    # Check for Treatments (These signal the end of a block/section)
                    if line.startswith("Neem oil") or "biopesticide" in line:
                         if current_doc: current_doc['treatment_organic'] = line
                         continue
                    
                    if line.startswith("Chemical pesticide") or "Chemical fertilizer" in line:
                         if current_doc: current_doc['treatment_inorganic'] = line
                         continue

                    if line.startswith("Homemade remedy"):
                         if current_doc: current_doc['treatment_homemade'] = line
                         # End of this pest's block usually, but let's keep adding until new name
                         continue
                         
                    # Check for Symptoms (usually starts with "<Name> infestation...")
                    if "infestation shows symptoms" in line:
                        # This line contains symptoms. 
                        # The Pest Name is likely the previous line(s) OR the start of this line.
                        # Pattern: "Xylotrechus infestation shows..." -> Name is Xylotrechus
                        
                        infestation_index = line.find(" infestation shows symptoms")
                        if infestation_index != -1:
                            potential_name = line[:infestation_index].strip()
                            symptoms_text = line[infestation_index:].strip()
                            
                            # If we haven't started a doc, or the name is different, start new
                            if not current_doc or (current_doc.get('name') != potential_name):
                                if current_doc and current_doc.get('name'):
                                    rows.append(current_doc) # Save previous
                                
                                current_doc = {
                                    "name": potential_name,
                                    "id": potential_name.replace(" ", "_"),
                                    "symptoms": symptoms_text
                                }
                            else:
                                # Just update symptoms if missing
                                current_doc['symptoms'] = symptoms_text
                        continue

                    # Fallback: If line is short and looks like a name (and we expect a name)
                    # But the "infestation" line is the strongest signal. 
                    # Let's rely on the "infestation" line to trigger a new record if we aren't in one.
                    
                    # If we are parsing multi-line description/treatments, append? 
                    # For now, simplistic capture.

                # Capture last doc
                if current_doc and current_doc.get('name'):
                    rows.append(current_doc)
                
                print(f"DEBUG PDF PARSER: Found {len(rows)} records.")
                
                reader = rows
                
            except ImportError:
                 return jsonify({"error": "pypdf library not found. Please install it."}), 500
            except Exception as ex:
                 return jsonify({"error": f"Failed to parse PDF: {str(ex)}"}), 400
        
        else:
            # CSV Handling (Existing Logic)
            try:
                content = file.stream.read().decode("utf-8-sig")
            except UnicodeDecodeError:
                try:
                    file.stream.seek(0)
                    content = file.stream.read().decode("latin-1")
                except:
                    return jsonify({"error": "File encoding not supported. Save as UTF-8 CSV."}), 400

            stream = io.StringIO(content, newline=None)
            reader = csv.DictReader(stream)
            
            # Normalize headers
        if hasattr(reader, 'fieldnames') and reader.fieldnames:
            print(f"DEBUG IMPORT: Received Headers: {reader.fieldnames}")
            reader.fieldnames = [f.strip() for f in reader.fieldnames]
            print(f"DEBUG IMPORT: Normalized Headers: {reader.fieldnames}")

        imported_count = 0
        updated_count = 0
        errors = []

        for i, row in enumerate(reader):
            if i < 3: print(f"DEBUG IMPORT Row {i}: {row}") 
            
            doc_id = row.get('id') or row.get('ID')
            
            # Handle headers with potential invisible chars
            if not doc_id:
                 for k in row.keys():
                     if k and k.strip().lower() == 'id':
                         doc_id = row[k]
                         break

            name = row.get('name') or row.get('Name') or row.get('Pest Name') or row.get('pest name')
            
            if not doc_id and name:
                clean_name = name.strip()
                existing = treatments_collection.find_one({"name": clean_name})
                if existing:
                    doc_id = existing['_id']
                else:
                    doc_id = clean_name.replace(" ", "_")
            
            if not doc_id:
                errors.append(f"Row {i+1}: Missing ID or Name.")
                continue
                
            update_doc = {}
            if row.get('description'): update_doc['description'] = row.get('description')
            if row.get('prevention'): update_doc['prevention'] = row.get('prevention')
            
            symptoms_raw = row.get('symptoms') or row.get('Symptoms')
            if symptoms_raw:
                update_doc['symptoms'] = [s.strip() for s in symptoms_raw.replace(';', ',').split(',') if s.strip()]
                
            treatments = {}
            t_org = row.get('treatment_organic') or row.get('Organic') or row.get('organic')
            t_inorg = row.get('treatment_inorganic') or row.get('Inorganic') or row.get('inorganic') or row.get('Chemical') or row.get('chemical')
            t_home = row.get('treatment_homemade') or row.get('Homemade') or row.get('homemade')
            
            if t_org: treatments['organic'] = [t.strip() for t in t_org.replace(';', ',').split(',') if t.strip()]
            if t_inorg: treatments['inorganic'] = [t.strip() for t in t_inorg.replace(';', ',').split(',') if t.strip()]
            if t_home: treatments['homemade'] = [t.strip() for t in t_home.replace(';', ',').split(',') if t.strip()]
            
            if treatments:
                for k, v in treatments.items():
                    update_doc[f'treatments.{k}'] = v
            
            if not update_doc:
                errors.append(f"Row {i+1}: Empty data.")
                continue

            res = treatments_collection.update_one(
                {"_id": doc_id},
                {"$set": update_doc},
                upsert=True
            )
            
            if res.upserted_id or treatments_collection.count_documents({"_id": doc_id, "name": {"$exists": False}}):
                if name:
                    treatments_collection.update_one({"_id": doc_id}, {"$set": {"name": name}})
            
            if res.upserted_id:
                imported_count += 1
            elif res.modified_count > 0:
                updated_count += 1
                
        if imported_count == 0 and updated_count == 0 and not errors:
             errors.append("No records processed. Check headers (Expected: 'Pest Name' or 'ID').")

        refresh_disease_data()
        
        debug_headers = []
        if hasattr(reader, 'fieldnames'):
             debug_headers = reader.fieldnames
        
        return jsonify({
            "message": "Import processed",
            "imported": imported_count,
            "updated": updated_count,
            "errors": errors[:10],
            "debug_headers": debug_headers
        }), 200

    except Exception as e:
        print(f"Import Error: {e}")
        return jsonify({"error": f"Server Error: {str(e)}"}), 500


# --- Proposal Routes ---
@app.route('/api/expert/proposals', methods=['POST'])
def submit_proposal():
    if proposals_collection is None: return jsonify("DB Error"), 503
    data = request.json
    
    # Validation
    if not data.get('id') or not data.get('expert'):
        return jsonify({"error": "Missing required fields"}), 400
        
    proposal = {
        "disease_id": data['id'],
        "disease_name": data.get('name'),
        "changes": {
            "symptoms": data.get('symptoms'),
            "treatments": data.get('treatments'),
            "description": data.get('description')
        },
        "expert": data['expert'],
        "status": "pending",
        "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    
    proposals_collection.insert_one(proposal)
    return jsonify({"message": "Proposal submitted for review"}), 201



@app.route('/api/admin/proposals/<pid>/approve', methods=['POST'])
def approve_proposal(pid):
    if proposals_collection is None: return jsonify("DB Error"), 503
    
    prop = proposals_collection.find_one({"_id": ObjectId(pid)})
    if not prop: return jsonify({"error": "Proposal not found"}), 404
    
    # Determine Proposal Type
    # Expert Proposal has 'changes' dict
    # User Proposal has 'usage' and 'type' directly or implies medicine addition
    
    # CASE 1: Expert Proposal (Modifying Disease)
    if 'changes' in prop and prop['changes']:
        if treatments_collection is not None:
            update_doc = {}
            changes = prop['changes']
            
            if changes.get('description'): update_doc['description'] = changes['description']
            if changes.get('symptoms'): update_doc['symptoms'] = changes['symptoms']
            
            if changes.get('treatments'): 
                 update_doc['treatments'] = changes['treatments']
            
            try:
                treatments_collection.update_one(
                    {"_id": prop['disease_id']},
                    {"$set": update_doc},
                    upsert=True
                )
            except Exception as e:
                return jsonify({"error": f"Failed to apply updates: {str(e)}"}), 500

    # CASE 2: User Medicine Proposal (New Homemade Remedy)
    # Check for fields common in medicine proposal
    elif 'usage' in prop and 'type' in prop:
        if medicines_collection is not None:
            new_med = {
                "name": prop.get('name'),
                "plant": prop.get('plant'),
                "diseases": prop.get('diseases'),
                "symptoms": prop.get('symptoms'),
                "usage": prop.get('usage'),
                "type": prop.get('type', 'Homemade'),
                "submitted_by": prop.get('submitted_by'),
                "approved_at": datetime.datetime.now().strftime("%Y-%m-%d"),
                "image": None 
            }
            try:
                medicines_collection.insert_one(new_med)
            except Exception as e:
                return jsonify({"error": f"Failed to add medicine: {str(e)}"}), 500

    # 2. Mark Proposal Accepted
    proposals_collection.update_one(
        {"_id": ObjectId(pid)}, 
        {"$set": {"status": "accepted", "reviewed_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")}}
    )
    
    # 3. Dynamic Refresh
    try:
        refresh_disease_data()
    except Exception as e:
        print(f"Refresh failed: {e}")
    
    return jsonify({"message": "Proposal approved and applied"}), 200

@app.route('/api/admin/proposals/<pid>/reject', methods=['POST'])
def reject_proposal(pid):
    if proposals_collection is None: return jsonify("DB Error"), 503
    
    data = request.json or {}
    reason = data.get('reason', '')
    
    update_data = {
        "status": "rejected", 
        "reviewed_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    if reason:
        update_data["rejection_reason"] = reason

    proposals_collection.update_one(
        {"_id": ObjectId(pid)}, 
        {"$set": update_data}
    )
    return jsonify({"message": "Proposal rejected"}), 200



if __name__ == '__main__':
    # Initialize Data
    try:
        refresh_disease_data()
    except Exception as e:
        print(f"Failed to load initial data: {e}")

    print(app.url_map)
    # Disable reloader to prevent "WinError 10038" during heavy training subprocesses
    app.run(host='0.0.0.0', debug=True, use_reloader=False, port=5000)
