# Multi-stage Dockerfile: AquaSmart AI Unified Full-Stack Application
# Stage 1: Build the Vite React Frontend
FROM node:22-alpine AS frontend-builder
WORKDIR /build

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# Stage 2: Python FastAPI Runtime & Static Host
FROM python:3.11-slim
WORKDIR /app

# Install system libraries for OpenCV & imaging
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Install backend dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r ./backend/requirements.txt

# Copy backend source code & runner
COPY backend/ ./backend/
COPY run.py ./

# Copy built frontend production dist
COPY --from=frontend-builder /build/dist ./frontend/dist

ENV PYTHONPATH=/app/backend
ENV FRONTEND_DIST=/app/frontend/dist
ENV PORT=8000
EXPOSE 8000

CMD ["python", "run.py"]
