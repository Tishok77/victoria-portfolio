"""One process for the whole site: static frontend at / and the API at /api.

Run:  .venv/bin/python -m uvicorn app.main:app --app-dir server --port 8765
(Victoria Portfolio.app does this in the background.)
"""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from starlette.exceptions import HTTPException as StarletteHTTPException

from .api import health, leads
from .config import SITE_ROOT, settings
from .db import init_db

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
log = logging.getLogger("victoria")

MAX_API_BODY_BYTES = 16 * 1024

# Only the public site is served — never server/ (database, .env), the .app bundles or README.
STATIC_DIRS = ("css", "js", "content", "assets", "pages")
STATIC_FILES = {"index.html", "favicon.ico"}


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    log.info(
        "backend started; database=%s; email=%s",
        settings.database_path,
        "enabled" if settings.email_enabled else "disabled (dev mode)",
    )
    yield


app = FastAPI(
    title="Victoria Portfolio API",
    lifespan=lifespan,
    docs_url="/api/docs" if settings.api_docs else None,
    redoc_url=None,
    openapi_url="/api/openapi.json" if settings.api_docs else None,
)


@app.middleware("http")
async def guard_and_headers(request: Request, call_next):
    if request.url.path.startswith("/api/"):
        length = request.headers.get("content-length", "")
        if length.isdigit() and int(length) > MAX_API_BODY_BYTES:
            return JSONResponse(status_code=413, content={"success": False, "error": "payload_too_large"})
    response = await call_next(request)
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
    return response


# Error responses never include stack traces, paths or submitted values.
@app.exception_handler(RequestValidationError)
async def validation_error(request: Request, error: RequestValidationError):
    known = {"name", "phone", "message"}
    fields = sorted({str(item["loc"][-1]) if str(item["loc"][-1]) in known else "body"
                     for item in error.errors() if item.get("loc")})
    return JSONResponse(status_code=422, content={"success": False, "error": "validation_error", "fields": fields})


@app.exception_handler(StarletteHTTPException)
async def http_error(request: Request, error: StarletteHTTPException):
    if request.url.path.startswith("/api/"):
        return JSONResponse(status_code=error.status_code, content={"success": False, "error": "http_error"})
    return JSONResponse(status_code=error.status_code, content={"error": "not_found" if error.status_code == 404 else "error"})


@app.exception_handler(Exception)
async def internal_error(request: Request, error: Exception):
    log.exception("unhandled error on %s %s", request.method, request.url.path)
    return JSONResponse(status_code=500, content={"success": False, "error": "internal_error"})


app.include_router(health.router, prefix="/api")
app.include_router(leads.router, prefix="/api")


@app.get("/", include_in_schema=False)
def index() -> FileResponse:
    return FileResponse(SITE_ROOT / "index.html")


@app.get("/{filename}", include_in_schema=False)
def root_file(filename: str) -> FileResponse:
    if filename not in STATIC_FILES:
        raise StarletteHTTPException(status_code=404)
    return FileResponse(SITE_ROOT / filename)


for directory in STATIC_DIRS:
    app.mount(f"/{directory}", StaticFiles(directory=SITE_ROOT / directory), name=directory)
