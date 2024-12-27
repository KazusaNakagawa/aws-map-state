import os
import json
import pytest


FIXTURES_DIR = os.path.join(os.path.dirname(__file__), 'fixtures')

@pytest.fixture
def event_fixture(request: pytest.FixtureRequest):
    file_name = request.param
    with open(f"{FIXTURES_DIR}/{file_name}") as f:
        return json.load(f)
