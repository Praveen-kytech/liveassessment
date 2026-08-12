import pytest
from fastapi.testclient import TestClient

def test_read_root(client: TestClient):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to Live Assessment Platform API"}

def test_auth_protected_results(client: TestClient):
    # This should pass because client has dependency overridden
    response = client.get("/api/results/session/1/results")
    assert response.status_code == 200
    assert response.json() == []

def test_unauth_protected_results(unauth_client: TestClient):
    # This should fail with 401
    response = unauth_client.get("/api/results/session/1/results")
    assert response.status_code == 401
    assert response.json() == {"detail": "Not authenticated"}

def test_auth_protected_zoom(client: TestClient):
    # Mock zoom meeting creation
    response = client.post("/api/zoom/session/1/zoom")
    assert response.status_code == 200
    assert "meeting" in response.json()
