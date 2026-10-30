# Coconut Disease Identification & Severity Classification

**Project:** AI-Powered IoT Based Smart Resources Management Framework For Coconut Cultivation   
**Project ID:** J26-IT-313
**Student ID:** IT23200906
**University:** Sri Lanka Institute of Information Technology (SLIIT)

## 1. Overview

This component focuses on developing an AI-based Coconut Disease Identification and Severity Classification system to help Sri Lankan coconut farmers identify coconut diseases using leaf images.

The system uses deep learning-based image classification to identify different coconut diseases and determines disease severity using three levels: Early, Moderate, and Severe.

It also provides disease-specific treatment recommendations and supports disease progress monitoring by comparing previous and current assessments.

## 2. Main Features

- **Disease Identification:** Identifies coconut diseases from uploaded or captured images using AI-based image classification.
- **Multiple Disease Classification:** Identifies different coconut disease categories.
- **Model Comparison:** Evaluates MobileNetV2 and EfficientNet-Lite to identify a suitable lightweight CNN model.
- **Severity Classification:** Categorizes disease severity into Early, Moderate, and Severe stages.
- **Treatment Recommendations:** Provides disease-specific treatment recommendations using a rule-based approach.
- **Progress Monitoring:** Compares previous and current assessments to identify whether the disease condition is Improving, Stable, or Deteriorating.
- **Mobile Integration:** Provides disease identification functionality through a React Native mobile application.

## 3. Machine Learning Models

The following lightweight CNN architectures are used for comparative evaluation:

| Model | Purpose |
|---|---|
| MobileNetV2 | Coconut disease identification |
| EfficientNet-Lite | Coconut disease identification |

The models are evaluated using accuracy, precision, recall, F1-score, confusion matrix, and inference time.

## 4. Technology Stack

| Technology | Purpose |
|---|---|
| Python | Machine Learning Development |
| PyTorch | Model Training |
| timm | Pre-trained Model Architectures |
| NumPy | Numerical Processing |
| OpenCV | Image Processing |
| Scikit-learn | Model Evaluation |
| ONNX | Model Export |
| ONNX Runtime | Model Inference |
| FastAPI | ML Processing API (if used) |
| Node.js | Backend Development |
| Express.js | REST API Development |
| React Native | Mobile Application |
| Expo | Mobile Application Development |

## 5. Project Structure

The disease identification functionality is integrated into the following project structure:

```text
J26-IT-313/
│
├── backend/
│   ├── processing/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── server.js
│   ├── trained_models/
│   ├── requirements.txt
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── app/
│   │   ├── disease/
│   │   │   ├── index.tsx
│   │   │   └── prediction.tsx
│   │   ├── fertilizer/
│   │   ├── finance/
│   │   ├── harvest/
│   │   └── _layout.tsx
│   │
│   ├── components/
│   ├── assets/
│   ├── package.json
│   └── app.json
│
└── README.md
```

## 6. Installation and Setup

### Prerequisites

- Node.js and npm
- Python 3.11
- Git
- Visual Studio Code
- Expo Go (for mobile testing)

### Step 1: Clone the Repository

```bash
git clone https://github.com/isukanimalasuriya/J26-IT-313.git
```

Navigate to the project directory:

```bash
cd J26-IT-313
```

### Step 2: Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Install Node.js dependencies:

```bash
npm install
```

Configure the environment variables using `.env.example` and create your `.env` file.

Start the backend server:

```bash
npm start
```

### Step 3: Frontend Setup

Open another terminal and navigate to the frontend directory:

```bash
cd J26-IT-313/frontend
```

Install frontend dependencies:

```bash
npm install
```

Start the Expo development server:

```bash
npx expo start
```

Scan the QR code using Expo Go or run the application using an available emulator.

### Step 4: Python Dependencies

If the disease identification processing module requires Python dependencies, navigate to the backend directory and install them:

```bash
cd backend
```

Create and activate a virtual environment:

```bash
python -m venv .venv
```

Windows activation:

```bash
.venv\Scripts\activate
```

Install Python dependencies:

```bash
pip install -r requirements.txt
```

## 7. Disease Identification Workflow

1. Farmer opens the disease identification module in the mobile application.
2. Farmer captures or uploads a coconut leaf image.
3. The image is sent to the backend through a REST API.
4. The image is processed and passed to the trained deep learning model.
5. The model predicts the coconut disease category.
6. The system determines the disease severity level.
7. Disease identification results and treatment recommendations are returned to the mobile application.
8. Farmers can submit follow-up images to monitor disease progression.

## 8. Model Evaluation Metrics

The following metrics are used to evaluate and compare the trained models:

- Accuracy
- Precision
- Recall
- F1-Score
- Confusion Matrix
- Inference Time

The comparative evaluation helps identify a suitable lightweight model for integration into the mobile application.

## 9. Research Contribution

This component contributes to the Smart Coconut Cultivation Management System by:

- Developing an AI-based coconut disease identification solution.
- Supporting early identification of coconut diseases.
- Classifying disease severity into three stages.
- Comparing lightweight CNN architectures.
- Providing disease-specific treatment recommendations.
- Monitoring disease progression over time.
- Supporting Sri Lankan coconut farmers through mobile-based AI technology.

## 10. Project Information

**Project Name:** AI-Powered IoT Based Smart Resources Management Framework For Coconut Cultivation 
**Component:** Coconut Disease Identification & Severity Classification  
**Project ID:** J26-IT-313  
**Student ID:** IT23200906  
**Institution:** Sri Lanka Institute of Information Technology (SLIIT)