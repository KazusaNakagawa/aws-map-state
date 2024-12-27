from typing import Dict


CHUNK_SIZE = 3

def handler(event: Dict, context):
    """event は map state で受け取った値
    tables を chunk に分けて返す defoult chunk size は 3

    Parameters:
    {
        "dt_date": "2021-01-01",
        "schema": "schemaA",
        "tables": [
            "tableA",
            "tableB",
            "tableC",
            "tableD",
            "tableE"
        ]
    }
    """ 
    schema = event.get("schema")
    tables = event.get("tables")
    chunk_size = event.get("chunk_size", CHUNK_SIZE)

    if not tables or not isinstance(tables, list):
        raise ValueError("Invalid input: 'tables' field is required")

    chunked_tables = [tables[i:i + chunk_size] for i in range(0, len(tables), chunk_size)]
    return {
         "dt_date": event.get("dt_date"),
         "schema": schema,
         "tables": chunked_tables,
         "chunk_nums": list(range(len(chunked_tables)))
    }
