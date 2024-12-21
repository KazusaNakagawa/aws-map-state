# import requests

def handler(event, context):
    """集計結果をSlackに通知"""

    aggrd_result = event.get("aggrd_result")
    webhook_url = "https://hooks.slack.com/services/your/webhook/url"
    message = f"Aggrd Result: {aggrd_result}"
    print(message)
    
    # response = requests.post(webhook_url, json={"text": message})
    # response.raise_for_status()
    return {"status": "Notification sent"}
