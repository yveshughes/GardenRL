"""Test environment simulation logic."""

from GardenRL.server.GardenRL_environment import GardenrlEnvironment
from GardenRL.models import GardenrlAction, GardenrlObservation


def test_environment_reset():
    """Test environment initialization."""
    env = GardenrlEnvironment(seed=42)
    obs = env.reset()

    assert isinstance(obs, GardenrlObservation)
    assert obs.day == 0
    assert obs.growth_stage == "seedling"
    assert obs.done is False
    assert obs.ph == 6.0
    assert obs.ec == 1.6


def test_environment_step():
    """Test basic step functionality."""
    env = GardenrlEnvironment(seed=42)
    env.reset()

    action = GardenrlAction(
        action_type="maintain",
        reasoning="Testing step"
    )

    obs = env.step(action)
    assert obs.day == 1
    assert isinstance(obs.ph, float)
    assert isinstance(obs.ec, float)
    assert obs.done is False


def test_ph_adjustment_up():
    """Test pH adjustment up action."""
    env = GardenrlEnvironment(seed=42)
    env.reset()

    # Get initial pH
    initial_ph = env._ph

    action = GardenrlAction(
        action_type="adjust_ph_up",
        ph_adjustment=0.5
    )

    env._apply_action(action)
    # pH should increase (before drift)
    assert env._ph > initial_ph


def test_ph_adjustment_down():
    """Test pH adjustment down action."""
    env = GardenrlEnvironment(seed=42)
    env.reset()

    # Set pH high
    env._ph = 7.0

    action = GardenrlAction(
        action_type="adjust_ph_down",
        ph_adjustment=0.5
    )

    env._apply_action(action)
    # pH should decrease
    assert env._ph < 7.0


def test_harvest_action():
    """Test harvest action."""
    env = GardenrlEnvironment(seed=42)
    env.reset()

    # Fast-forward to day 25+
    env._day = 27
    env._biomass = 200.0  # Healthy plant
    env._alive = True

    action = GardenrlAction(
        action_type="harvest",
        reasoning="Ready to harvest"
    )

    obs = env.step(action)
    assert obs.done is True
    assert obs.reward > 0  # Should get harvest reward
    # Biomass continues growing during the harvest step, so reward will be slightly higher
    assert obs.reward >= 2000.0  # At least 200g × 10


def test_death_condition_extreme_ph():
    """Test plant death from extreme pH."""
    env = GardenrlEnvironment(seed=42)
    env.reset()

    # Force lethal pH
    env._ph = 2.0
    env._check_death()

    assert env._alive is False


def test_death_condition_high_ec():
    """Test plant death from extreme EC."""
    env = GardenrlEnvironment(seed=42)
    env.reset()

    # Force lethal EC
    env._ec = 5.0
    env._check_death()

    assert env._alive is False


def test_growth_over_multiple_days():
    """Test that biomass increases over time with good conditions."""
    env = GardenrlEnvironment(seed=42)
    env.reset()

    initial_biomass = env._biomass

    # Run 10 days with good management
    for _ in range(10):
        # Keep conditions optimal
        env._ph = 6.0
        env._ec = 1.6
        env._water_temp = 20.0

        action = GardenrlAction(action_type="maintain")
        env.step(action)

    # Plant should have grown
    assert env._biomass > initial_biomass


def test_episode_ends_at_day_30():
    """Test that episode ends at day 30."""
    env = GardenrlEnvironment(seed=42)
    env.reset()

    obs = None
    for day in range(30):
        action = GardenrlAction(action_type="maintain")
        obs = env.step(action)

        if day < 29:
            assert obs.done is False

    # Day 30 should end episode
    assert obs.done is True


def test_warnings_generated():
    """Test that warnings are generated for bad conditions."""
    env = GardenrlEnvironment(seed=42)
    env.reset()

    # Set bad pH
    env._ph = 7.5

    obs = env._generate_observation()

    # Should have pH warning
    assert len(obs.warnings) > 0
    assert any("pH" in warning for warning in obs.warnings)


def test_leaf_color_changes():
    """Test that leaf color reflects plant health."""
    env = GardenrlEnvironment(seed=42)
    env.reset()

    # Healthy conditions
    env._ec = 1.6
    env._nutrient_lockout = 0
    env._stress_level = 0
    assert env._get_leaf_color() == "healthy_green"

    # Low EC (nitrogen deficiency)
    env._ec = 0.5
    assert env._get_leaf_color() == "light_green"

    # High EC (nutrient burn)
    env._ec = 3.0
    assert env._get_leaf_color() == "brown_tips"

    # Nutrient lockout
    env._ec = 1.6  # Reset EC
    env._nutrient_lockout = 60
    assert env._get_leaf_color() == "purple_veins"
