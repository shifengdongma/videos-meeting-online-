import asyncio
import logging
from datetime import datetime, timedelta

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.models.meeting import Meeting, MeetingParticipant

logger = logging.getLogger(__name__)

# 创建数据库连接
engine = create_engine(settings.database_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class NotificationService:
    """会议通知推送服务"""

    def __init__(self):
        self.running = False
        self.check_interval = 60  # 每60秒检查一次
        self.advance_minutes = 30  # 会议开始前30分钟推送通知

    async def start(self):
        """启动后台推送服务"""
        self.running = True
        logger.info("会议通知推送服务已启动")
        while self.running:
            try:
                await self.check_and_send_notifications()
            except Exception as e:
                logger.error(f"推送检查失败: {e}")
            await asyncio.sleep(self.check_interval)

    def stop(self):
        """停止后台推送服务"""
        self.running = False
        logger.info("会议通知推送服务已停止")

    async def check_and_send_notifications(self):
        """检查即将开始的会议并发送通知"""
        db = SessionLocal()
        try:
            now = datetime.utcnow()
            # 查询即将开始且已发布的会议
            # 使用 earliest_entry_time 或 start_time 作为参考时间
            upcoming_meetings = (
                db.query(Meeting)
                .filter(
                    Meeting.is_published == True,
                    Meeting.status == "scheduled",
                )
                .all()
            )

            for meeting in upcoming_meetings:
                # 确定推送参考时间（优先使用最早进入时间）
                reference_time = meeting.earliest_entry_time or meeting.start_time
                if not reference_time:
                    continue

                # 计算距离会议开始的时间
                time_until_meeting = reference_time - now

                # 如果会议在指定时间内开始，发送通知
                if timedelta(minutes=0) <= time_until_meeting <= timedelta(minutes=self.advance_minutes):
                    await self.send_meeting_notification(meeting, db)

        finally:
            db.close()

    async def send_meeting_notification(self, meeting: Meeting, db):
        """
        发送会议通知
        为将来对接真实短信/邮件服务预留接口
        """
        # 获取参会人员列表
        participants = (
            db.query(MeetingParticipant)
            .filter(MeetingParticipant.meeting_id == meeting.id)
            .all()
        )

        if not participants:
            logger.info(f"会议 [{meeting.id}] 无参会人员，跳过通知")
            return

        # 构建通知内容
        notification_content = self.build_notification_content(meeting)

        # 发送通知（目前仅打印日志）
        for participant in participants:
            phone = participant.phone or "未设置电话"
            logger.info(f"向 [{phone}] 发送会议推送: 会议 [{meeting.title}] 将于 {meeting.start_time} 开始")
            # TODO: 对接真实短信/邮件服务
            # await self.send_sms(phone, notification_content)
            # await self.send_email(participant.email, notification_content)

        logger.info(f"会议 [{meeting.id}] {meeting.title} 通知已发送给 {len(participants)} 位参会人员")

    def build_notification_content(self, meeting: Meeting) -> str:
        """构建通知内容"""
        start_time_str = meeting.start_time.strftime("%Y-%m-%d %H:%M")
        end_time_str = meeting.end_time.strftime("%Y-%m-%d %H:%M")

        content = f"""
【会议通知】
会议名称：{meeting.title}
会议时间：{start_time_str} - {end_time_str}
会议地点：{meeting.address or '线上会议'}

请准时参加会议。
        """
        return content.strip()

    # 预留的短信发送接口
    async def send_sms(self, phone: str, content: str):
        """
        发送短信通知
        TODO: 对接短信服务提供商（如阿里云、腾讯云短信服务）
        """
        logger.info(f"[SMS] 发送短信至 {phone}: {content[:50]}...")
        # 实际对接时需要调用短信服务 API
        pass

    # 预留的邮件发送接口
    async def send_email(self, email: str, content: str):
        """
        发送邮件通知
        TODO: 对接邮件服务（SMTP 或第三方邮件服务）
        """
        logger.info(f"[EMAIL] 发送邮件至 {email}: {content[:50]}...")
        # 实际对接时需要调用邮件服务 API
        pass


# 创建全局通知服务实例
notification_service = NotificationService()


async def start_notification_service():
    """启动通知服务（在 FastAPI 应用启动时调用）"""
    asyncio.create_task(notification_service.start())


def stop_notification_service():
    """停止通知服务"""
    notification_service.stop()