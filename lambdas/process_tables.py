from typing import Dict


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
