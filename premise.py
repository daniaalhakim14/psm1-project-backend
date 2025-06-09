import pandas as pd
from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
DB_USER = os.environ['DB_USER']
DB_PASSWORD = os.environ['DB_PASSWORD']
DB_HOST = os.environ['DB_HOST']
DB_NAME = os.environ['DB_NAME']

# Connect to DB
engine = create_engine(f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:5432/{DB_NAME}")

# Load Parquet data
URL = 'https://storage.data.gov.my/pricecatcher/lookup_premise.parquet'
df = pd.read_parquet(URL)
print("Columns in raw dataframe:", df.columns.tolist())

# Rename to match database schema
df = df.rename(columns={
    'premise_code': 'premiseid',
    'premise': 'premisename',
    'premise_type': 'premisetype',
    'address': 'address',
    'state': 'state',
    'district': 'district'
})

# Drop null names
df.dropna(subset=['premisename'], inplace=True)

# ✅ Add this block here: clean and truncate long strings
df['premiseid'] = df['premiseid'].astype(float).astype(int).astype(str)
df['premisename'] = df['premisename'].astype(str).str.slice(0, 100)
df['address'] = df['address'].astype(str).str.replace(r'[\r\n]+', ' ', regex=True).str.slice(0, 255)
df['premisetype'] = df['premisetype'].astype(str).str.slice(0, 100)
df['state'] = df['state'].astype(str).str.slice(0, 100)
df['district'] = df['district'].astype(str).str.slice(0, 100)

# Then continue with insert logic
with engine.begin() as conn:
    for _, row in df.iterrows():
        conn.execute(text("""
            INSERT INTO premise (premiseid, premisename, address, premisetype, state, district)
            VALUES (:premiseid, :premisename, :address, :premisetype, :state, :district)
            ON CONFLICT (premiseid) DO NOTHING
        """), row.to_dict())

print("Premise data upserted successfully.")
