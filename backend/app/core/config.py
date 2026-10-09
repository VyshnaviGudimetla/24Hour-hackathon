import os
from pydantic_settings import BaseSettings, SettingsConfigDict

is_vercel = os.getenv("VERCEL") == "1"

default_db_url = "sqlite:////tmp/aquasmart.db" if is_vercel else "sqlite:///./aquasmart.db"
default_upload_dir = "/tmp/uploads" if is_vercel else os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")

# If on Vercel, copy pre-seeded database to /tmp if not already present
if is_vercel and not os.path.exists("/tmp/aquasmart.db"):
    for candidate in [
        os.path.join(os.path.dirname(os.path.dirname(__file__)), "aquasmart.db"),
        os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "aquasmart.db"),
        "./aquasmart.db",
        "./backend/aquasmart.db"
    ]:
        if os.path.exists(candidate):
            import shutil
            try:
                shutil.copy2(candidate, "/tmp/aquasmart.db")
                break
            except Exception:
                pass

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="allow")

    APP_NAME: str = "AquaSmart AI — Telemetry & Feeding Optimizer"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = "aquasmart-super-secret-key-for-jwt-signing-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day
    DATABASE_URL: str = default_db_url
    DEMO_MODE_DEFAULT: bool = True
    UPLOAD_DIR: str = default_upload_dir
    MAX_UPLOAD_SIZE_MB: int = 10
    STALE_DATA_TIMEOUT_MINUTES: int = 15

settings = Settings()

# Ensure upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

