import pandas as pd
import numpy as np
import os
import random
from datetime import datetime, timedelta

# NER Bounding Box
NER_MIN_LAT, NER_MAX_LAT = 21.5, 29.5
NER_MIN_LON, NER_MAX_LON = 89.5, 97.5

def generate_safe_zones(positive_csv_path, output_csv_path):
    print("Loading historical landslide data (y=1)...")
    positive_df = pd.read_csv(positive_csv_path)
    
    # We want a 1:1 ratio of hazard points to safe points
    num_samples = len(positive_df)
    
    print(f"Generating {num_samples} safe zones (y=0)...")
    
    # Generate random coordinates within the NER bounding box
    safe_lats = np.random.uniform(NER_MIN_LAT, NER_MAX_LAT, num_samples)
    safe_lons = np.random.uniform(NER_MIN_LON, NER_MAX_LON, num_samples)
    
    # Generate random dates over the last 10 years to fetch historical weather later
    start_date = datetime(2014, 1, 1)
    end_date = datetime(2024, 1, 1)
    date_range = (end_date - start_date).days
    safe_dates = [(start_date + timedelta(days=random.randint(0, date_range))).strftime('%Y-%m-%d') for _ in range(num_samples)]
    
    # Create the negative dataframe
    negative_df = pd.DataFrame({
        'event_date': safe_dates,
        'latitude': safe_lats,
        'longitude': safe_lons,
        'landslide_occurred': 0
    })
    
    # Merge both datasets together
    combined_df = pd.concat([positive_df, negative_df], ignore_index=True)
    
    # Shuffle the dataset so 1s and 0s are mixed
    combined_df = combined_df.sample(frac=1, random_state=42).reset_index(drop=True)
    
    combined_df.to_csv(output_csv_path, index=False)
    print(f"✅ Master dataset created with {len(combined_df)} total rows. Saved to {output_csv_path}")

if __name__ == "__main__":
    input_csv = "data/processed/ner_historical_landslides.csv"
    output_csv = "data/processed/master_training_data.csv"
    generate_safe_zones(input_csv, output_csv)