import json
import pytest

import aggr_results as ar
from tests.conftest import FIXTURES_DIR

class TestLoadConfig:

    @pytest.fixture
    def event_fixture(self):
        with open(f"{FIXTURES_DIR}/event_aggr_results.json") as f:
            return json.load(f)

    def test_handler(self, event_fixture):
        event = event_fixture
        result = ar.handler(event, None)
        assert result["aggregated_result"] == 9
