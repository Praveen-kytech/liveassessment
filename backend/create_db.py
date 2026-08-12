import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import sys

try:
    # Connect to the default 'postgres' database
    conn = psycopg2.connect(
        dbname='postgres',
        user='postgres',
        password='prav123',
        host='localhost',
        port='5433'
    )
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cursor = conn.cursor()
    
    # Check if database exists
    cursor.execute("SELECT 1 FROM pg_catalog.pg_database WHERE datname = 'poc'")
    exists = cursor.fetchone()
    if not exists:
        cursor.execute("CREATE DATABASE poc")
        print("Database 'poc' created successfully.")
    else:
        print("Database 'poc' already exists.")
        
    cursor.close()
    conn.close()
except Exception as e:
    print(f"Error creating database: {e}")
    sys.exit(1)
