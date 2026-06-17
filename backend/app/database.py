from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
import time

# Wait for DB to be ready (Primitive wait, ideally use specific wait script)
# But here we rely on docker restart policy or pre-check
DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://root:root@db:3306/desktop_app?charset=utf8mb4")

# Create engine with explicit UTF-8 encoding settings
engine = create_engine(
    DATABASE_URL, 
    pool_pre_ping=False,
    connect_args={
        "charset": "utf8mb4",
        "use_unicode": True,
    },
    echo=False
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
