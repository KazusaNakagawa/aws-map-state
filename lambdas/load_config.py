from typing import Dict


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


if __name__ == "__main__":
    event = {
        "category": "type1",
        "dt_date": "2021-01-01",
        "schemas": [
            "schema1",
            "schema2",
            "schema3"
        ]
    }
    # event = {
    #     'category': 'type2',
    #     'dt_date': '2024-01-01',
    #     'schemas': [
    #         'schema4',
    #         'schema5',
    #     ]
    # }
    print(handler(event, None))
