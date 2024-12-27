from typing import Any, Dict, List


def handler(event: List, context: Any) -> Dict:
    """複数のイベントを受け取り、スキーマの処理結果を集計"""

    if not isinstance(event, list):
        raise ValueError("Invalid input format: expected a list")

    aggregated_count: int = 0

    for sublist in event:
        for item in sublist:
            if item.get('status') == 'Tables processed':
                aggregated_count += 1

    return {
        "aggregated_result": aggregated_count,
    }
