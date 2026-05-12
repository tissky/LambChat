from __future__ import annotations

import pytest

from src.infra.task.executor import TaskExecutor
from src.infra.task.status import TaskStatus


class _FakeWebSocketManager:
    def __init__(self, delivered_count: int) -> None:
        self.delivered_count = delivered_count
        self.sent: list[tuple[str, dict]] = []

    async def send_to_user_with_broadcast(self, user_id: str, message: dict) -> int:
        self.sent.append((user_id, message))
        return self.delivered_count


class _FakeSessionManager:
    async def get_session(self, session_id: str):
        return None


class _FakeLogger:
    def __init__(self) -> None:
        self.infos: list[str] = []
        self.warnings: list[str] = []

    def info(self, message: str, *args) -> None:
        self.infos.append(message % args if args else message)

    def warning(self, message: str, *args) -> None:
        self.warnings.append(message % args if args else message)


@pytest.mark.asyncio
async def test_task_notification_warns_when_no_websocket_delivery(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    ws_manager = _FakeWebSocketManager(delivered_count=0)
    fake_logger = _FakeLogger()
    monkeypatch.setattr("src.infra.websocket.get_connection_manager", lambda: ws_manager)
    monkeypatch.setattr("src.infra.session.manager.SessionManager", _FakeSessionManager)
    monkeypatch.setattr("src.infra.task.executor.logger", fake_logger)

    executor = TaskExecutor(storage=None, run_info={}, heartbeat_manager=None)  # type: ignore[arg-type]

    await executor._send_task_notification(
        "session-1",
        "run-1",
        TaskStatus.COMPLETED,
        "user-1",
    )

    assert ws_manager.sent
    assert any("delivered=0" in message for message in fake_logger.warnings)
