
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import sqlite3
from datetime import datetime
import hashlib
import os

# Initialize FastAPI app
app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class SensorData(BaseModel):
    chip_id: str
    temperature: float
    humidity: int
    rssi: int

class SensorResponse(BaseModel):
    id: str
    temperature: float
    humidity: int
    rssi: int
    last_updated: str

class UserCreate(BaseModel):
    email: str
    password: str
    first_name: str
    last_name: str

class UserLogin(BaseModel):
    email: str
    password: str

# Simple password hashing functions
def get_password_hash(password: str) -> str:
    salt = os.urandom(32)  # 32 bytes salt
    key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt,
        100000,  # 100,000 iterations
    )
    return salt.hex() + ':' + key.hex()

def verify_password(plain_password: str, stored_password: str) -> bool:
    salt_hex, key_hex = stored_password.split(':')
    salt = bytes.fromhex(salt_hex)
    key = hashlib.pbkdf2_hmac(
        'sha256',
        plain_password.encode('utf-8'),
        salt,
        100000,  # 100,000 iterations
    )
    return key.hex() == key_hex

# Database initialization
def init_db():
    conn = sqlite3.connect('sensors.db')
    c = conn.cursor()
    
    # Create sensors table
    c.execute('''
        CREATE TABLE IF NOT EXISTS sensors
        (chip_id TEXT PRIMARY KEY, 
        temperature REAL,
        humidity INTEGER,
        rssi INTEGER,
        last_updated TIMESTAMP)
    ''')
    
    # Create users table
    c.execute('''
        CREATE TABLE IF NOT EXISTS users
        (id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        hashed_password TEXT,
        first_name TEXT,
        last_name TEXT)
    ''')
    
    conn.commit()
    conn.close()

init_db()

@app.post("/register/")
async def register(user: UserCreate):
    conn = sqlite3.connect('sensors.db')
    c = conn.cursor()
    
    try:
        # Check if user already exists
        c.execute("SELECT email FROM users WHERE email = ?", (user.email,))
        if c.fetchone():
            raise HTTPException(status_code=400, detail="Email already registered")
        
        hashed_password = get_password_hash(user.password)
        c.execute(
            "INSERT INTO users (email, hashed_password, first_name, last_name) VALUES (?, ?, ?, ?)",
            (user.email, hashed_password, user.first_name, user.last_name)
        )
        conn.commit()
        return {"status": "success", "message": "User registered successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@app.post("/login/")
async def login(user: UserLogin):
    conn = sqlite3.connect('sensors.db')
    c = conn.cursor()
    
    try:
        c.execute("SELECT id, hashed_password FROM users WHERE email = ?", (user.email,))
        result = c.fetchone()
        
        if not result or not verify_password(user.password, result[1]):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        return {"status": "success", "user_id": result[0]}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@app.post("/sensor-data/")
async def receive_sensor_data(data: SensorData):
    conn = sqlite3.connect('sensors.db')
    c = conn.cursor()
    
    try:
        c.execute('''
            INSERT OR REPLACE INTO sensors 
            (chip_id, temperature, humidity, rssi, last_updated)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            data.chip_id,
            data.temperature,
            data.humidity,
            data.rssi,
            datetime.now().isoformat()
        ))
        conn.commit()
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@app.get("/sensors/", response_model=List[SensorResponse])
async def get_sensors():
    conn = sqlite3.connect('sensors.db')
    c = conn.cursor()
    
    try:
        c.execute('SELECT * FROM sensors')
        rows = c.fetchall()
        return [
            {
                "id": row[0],
                "temperature": row[1],
                "humidity": row[2],
                "rssi": row[3],
                "last_updated": row[4]
            }
            for row in rows
        ]
    finally:
        conn.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
