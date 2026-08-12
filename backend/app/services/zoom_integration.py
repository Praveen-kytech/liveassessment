import httpx
import os
import base64
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

class ZoomIntegrationService:
    def __init__(self):
        self.client_id = os.getenv("ZOOM_CLIENT_ID", "mock_client_id")
        self.client_secret = os.getenv("ZOOM_CLIENT_SECRET", "mock_client_secret")
        self.account_id = os.getenv("ZOOM_ACCOUNT_ID", "mock_account_id")
        self.base_url = "https://api.zoom.us/v2"
        self.token_url = "https://zoom.us/oauth/token"

    async def _get_access_token(self) -> str:
        if self.client_id == "mock_client_id":
            return "mock_zoom_token"
            
        auth_string = f"{self.client_id}:{self.client_secret}"
        b64_auth = base64.b64encode(auth_string.encode()).decode()
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.token_url,
                params={"grant_type": "account_credentials", "account_id": self.account_id},
                headers={"Authorization": f"Basic {b64_auth}"}
            )
            response.raise_for_status()
            data = response.json()
            return data["access_token"]

    async def create_meeting(self, topic: str, start_time: str, duration: int) -> Dict[str, Any]:
        logger.info(f"Creating zoom meeting for {topic} at {start_time}")
        token = await self._get_access_token()
        
        if token == "mock_zoom_token":
            # Fallback if no zoom credentials are set
            return {
                "id": "123456789",
                "join_url": "https://zoom.us/j/123456789",
                "start_url": "https://zoom.us/s/123456789"
            }
            
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/users/me/meetings",
                json={
                    "topic": topic,
                    "type": 2, # Scheduled meeting
                    "start_time": start_time,
                    "duration": duration,
                    "settings": {
                        "host_video": True,
                        "participant_video": True,
                        "join_before_host": False,
                        "mute_upon_entry": True,
                    }
                },
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json"
                }
            )
            response.raise_for_status()
            return response.json()

zoom_integration_service = ZoomIntegrationService()
