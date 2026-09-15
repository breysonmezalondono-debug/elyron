from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile
from fastapi.responses import StreamingResponse

from app.schemas.chat import ChatRequest, ChatResponse
from app.services.openai_service import AIService, AIServiceError
from app.services.extractor import extract_text

router = APIRouter()


def get_ai_service(request: Request) -> AIService:
    return request.app.state.ai_service


MAX_EXTRACT_BYTES = 60 * 1024 * 1024


@router.post(
    "/extract",
    summary="Extraer texto real de un documento (PDF/DOCX/TXT/CSV/XLSX/PPTX)",
)
async def extract(file: UploadFile = File(...)) -> dict:
    """Endpoint interno (lo invoca el backend con ownership ya validado).

    Extrae el texto del archivo para usarlo como contexto real de la
    respuesta de Elir. Nunca inventa contenido: si no puede leerlo,
    devuelve un error controlado.
    """
    data = await file.read()
    if len(data) == 0:
        raise HTTPException(status_code=400, detail="El archivo está vacío.")
    if len(data) > MAX_EXTRACT_BYTES:
        raise HTTPException(status_code=413, detail="El archivo supera el tamaño máximo.")
    result = extract_text(data, file.filename or "archivo", file.content_type or "")
    if result.get("error") and not result.get("text"):
        raise HTTPException(status_code=422, detail=result["error"])
    return {"text": result["text"], "chars": result.get("chars", len(result["text"]))}



@router.post(
    "/chat",
    response_model=ChatResponse,
    summary="Generar respuesta de IA",
)
async def chat(
    request: ChatRequest,
    service: AIService = Depends(get_ai_service),
) -> ChatResponse:
    try:
        return await service.chat(request)
    except AIServiceError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message) from exc


@router.post(
    "/chat/stream",
    summary="Generar respuesta de IA en streaming (SSE)",
)
async def chat_stream(
    request: ChatRequest,
    service: AIService = Depends(get_ai_service),
) -> StreamingResponse:
    return StreamingResponse(
        service.stream_chat(request),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )
