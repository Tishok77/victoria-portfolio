import logging
import time
from collections import defaultdict, deque
from datetime import timedelta
from threading import Lock

from fastapi import APIRouter, BackgroundTasks, Request
from fastapi.responses import JSONResponse

from ..config import settings
from ..repositories import leads as leads_repo
from ..schemas import LeadIn
from ..services.notifications import notify_new_lead

log = logging.getLogger("victoria.leads")
router = APIRouter()

DUPLICATE_WINDOW = timedelta(minutes=2)
RATE_WINDOW_SECONDS = 600

# In-memory, per client IP: enough for a single-process personal site.
_recent: dict[str, deque] = defaultdict(deque)
_recent_lock = Lock()


def _rate_limited(client: str) -> bool:
    now = time.monotonic()
    with _recent_lock:
        hits = _recent[client]
        while hits and now - hits[0] > RATE_WINDOW_SECONDS:
            hits.popleft()
        if len(hits) >= settings.leads_rate_limit:
            return True
        hits.append(now)
        return False


@router.post("/leads", status_code=201)
def create_lead(payload: LeadIn, request: Request, background: BackgroundTasks):
    # A repeated submit of the same lead (double click, retry) is not a new lead.
    duplicate = leads_repo.find_recent_duplicate(payload.phone, payload.message, DUPLICATE_WINDOW)
    if duplicate:
        log.info("lead %s: duplicate submit ignored", duplicate.id)
        return {"success": True}

    client = request.client.host if request.client else "unknown"
    if _rate_limited(client):
        log.warning("lead rejected: rate limit reached")
        return JSONResponse(status_code=429, content={"success": False, "error": "too_many_requests"})

    lead = leads_repo.create(payload.name, payload.phone, payload.message)
    background.add_task(notify_new_lead, lead)
    return {"success": True}
