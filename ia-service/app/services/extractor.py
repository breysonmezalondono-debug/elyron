"""Extracción REAL de texto de documentos de estudio para Elir.

Soporta: PDF, DOCX, DOC (via docx2txt), TXT, CSV, XLSX, XLS, PPTX.
Cada extractor se resuelve por extensión y MIME; si no hay librería
disponible o el tipo no es soportado, devuelve texto vacío y un error
controlado (NUNCA inventa contenido).
"""

from __future__ import annotations

import csv
import io
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

MAX_CHARS = 200_000

# Extensiones de imágenes: el texto no se extrae localmente (requiere un
# modelo de visión). Elir las maneja aparte.
IMAGE_EXTS = {"png", "jpg", "jpeg", "gif", "webp"}


def _try_import(mod: str):
    try:
        __import__(mod)
        return True
    except Exception:  # pragma: no cover - depende de la instalación
        return False


def _extract_pdf(data: bytes, filename: str) -> str:
    if not _try_import("pypdf"):
        logger.warning("pypdf no disponible para PDF: %s", filename)
        return ""
    from pypdf import PdfReader

    reader = PdfReader(io.BytesIO(data))
    parts: list[str] = []
    for i, page in enumerate(reader.pages):
        text = (page.extract_text() or "").strip()
        if text:
            parts.append(f"[página {i + 1}]\n{text}")
    return "\n\n".join(parts)


def _extract_docx(data: bytes, filename: str) -> str:
    if not _try_import("docx"):
        logger.warning("python-docx no disponible para DOCX: %s", filename)
        return ""
    from docx import Document

    doc = Document(io.BytesIO(data))
    parts = [p.text for p in doc.paragraphs if p.text.strip()]
    for table in doc.tables:
        for row in table.rows:
            cells = [c.text.strip() for c in row.cells if c.text.strip()]
            if cells:
                parts.append(" | ".join(cells))
    return "\n".join(parts)


def _extract_doc(data: bytes, filename: str) -> str:
    if not _try_import("docx2txt"):
        logger.warning("docx2txt no disponible para DOC: %s", filename)
        return ""
    import docx2txt

    return docx2txt.process(io.BytesIO(data))


def _extract_txt(data: bytes, filename: str) -> str:
    for enc in ("utf-8", "latin-1", "cp1252"):
        try:
            return data.decode(enc)
        except (UnicodeDecodeError, UnicodeError):
            continue
    return data.decode("utf-8", errors="replace")


def _extract_csv(data: bytes, filename: str) -> str:
    try:
        text = data.decode("utf-8")
    except UnicodeDecodeError:
        text = data.decode("latin-1")
    rows = list(csv.reader(io.StringIO(text)))
    return "\n".join(" | ".join(cell.strip() for cell in row) for row in rows if row)


def _extract_excel(data: bytes, filename: str) -> str:
    if not _try_import("openpyxl"):
        logger.warning("openpyxl no disponible para Excel: %s", filename)
        return ""
    import openpyxl

    wb = openpyxl.load_workbook(io.BytesIO(data), data_only=True, read_only=True)
    parts: list[str] = []
    for ws in wb.worksheets:
        rows: list[str] = []
        for row in ws.iter_rows(values_only=True):
            cells = [str(c).strip() for c in row if c is not None and str(c).strip()]
            if cells:
                rows.append(" | ".join(cells))
        if rows:
            parts.append(f"[hoja: {ws.title}]\n" + "\n".join(rows))
    return "\n\n".join(parts)


def _extract_pptx(data: bytes, filename: str) -> str:
    if not _try_import("pptx"):
        logger.warning("python-pptx no disponible para PPTX: %s", filename)
        return ""
    from pptx import Presentation

    prs = Presentation(io.BytesIO(data))
    parts: list[str] = []
    for i, slide in enumerate(prs.slides):
        texts = [shape.text.strip() for shape in slide.shapes if hasattr(shape, "text") and shape.text.strip()]
        if texts:
            parts.append(f"[diapositiva {i + 1}]\n" + "\n".join(texts))
    return "\n\n".join(parts)


_EXTRACTORS = {
    "pdf": _extract_pdf,
    "docx": _extract_docx,
    "doc": _extract_doc,
    "txt": _extract_txt,
    "csv": _extract_csv,
    "xlsx": _extract_excel,
    "xls": _extract_excel,
    "pptx": _extract_pptx,
}


def extract_text(data: bytes, filename: str, mime: str) -> dict:
    """Devuelve el texto extraído real o un error controlado."""
    ext = Path(filename).suffix.lower().lstrip(".")
    if not ext:
        return {"text": "", "error": "El archivo no tiene extensión."}
    if ext in IMAGE_EXTS:
        return {
            "text": "",
            "error": "Tipo de imagen: requiere modelo de visión (no se extrae texto localmente).",
        }
    extractor = _EXTRACTORS.get(ext)
    if extractor is None:
        return {"text": "", "error": f"Tipo de archivo no soportado: .{ext}"}
    try:
        text = extractor(data, filename)
        if not text.strip():
            return {"text": "", "error": "No se pudo extraer texto (archivo vacío o sin texto legible)."}
        return {"text": text[:MAX_CHARS], "chars": len(text[:MAX_CHARS])}
    except Exception as exc:  # pragma: no cover - depende del archivo
        logger.exception("Error extrayendo %s: %s", filename, exc)
        return {"text": "", "error": f"No se pudo procesar el archivo: {exc}"}
