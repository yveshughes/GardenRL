"""Test data models."""

from GardenRL.models import GardenrlAction, GardenrlObservation


def test_action_creation():
    """Test creating a valid action."""
    action = GardenrlAction(
        action_type="adjust_ph_down",
        ph_adjustment=0.3,
        reasoning="pH too high"
    )
    assert action.action_type == "adjust_ph_down"
    assert action.ph_adjustment == 0.3
    assert action.reasoning == "pH too high"


def test_action_defaults():
    """Test action with default values."""
    action = GardenrlAction(action_type="maintain")
    assert action.action_type == "maintain"
    assert action.ph_adjustment is None
    assert action.reasoning == ""


def test_observation_creation():
    """Test creating a valid observation."""
    obs = GardenrlObservation(
        day=5,
        ph=6.2,
        ec=1.5,
        water_temp=20.0,
        leaf_color="healthy_green",
        estimated_leaf_count=10,
        plant_height_cm=8.5,
        growth_stage="vegetative",
        warnings=[],
        reward=0.0,
        done=False,
    )
    assert obs.day == 5
    assert obs.ph == 6.2
    assert obs.growth_stage == "vegetative"
    assert obs.leaf_color == "healthy_green"


def test_observation_with_warnings():
    """Test observation with warnings."""
    obs = GardenrlObservation(
        day=10,
        ph=7.5,
        ec=0.8,
        water_temp=19.0,
        leaf_color="purple_veins",
        estimated_leaf_count=8,
        plant_height_cm=10.0,
        growth_stage="vegetative",
        warnings=["pH drift detected", "EC low"],
        reward=0.0,
        done=False,
    )
    assert len(obs.warnings) == 2
    assert "pH drift detected" in obs.warnings
