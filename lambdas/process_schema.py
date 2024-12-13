def handler(event, context):
    """1つのイベントを受け取り、スキーマを処理"""

    if not isinstance(event, dict):
        raise ValueError("Invalid input format: event must be dict")

    schema = event.get("schema")
    if not schema:
        raise ValueError("Invalid input: 'schema' field is required")
    
    # 処理ロジック
    return {
        "schema": schema,
        "result": f"Processed {schema}"
    }
