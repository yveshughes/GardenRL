# Copyright (c) Meta Platforms, Inc. and affiliates.
# All rights reserved.
#
# This source code is licensed under the BSD-style license found in the
# LICENSE file in the root directory of this source tree.

"""
Data models for the GardenRL hydroponic farming environment.

GardenRL simulates a 30-day hydroponic lettuce growing cycle with realistic
water chemistry (pH, EC, temperature) and plant growth dynamics.
"""

from typing import Optional, List
from pydantic import Field

from openenv.core.env_server.types import Action, Observation


class GardenrlAction(Action):
    """Action for hydroponic garden management."""

    action_type: str = Field(
        ...,
        description="Action: adjust_ph_up, adjust_ph_down, add_nutrients, dilute_nutrients, heat_water, cool_water, maintain, harvest"
    )
    ph_adjustment: Optional[float] = Field(
        None,
        description="pH adjustment amount (0.1-0.5), positive for up, negative for down"
    )
    nutrient_adjustment: Optional[float] = Field(
        None,
        description="EC adjustment in mS/cm (0.1-0.5 for add, negative for dilute)"
    )
    temperature_target: Optional[float] = Field(
        None,
        description="Target water temperature in Celsius (18-24)"
    )
    reasoning: str = Field(
        default="",
        description="Agent's reasoning for this action (encouraged for Mercor sub-bounty)"
    )


class GardenrlObservation(Observation):
    """Observation from hydroponic environment."""

    # Time
    day: int = Field(..., description="Current day in 30-day cycle")

    # Water chemistry (sensor readings)
    ph: float = Field(..., description="pH level (0-14, optimal 5.5-6.5)")
    ec: float = Field(..., description="Electrical conductivity in mS/cm (optimal 1.2-2.0)")
    water_temp: float = Field(..., description="Water temperature in Celsius (optimal 18-22)")

    # Plant metrics (visual observations)
    leaf_color: str = Field(
        ...,
        description="Leaf color: healthy_green, light_green, yellowing, brown_tips, purple_veins"
    )
    estimated_leaf_count: int = Field(..., description="Number of visible leaves")
    plant_height_cm: float = Field(..., description="Plant height in centimeters")

    # Growth tracking
    growth_stage: str = Field(
        ...,
        description="Growth stage: seedling, vegetative, mature, declining, dead"
    )

    # Agent reasoning signals
    warnings: List[str] = Field(
        default_factory=list,
        description="Warning messages: pH drift detected, nutrient lockout risk, etc."
    )
