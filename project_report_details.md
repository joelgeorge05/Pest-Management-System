# Project Report Details
## Smart Pest Management System

### 1. System Status Check
- **Backend**: ✅ Online (Flask Server)
- **Database**: ✅ Connected (MongoDB Local)
- **Frontend**: ✅ Build Successful (Vite Production Build)
- **AI Model**: ✅ Loaded (MobileNetV2, PyTorch)
- **Chatbot**: ✅ Functional (Offline Rule-Based)

### 2. Technology Stack

#### Frontend
- **Framework**: React.js (v19.2)
- **Build Tool**: Vite (v7.2)
- **Styling**: TailwindCSS (v3.4), Lucide React (Icons)
- **State Management**: React Hooks (`useState`, `useEffect`, `useContext`)
- **HTTP Client**: Native `fetch` API

#### Backend
- **Framework**: Python Flask (v3.1)
- **AI/ML**: PyTorch (`torch`, `torchvision`), PIL (Image Processing)
- **Database Driver**: PyMongo
- **Authentication**: JWT / Session-based (Custom implementation)
- **Natural Language**: `difflib` (Standard Lib) for fuzzy matching

#### Database
- **System**: MongoDB (NoSQL)
- **Collections**: `users`, `medicines`, `shops`, `consultations`, `messages`, `posts`

### 3. Key Specifications & Features

#### A. Disease Detection
- **Input**: JPG/PNG Images of crop leaves.
- **Processing**: Resized to 224x224, Normalized.
- **Model**: MobileNetV2 (Pre-trained on ImageNet, Fine-tuned on PlantVillage).
- **Output**: Disease Class Name + Confidence Score.

#### B. Offline Chatbot
- **Engine**: Local Python `difflib` (No external API).
- **Capabilities**:
    - Greeting & General Assistance.
    - Disease Lookup (Fuzzy match names).
    - Resource directing ("shops", "subsidies").

#### C. User Roles
1.  **Farmer**: Can upload images, chat, view shops, request consultation.
2.  **Expert**: Can view and reply to consultation requests.
3.  **Admin**: Can manage users (suspend/delete), shops, medicines, and view system stats.

#### D. Additional Modules
-   **Shop Locator**: Directory of pesticide shops with location data.
-   **Subsidy Portal**: Information on government agricultural schemes.
-   **Forum**: User-to-user messaging and discussion board.
-   **Weather**: Real-time integration (Placeholder/Mock logic for now).

### 4. Project Structure
-   `/src`: React Frontend Source
-   `/backend`: Flask API & AI Logic
-   `/backend/data`: Dataset & Model Weights (`.pth`)
-   `/srs`: Documentation (SRS.pdf)
