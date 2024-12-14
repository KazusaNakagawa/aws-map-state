def handler(event, context):
    """1つのイベントを受け取り、スキーマを処理"""
    print(f"Received event: {event}")

    if not isinstance(event, dict):
        raise ValueError("Invalid input format: event must be dict")

    schema = event.get("schema")

    if not schema:
        raise ValueError("Invalid input: 'schema' field is required")

    import time
    if schema == "schema1":
        time.sleep(10)

    event["result"] = f"Processed {schema}"
    event["schema"] = schema

    print(f"Processed event: {event}")
    return event


if __name__ == "__main__":
    event = {
        "dt_date": "2021-01-01",
        "schema": "schema1",
    }
    print(handler(event, None))
