from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "NPrep QMS"
    API_V1_STR: str = "/api/v1"
    
    # Database
    # Defaulting to localhost for local run, can be overridden by docker-compose environment variables
    DATABASE_URL: str = "postgresql+asyncpg://nprep_user:nprep_password@localhost:5432/nprep_qms"

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
