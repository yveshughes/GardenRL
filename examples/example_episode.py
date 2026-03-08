"""
Example episodes demonstrating GardenRL hydroponic simulation.

This script runs two contrasting episodes:
1. Optimal management - Active pH/EC control leads to healthy 200g+ harvest
2. Neglect - No intervention leads to plant death or poor harvest

Run with: python examples/example_episode.py
"""

import sys
sys.path.insert(0, '/Users/yves/Developer/GardenRL')

from server.GardenRL_environment import GardenrlEnvironment
from models import GardenrlAction


def run_optimal_episode():
    """
    Run episode with good management practices.

    Expected outcome: 150-250g harvest (1500-2500 reward)
    """
    env = GardenrlEnvironment(seed=42)  # Reproducible
    obs = env.reset()

    print("=" * 70)
    print("OPTIMAL MANAGEMENT EPISODE")
    print("=" * 70)
    print(f"Day {obs.day}: pH={obs.ph:.2f}, EC={obs.ec:.2f}, Stage={obs.growth_stage}")
    print()

    for day in range(30):
        # Simple rule-based policy
        reasoning = ""

        if obs.ph > 6.5:
            action = GardenrlAction(
                action_type="adjust_ph_down",
                ph_adjustment=0.3,
                reasoning=f"pH {obs.ph:.2f} too high, risk of nutrient lockout"
            )
            reasoning = f"↓ Lowering pH (was {obs.ph:.2f})"

        elif obs.ph < 5.5:
            action = GardenrlAction(
                action_type="adjust_ph_up",
                ph_adjustment=0.3,
                reasoning=f"pH {obs.ph:.2f} too low, calcium uptake impaired"
            )
            reasoning = f"↑ Raising pH (was {obs.ph:.2f})"

        elif obs.ec < 1.2:
            action = GardenrlAction(
                action_type="add_nutrients",
                nutrient_adjustment=0.4,
                reasoning=f"EC {obs.ec:.2f} low, plants need more nutrients"
            )
            reasoning = f"+ Adding nutrients (EC was {obs.ec:.2f})"

        elif obs.ec > 2.0:
            action = GardenrlAction(
                action_type="dilute_nutrients",
                nutrient_adjustment=0.3,
                reasoning=f"EC {obs.ec:.2f} high, risk of nutrient burn"
            )
            reasoning = f"− Diluting nutrients (EC was {obs.ec:.2f})"

        elif day >= 27:
            action = GardenrlAction(
                action_type="harvest",
                reasoning="Day 27, optimal harvest time for Batavia lettuce"
            )
            reasoning = "✂️  Harvesting plant"

        else:
            action = GardenrlAction(
                action_type="maintain",
                reasoning="All parameters optimal, maintaining current conditions"
            )
            reasoning = "✓ Maintaining (all optimal)"

        obs = env.step(action)

        # Print status every few days
        if day % 3 == 0 or day >= 27 or obs.warnings:
            print(f"Day {obs.day:2d}: pH={obs.ph:4.1f} EC={obs.ec:4.2f} "
                  f"Temp={obs.water_temp:4.1f}°C │ "
                  f"Leaves={obs.estimated_leaf_count:2d} "
                  f"Height={obs.plant_height_cm:4.1f}cm │ "
                  f"{obs.leaf_color:15s} │ {reasoning}")

            if obs.warnings:
                for warning in obs.warnings:
                    print(f"        ⚠️  {warning}")

        if obs.done:
            print()
            print("=" * 70)
            print("🌱 EPISODE COMPLETE!")
            print("=" * 70)
            print(f"Final Reward: {obs.reward:.1f}")
            harvest_weight = obs.reward / 10.0
            print(f"Harvest Weight: {harvest_weight:.1f}g")
            print(f"Growth Stage: {obs.growth_stage}")
            print(f"Leaf Color: {obs.leaf_color}")
            print()
            if harvest_weight >= 150:
                print("✅ SUCCESS: Healthy harvest! (150g+ is commercial quality)")
            elif harvest_weight >= 100:
                print("⚠️  ACCEPTABLE: Viable harvest, but suboptimal")
            else:
                print("❌ POOR: Failed to produce healthy plant")
            print()
            break


def run_neglect_episode():
    """
    Run episode with no management (neglect).

    Expected outcome: Plant dies or yields <100g (0-1000 reward)
    """
    env = GardenrlEnvironment(seed=42)  # Same seed for comparison
    obs = env.reset()

    print("=" * 70)
    print("NEGLECT EPISODE (NO MANAGEMENT)")
    print("=" * 70)
    print(f"Day {obs.day}: pH={obs.ph:.2f}, EC={obs.ec:.2f}")
    print("Strategy: Do nothing, let nature take its course")
    print()

    for day in range(30):
        # Do nothing - just maintain
        action = GardenrlAction(
            action_type="maintain",
            reasoning="Ignoring all warnings (neglect scenario)"
        )

        obs = env.step(action)

        # Print status every 3 days
        if day % 3 == 0 or obs.warnings or obs.done:
            print(f"Day {obs.day:2d}: pH={obs.ph:4.1f} EC={obs.ec:4.2f} │ "
                  f"{obs.leaf_color:15s} │ Stage={obs.growth_stage}")

            if obs.warnings:
                for warning in obs.warnings:
                    print(f"        ⚠️  {warning}")

        if obs.done:
            print()
            print("=" * 70)
            if obs.growth_stage == "dead":
                print("💀 PLANT DIED")
            else:
                print("🌱 EPISODE ENDED")
            print("=" * 70)
            print(f"Final Reward: {obs.reward:.1f}")
            harvest_weight = obs.reward / 10.0
            print(f"Harvest Weight: {harvest_weight:.1f}g")
            print(f"Growth Stage: {obs.growth_stage}")
            print()
            if harvest_weight < 100:
                print("❌ FAILED: Poor management led to severe crop loss")
            print()
            break


if __name__ == "__main__":
    run_optimal_episode()
    print("\n")
    run_neglect_episode()

    print("\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)
    print("This demonstrates the long-horizon planning challenge:")
    print("- Optimal management → 150-250g harvest (1500-2500 reward)")
    print("- Neglect → Death or <100g harvest (0-1000 reward)")
    print()
    print("Key mechanics:")
    print("  • pH naturally drifts upward → requires active management")
    print("  • EC depletes over time → nutrient supplementation needed")
    print("  • Poor pH → nutrient lockout → stunted growth → poor harvest")
    print("  • Delayed consequences: mistakes on day 5 affect harvest on day 30")
    print("=" * 70)
