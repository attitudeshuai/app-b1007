# Backend Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies (if any needed for psutil or mysql)
# Use Tsinghua University mirror for faster downloads in China
RUN sed -i 's/deb.debian.org/mirrors.tuna.tsinghua.edu.cn/g' /etc/apt/sources.list.d/debian.sources && \
    apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    default-libmysqlclient-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple

# Copy application code
COPY . .

# Expose port
EXPOSE 8007

# Run application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8007"]
