from enum import Enum


class RoleEnum(str, Enum):
    admin = "admin"
    host = "host"
    user = "user"


class MeetingStatus(str, Enum):
    scheduled = "scheduled"
    ongoing = "ongoing"
    ended = "ended"


class VoteStatus(str, Enum):
    voting = "voting"
    ended = "ended"
