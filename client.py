# Copyright (c) Meta Platforms, Inc. and affiliates.
# All rights reserved.
#
# This source code is licensed under the BSD-style license found in the
# LICENSE file in the root directory of this source tree.

"""Gardenrl Environment Client."""

from typing import Dict

from openenv.core.client_types import StepResult
from openenv.core.env_server.types import State
from openenv.core import EnvClient

from .models import GardenrlAction, GardenrlObservation


class GardenrlEnv(
    EnvClient[GardenrlAction, GardenrlObservation, State]
):
    """
    Client for the Gardenrl Environment.

    This client maintains a persistent WebSocket connection to the environment server,
    enabling efficient multi-step interactions with lower latency.
    Each client instance has its own dedicated environment session on the server.

    Example:
        >>> # Connect to a running server
        >>> with GardenrlEnv(base_url="http://localhost:8000") as client:
        ...     result = client.reset()
        ...     print(f"Day {result.observation.day}: pH={result.observation.ph}")
        ...
        ...     # Adjust pH if too high
        ...     if result.observation.ph > 6.5:
        ...         action = GardenrlAction(action_type="adjust_ph_down", ph_adjustment=0.3)
        ...         result = client.step(action)

    Example with Docker:
        >>> # Automatically start container and connect
        >>> client = GardenrlEnv.from_docker_image("GardenRL-env:latest")
        >>> try:
        ...     result = client.reset()
        ...     action = GardenrlAction(action_type="maintain")
        ...     result = client.step(action)
        ... finally:
        ...     client.close()
    """

    def _step_payload(self, action: GardenrlAction) -> Dict:
        """
        Convert GardenrlAction to JSON payload for step message.

        Args:
            action: GardenrlAction instance

        Returns:
            Dictionary representation suitable for JSON encoding
        """
        return {
            "action_type": action.action_type,
            "ph_adjustment": action.ph_adjustment,
            "nutrient_adjustment": action.nutrient_adjustment,
            "temperature_target": action.temperature_target,
            "reasoning": action.reasoning,
        }

    def _parse_result(self, payload: Dict) -> StepResult[GardenrlObservation]:
        """
        Parse server response into StepResult[GardenrlObservation].

        Args:
            payload: JSON response data from server

        Returns:
            StepResult with GardenrlObservation
        """
        obs_data = payload.get("observation", {})
        observation = GardenrlObservation(
            day=obs_data.get("day", 0),
            ph=obs_data.get("ph", 6.0),
            ec=obs_data.get("ec", 1.6),
            water_temp=obs_data.get("water_temp", 20.0),
            leaf_color=obs_data.get("leaf_color", "healthy_green"),
            estimated_leaf_count=obs_data.get("estimated_leaf_count", 0),
            plant_height_cm=obs_data.get("plant_height_cm", 0.0),
            growth_stage=obs_data.get("growth_stage", "seedling"),
            warnings=obs_data.get("warnings", []),
            reward=payload.get("reward", 0.0),
            done=payload.get("done", False),
            metadata=obs_data.get("metadata", {}),
        )

        return StepResult(
            observation=observation,
            reward=payload.get("reward", 0.0),
            done=payload.get("done", False),
        )

    def _parse_state(self, payload: Dict) -> State:
        """
        Parse server response into State object.

        Args:
            payload: JSON response from state request

        Returns:
            State object with episode_id and step_count
        """
        return State(
            episode_id=payload.get("episode_id"),
            step_count=payload.get("step_count", 0),
        )
