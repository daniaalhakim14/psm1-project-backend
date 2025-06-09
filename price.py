import pandas as pd
from sqlalchemy import create_engine
from psycopg2.extras import execute_values
import psycopg2
import os
from dotenv import load_dotenv
from tqdm import tqdm  # progress bar

# Load environment variables
load_dotenv()
DB_USER = os.environ['DB_USER']
DB_PASSWORD = os.environ['DB_PASSWORD']
DB_HOST = os.environ['DB_HOST']
DB_NAME = os.environ['DB_NAME']

# Create SQLAlchemy engine and raw psycopg2 connection
engine = create_engine(f'postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:5432/{DB_NAME}')
raw_conn = psycopg2.connect(
    dbname=DB_NAME,
    user=DB_USER,
    password=DB_PASSWORD,
    host=DB_HOST
)

# Load Price Data
URL = 'https://storage.data.gov.my/pricecatcher/pricecatcher_2025-05.parquet'
df = pd.read_parquet(URL)
print("Columns in raw dataframe:", df.columns.tolist())

# Clean and format
df = df.rename(columns={
    'premise_code': 'premiseid',
    'item_code': 'itemcode',
    'price': 'price',
    'date': 'date'
})
df.dropna(subset=['premiseid', 'itemcode', 'price', 'date'], inplace=True)
df['premiseid'] = df['premiseid'].astype(str).str.strip().str.replace(r'\.0$', '', regex=True)
df['itemcode'] = df['itemcode'].astype(str).str.strip().str.replace(r'\.0$', '', regex=True)
df['date'] = pd.to_datetime(df['date'], errors='coerce')
df.dropna(subset=['date'], inplace=True)

# Filter invalid FKs
with engine.begin() as conn:
    valid_items = pd.read_sql("SELECT itemcode FROM item", conn)['itemcode'].astype(str).tolist()
    valid_premises = pd.read_sql("SELECT premiseid FROM premise", conn)['premiseid'].astype(str).tolist()

df = df[df['itemcode'].isin(valid_items) & df['premiseid'].isin(valid_premises)]
print(f"Valid records to insert: {len(df)}")

# 🚀 BULK INSERT WITH PROGRESS
batch_size = 5000
values = df[['premiseid', 'itemcode', 'price', 'date']].values.tolist()

with raw_conn:
    with raw_conn.cursor() as cur:
        for i in tqdm(range(0, len(values), batch_size), desc="Inserting to DB"):
            batch = values[i:i+batch_size]
            execute_values(cur, """
                INSERT INTO price (premiseid, itemcode, price, date)
                VALUES %s
                ON CONFLICT (premiseid, itemcode, date)
                DO UPDATE SET price = EXCLUDED.price;
            """, batch)

raw_conn.close()
print("✅ Bulk insert completed.")
