"""Shared HTTP helper for all tools."""
import os
import httpx

API_BASE_URL = os.environ.get("API_BASE_URL", "http://localhost:8000")
_TIMEOUT = 10.0


def _request(method: str, path: str, params: dict = None, body: dict = None, token: str = None) -> dict:
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    url = f"{API_BASE_URL}{path}"
    kwargs = dict(params=params, headers=headers, timeout=_TIMEOUT)
    if body is not None:
        kwargs["json"] = body

    for attempt in range(2):
        try:
            resp = getattr(httpx, method)(url, **kwargs)
            resp.raise_for_status()
            return resp.json()
        except httpx.ConnectError:
            if attempt == 1:
                raise
            # retry once


def get(path: str, params: dict = None, token: str = None) -> dict:
    return _request("get", path, params=params, token=token)


def post(path: str, body: dict, token: str = None) -> dict:
    return _request("post", path, body=body, token=token)


def put(path: str, body: dict, token: str = None) -> dict:
    return _request("put", path, body=body, token=token)
