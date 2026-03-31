from collections import defaultdict
from dataclasses import dataclass
from typing import Optional

from fastapi import WebSocket


@dataclass
class UserMetadata:
    user_id: int
    display_name: str
    role: str  # 'host' | 'user'


class ConnectionManager:
    def __init__(self):
        # WebSocket connections by room id
        self.meeting_connections: dict[int, list[WebSocket]] = defaultdict(list)
        self.live_connections: dict[int, list[WebSocket]] = defaultdict(list)

        # User metadata mapping: websocket -> UserMetadata
        self.user_metadata: dict[WebSocket, UserMetadata] = {}

        # Connection identifier mapping: str id -> WebSocket
        self.connection_ids: dict[str, WebSocket] = {}

        # Raise hand state by room id: set of connection ids
        self.raised_hands_meeting: dict[int, set[str]] = defaultdict(set)
        self.raised_hands_live: dict[int, set[str]] = defaultdict(set)

        # Room type tracking for each websocket
        self.ws_room_type: dict[WebSocket, str] = {}  # 'meeting' | 'live'
        self.ws_room_id: dict[WebSocket, int] = {}

    async def connect_meeting(self, meeting_id: int, websocket: WebSocket):
        await websocket.accept()
        self.meeting_connections[meeting_id].append(websocket)
        self.ws_room_type[websocket] = 'meeting'
        self.ws_room_id[websocket] = meeting_id

    def disconnect_meeting(self, meeting_id: int, websocket: WebSocket):
        if websocket in self.meeting_connections[meeting_id]:
            self.meeting_connections[meeting_id].remove(websocket)

        # Clean up user metadata
        conn_id = self._get_conn_id(websocket)
        if conn_id:
            self.raised_hands_meeting[meeting_id].discard(conn_id)
            self.connection_ids.pop(conn_id, None)

        self.user_metadata.pop(websocket, None)
        self.ws_room_type.pop(websocket, None)
        self.ws_room_id.pop(websocket, None)

    async def connect_live(self, live_id: int, websocket: WebSocket):
        await websocket.accept()
        self.live_connections[live_id].append(websocket)
        self.ws_room_type[websocket] = 'live'
        self.ws_room_id[websocket] = live_id

    def disconnect_live(self, live_id: int, websocket: WebSocket):
        if websocket in self.live_connections[live_id]:
            self.live_connections[live_id].remove(websocket)

        # Clean up user metadata
        conn_id = self._get_conn_id(websocket)
        if conn_id:
            self.raised_hands_live[live_id].discard(conn_id)
            self.connection_ids.pop(conn_id, None)

        self.user_metadata.pop(websocket, None)
        self.ws_room_type.pop(websocket, None)
        self.ws_room_id.pop(websocket, None)

    def register_user(self, conn_id: str, websocket: WebSocket, user_id: int, display_name: str, role: str):
        """Register user metadata for a websocket connection."""
        self.user_metadata[websocket] = UserMetadata(user_id=user_id, display_name=display_name, role=role)
        self.connection_ids[conn_id] = websocket

    def unregister_user(self, conn_id: str):
        """Unregister user by connection id."""
        websocket = self.connection_ids.get(conn_id)
        if websocket:
            self.user_metadata.pop(websocket, None)
            self.connection_ids.pop(conn_id, None)

    def _get_conn_id(self, websocket: WebSocket) -> Optional[str]:
        """Get connection id for a websocket."""
        for conn_id, ws in self.connection_ids.items():
            if ws == websocket:
                return conn_id
        return None

    def handle_raise_hand(self, room_type: str, room_id: int, conn_id: str) -> bool:
        """Handle raise-hand action. Returns True if state changed."""
        hands_dict = self.raised_hands_meeting if room_type == 'meeting' else self.raised_hands_live
        if conn_id not in hands_dict[room_id]:
            hands_dict[room_id].add(conn_id)
            return True
        return False

    def handle_lower_hand(self, room_type: str, room_id: int, conn_id: str) -> bool:
        """Handle lower-hand action. Returns True if state changed."""
        hands_dict = self.raised_hands_meeting if room_type == 'meeting' else self.raised_hands_live
        if conn_id in hands_dict[room_id]:
            hands_dict[room_id].discard(conn_id)
            return True
        return False

    def is_hand_raised(self, room_type: str, room_id: int, conn_id: str) -> bool:
        """Check if a user has raised hand."""
        hands_dict = self.raised_hands_meeting if room_type == 'meeting' else self.raised_hands_live
        return conn_id in hands_dict[room_id]

    def get_online_users(self, room_type: str, room_id: int) -> list[dict]:
        """Get list of online users in a room with their metadata and hand state."""
        connections = self.meeting_connections[room_id] if room_type == 'meeting' else self.live_connections[room_id]
        hands_dict = self.raised_hands_meeting if room_type == 'meeting' else self.raised_hands_live

        users = []
        for ws in connections:
            metadata = self.user_metadata.get(ws)
            conn_id = self._get_conn_id(ws)
            if metadata and conn_id:
                users.append({
                    'id': conn_id,
                    'user_id': metadata.user_id,
                    'display_name': metadata.display_name,
                    'role': metadata.role,
                    'hand_raised': conn_id in hands_dict[room_id]
                })
        return users

    def get_user_metadata(self, conn_id: str) -> Optional[UserMetadata]:
        """Get user metadata by connection id."""
        websocket = self.connection_ids.get(conn_id)
        if websocket:
            return self.user_metadata.get(websocket)
        return None

    async def broadcast_meeting(self, meeting_id: int, payload: dict, exclude: Optional[WebSocket] = None):
        for connection in list(self.meeting_connections[meeting_id]):
            if exclude and connection == exclude:
                continue
            await connection.send_json(payload)

    async def broadcast_live(self, live_id: int, payload: dict, exclude: Optional[WebSocket] = None):
        for connection in list(self.live_connections[live_id]):
            if exclude and connection == exclude:
                continue
            await connection.send_json(payload)

    async def send_to_connection(self, conn_id: str, payload: dict):
        """Send message to a specific connection by id."""
        websocket = self.connection_ids.get(conn_id)
        if websocket:
            await websocket.send_json(payload)


manager = ConnectionManager()
