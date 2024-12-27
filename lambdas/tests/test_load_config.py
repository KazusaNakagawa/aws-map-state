import pytest

import load_config


class TestLoadConfig:

    @pytest.mark.parametrize('event_fixture', ['event_load_config.json'], indirect=True)
    def test_handler(self, event_fixture):
        event = event_fixture
        assert load_config.handler(event, None) == {
            'dt_date': event['dt_date'],
            'schemas': event['schemas'],
        }
