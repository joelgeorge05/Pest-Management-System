# Pest Management System - Local Setup Guide

This guide explains how to run the pest management application on your local machine.

## Prerequisites
-   **Python 3.8+** (for the Backend)
-   **Node.js 16+** (for the Frontend)
-   **MongoDB** (Ensure it is installed and running locally)

## Step 1: Start the Backend (API Server)
1.  Open a terminal or command prompt.
2.  Navigate to the project folder:
    ```bash
    cd "path/to/pest"
    ```
3.  Activate your virtual environment (optional but recommended).
4.  Run the Flask application:
    ```bash
    python backend/app.py
    ```
    *The server will start at `http://127.0.0.1:5000`.*

## Step 2: Start the Frontend (User Interface)
1.  Open a **new** terminal window.
2.  Navigate to the project folder:
    ```bash
    cd "path/to/pest"
    ```
3.  Install dependencies (only needed the first time):
    ```bash
    npm install
    ```
4.  Run the development server:
    ```bash
    npm run dev
    ```
    *The UI will be available at `http://localhost:5173`.*

## Step 3: Access the Application
-   Open your web browser and go to: **[http://localhost:5173](http://localhost:5173)**

## Troubleshooting
-   **Address in use**: If port 5000 or 5173 is busy, close other running terminals or processes.
-   **Database Error**: Ensure MongoDB is running.
-   **"Model not found"**: Ensure the `plant_disease_model.h5` file exists in the `models/` directory or run `create_dummy_model.py`.

## Optional: Access from Other Devices (Local Network)
To view the app on your phone or another computer on the same WiFi:

1.  **Backend**: Edit `backend/app.py`:
    ```python
    app.run(debug=True, port=5000, host='0.0.0.0')
    ```
2.  **Frontend**: Run with the host flag:
    ```bash
    npm run dev -- --host
    ```
3.  Access via your computer's IP address (e.g., `http://192.168.1.5:5173`).
