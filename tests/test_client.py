"""Test client imports and types (P0 regression test)."""

def test_imports():
    """P0 regression test - imports should work."""
    from GardenRL.client import GardenrlEnv
    from GardenRL.models import GardenrlAction, GardenrlObservation
    assert GardenrlEnv is not None
    assert GardenrlAction is not None
    assert GardenrlObservation is not None


def test_client_type_parameters():
    """Test that client has correct type parameters (P0 fix verification)."""
    from openenv.core.env_server.types import State
    from openenv.core import EnvClient
    from GardenRL.client import GardenrlEnv

    # Verify GardenrlEnv inherits from EnvClient
    assert issubclass(GardenrlEnv, EnvClient)
