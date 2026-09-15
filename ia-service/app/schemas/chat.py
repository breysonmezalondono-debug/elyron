from typing import Any

from pydantic import BaseModel, Field, field_validator

MAX_MESSAGES = 50
MAX_MESSAGE_LENGTH = 12000
MAX_SYSTEM_PROMPT_LENGTH = 4000

ALLOWED_ROLES = {"system", "user", "assistant"}


class ChatMessage(BaseModel):
    role: str
    content: str

    @field_validator("role")
    @classmethod
    def _role_must_be_allowed(cls, v: str) -> str:
        if v not in ALLOWED_ROLES:
            raise ValueError(
                f"role invalido: '{v}'. Valores permitidos: {sorted(ALLOWED_ROLES)}"
            )
        return v

    @field_validator("content")
    @classmethod
    def _content_valid(cls, v: str) -> str:
        v = (v or "").strip()
        if not v:
            raise ValueError("content no puede estar vacio")
        if len(v) > MAX_MESSAGE_LENGTH:
            raise ValueError(
                f"content demasiado largo (max {MAX_MESSAGE_LENGTH} caracteres)"
            )
        return v


class ChatRequest(BaseModel):
    messages: list[ChatMessage] = Field(..., min_length=1)
    system_prompt: str | None = Field(default=None, max_length=MAX_SYSTEM_PROMPT_LENGTH)
    model: str | None = Field(default=None, max_length=128)
    temperature: float = Field(default=0.7, ge=0.0, le=2.0)
    max_tokens: int | None = Field(default=None, ge=1, le=8192)

    @field_validator("messages")
    @classmethod
    def _limit_messages(cls, v: list[ChatMessage]) -> list[ChatMessage]:
        if len(v) > MAX_MESSAGES:
            raise ValueError(f"demasiados mensajes (max {MAX_MESSAGES})")
        return v


class ChatResponse(BaseModel):
    id: str
    model: str
    content: str
    usage: dict[str, Any] | None = None
