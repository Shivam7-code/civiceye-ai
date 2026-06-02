# Team Members:
# Sikha Rout , Shreya , Maanya N S , Shivam Raj Patel

# Setup Instructions

## Prerequisites

* Node.js (v18 or higher)
* npm or yarn
* Git

## Installation

1. Clone the repository

```bash
git clone <repository-url>
cd civiceye-ai
```

2. Install dependencies

```bash
npm install
```

3. Configure environment variables

Create a `.env` file in the root directory:

```env
GROQ_API_KEY=your_api_key_here
```

4. Start the development server

```bash
npm run dev
```

5. Open the application

Visit:

```text
http://localhost:5173
```

## Build for Production

```bash
npm run build
```

## Features

* AI-powered issue classification
* Civic complaint reporting
* Geo-location tagging
* Smart department routing
* Authority dashboard
* Complaint tracking and analytics

## Tech Stack

* React.js
* Vite
* JavaScript
* Groq API
* Recharts
* Lucide Icons

# CivicEye AI - Project Structure & Working Flow

## Project Structure

```text
CivicEye-AI/
│
├── public/
│
├── src/
│   ├── CivicEyeAI.jsx          # Main application logic
│   ├── App.jsx                 # Root component
│   ├── main.jsx                # Entry point
│   ├── styles.css              # Application styling
│   │
│   ├── Components/
│   │   ├── CitizenDashboard
│   │   ├── AuthorityDashboard
│   │   ├── ComplaintCard
│   │   ├── CityMap
│   │   └── AnalyticsPanel
│   │
│   ├── Assets/
│   │   ├── Images
│   │   └── Icons
│   │
│   └── Utils/
│       ├── AIClassification
│       ├── SeverityScoring
│       └── DepartmentRouting
│
├── .env
├── package.json
├── vite.config.js
└── README.md
```

## Working Flow

### 1. Citizen Reports an Issue

* User uploads an image.
* User selects or enters issue details.
* Browser captures GPS location.
* Complaint is submitted.

↓

### 2. AI Analysis

The AI engine:

* Identifies issue type
* Calculates severity
* Estimates urgency score
* Predicts affected population
* Assigns responsible department

↓

### 3. Complaint Generation

A complaint ticket is created:

```text
CIV-0001
Status: Submitted
Severity: High
Department: Road Maintenance
Location: GPS Coordinates
```

↓

### 4. Smart Routing

Complaint is automatically routed to:

* Road Maintenance
* Water Board
* Sanitation
* Electrical Department
* Public Works

based on issue type.

↓

### 5. Authority Dashboard

Officers can:

* View complaints
* See locations on map
* Track status
* Update progress
* Monitor analytics

↓

### 6. Complaint Resolution

Status Flow:

```text
Submitted
    ↓
Acknowledged
    ↓
In Progress
    ↓
Resolved
```

↓

### 7. Citizen Tracking

Citizens can:

* Track complaint status
* View updates
* Check resolution progress

## Key Features

✔ AI Issue Classification

✔ Urgency & Severity Scoring

✔ Geo-Location Tagging

✔ Smart Department Routing

✔ Complaint Tracking

✔ Authority Dashboard

✔ Analytics & Insights

✔ Interactive City Map

## Future Enhancements

* Mapbox Integration
* Real Database (MongoDB/Firebase)
* Push Notifications
* Emergency SOS Services
* Women Safety Mode
* Predictive AI Analytics
* Mobile App Support
* Real-Time Complaint Verification