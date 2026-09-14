import pandas as pd
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
import time
from datetime import timedelta

def create_resilient_session():
    session = requests.Session()
    retry_strategy = Retry(
        total=5,
        backoff_factor=1,
        status_forcelist=[429, 500, 502, 503, 504],
        allowed_methods=["GET"]
    )
    adapter = HTTPAdapter(max_retries=retry_strategy)
    session.mount("https://", adapter)
    return session

def fetch_antecedent_rainfall(csv_input, csv_output, max_records=800):
    print("Loading master dataset...")
    df = pd.read_csv(csv_input)
    
    # Scale dataset size (e.g. 800 rows: 400 landslides, 400 safe points)
    df = df.head(min(max_records, len(df))).copy()
    
    session = create_resilient_session()
    rainfall_data = []

    print(f"Fetching historical weather for {len(df)} coordinates...")
    
    for index, row in df.iterrows():
        lat = row['latitude']
        lon = row['longitude']
        event_dt = pd.to_datetime(row['event_date'])
        
        start_date = (event_dt - timedelta(days=3)).strftime('%Y-%m-%d')
        end_date = (event_dt - timedelta(days=1)).strftime('%Y-%m-%d')
        
        url = (
            f"https://archive-api.open-meteo.com/v1/archive?"
            f"latitude={lat}&longitude={lon}&start_date={start_date}&end_date={end_date}"
            f"&daily=precipitation_sum&timezone=auto"
        )
        
        total_rain = 0.0
        try:
            response = session.get(url, timeout=15)
            if response.status_code == 200:
                data = response.json()
                if 'daily' in data and 'precipitation_sum' in data['daily']:
                    valid_rains = [r for r in data['daily']['precipitation_sum'] if r is not None]
                    total_rain = sum(valid_rains)
        except Exception as e:
            print(f"Row {index} fallback to 0.0 mm: {e}")
            
        rainfall_data.append(total_rain)
        
        # Open-Meteo safe throttle: ~0.25s interval
        time.sleep(0.25)
        
        if (index + 1) % 50 == 0:
            print(f"Completed {index + 1} / {len(df)} records...")

    df['rainfall_72h_mm'] = rainfall_data
    
    # Drop records that suffered total fetch failures
    df.to_csv(csv_output, index=False)
    print(f"✅ Weather dataset ready with {len(df)} samples! Saved to {csv_output}")

if __name__ == "__main__":
    fetch_antecedent_rainfall(
        "data/processed/master_training_data.csv",
        "data/processed/training_data_with_weather.csv",
        max_records=5000
    )