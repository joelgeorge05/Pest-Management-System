# Smart Pest Management System - Project Report Context

## 1. Abstract
Agriculture is highly vulnerable to crop diseases and pests, which can significantly reduce crop yields and cause severe economic losses. Early and accurate detection of these issues is crucial for effective treatment; however, many farmers lack immediate access to agricultural experts or reliable internet connectivity in rural farming areas. This project introduces the **Smart Pest Management System**, an offline-first, AI-driven web application designed to empower farmers with accessible, real-time crop disease diagnosis and tailored treatment recommendations.

The core of the system utilizes a lightweight Convolutional Neural Network (MobileNetV2), integrated within a PyTorch and Python Flask backend, allowing it to classify crop diseases from uploaded leaf images efficiently and locally, without requiring an active internet connection. The user interface, built with React.js and Vite, provides a responsive, nature-themed, and intuitive experience customized for farmers. 

Key features of the platform include offline AI disease detection, visually categorized treatment prescriptions (organic, inorganic, and homemade), a localized rule-based chatbot for instant query resolution, and a community forum for peer-to-peer knowledge sharing. Furthermore, the system bridges the gap between technology and human expertise by offering a consultation module where farmers can connect with verified agricultural experts for complex issues, alongside directories locating nearby pesticide shops and government subsidies.

By combining edge-capable artificial intelligence with a robust decoupled architecture (React, Flask, and MongoDB), the Smart Pest Management System delivers a scalable, reliable, and user-centric solution. It works to significantly mitigate agricultural losses and democratize access to advanced farming technology for rural communities.

*Keywords: Deep Learning, MobileNetV2, Precision Agriculture, Crop Disease Detection, Offline-First Architecture, React, Flask, MongoDB.*

---

## 2. Technology Stack & Software Specifications

The system is built using a modern decoupled architecture (Client-Server), with a focus on local offline capabilities for the AI components.

### 2.1 Frontend (User Interface)
*   **Framework:** React.js (v19.2) - Component-based UI framework.
*   **Build Tool & Dev Server:** Vite (v7.2) - For fast hot-module replacement and optimized production builds.
*   **Styling Engine:** Tailwind CSS (v3.4) - Utility-first CSS framework used for responsive, visually appealing, and nature-themed design.
*   **Icons & Assets:** Lucide React.
*   **HTTP Client:** Native `fetch` API for asynchronous backend communication.

### 2.2 Backend (Server & API)
*   **Framework:** Python Flask (v3.1) - Lightweight WSGI web backend framework serving REST APIs.
*   **Authentication:** Custom JWT/Session-based implementation.
*   **File Handling:** Werkzeug `secure_filename` for handling image uploads.

### 2.3 Artificial Intelligence & Machine Learning
*   **Deep Learning Framework:** PyTorch (`torch`, `torchvision`).
*   **Computer Vision Model:** MobileNetV2 (with hooks for Hybrid Ensembles like EfficientNet and Swin Transformer), optimized for efficient local image classification.
*   **Image Processing:** Pillow (PIL) - Used for image resizing and normalization before passing to the model.
*   **NLP/Chatbot Engine:** Local offline rule-based routing using Python's `difflib` for fuzzy string matching (ensures it works without an active internet API).

### 2.4 Database Layer
*   **Database System:** MongoDB (NoSQL) - Chosen for flexible, document-based storage.
*   **Database Driver:** PyMongo (Python API).

### 2.5 Minimum System Requirements
*   **Software prerequisites:** Python 3.8+ and Node.js v16+.
*   **Database Engine:** Local MongoDB daemon running on port 27017.
*   **Hardware:** Basic Dual-core CPU with at least 4GB RAM. A GPU (CUDA-compatible) is optionally supported via PyTorch for faster model inferencing and retraining but is not mandatory for standard usage. 
*   **Storage:** Sufficient disk space for image datasets, MongoDB storage, and the exported `.pth` model weight files.

---

## 3. Database Design (Collections Schema)

Because the project utilizes MongoDB (a NoSQL document database), it does not use rigid tabular SQL schemas. However, it enforces specific document structures within Collections. Below represents the logical schema for the primary functional entities.

### 3.1 `users` Collection
Manages authentication and profiles for Farmers, Experts, and Admins.

| Field | DataType | Description |
| :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key |
| `username` | String | Unique login identifier |
| `password` | String | Plaintext representation/hash |
| `role` | String | User authorization level (`farmer`, `expert`, `admin`) |
| `name` | String | Full name of the user |
| `email` | String | User's email address |
| `address` | String | Physical address |
| `pincode` | String | Postal code |
| `phone` | String | Contact number |
| `is_suspended` | Boolean | Account status flag |
| `profile_image` | String | Path to uploaded avatar |
| `specialization` | String | Expertise area (if `role` is `expert`) |

### 3.2 `medicines` Collection
Stores treatment prescriptions (Organic, Inorganic, Homemade).

| Field | DataType | Description |
| :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key |
| `name` | String | Name of the medicine/treatment |
| `plant` | String | The crop this treats |
| `diseases` | String | Targeted disease names |
| `symptoms` | String | The symptoms it addresses |
| `usage` | String | Instructions to apply the treatment |
| `type` | String | Categorization (e.g., "Organic", "Inorganic") |
| `submitted_by`| String | Username of the creator/farmer proposing it |
| `approved_at` | String | Timestamp of admin approval |

### 3.3 `shops` Collection
Directory of local pesticide and farming equipment stores.

| Field | DataType | Description |
| :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key |
| `name` | String | Name of the shop |
| `address` | String | Physical address |
| `contact` | String | Phone number or email |
| `location` | String | General locality or city name |
| `photo` | String | URL to the uploaded shop image |

### 3.4 `activity_log` Collection
System audit log tracking actions like system logins and disease scans.

| Field | DataType | Description |
| :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key |
| `user_id` | ObjectId | Foreign key referencing `users._id` |
| `username` | String | Denormalized username for faster querying |
| `action` | String | Description of the action ("Logged in") |
| `timestamp` | String | Date/Time of action execution |

### 3.5 `treatment_proposals` Collection
Stores community submissions or expert adjustments prior to admin approval.

| Field | DataType | Description |
| :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key |
| `disease_id` | String | Target disease ID (if modifying existing) |
| `changes` | Object | Dictionary of modifications (description, treatments) |
| `status` | String | Workflow status (`pending`, `accepted`, `rejected`) |
| `timestamp` | String | Submission timestamp |
| `reviewed_at` | String | Review timestamp |
