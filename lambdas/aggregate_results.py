def handler(event, context):
    """複数のイベントを受け取り、スキーマの処理結果を集計"""

    if not isinstance(event, list):
        raise ValueError("Invalid input format: expected a list")

    aggregated_count = 0

    for item in event:
        if isinstance(item, dict):
            schemas = item.get("schema", [])
            if isinstance(schemas, str):
                aggregated_count += 1

    return {
        "aggregated_result": aggregated_count
    }


if __name__ == "__main__":
    event = [
      {
        "schema": "schema1",
        "result": "Processed schema1"
      },
      {
        "schema": "schema2",
        "result": "Processed schema2"
      },
      {
        "schema": "schema3",
        "result": "Processed schema3"
      }
    ]
    print(handler(event, None))  # => {"aggregated_result": 3}
