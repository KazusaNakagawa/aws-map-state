import pytest

import process_tables as pt


class TestProcessTables:

    @pytest.mark.parametrize('event_fixture', ['event_process_tables.json'], indirect=True)
    def test_handler(self, event_fixture):
        event = event_fixture
        assert pt.handler(event, None) == {
            'dt_date': event['dt_date'],
            'schema': event['schema'],
            'status': 'Tables processed',
            'chunk_num': event['chunk_num']
        }
