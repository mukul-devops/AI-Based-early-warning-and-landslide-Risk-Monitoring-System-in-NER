from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import declarative_base
from geoalchemy2 import Geometry

Base = declarative_base()

class RiskZone(Base):
    __tablename__ = "risk_zones"

    id = Column(Integer, primary_key=True, index=True)
    location_name = Column(String, index=True)
    risk_level = Column(String)
    hazard_details = Column(String, nullable=True)
    # This is the PostGIS spatial column (SRID 4326 is standard GPS coordinates)
    geom = Column(Geometry(geometry_type='POINT', srid=4326))