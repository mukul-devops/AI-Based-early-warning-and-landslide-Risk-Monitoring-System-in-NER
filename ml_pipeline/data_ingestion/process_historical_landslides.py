import pandas as pd
import os

# Define the bounding box for India's North Eastern Region (Approximate)
NER_MIN_LAT, NER_MAX_LAT = 21.5, 29.5
NER_MIN_LON, NER_MAX_LON = 89.5, 97.5

def extract_ner_landslides(input_path, output_path):
    print("Loading global landslide data...")
    df = pd.read_csv(input_path)
    
    # Filter for points within the NER bounding box
    ner_data = df[
        (df['latitude'] >= NER_MIN_LAT) & (df['latitude'] <= NER_MAX_LAT) &
        (df['longitude'] >= NER_MIN_LON) & (df['longitude'] <= NER_MAX_LON)
    ].copy()
    
    # Keep only the essential columns for our ML model
    columns_to_keep = ['event_date', 'latitude', 'longitude', 'landslide_trigger', 'fatalities']
    
    # Handle missing columns gracefully depending on the specific NASA CSV version
    available_cols = [col for col in columns_to_keep if col in ner_data.columns]
    ner_data = ner_data[available_cols]
    
    # Drop rows without valid coordinates or dates
    ner_data.dropna(subset=['latitude', 'longitude', 'event_date'], inplace=True)
    
    # Add our target variable (1 = Landslide occurred)
    ner_data['landslide_occurred'] = 1
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    ner_data.to_csv(output_path, index=False)
    print(f"✅ Extracted {len(ner_data)} historical NER landslides. Saved to {output_path}")

if __name__ == "__main__":
    # Assuming script is run from the root directory
    input_csv = "data/raw/Global_Landslide_Catalog_Export.csv"
    output_csv = "data/processed/ner_historical_landslides.csv"
    extract_ner_landslides(input_csv, output_csv)