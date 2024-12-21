from typing import Dict
import snowflake.connector


def handler(event: Dict, context):
    """1つのイベントを受け取り、設定をロード"""
    category = event.get('category')
    if not category:
        raise ValueError("Invalid input: 'category' field is required")
    if category in ['type1', 'type2']:
        return {
            'dt_date': event.get('dt_date'),
            'schemas': event.get('schemas'),
        }
    else:
        raise ValueError(f"Invalid category: {category}")
