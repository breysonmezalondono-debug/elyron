# ============================================================
# ELIRON · ia-service (FastAPI) · Dockerfile de producción
# Extracción de texto de documentos + proveedor de IA.
# Imagen pequeña basada en Python 3.12 slim. Sin secretos.
# ============================================================

FROM python:3.12-slim AS base

WORKDIR /app

# Dependencias del sistema para algunas libs (docx/pptx)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copia solo lo necesario (no el venv local)
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app
COPY static ./static

# Usuario no-root
RUN useradd -m iauser
USER iauser

EXPOSE 8000

# Puerto dinámico: el host inyecta PORT (default 8000)
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
