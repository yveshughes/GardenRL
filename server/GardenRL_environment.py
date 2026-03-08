# Copyright (c) Meta Platforms, Inc. and affiliates.
# All rights reserved.
#
# This source code is licensed under the BSD-style license found in the
# LICENSE file in the root directory of this source tree.

"""
GardenRL Environment Implementation.

A realistic hydroponic lettuce farming simulator for long-horizon RL research.
Simulates 30-day growth cycles with pH, EC, temperature dynamics and delayed rewards.
"""

import math
import random
from typing import List
from uuid import uuid4

from openenv.core.env_server.interfaces import Environment
from openenv.core.env_server.types import State

from ..models import GardenrlAction, GardenrlObservation


class GardenrlEnvironment(Environment):
    """
    Hydroponic lettuce farming environment.

    Simulates a 30-day Batavia lettuce growth cycle in an NFT (Nutrient Film Technique)
    hydroponic system. Agents must manage pH, EC (electrical conductivity), and water
    temperature to maximize harvest weight while dealing with:
    - Natural parameter drift (pH rises, EC depletes)
    - Nutrient lockout from pH mismanagement
    - Cumulative stress effects
    - Delayed consequences (pH mistake on day 5 affects harvest on day 30)

    Observation space: pH, EC, temp, leaf color, leaf count, height, growth stage, warnings
    Action space: Adjust pH up/down, add/dilute nutrients, heat/cool water, maintain, harvest
    Reward: Shaped 0-1 reward combining terminal harvest and dense condition signals

    Example:
        >>> env = GardenrlEnvironment()
        >>> obs = env.reset()
        >>> print(f"Day {obs.day}: pH={obs.ph}, EC={obs.ec}")
        >>>
        >>> # Adjust pH if too high
        >>> if obs.ph > 6.5:
        >>>     action = GardenrlAction(action_type="adjust_ph_down", ph_adjustment=0.3)
        >>>     obs = env.step(action)
    """

    # Enable concurrent WebSocket sessions
    SUPPORTS_CONCURRENT_SESSIONS: bool = True

    def __init__(self, seed: int = None):
        """
        Initialize the hydroponic environment.

        Args:
            seed: Random seed for reproducible episodes (optional)
        """
        self._state = State(episode_id=str(uuid4()), step_count=0)
        self._seed = seed
        if seed is not None:
            random.seed(seed)

        # Observable state (visible to agent)
        self._day = 0
        self._ph = 6.0  # Optimal starting point
        self._ec = 1.6  # Optimal EC for lettuce
        self._water_temp = 20.0  # Optimal temperature

        # Hidden state (drives simulation, not directly observable)
        self._biomass = 0.1  # Start as tiny seedling (grams)
        self._root_health = 100.0  # Percentage (0-100)
        self._stress_level = 0.0  # Cumulative stress (0-100+)
        self._nutrient_lockout = 0.0  # Nutrient uptake blockage (0-100)

        # Episode tracking
        self._alive = True
        self._harvested = False

        # Derived metrics (calculated from hidden state)
        self._leaf_count = 2  # Seedlings start with 2 cotyledons
        self._height_cm = 2.0  # Seedling height

        # Reward shaping accumulators
        self._cumulative_condition = 0.0
        self._steps_taken = 0

    def reset(self) -> GardenrlObservation:
        """
        Reset environment to day 0 with a fresh seedling.

        Returns:
            Initial observation for new episode
        """
        self._state = State(episode_id=str(uuid4()), step_count=0)

        # Reset observable state to optimal starting conditions
        self._day = 0
        self._ph = 6.0
        self._ec = 1.6
        self._water_temp = 20.0

        # Reset hidden state
        self._biomass = 0.1
        self._root_health = 100.0
        self._stress_level = 0.0
        self._nutrient_lockout = 0.0

        # Reset episode status
        self._alive = True
        self._harvested = False

        # Reset derived metrics
        self._leaf_count = 2
        self._height_cm = 2.0

        # Reset reward shaping accumulators
        self._cumulative_condition = 0.0
        self._steps_taken = 0

        return self._generate_observation()

    def step(self, action: GardenrlAction) -> GardenrlObservation:  # type: ignore[override]
        """
        Execute one day in the hydroponic garden.

        Simulation order:
        1. Apply agent's action (pH adjustment, nutrient changes, etc.)
        2. Simulate natural drift (pH rises, EC depletes)
        3. Calculate growth rate based on current conditions
        4. Update plant state (biomass, leaves, height)
        5. Check death conditions (extreme pH, EC, stress)
        6. Generate observation with reward

        Args:
            action: GardenrlAction specifying what to do today

        Returns:
            GardenrlObservation with updated plant state and reward
        """
        self._state.step_count += 1
        self._day += 1

        # Only process actions if plant is alive
        if self._alive:
            self._apply_action(action)
            self._simulate_drift()
            growth_rate = self._calculate_growth_rate()
            self._update_plant(growth_rate)
            self._check_death()

        # Accumulate dense condition signal for reward shaping
        self._steps_taken += 1
        ph_score = max(0.0, 1.0 - abs(self._ph - 6.0) / 2.0)
        ec_score = max(0.0, 1.0 - abs(self._ec - 1.6) / 1.6)
        temp_score = max(0.0, 1.0 - abs(self._water_temp - 20.0) / 8.0)
        self._cumulative_condition += 0.45 * ph_score + 0.45 * ec_score + 0.10 * temp_score

        return self._generate_observation()

    def _apply_action(self, action: GardenrlAction):
        """
        Apply agent's action to water chemistry or plant.

        Args:
            action: Agent's chosen action
        """
        action_type = action.action_type

        if action_type == "adjust_ph_up":
            adjustment = action.ph_adjustment if action.ph_adjustment else 0.3
            self._ph += abs(adjustment)

        elif action_type == "adjust_ph_down":
            adjustment = action.ph_adjustment if action.ph_adjustment else 0.3
            self._ph -= abs(adjustment)

        elif action_type == "add_nutrients":
            adjustment = action.nutrient_adjustment if action.nutrient_adjustment else 0.4
            self._ec += abs(adjustment)

        elif action_type == "dilute_nutrients":
            adjustment = action.nutrient_adjustment if action.nutrient_adjustment else 0.3
            self._ec -= abs(adjustment)

        elif action_type == "heat_water":
            target = action.temperature_target if action.temperature_target else 22.0
            # Gradual change toward target
            self._water_temp = (self._water_temp + target) / 2

        elif action_type == "cool_water":
            target = action.temperature_target if action.temperature_target else 18.0
            self._water_temp = (self._water_temp + target) / 2

        elif action_type == "harvest":
            # Can only harvest after day 25
            if self._day >= 25:
                self._harvested = True

        # "maintain" does nothing (let nature take its course)

        # Clamp parameters to physical limits
        self._ph = max(0.0, min(14.0, self._ph))
        self._ec = max(0.0, self._ec)
        self._water_temp = max(10.0, min(35.0, self._water_temp))

    def _simulate_drift(self):
        """
        Simulate natural parameter changes over 24 hours.

        Realistic hydroponic behavior:
        - pH tends to rise (bacterial activity, CO2 outgassing)
        - EC depletes (plant consumes nutrients)
        - Temperature has minor fluctuation (ambient changes)
        """
        # pH drift (tends upward, realistic for NFT systems)
        self._ph += random.uniform(-0.1, 0.2)

        # EC depletion (plant consumption)
        consumption = random.uniform(0.05, 0.15)
        # Larger plants consume more
        consumption *= (1.0 + self._biomass / 250.0)
        self._ec -= consumption

        # Temperature fluctuation
        self._water_temp += random.uniform(-0.5, 0.5)

        # Clamp to physical limits
        self._ph = max(0.0, min(14.0, self._ph))
        self._ec = max(0.0, self._ec)
        self._water_temp = max(10.0, min(35.0, self._water_temp))

    def _calculate_growth_rate(self) -> float:
        """
        Calculate daily biomass growth based on environmental conditions.

        Optimal conditions yield ~8g/day (250g in 30 days).
        Suboptimal conditions apply multiplicative penalties.

        Returns:
            Growth rate in grams/day
        """
        base_rate = 8.0  # Grams per day at optimal conditions

        rate = base_rate

        # pH stress (nutrient lockout)
        if not (5.5 <= self._ph <= 6.5):
            rate *= 0.5  # Major growth penalty
            # Accumulate nutrient lockout
            if self._ph < 5.5:
                self._nutrient_lockout = min(100.0, self._nutrient_lockout + 5.0)
            elif self._ph > 6.5:
                self._nutrient_lockout = min(100.0, self._nutrient_lockout + 3.0)
        else:
            # Good pH allows recovery
            self._nutrient_lockout = max(0.0, self._nutrient_lockout - 2.0)

        # Nutrient lockout reduces uptake
        if self._nutrient_lockout > 0:
            lockout_penalty = 1.0 - (self._nutrient_lockout / 200.0)  # Max 50% penalty
            rate *= lockout_penalty

        # EC stress (nutrient availability)
        if self._ec < 1.0:
            # Nutrient deficiency
            rate *= 0.6
        elif self._ec > 2.5:
            # Nutrient burn
            rate *= 0.4
            self._stress_level += 2.0
        elif self._ec > 2.0:
            # Slightly high
            rate *= 0.8

        # Temperature stress
        if self._water_temp < 15:
            rate *= 0.4  # Cold stress
            self._stress_level += 1.5
        elif self._water_temp < 18:
            rate *= 0.7
        elif self._water_temp > 24:
            rate *= 0.6  # Heat stress
            self._stress_level += 1.5
        elif self._water_temp > 22:
            rate *= 0.9

        # Root health affects nutrient uptake
        rate *= (self._root_health / 100.0)

        # Slow growth if stressed
        if self._stress_level > 50:
            stress_penalty = max(0.3, 1.0 - (self._stress_level / 200.0))
            rate *= stress_penalty

        # Very young plants grow slower (establishment phase)
        if self._day < 5:
            rate *= 0.5

        return max(0.0, rate)

    def _update_plant(self, growth_rate: float):
        """
        Update plant biomass and derived metrics.

        Args:
            growth_rate: Grams of biomass to add today
        """
        self._biomass += growth_rate

        # Estimate leaf count from biomass
        # Batavia lettuce: approximately 1 leaf per 7-8 grams biomass
        self._leaf_count = 2 + int(self._biomass / 7.0)

        # Height grows logarithmically
        # Seedling starts at ~2cm, mature plant reaches 15-20cm
        self._height_cm = 2.0 + (18.0 * math.log(1 + self._biomass / 50.0))

        # Root health degrades if stressed
        if self._stress_level > 40:
            self._root_health = max(0.0, self._root_health - 0.5)

    def _check_death(self):
        """
        Check for lethal conditions that kill the plant.
        """
        # Extreme pH is lethal
        if self._ph < 4.0 or self._ph > 8.0:
            self._alive = False

        # Severe nutrient burn is lethal
        if self._ec > 4.0:
            self._alive = False

        # Extreme cold is lethal
        if self._water_temp < 10:
            self._alive = False

        # Cumulative stress can be lethal
        if self._stress_level > 100.0:
            self._alive = False

        # Root death is lethal
        if self._root_health <= 0:
            self._alive = False

    def _generate_observation(self) -> GardenrlObservation:
        """
        Create observation from current state.

        Returns:
            GardenrlObservation with all visible metrics and reward
        """
        # Determine leaf color from conditions
        leaf_color = self._get_leaf_color()

        # Generate warnings based on state
        warnings = self._get_warnings()

        # Calculate shaped reward (0-1 scale)
        reward = 0.0
        done = False

        # Episode ends on: harvest, death, or day 30
        if self._harvested or not self._alive or self._day >= 30:
            done = True

            # Terminal harvest reward (0-1)
            harvest_weight = self._biomass if (self._harvested and self._alive) else 0.0
            terminal_reward = harvest_weight / 250.0  # 250g = perfect harvest

            # Dense condition signal: average condition quality + survival ratio
            avg_condition = self._cumulative_condition / max(self._steps_taken, 1)
            survival_ratio = min(self._day, 30) / 30.0
            dense_reward = 0.5 * avg_condition + 0.5 * survival_ratio

            if harvest_weight > 0:
                # Harvest succeeded: terminal reward dominant
                reward = 0.7 * terminal_reward + 0.3 * dense_reward
            else:
                # No harvest: small dense signal so policy can still learn
                reward = 0.15 * dense_reward

        # Determine growth stage
        growth_stage = self._get_growth_stage()

        return GardenrlObservation(
            day=self._day,
            ph=round(self._ph, 2),
            ec=round(self._ec, 2),
            water_temp=round(self._water_temp, 1),
            leaf_color=leaf_color,
            estimated_leaf_count=self._leaf_count,
            plant_height_cm=round(self._height_cm, 1),
            growth_stage=growth_stage,
            warnings=warnings,
            reward=reward,
            done=done,
            metadata={
                "biomass_hidden": round(self._biomass, 1),
                "stress_level_hidden": round(self._stress_level, 1),
                "nutrient_lockout_hidden": round(self._nutrient_lockout, 1),
                "root_health_hidden": round(self._root_health, 1),
            }
        )

    def _get_leaf_color(self) -> str:
        """
        Determine visual leaf color from hidden state.

        Returns:
            Leaf color string
        """
        if not self._alive:
            return "brown_tips"

        # Nutrient lockout (pH issue) causes purple veins
        if self._nutrient_lockout > 50:
            return "purple_veins"

        # Nitrogen deficiency (low EC) causes light green
        if self._ec < 1.0:
            return "light_green"

        # High stress causes yellowing
        if self._stress_level > 50:
            return "yellowing"

        # Nutrient burn (high EC) causes brown tips
        if self._ec > 2.5:
            return "brown_tips"

        # Otherwise healthy green
        return "healthy_green"

    def _get_warnings(self) -> List[str]:
        """
        Generate warning messages for agent reasoning.

        Returns:
            List of warning strings
        """
        warnings = []

        # pH warnings
        if self._ph < 5.0:
            warnings.append("pH critically low - severe nutrient lockout risk")
        elif self._ph < 5.5:
            warnings.append("pH drift detected - too acidic")
        elif self._ph > 7.0:
            warnings.append("pH critically high - calcium/iron lockout")
        elif self._ph > 6.5:
            warnings.append("pH drift detected - too alkaline")

        # Nutrient lockout warning
        if self._nutrient_lockout > 30:
            warnings.append("nutrient lockout risk - check pH")

        # EC warnings
        if self._ec < 0.8:
            warnings.append("EC critically low - severe nutrient deficiency")
        elif self._ec < 1.0:
            warnings.append("EC low - nutrient deficiency risk")
        elif self._ec > 3.0:
            warnings.append("EC critically high - severe nutrient burn")
        elif self._ec > 2.5:
            warnings.append("EC high - nutrient burn risk")

        # Temperature warnings
        if self._water_temp < 15:
            warnings.append("temperature critically low - growth stunted")
        elif self._water_temp < 18:
            warnings.append("temperature low - suboptimal growth")
        elif self._water_temp > 24:
            warnings.append("temperature high - root stress")

        # Stress warning
        if self._stress_level > 70:
            warnings.append("plant critically stressed - death risk")
        elif self._stress_level > 40:
            warnings.append("plant stress detected")

        # Root health warning
        if self._root_health < 50:
            warnings.append("root health declining")

        return warnings

    def _get_growth_stage(self) -> str:
        """
        Determine growth stage from day and health.

        Returns:
            Growth stage string
        """
        if not self._alive:
            return "dead"

        if self._day < 7:
            return "seedling"

        if self._day < 20:
            return "vegetative"

        # Mature stage only if reasonably healthy
        if self._stress_level < 50:
            return "mature"

        return "declining"

    @property
    def state(self) -> State:
        """
        Get the current environment state.

        Returns:
            Current State with episode_id and step_count
        """
        return self._state
