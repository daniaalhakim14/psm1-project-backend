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

# Create DB engine
engine = create_engine(f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:5432/{DB_NAME}")

# Load Parquet file
URL_DATA = 'https://storage.data.gov.my/pricecatcher/lookup_item.parquet'
df = pd.read_parquet(URL_DATA)

# Rename to match DB
df = df.rename(columns={
    'item_code': 'itemcode',
    'item': 'itemname',
    'unit': 'unit',
    'item_group': 'itemgroup',
    'item_category': 'itemcategory'
})

# Clean data
df['itemcode'] = df['itemcode'].astype(str).str.strip()
df.dropna(inplace=True)

# Insert into item table
with engine.begin() as conn:
    for _, row in df.iterrows():
        conn.execute(text("""
            INSERT INTO item (itemcode, itemname, unit, itemgroup, itemcategory)
            VALUES (:itemcode, :itemname, :unit, :itemgroup, :itemcategory)
            ON CONFLICT (itemcode) DO NOTHING
        """), row.to_dict())  # Use DO NOTHING to prevent duplicate insert errors

print("Item table populated successfully.")
