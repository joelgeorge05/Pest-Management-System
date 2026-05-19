import pandas as pd
import os

file_path = 'backend/data/Combined_Plant_Disease_Dataset.xlsx'
try:
    df = pd.read_excel(file_path)
    print("Columns:", df.columns.tolist())
    print("Sample:", df.head(1).to_dict(orient='records'))
    
    # Check if we should convert
    csv_path = 'backend/data/treatments.csv'
    df.to_csv(csv_path, index=False)
    print(f"Converted to {csv_path}")

except ImportError as e:
    print(f"MISSING_DEPENDENCY: {e}")
except Exception as e:
    print(f"ERROR: {e}")
