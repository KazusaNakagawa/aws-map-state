# import requests

def handler(event, context):
    """集計結果をSlackに通知"""

    aggregated_result = event.get("aggregated_result")
    webhook_url = "https://hooks.slack.com/services/your/webhook/url"
    message = f"Aggregated Result: {aggregated_result}"
    print(message)
    
    # response = requests.post(webhook_url, json={"text": message})
    # response.raise_for_status()
    return {"status": "Notification sent"}
