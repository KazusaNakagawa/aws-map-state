from typing import Any, Dict, List


def handler(event: List, context: Any) -> Dict:
    """複数のイベントを受け取り、スキーマの処理結果を集計"""

    if not isinstance(event, list):
        raise ValueError("Invalid input format: expected a list")

    aggrd_count: int = 0

    for item in event:
        if isinstance(item, dict):
            schemas = item.get("schema", [])
            if isinstance(schemas, str):
                aggrd_count += 1

    return {
        "event": event,
        "aggrd_result": aggrd_count,
    }


if __name__ == "__main__":
    event = [
      {
        "dt_date": "2021-01-01", 
        "schema": "schema1",
        "result": "Processed schema1"
      },
      {
        "dt_date": "2021-01-01", 
        "schema": "schema2",
        "result": "Processed schema2"
      },
      {
        "dt_date": "2021-01-01", 
        "schema": "schema3",
        "result": "Processed schema3"
      }
    ]
    print(handler(event, None))  # => {"aggrd_result": 3}
