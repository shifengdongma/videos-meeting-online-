import io
import logging
from datetime import datetime

import pandas as pd
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.meeting import Meeting, MeetingParticipant
from app.models.user import User
from app.schemas.meeting import MeetingParticipantResponse
from app.services.deps import require_roles

router = APIRouter(prefix="/meetings", tags=["participants"])
logger = logging.getLogger(__name__)


@router.post(
    "/{meeting_id}/participants/import",
    response_model=list[MeetingParticipantResponse],
    status_code=status.HTTP_201_CREATED,
)
async def import_participants(
    meeting_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(require_roles("admin", "host")),
    db: Session = Depends(get_db),
):
    """
    批量导入参会人员（支持 Excel 和 CSV 文件）
    文件需包含以下列：姓名、电话、部门
    """
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="会议不存在")

    # 检查文件类型
    filename = file.filename or ""
    if not (filename.endswith(".xlsx") or filename.endswith(".xls") or filename.endswith(".csv")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="仅支持 Excel (.xlsx, .xls) 或 CSV (.csv) 文件",
        )

    # 读取文件内容
    content = await file.read()

    try:
        if filename.endswith(".csv"):
            # 使用 pandas 读取 CSV
            df = pd.read_csv(io.BytesIO(content), encoding="utf-8")
        else:
            # 使用 pandas 读取 Excel
            df = pd.read_excel(io.BytesIO(content))
    except Exception as e:
        logger.error(f"文件解析失败: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"文件解析失败: {str(e)}",
        )

    # 检查必需列
    required_columns = ["姓名", "电话", "部门"]
    # 尝试匹配列名（支持大小写和空格差异）
    column_mapping = {}
    for col in df.columns:
        col_normalized = col.strip().lower()
        for required in required_columns:
            if col_normalized == required.lower():
                column_mapping[required] = col
                break

    missing_columns = [col for col in required_columns if col not in column_mapping]
    if missing_columns:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"文件缺少必需列: {', '.join(missing_columns)}。请确保文件包含：姓名、电话、部门",
        )

    # 解析数据并批量插入
    participants = []
    errors = []

    for idx, row in df.iterrows():
        try:
            name = str(row[column_mapping["姓名"]]).strip() if pd.notna(row[column_mapping["姓名"]]) else None
            phone = str(row[column_mapping["电话"]]).strip() if pd.notna(row[column_mapping["电话"]]) else None
            department = str(row[column_mapping["部门"]]).strip() if pd.notna(row[column_mapping["部门"]]) else None

            if not name:
                errors.append(f"第 {idx + 2} 行：姓名为空，跳过")
                continue

            participant = MeetingParticipant(
                meeting_id=meeting_id,
                name=name,
                phone=phone,
                department=department,
            )
            db.add(participant)
            participants.append(participant)

        except Exception as e:
            errors.append(f"第 {idx + 2} 行解析失败: {str(e)}")
            continue

    if not participants:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"未解析到有效的参会人员数据。错误: {'; '.join(errors)}",
        )

    db.commit()
    for p in participants:
        db.refresh(p)

    # 记录导入日志
    logger.info(f"会议 [{meeting_id}] 批量导入参会人员: 成功 {len(participants)} 条，失败 {len(errors)} 条")
    if errors:
        logger.warning(f"导入错误详情: {errors}")

    return participants


@router.get("/{meeting_id}/participants/template")
def download_template(
    meeting_id: int,
    current_user: User = Depends(require_roles("admin", "host")),
):
    """
    返回参会人员导入模板的数据格式说明
    """
    return {
        "columns": ["姓名", "电话", "部门"],
        "example": [
            {"姓名": "张三", "电话": "13800138001", "部门": "技术部"},
            {"姓名": "李四", "电话": "13800138002", "部门": "市场部"},
            {"姓名": "王五", "电话": "13800138003", "部门": "人事部"},
        ],
        "tips": [
            "姓名列必填，电话和部门列可选",
            "文件格式支持 .xlsx、.xls、.csv",
            "CSV 文件请使用 UTF-8 编码",
        ],
    }