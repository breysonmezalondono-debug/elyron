from functools import lru_cache

from dotenv import dotenv_values
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "IA Service API"
    app_version: str = "0.1.0"
    log_level: str = "INFO"
    api_v1_prefix: str = "/api/v1"

    openai_api_key: str
    openai_base_url: str = "https://api.groq.com/openai/v1"
    openai_model: str = "openai/gpt-oss-120b"
    openai_timeout_seconds: float = 60.0
    openai_max_retries: int = 2
    openai_max_tokens: int = 1024
    openai_temperature: float = 0.7

    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
    ]

    def __init__(self, **values: object) -> None:
        env_values = {k.lower(): v for k, v in dotenv_values(".env").items()}
        openai_api_key = env_values.get("openai_api_key")
        if openai_api_key:
            values["openai_api_key"] = openai_api_key
        super().__init__(**values)

    @field_validator("openai_api_key", mode="before")
    @classmethod
    def _keys_not_blank(cls, v: object) -> object:
        if not v or not str(v).strip():
            raise ValueError("OPENAI_API_KEY no puede estar vacia. Revisa tu .env")
        return v

    @field_validator("cors_origins", mode="after")
    @classmethod
    def _no_wildcard_with_credentials(cls, v: list[str]) -> list[str]:
        if "*" in v:
            raise ValueError(
                "CORS_ORIGINS no puede contener '*' junto con allow_credentials=True"
            )
        return v


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
