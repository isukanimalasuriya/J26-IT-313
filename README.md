# Smart Coconut Cultivation Management System

### Final Year Research Project — J26-IT-313

**Sri Lanka Institute of Information Technology (SLIIT)**

## 1. Project Overview

The Smart Coconut Cultivation Management System is an IoT and AI-based research project designed to support coconut farmers in making data-driven cultivation decisions.

The system combines real-time soil monitoring, machine learning, environmental analysis, and mobile technologies to improve fertilizer management, disease identification, harvesting decisions, and financial planning.

The proposed solution consists of four major research components:

1. Smart Fertilizer Recommendation and Resource Management
2. Coconut Disease Detection
3. Coconut Maturity and Harvest Prediction
4. Financial Planning and Risk Management

## 2. Research Problem

Traditional coconut cultivation faces challenges such as inefficient fertilizer application, nutrient losses caused by rainfall and sloping terrain, delayed disease detection, uncertain harvesting decisions, and limited access to data-driven financial planning.

This research aims to address these challenges through an integrated smart cultivation system.

## 3. Research Objectives

- Develop an intelligent fertilizer recommendation system using soil and crop parameters.
- Analyze rainfall, slope, and nutrient-loss risks.
- Integrate IoT sensors for real-time environmental monitoring.
- Develop an AI-based coconut disease detection component.
- Support coconut maturity and harvesting predictions.
- Provide financial planning and risk assessment capabilities.
- Develop a mobile application for accessing cultivation recommendations.

## 4. Research Components

### Component 1: Smart Fertilizer Recommendation and Resource Management

Develops a slope-aware, crop-profile-based fertilizer recommendation framework.

**Key Features:**

- Real-time soil parameter monitoring using ESP32 and sensors.
- Soil pH, NPK, moisture, and environmental measurements.
- Coconut variety and tree-age-based recommendations.
- Machine learning-based fertilizer dosage prediction.
- Rainfall forecast integration.
- Slope-based nutrient-loss risk analysis.
- Fertilizer application timing and split-dose recommendations.
- Post-application nutrient retention monitoring.

**Technologies:** ESP32, Python, XGBoost, Node.js, MySQL, Firebase.

### Component 2: Coconut Disease Detection

Focuses on identifying coconut diseases using image-based AI analysis.

**Planned Features:**

- Image-based disease identification.
- AI-assisted disease classification.
- Disease information and management guidance.
- Mobile application integration.

### Component 3: Coconut Maturity and Harvest Prediction

Focuses on supporting harvesting decisions through predictive analysis.

**Planned Features:**

- Coconut maturity assessment.
- Harvest readiness prediction.
- Data-driven harvesting recommendations.

### Component 4: Financial Planning and Risk Management

Focuses on improving plantation financial management.

**Planned Features:**

- Cultivation cost analysis.
- Financial planning assistance.
- Risk assessment.
- Decision support for farmers.

## 5. Technology Stack

| Layer               | Technologies                      |
| ------------------- | --------------------------------- |
| Mobile Application  | React Native, Expo                |
| Backend API         | Node.js, Express.js               |
| Machine Learning    | Python, Scikit-learn, XGBoost     |
| Relational Database | MySQL                             |
| Sensor Data Storage | Firebase Firestore                |
| IoT Hardware        | ESP32                             |
| Communication       | Wi-Fi, HTTP REST API              |
| Development Tools   | VS Code, Arduino IDE, Git, GitHub |

## 6. System Architecture

The proposed solution connects field sensors to the mobile application through backend services.

**Data Flow:**

ESP32 + Soil Sensors  
↓  
Wi-Fi Communication  
↓  
Node.js / Express Backend  
↓  
MySQL Database + Firebase Firestore  
↓  
Python Machine Learning Processing  
↓  
Fertilizer Recommendations and Risk Analysis  
↓  
React Native Mobile Application

Other research components integrate through the shared application and backend services.

## 7. Project Folder Structure

```text
J26-IT-313/
|
|-- backend/
|   |-- app/
|   |-- processing/
|   |   |-- __init__.py
|   |   |-- inference_runner.py
|   |-- src/
|   |-- trained_models/
|   |-- .env.example
|   |-- package.json
|   |-- requirements.txt
|   |-- README.md
|
|-- frontend/
|   |-- assets/
|   |-- scripts/
|   |-- src/
|   |-- package.json
|   |-- app.json
|   |-- README.md
|
|-- .gitignore
|-- README.md
```

## 8. Installation and Setup

### Prerequisites

- Node.js and npm
- Python 3.11 or a compatible version
- MySQL Server
- Expo Go or an Android emulator
- Arduino IDE for ESP32 development
- Firebase project credentials

### Clone Repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd J26-IT-313
```

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file using `.env.example` and configure the required environment variables.

Start the backend:

```bash
npm start
```

### Python Machine Learning Setup

From the backend directory:

```bash
python -m venv .venv311
```

Activate the virtual environment on Windows:

```bash
.venv311\Scripts\activate
```

Install the Python dependencies:

```bash
pip install -r requirements.txt
```

### Frontend Setup

From the repository root:

```bash
cd frontend
npm install
npx expo start
```

Use Expo Go or an emulator to access the mobile application.

## 9. IoT Sensor Integration

The fertilizer management component uses an ESP32-based monitoring setup.

**Sensors:**

- RS485 Soil NPK Sensor
- Soil Moisture Sensor
- Soil pH Sensor
- DHT22 Temperature and Humidity Sensor
- DS18B20 Soil Temperature Sensor
- MPU6050 / MPU9250 Slope Measurement Sensor

Sensor readings are sent to the backend using HTTP requests.

## 10. Machine Learning Approach

The fertilizer recommendation component uses machine learning to estimate fertilizer application quantities based on soil, environmental, and coconut tree parameters.

**Potential Input Parameters:**

- Soil N, P, K
- Soil pH
- Soil Moisture
- Soil Salinity
- Organic Matter
- Coconut Tree Age
- Coconut Variety
- Soil Texture

Rainfall and slope information are additionally considered when deciding fertilizer application timing, methods, and nutrient-loss risks.

**Algorithm:** XGBoost Regression for fertilizer dosage prediction.

Additional prediction models and decision rules are developed for the other research components.

## 11. Current Project Status

**Research and Development Stage — PP1**

- Research scope and objectives defined.
- Mobile application structure initialized.
- Backend API development initiated.
- MySQL and Firebase integrations developed.
- ESP32 sensor integration under testing.
- Preliminary fertilizer prediction model developed.
- Research component development ongoing.

## 12. Future Improvements

- Complete model validation using field-collected datasets.
- Improve fertilizer recommendations using agricultural expert feedback.
- Implement weather-based fertilizer scheduling.
- Complete integration of all four research components.
- Perform system testing and usability evaluation.
- Deploy backend and database services.

## 13. Research Team

**Group ID:** J26-IT-313  
**Institution:** Sri Lanka Institute of Information Technology (SLIIT)  
**Project Type:** Final Year Research Project

_Group member names, student IDs and details._

- A.I.A Nimalasuriya, IT23234048
- H Kuruppuge, IT**\*\***
- Gunasekara, **\*\***
- Sandeepa, **\*\***

## 14. License

This repository is intended for academic research and educational purposes. Usage and distribution are subject to the project team's selected license.
