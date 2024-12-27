import json
import pytest

import process_tables as pt
from tests.conftest import FIXTURES_DIR


class TestProcessTables:

    @pytest.fixture
    def event_fixture(self):
        with open(f"{FIXTURES_DIR}/event_process_tables.json") as f:
            return json.load(f)

    def test_handler(self, event_fixture):
        event = event_fixture
        assert pt.handler(event, None) == {
            "dt_date": event['dt_date'],
            "schema": event['schema'],
            "status": "Tables processed",
            "chunk_num": event['chunk_num']
        }
