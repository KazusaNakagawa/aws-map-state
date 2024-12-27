import json
import pytest

import load_config
from tests.conftest import FIXTURES_DIR


class TestLoadConfig:

    @pytest.fixture
    def event_fixture(self):
        with open(f"{FIXTURES_DIR}/event_load_config.json") as f:
            return json.load(f)

    def test_handler(self, event_fixture):
        event = event_fixture
        assert load_config.handler(event, None) == {
            "dt_date": event['dt_date'],
            "schemas": event['schemas'],
        }
