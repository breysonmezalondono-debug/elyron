import json
import logging
from typing import AsyncIterator

from openai import (
    APIConnectionError,
    APITimeoutError,
    AuthenticationError,
    BadRequestError,
    InternalServerError,
    NotFoundError,
    RateLimitError,
)
from openai import AsyncOpenAI

from app.config import settings
from app.schemas.chat import ChatRequest, ChatResponse

logger = logging.getLogger(__name__)


class AIServiceError(Exception):
    """Error del servicio de IA que se traduce a una respuesta HTTP."""

    def __init__(self, message: str, status_code: int = 500) -> None:
        super().__init__(message)
        self.message = message
        self.status_code = status_code


class AIService:
    """Cliente async hacia proveedores compatibles con OpenAI (Groq, OpenAI, xAI)."""

    def __init__(self) -> None:
        self._client: AsyncOpenAI | None = None

    @property
    def client(self) -> AsyncOpenAI:
        if self._client is None:
            self._client = AsyncOpenAI(
                api_key=settings.openai_api_key,
                base_url=settings.openai_base_url,
                timeout=settings.openai_timeout_seconds,
                max_retries=settings.openai_max_retries,
            )
        return self._client

    async def close(self) -> None:
        if self._client is not None:
            await self._client.close()
            self._client = None

    def _build_messages(self, request: ChatRequest) -> list[dict[str, str]]:
        messages: list[dict[str, str]] = []
        if request.system_prompt:
            messages.append({"role": "system", "content": request.system_prompt})
        messages.extend({"role": m.role, "content": m.content} for m in request.messages)
        return messages

    def _to_openai_error(self, exc: Exception) -> AIServiceError:
        if isinstance(exc, AuthenticationError):
            logger.error("Autenticacion fallida con el proveedor: %s", exc)
            return AIServiceError(
                "API key invalida o sin permisos. Revisa tu archivo .env", 401
            )
        if isinstance(exc, RateLimitError):
            logger.error("Rate limit del proveedor: %s", exc)
            return AIServiceError(
                "Demasiadas peticiones al proveedor. Intenta mas tarde.", 429
            )
        if isinstance(exc, NotFoundError):
            logger.error("Recurso/modelo no encontrado: %s", exc)
            return AIServiceError("El modelo de IA no existe o no esta disponible.", 400)
        if isinstance(exc, BadRequestError):
            logger.error("Peticion rechazada por el proveedor: %s", exc)
            return AIServiceError("Peticion invalida hacia el proveedor de IA.", 400)
        if isinstance(exc, APITimeoutError):
            logger.error("Timeout con el proveedor: %s", exc)
            return AIServiceError(
                "El proveedor de IA tardo demasiado en responder.", 504
            )
        if isinstance(exc, APIConnectionError):
            logger.error("Fallo de conexion con el proveedor: %s", exc)
            return AIServiceError(
                "No se pudo conectar con el proveedor de IA.", 502
            )
        logger.exception("Error inesperado al llamar al proveedor de IA")
        return AIServiceError("Error interno del servicio de IA.", 500)

    async def chat(self, request: ChatRequest) -> ChatResponse:
        model = request.model or settings.openai_model
        max_tokens = request.max_tokens or settings.openai_max_tokens

        try:
            completion = await self.client.chat.completions.create(
                model=model,
                messages=self._build_messages(request),
                temperature=request.temperature,
                max_tokens=max_tokens,
            )
        except Exception as exc:
            raise self._to_openai_error(exc) from exc

        if not completion.choices:
            logger.error("El proveedor devolvio una respuesta sin choices")
            raise AIServiceError("El proveedor devolvio una respuesta vacia.", 502)

        content = (completion.choices[0].message.content or "").strip()
        if not content:
            logger.warning("El proveedor devolvio contenido vacio")
            raise AIServiceError("El proveedor devolvio una respuesta vacia.", 502)

        usage = completion.usage.model_dump() if completion.usage else None
        logger.info(
            "Chat ok | model=%s | total_tokens=%s",
            model,
            usage.get("total_tokens") if usage else None,
        )

        return ChatResponse(
            id=completion.id,
            model=completion.model,
            content=content,
            usage=usage,
        )

    async def stream_chat(self, request: ChatRequest) -> AsyncIterator[str]:
        model = request.model or settings.openai_model
        max_tokens = request.max_tokens or settings.openai_max_tokens

        try:
            stream = await self.client.chat.completions.create(
                model=model,
                messages=self._build_messages(request),
                temperature=request.temperature,
                max_tokens=max_tokens,
                stream=True,
            )
        except Exception as exc:
            error = self._to_openai_error(exc)
            yield f"data: {json.dumps({'error': error.message}, ensure_ascii=False)}\n\n"
            yield "data: [DONE]\n\n"
            return

        try:
            async for chunk in stream:
                delta = chunk.choices[0].delta if chunk.choices else None
                if delta and delta.content:
                    yield f"data: {json.dumps(delta.content, ensure_ascii=False)}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as exc:
            logger.error("Error durante el streaming: %s", exc)
            error = self._to_openai_error(exc)
            yield f"data: {json.dumps({'error': error.message}, ensure_ascii=False)}\n\n"
            yield "data: [DONE]\n\n"
