import json
import pytest

import process_schema as ps
from tests.conftest import FIXTURES_DIR


class TestProcessSchema:

    @pytest.fixture
    def event_fixture(self):
        with open(f"{FIXTURES_DIR}/event_process_schema.json") as f:
            return json.load(f)

    def test_handler(self, event_fixture):
        event = event_fixture
        chunked_tables = [event['tables'][i:i + ps.CHUNK_SIZE] for i in range(0, len(event['tables']), ps.CHUNK_SIZE)]
        assert ps.handler(event, None) == {
            "dt_date": event['dt_date'],
            "schema": event['schema'],
            "tables": chunked_tables,
            "chunk_nums": list(range(len(chunked_tables)))
        }
