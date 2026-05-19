# Smart Pest Management System
## Features and Technology Stack Summary

### 1. Key Features

**Farmer Interface**
-   **AI Disease Detection**: Upload leaf images to detect diseases offline (MobileNetV2).
-   **Medicine Recommendations**: Get Organic, Inorganic, and Homemade treatment options.
-   **Offline Chatbot**: Ask questions about crops and diseases without internet.
-   **Shop Locator**: Find nearby pesticide shops.
-   **Forums**: Discuss issues with other farmers (Community Meds).
-   **Government Schemes**: View latest agricultural subsidies.

**Admin Interface**
-   **User Management**: Manage Farmers and Experts (Suspend/Delete).
-   **Inventory Control**: Manage Shops and Medicines.
-   **Visual Filtering**: Color-coded medicine filters (Organic=Green, Inorganic=Red).
-   **AI Model Retraining**: Update the detection model directly from the dashboard.
-   **Analytics**: View system usage stats and activity logs.

**Expert Interface**
-   **Consultation Dashboard**: View and reply to farmer consultation requests.
-   **Case History**: Track solved cases.

### 2. Technology Stack

**Frontend (User Interface)**
-   **React.js**: Component-based UI framework.
-   **Vite**: Fast build tool and dev server.
-   **Tailwind CSS**: Utility-first styling for a responsive, nature-themed design.
-   **Lucide React**: Modern icon set.

**Backend (Server & logic)**
-   **Python Flask**: Lightweight WSGI web application framework.
-   **PyTorch**: Deep learning framework for the CNN model.
-   **Pillow (PIL)**: Image processing.

**Database**
-   **MongoDB**: NoSQL database for flexible data storage (Users, Medicines, Logs).
-   **PyMongo**: Python driver for MongoDB.

**AI & Machine Learning**
-   **MobileNetV2**: Efficient Convolutional Neural Network (CNN) optimized for local deployment.
-   **Torchvision**: Transformations and model architecture.

**Deployment & Environment**
-   **Offline-First Architecture**: Core AI runs locally.
-   **REST API**: Communication between frontend and backend.
