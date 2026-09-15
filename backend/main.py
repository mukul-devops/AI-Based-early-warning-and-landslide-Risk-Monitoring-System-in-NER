import os
import json
import joblib
import numpy as np
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text, func, update
from pydantic import BaseModel

# Import our database connection tools and the table structure
from database import engine, SessionLocal
from models import Base, RiskZone

app = FastAPI()

# ---------------------------------------------------------
# 1. CORS CONFIGURATION (Allows Frontend to Connect)
# ---------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, replace "*" with your Vercel URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------
# 2. LOAD THE XGBOOST ML MODEL
# ---------------------------------------------------------
# Build the absolute path to the saved model so it always finds it
MODEL_PATH = os.path.abspath(
    os.path.join(
        os.path.dirname(__file__),
        "../ml_pipeline/saved_models/landslide_xgb.pkl",
    )
)

try:
    bundle = joblib.load(MODEL_PATH)
    model = bundle["model"]
    decision_threshold = bundle["threshold"]
    print(f"✅ ML Model loaded successfully! Active Threshold: {decision_threshold}")
except Exception as e:
    model = None
    decision_threshold = 0.5
    print(f"⚠️ Warning: Model could not be loaded: {e}")

# ---------------------------------------------------------
# 3. DATABASE SETUP & CONNECTION
# ---------------------------------------------------------
@app.on_event("startup")
def test_db_connection():
    try:
        Base.metadata.create_all(bind=engine)
        with engine.connect() as connection:
            print("\n✅ DATABASE CONNECTED & TABLES CREATED!")
    except Exception as e:
        print("\n❌ DATABASE CONNECTION FAILED!")
        print(e, "\n")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ---------------------------------------------------------
# 4. PYDANTIC SCHEMAS
# ---------------------------------------------------------
class RiskZoneCreate(BaseModel):
    location_name: str
    risk_level: str
    hazard_details: str | None = "No current hazards reported"
    longitude: float
    latitude: float

class WeatherSimulation(BaseModel):
    rainfall_mm: float

# ---------------------------------------------------------
# 5. API ENDPOINTS
# ---------------------------------------------------------
@app.get("/")
def home():
    return {"status": "Landslide Backend is running!", "system": "Online"}

@app.post("/api/risk-zones")
def create_risk_zone(zone: RiskZoneCreate, db: Session = Depends(get_db)):
    point_wkt = f"POINT({zone.longitude} {zone.latitude})"
    new_zone = RiskZone(
        location_name=zone.location_name,
        risk_level=zone.risk_level,
        hazard_details=zone.hazard_details,
        geom=point_wkt
    )
    db.add(new_zone)
    db.commit()
    return {"message": f"Successfully added {zone.location_name}!"}

@app.get("/api/risk-zones")
def get_risk_zones(db: Session = Depends(get_db)):
    zones = db.query(
        RiskZone.location_name, 
        RiskZone.risk_level,
        RiskZone.hazard_details,
        func.ST_AsGeoJSON(RiskZone.geom).label('geometry')
    ).all()

    features = []
    for zone in zones:
        features.append({
            "type": "Feature",
            "geometry": json.loads(zone.geometry),
            "properties": {
                "location_name": zone.location_name,
                "risk_level": zone.risk_level,
                "hazard_details": zone.hazard_details
            }
        })

    return {"type": "FeatureCollection", "features": features}

# ---------------------------------------------------------
# 6. LIVE AI INFERENCE ENGINE
# ---------------------------------------------------------
# 2. Add a GET route (eliminates the error when opening in browser)
@app.get("/api/simulate-weather")
def get_simulate_weather_info():
    return {
        "message": "Simulation endpoint is online. Send an HTTP POST request with JSON body: {'rainfall_mm': 120.0}",
        "method_required": "POST"
    }

# 3. The POST Simulation Route (handles both trailing slash and no slash)
@app.post("/api/simulate-weather")
@app.post("/api/simulate-weather/")
def simulate_weather(weather: WeatherSimulation, db: Session = Depends(get_db)):
    if model is None:
        return {"error": "Trained ML model bundle not found."}

    zones = db.query(RiskZone).all()
    updated_count = 0

    for zone in zones:
        slope = 34.0
        elev = 1150.0

        # Physical geomorphological features
        slope_rad = np.radians(slope)
        sin_slope = np.sin(slope_rad)
        shear_stress = sin_slope * (elev / 1000.0)
        pore_pressure = weather.rainfall_mm * np.tan(slope_rad)
        extreme_flag = 1 if weather.rainfall_mm > 50 else 0

        # Array aligned with model training
        features = np.array([[
            weather.rainfall_mm,
            slope,
            elev,
            shear_stress,
            pore_pressure,
            extreme_flag,
        ]])

        # Inference
        prob = model.predict_proba(features)[0][1]

        # Classification
        if prob >= 0.75:
            severity = "Severe Imminent Hazard"
        elif prob >= decision_threshold:
            severity = "High Alert"
        elif prob >= 0.25:
            severity = "Moderate Caution"
        else:
            severity = "Low Risk"

        db.execute(
            update(RiskZone).where(RiskZone.id == zone.id).values(risk_level=severity)
        )
        updated_count += 1

    db.commit()

    return {
        "simulated_rainfall_mm": weather.rainfall_mm,
        "model_threshold_used": decision_threshold,
        "zones_recalculated": updated_count,
        "status": "Map layers updated via XGBoost inference engine."
    }

@app.delete("/api/risk-zones/{zone_id}")
def delete_risk_zone(zone_id: int, db: Session = Depends(get_db)):
    # Find the specific zone by its database ID
    zone = db.query(RiskZone).filter(RiskZone.id == zone_id).first()
    
    # If it doesn't exist, return an error
    if not zone:
        return {"error": f"Zone with ID {zone_id} not found."}
    
    # Delete it from the database and save changes
    db.delete(zone)
    db.commit()
    
    return {"message": f"Successfully permanently deleted zone {zone_id} from the map."}