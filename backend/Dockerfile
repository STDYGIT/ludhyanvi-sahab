FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY main.py .
COPY init_db.sql .
COPY migrate_sqlite_to_pg.py .
COPY sahir.db .
COPY .env* ./

# Audio files will be mounted as a volume at /data/audio
ENV AUDIO_DIR=/data/audio

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
