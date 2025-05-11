import re

from pydantic import BaseModel


def to_camel(string: str) -> str:
    # 将下划线后的字母转大写并移除下划线
    s = re.sub(r"(_)([a-zA-Z])", lambda x: x.group(2).upper(), string)
    # 确保首字母是小写（如果原词首字母不是_开头的话）
    return s[0].lower() + s[1:] if s else ""


class CamelModel(BaseModel):
    """将蛇形命名转换为驼峰命名的基础模型"""

    class Config:
        alias_generator = to_camel
        populate_by_name = True
