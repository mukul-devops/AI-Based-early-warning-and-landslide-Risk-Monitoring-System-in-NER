from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# This URL contains the username, password, host, and database name we used in the Docker command
DATABASE_URL = 'postgresql://postgres:mukul981242@db.tmvsdlmrlkkiigxxdhff.supabase.co:5432/postgres'

# The engine is the main connection point to the database
engine = create_engine(DATABASE_URL)

# This will allow us to open "sessions" (conversations) with the database later
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)