from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.services.ws_manager import manager

router = APIRouter(tags=["ws"])


@router.websocket("/ws/meetings/{meeting_id}")
async def meeting_ws(websocket: WebSocket, meeting_id: int):
    await manager.connect_meeting(meeting_id, websocket)
    try:
        while True:
            payload = await websocket.receive_json()
            msg_type = payload.get('type')
            from_id = payload.get('from', '')

            # Handle join message - register user
            if msg_type == 'join':
                user_id = payload.get('user_id', 0)
                display_name = payload.get('display_name', '匿名用户')
                role = payload.get('role', 'user')
                manager.register_user(from_id, websocket, user_id, display_name, role)

                # Broadcast user-joined to all others
                await manager.broadcast_meeting(meeting_id, {
                    'type': 'user-joined',
                    'from': from_id,
                    'user_id': user_id,
                    'display_name': display_name,
                    'role': role
                }, exclude=websocket)

                # Send user-list to the new user
                await manager.send_to_connection(from_id, {
                    'type': 'user-list',
                    'users': manager.get_online_users('meeting', meeting_id)
                })

                # Continue to broadcast join for WebRTC signaling
                await manager.broadcast_meeting(meeting_id, payload)

            # Handle leave message
            elif msg_type == 'leave':
                user_metadata = manager.get_user_metadata(from_id)
                await manager.broadcast_meeting(meeting_id, {
                    'type': 'user-left',
                    'from': from_id,
                    'user_id': user_metadata.user_id if user_metadata else 0,
                    'display_name': user_metadata.display_name if user_metadata else '匿名用户'
                })
                manager.unregister_user(from_id)

            # Handle raise-hand
            elif msg_type == 'raise-hand':
                if manager.handle_raise_hand('meeting', meeting_id, from_id):
                    user_metadata = manager.get_user_metadata(from_id)
                    await manager.broadcast_meeting(meeting_id, {
                        'type': 'raise-hand',
                        'from': from_id,
                        'user_id': user_metadata.user_id if user_metadata else 0,
                        'display_name': user_metadata.display_name if user_metadata else '匿名用户'
                    })

            # Handle lower-hand
            elif msg_type == 'lower-hand':
                if manager.handle_lower_hand('meeting', meeting_id, from_id):
                    user_metadata = manager.get_user_metadata(from_id)
                    await manager.broadcast_meeting(meeting_id, {
                        'type': 'lower-hand',
                        'from': from_id,
                        'user_id': user_metadata.user_id if user_metadata else 0,
                        'display_name': user_metadata.display_name if user_metadata else '匿名用户'
                    })

            # Handle chat-message
            elif msg_type == 'chat-message':
                user_metadata = manager.get_user_metadata(from_id)
                chat_payload = {
                    'type': 'chat-message',
                    'from': from_id,
                    'sender_name': user_metadata.display_name if user_metadata else payload.get('sender_name', '匿名用户'),
                    'msg_type': payload.get('msg_type', 'text'),
                    'content': payload.get('content'),
                    'url': payload.get('url'),
                    'filename': payload.get('filename')
                }
                await manager.broadcast_meeting(meeting_id, chat_payload)

            # Handle WebRTC signaling and vote messages
            else:
                await manager.broadcast_meeting(meeting_id, payload)

    except WebSocketDisconnect:
        manager.disconnect_meeting(meeting_id, websocket)
        # Broadcast user-left on disconnect
        conn_id = None
        for cid, ws in manager.connection_ids.items():
            if ws == websocket:
                conn_id = cid
                break
        if conn_id:
            user_metadata = manager.get_user_metadata(conn_id)
            await manager.broadcast_meeting(meeting_id, {
                'type': 'user-left',
                'from': conn_id,
                'user_id': user_metadata.user_id if user_metadata else 0,
                'display_name': user_metadata.display_name if user_metadata else '匿名用户'
            })


@router.websocket("/ws/live/{live_id}")
async def live_ws(websocket: WebSocket, live_id: int):
    await manager.connect_live(live_id, websocket)
    try:
        while True:
            payload = await websocket.receive_json()
            msg_type = payload.get('type')
            from_id = payload.get('from', '')

            # Handle join message - register user
            if msg_type == 'join':
                user_id = payload.get('user_id', 0)
                display_name = payload.get('display_name', '匿名用户')
                role = payload.get('role', 'user')
                manager.register_user(from_id, websocket, user_id, display_name, role)

                # Broadcast user-joined to all others
                await manager.broadcast_live(live_id, {
                    'type': 'user-joined',
                    'from': from_id,
                    'user_id': user_id,
                    'display_name': display_name,
                    'role': role
                }, exclude=websocket)

                # Send user-list to the new user
                await manager.send_to_connection(from_id, {
                    'type': 'user-list',
                    'users': manager.get_online_users('live', live_id)
                })

                # Continue to broadcast join for WebRTC signaling
                await manager.broadcast_live(live_id, payload)

            # Handle leave message
            elif msg_type == 'leave':
                user_metadata = manager.get_user_metadata(from_id)
                await manager.broadcast_live(live_id, {
                    'type': 'user-left',
                    'from': from_id,
                    'user_id': user_metadata.user_id if user_metadata else 0,
                    'display_name': user_metadata.display_name if user_metadata else '匿名用户'
                })
                manager.unregister_user(from_id)

            # Handle raise-hand
            elif msg_type == 'raise-hand':
                if manager.handle_raise_hand('live', live_id, from_id):
                    user_metadata = manager.get_user_metadata(from_id)
                    await manager.broadcast_live(live_id, {
                        'type': 'raise-hand',
                        'from': from_id,
                        'user_id': user_metadata.user_id if user_metadata else 0,
                        'display_name': user_metadata.display_name if user_metadata else '匿名用户'
                    })

            # Handle lower-hand
            elif msg_type == 'lower-hand':
                if manager.handle_lower_hand('live', live_id, from_id):
                    user_metadata = manager.get_user_metadata(from_id)
                    await manager.broadcast_live(live_id, {
                        'type': 'lower-hand',
                        'from': from_id,
                        'user_id': user_metadata.user_id if user_metadata else 0,
                        'display_name': user_metadata.display_name if user_metadata else '匿名用户'
                    })

            # Handle chat-message
            elif msg_type == 'chat-message':
                user_metadata = manager.get_user_metadata(from_id)
                chat_payload = {
                    'type': 'chat-message',
                    'from': from_id,
                    'sender_name': user_metadata.display_name if user_metadata else payload.get('sender_name', '匿名用户'),
                    'msg_type': payload.get('msg_type', 'text'),
                    'content': payload.get('content'),
                    'url': payload.get('url'),
                    'filename': payload.get('filename')
                }
                await manager.broadcast_live(live_id, chat_payload)

            # Handle WebRTC signaling messages
            else:
                await manager.broadcast_live(live_id, payload)

    except WebSocketDisconnect:
        manager.disconnect_live(live_id, websocket)
        # Broadcast user-left on disconnect
        conn_id = None
        for cid, ws in manager.connection_ids.items():
            if ws == websocket:
                conn_id = cid
                break
        if conn_id:
            user_metadata = manager.get_user_metadata(conn_id)
            await manager.broadcast_live(live_id, {
                'type': 'user-left',
                'from': conn_id,
                'user_id': user_metadata.user_id if user_metadata else 0,
                'display_name': user_metadata.display_name if user_metadata else '匿名用户'
            })
