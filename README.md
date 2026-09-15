<div align="center">

# 🏔️ NER Landslide AI Overwatch
### An AI-Driven Hyper-Local Landslide Early Warning & Spatial Monitoring System

[![Smart India Hackathon 2026](https://img.shields.io/badge/Smart%20India%20Hackathon-2026-FF9933?style=for-the-badge&logo=target&logoColor=white)](https://www.sih.gov.in/)
[![Problem Statement ID](https://img.shields.io/badge/Problem%20Statement%20ID-26001-138808?style=for-the-badge&logo=codeforces&logoColor=white)](https://www.sih.gov.in/)
[![Theme](https://img.shields.io/badge/Theme-Disaster%20Management-blue?style=for-the-badge&logo=googleearth&logoColor=white)](https://www.sih.gov.in/)
[![Frontend Status](https://img.shields.io/badge/Vercel-Live%20Deployment-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://ai-based-early-warning-and-landslid-flax.vercel.app/)
[![Backend Status](https://img.shields.io/badge/Render-API%20Online-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://ai-based-early-warning-and-landslide-m859.onrender.com)

---

<p align="center">
  <b>Bridging physical geomorphology, high-frequency satellite telemetry, and ground-truth IoT sensing to safeguard the critical transit corridors of North Eastern India.</b>
</p>

[🌐 Live Interactive Command Center](https://ai-based-early-warning-and-landslid-flax.vercel.app/) • [⚡ Live API Docs](https://ai-based-early-warning-and-landslide-m859.onrender.com/docs) • [📑 Architectural Whitepaper](./)

---

</div>

## 📌 Executive Summary

The **North Eastern Region (NER)** of India sits squarely in **Seismic Zone V**, where extreme monsoonal precipitation and fragile sedimentary strata intersect to cause frequent, devastating slope failures. 

Traditional warning systems suffer from **geographical generalization**—issuing district-wide warnings based strictly on rainfall without accounting for slope steepness, pore-water pressure saturation, or rock mechanics.

**NER Landslide AI Overwatch** delivers a zero-latency predictive platform combining **XGBoost machine learning**, **PostGIS spatial geometry**, and **MEMS micro-vibration telemetry**. It translates raw environmental signals into actionable evacuation protocols for State Disaster Management Authorities (SDMA).

---

## ⚡ Interactive Live Demonstrations

| Target Service | Deployment Engine | Link |
| :--- | :--- | :--- |
| **GIS Operations Dashboard** | Vercel (Edge CDN) | [Live Web Console](https://ai-based-early-warning-and-landslid-flax.vercel.app/) |
| **Inference Backend (FastAPI)** | Render Cloud PaaS | [Live REST Endpoint](https://ai-based-early-warning-and-landslide-m859.onrender.com) |
| **Interactive API Documentation** | Swagger UI / OpenAPI | [Explore Endpoints](https://ai-based-early-warning-and-landslide-m859.onrender.com/docs) |

---

## 🛠️ Technology Stack & Badges

### 💻 Client-Side Architecture (Command Dashboard)
![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet_GIS-199900?style=for-the-badge&logo=leaflet&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

### ⚙️ Server-Side & Intelligence Core
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python_3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)
![XGBoost](https://img.shields.io/badge/XGBoost-11998e?style=for-the-badge&logo=scikit-learn&logoColor=white)
![NumPy](https://img.shields.io/badge/NumPy-013243?style=for-the-badge&logo=numpy&logoColor=white)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-D71F00?style=for-the-badge&logo=sqlalchemy&logoColor=white)

### 🗄️ Spatial Persistence & Cloud Infrastructure
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![PostGIS](https://img.shields.io/badge/PostGIS_Spatial-2C5E8A?style=for-the-badge&logo=postgresql&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase_Cloud-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Render](https://img.shields.io/badge/Render_Cloud-46E3B7?style=for-the-badge&logo=render&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel_Hosting-000000?style=for-the-badge&logo=vercel&logoColor=white)

---

## 🎯 Key System Capabilities

*   **Geomorphological Feature Engineering:** Feeds dynamic slope angle ($\beta$), elevation ($h$), shear stress index, and pore pressure ratios directly into inference pipelines.
*   **Decoupled GeoJSON Pipeline:** Employs an automated conversion layer transforming raw spatial PostGIS records into browser-renderable `FeatureCollection` structures without freezing the event loop.
*   **Dynamic Weather Simulation:** Integrated sandbox interface enabling disaster authorities to simulate arbitrary rainfall spikes (e.g., $150\text{ mm}$ over $72\text{ hours}$) and visualize cascading slope destabilization in real time.
*   **Emergency Resource Dispatcher:** Automates priority routing for National Disaster Response Force (NDRF) squads with built-in population risk matrices.

---

## 📊 AI Threat Classification Matrix

| Risk Tier | Probability Threshold | Color Representation | Operational Protocol |
| :---: | :---: | :---: | :--- |
| **Low Risk** | $< 0.25$ | `🟩 Emerald` | Baseline monitoring; regular highway clearance updates. |
| **Moderate Caution** | $0.25 - 0.50$ | `🟨 Amber` | Pre-alert SDMA local units; advisory speed restrictions on ghat roads. |
| **High Alert** | $0.50 - 0.75$ | `🟧 Orange` | Stage emergency excavators at high-risk points along NH-06/NH-44. |
| **Severe Imminent Hazard** | $\ge 0.75$ | `🟥 Crimson` | Total transit shutdown, automated siren triggers, mandatory village evacuations. |

---

## 🚀 Quickstart & Local Setup

### Prerequisites
*   Node.js `v18+`
*   Python `v3.10+`
*   PostgreSQL with PostGIS extensions enabled (or Supabase instance)

### 1. Clone the Monorepo
```bash
git clone [https://github.com/your-username/AI-Based-early-warning-and-landslide-Risk-Monitoring-System-in-NER.git](https://github.com/your-username/AI-Based-early-warning-and-landslide-Risk-Monitoring-System-in-NER.git)
cd AI-Based-early-warning-and-landslide-Risk-Monitoring-System-in-NER