import pandas as pd

def clean_data():
    df = pd.read_csv("data/processed/final_model_features.csv")
    initial_len = len(df)
    
    # Identify contradictory points: Labeled as 'Safe' (0) but have high rain AND high slope
    noisy_negatives = df[
        (df['landslide_occurred'] == 0) & 
        (df['rainfall_72h_mm'] > 40) & 
        (df['slope_angle_deg'] > 25)
    ]
    
    # Drop them from the dataset
    df_clean = df.drop(noisy_negatives.index)
    
    df_clean.to_csv("data/processed/final_model_features_clean.csv", index=False)
    
    print(f"Dropped {len(noisy_negatives)} confusing overlapping rows.")
    print(f"Dataset cleaned. Remaining rows: {len(df_clean)}")

if __name__ == "__main__":
    clean_data()