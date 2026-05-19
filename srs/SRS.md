# Software Requirements Specification
## for Smart Pest Management System

**Version**: 1.1  
**Prepared by**: Antigravity & User  
**Date**: 2026-01-31

---

## 1. Introduction

### 1.1 Purpose
The purpose of this document is to define the software requirements for the **Smart Pest Management System**. This web application is designed to assist farmers in identifying crop diseases using AI, providing treatment recommendations, managing pesticide shops, and facilitating expert consultations.

### 1.2 Document Conventions
This document uses the following conventions:
-   **Bold** text indicates important terms or headings.
-   *Italic* text indicates emphasis.
-   The term "System" refers to the Smart Pest Management System.

### 1.3 Intended Audience and Reading Suggestions
-   **Developers**: To understand the functional and non-functional requirements for implementation.
-   **Project Managers**: To track progress and ensure scope is met.
-   **Stakeholders/Farmers**: To understand the features provided by the system.
-   **Testers**: To verify the system against the requirements.

### 1.4 Product Scope
The system is a web-based platform with three primary interfaces:
1.  **Farmer Interface**: Disease detection, chatbot assistance, forum access, shop locator, and personal profile management.
2.  **Expert Interface**: Managing consultations, viewing assigned cases, and replying to farmer queries.
3.  **Admin Interface**: User management, database updates (shops, medicines, subsidies), system monitoring, and AI model retraining.

### 1.5 References
-   IEEE Std 830-1998, IEEE Recommended Practice for Software Requirements Specifications.
-   Project Source Code and Documentation.

---

## 2. Overall Description

### 2.1 Product Perspective
This system is a standalone web application. It operates locally (offline-capable for core features) but is designed to be deployment-ready. It integrates a custom-trained Convolutional Neural Network (CNN) for offline disease detection and a local rule-based chatbot.

### 2.2 Product Functions
-   **Disease Detection**: Analyze leaf images to identify diseases using MobileNetV2.
-   **Medicine Registry**: Maintain a database of Organic, Inorganic, and Homemade treatments with advanced filtering.
-   **Chatbot Assistance**: Answer queries offline using fuzzy logic.
-   **Expert Consultation**: Connect farmers with agricultural experts.
-   **Information Portal**: Display weather, shops, and government subsidies.
-   **Administration**: Manage users, content, and system resources.

### 2.3 User Classes and Characteristics
-   **Farmer**: Primary user. Needs simple, visual interfaces. Uses the app for diagnosis and advice.
-   **Agricultural Expert**: Specialized user. Reviews consultation requests and provides expert advice.
-   **Administrator**: Technical user. Manages user accounts, ensures data integrity, and updates static content.

### 2.4 Operating Environment
-   **Client**: Modern Web Browser (Chrome, Firefox, Edge).
-   **Server**: Python 3.9+ runtime, MongoDB instance (`pest_control_db`).
-   **Hardware**: Capable of running a local python server (for local deployment) or standard web server specs.

### 2.5 Design and Implementation Constraints
-   **Offline Capability**: Core features (AI, Chatbot) must work without internet.
-   **Database**: Uses MongoDB; requires a local instance.
-   **Performance**: AI Inference must be optimized for local CPU execution.

### 2.6 User Documentation
-   In-app help and walkthroughs are provided via the Chatbot and UI hints.

### 2.7 Assumptions and Dependencies
-   Users have a device with a camera and web browser.
-   Local Python environment is correctly set up with dependencies.
-   MongoDB service is running in the background.

---

## 3. External Interface Requirements

### 3.1 User Interfaces
-   **Design**: Clean, nature-themed UI using Green/White color palette.
-   **Responsive**: Mobile-friendly layout for field use.
-   **Components**: Floating chatbot, Image upload drag-and-drop, Dashboard tables.
-   **Admin Dashboard**: Dedicated tabs for History, Users, Shops, Medicines (with filters), Detection, and Subsidies.

### 3.2 Hardware Interfaces
-   **Camera**: Browser access to device camera for capturing leaf images.
-   **Storage**: Local disk access for storing uploaded images and logs.

### 3.3 Software Interfaces
-   **Database**: MongoDB connection via `pymongo`. Only `pest_control_db` is used.
-   **AI Libraries**: PyTorch (`torch`, `torchvision`) for model inference.
-   **Web Framework**: Flask (Backend) and React (Frontend).

### 3.4 Communications Interfaces
-   **HTTP/REST**: Communication between React Frontend and Flask Backend via `localhost:5000`.
-   **JSON**: Data exchange format.

---

## 4. System Features

### 4.1 Disease Detection (AI)
#### 4.1.1 Description and Priority
High Priority. The core feature allowing farmers to detect crop diseases from photos.
#### 4.1.2 Stimulus/Response Sequences
-   **Stimulus**: User uploads an image.
-   **Response**: System preprocesses image, runs inference, and returns disease class + confidence.
#### 4.1.3 Functional Requirements
-   **REQ-1**: System shall accept .jpg and .png image formats.
-   **REQ-2**: System shall use the loaded MobileNetV2 model for prediction.
-   **REQ-3**: System shall provide a confidence score for the prediction.

### 4.2 Medicine Registry & Filtering
#### 4.2.1 Description and Priority
High Priority. Allows admins to manage and farmers to view treatments.
#### 4.2.2 Stimulus/Response Sequences
-   **Stimulus**: User selects a medicine type filter (Organic, Inorganic, Homemade).
-   **Response**: The list of medicines updates to show only relevant items.
#### 4.2.3 Functional Requirements
-   **REQ-4**: System shall categorize medicines into Organic (Green), Inorganic (Red), and Homemade (Blue).
-   **REQ-5**: Admin interface shall provide one-click filters to sort the inventory.

### 4.3 Local Chatbot
#### 4.3.1 Description and Priority
High Priority. Provides instant assistance without internet.
#### 4.3.2 Functional Requirements
-   **REQ-6**: Chatbot shall operate without external API keys.
-   **REQ-7**: Chatbot shall interpret queries related to crops, diseases, shops, and subsidies.

### 4.4 Expert Consultation
#### 4.4.1 Description and Priority
Medium Priority. Connects users to human experts for complex cases.
#### 4.4.2 Functional Requirements
-   **REQ-8**: Users must be logged in to request consultation.
-   **REQ-9**: Experts shall have a dedicated dashboard to view pending requests.

### 4.5 AI Model Retraining
#### 4.5.1 Description and Priority
Medium Priority. Allows administrators to update the disease detection model with new data.
#### 4.5.2 Stimulus/Response Sequences
-   **Stimulus**: Admin triggers "Retrain Model" from the dashboard.
-   **Response**: System initiates background training, displays progress spinner, and notifies success upon completion.
#### 4.5.3 Functional Requirements
-   **REQ-10**: System shall prevent multiple concurrent training sessions.
-   **REQ-11**: System must provide real-time visual feedback (spinner/logs) during training.

---

## 5. Other Nonfunctional Requirements

### 5.1 Performance Requirements
-   **Response Time**: AI Prediction should take < 2 seconds on standard hardware.
-   **Throughput**: Backend should handle multiple concurrent requests without crashing.

### 5.2 Safety Requirements
-   **Validation**: All user inputs (files, text) must be sanitized to prevent injection attacks.
-   **Error Handling**: System must fail gracefully and provide readable error messages.

### 5.3 Security Requirements
-   **Data Privacy**: User passwords must be stored securely.
-   **Access Control**: Role-Based Access Control (RBAC) enforces distinct permissions for Admins, Experts, and Farmers.

### 5.4 Software Quality Attributes
-   **Usability**: Interface must be intuitive for non-technical users.
-   **Scalability**: MongoDB structure supports adding new collections without schema migration headaches.
-   **Reliability**: Core features must function independently of external services (Offline First).

---

## Appendix A: Glossary
-   **SRS**: Software Requirements Specification
-   **AI**: Artificial Intelligence
-   **CNN**: Convolutional Neural Network
-   **UI**: User Interface
-   **RBAC**: Role-Based Access Control
