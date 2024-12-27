import pytest

import aggr_results as ar


class TestAggrResults:

    @pytest.mark.parametrize('event_fixture', ['event_aggr_results.json'], indirect=True)
    def test_handler(self, event_fixture):
        event = event_fixture
        result = ar.handler(event, None)
        assert result['aggregated_result'] == 9
