import boto3
from typing import Dict
from botocore.exceptions import ClientError

import snowflake.connector

TIME_OUT = 30
TIME_ZONE = "UTC"


def get_secret(secret_name: str, region_name: str) -> str:
    """Get the secret from Secrets Manager"""
    session = boto3.session.Session()
    client = session.client(
        service_name='secretsmanager',
        region_name=region_name
    )
    try:
        get_secret_value_response = client.get_secret_value(
            SecretId=secret_name
        )
    except ClientError as e:
        # For a list of exceptions thrown, see
        # https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
        raise e

    secret = get_secret_value_response['SecretString']
    return secret

def db_connect(**config: Dict) -> snowflake.connector.connection:
    """DB接続を行う"""
    # TODO: 実装想定
    return snowflake.connector.connect(
        user=config.get("user"),
        password=config.get("password"),
        account=config.get("account"),
        warehouse=config.get("warehouse"),
        database=config.get("database"),
        schema=config.get("schema"),
        role=config.get("role"),
        login_timeout=TIME_OUT,
        network_timeout=TIME_OUT,
        timezone=TIME_ZONE,
        autocommit=True
    )

def handler(event: Dict, context):
    """event は map state で受け取った値
    tables(list) で処理させる想定

    Parameters:
    {
        "dt_date": "2021-01-01",
        "schema": "schemaA",
        "target_tables": [
            "tableA",
            "tableB",
            "tableC"
        ],
        "chunk_num": 0
    }
    """
    schema = event.get("schema")
    tables = event.get("target_tables")
    chunk_num = event.get("chunk_num")

    if not schema or not isinstance(schema, str):
        raise ValueError("Invalid input: 'schema' field is required")
    if not tables or not isinstance(tables, list):
        raise ValueError("Invalid input: 'tables' field is required")
    
    for table in tables:
        print(f"Processing {schema}.{table}")
        query = f"SELECT * FROM {schema}.{table}"

        # TODO: DB接続してクエリを実行

        print(f"Executing query: {query}")

    return {
         "dt_date": event.get("dt_date"),
         "schema": schema,
         "status": "Tables processed",
         "chunk_num": chunk_num
    }
