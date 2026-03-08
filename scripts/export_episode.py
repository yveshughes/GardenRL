"""
Export a specific episode from training logs to JSON for landing page replay.

This script extracts a single episode (typically the best performing one)
and formats it for use in the RobotDemo replay mode.

Usage:
    python scripts/export_episode.py training_logs/episodes_*.json --episode 847 --output landing-page/public/data/episode-847.json
"""

import argparse
import json
from pathlib import Path


def find_best_episode(training_data):
    """Find the episode with highest reward."""
    episodes = training_data["episodes"]
    best_episode = max(episodes, key=lambda e: e["reward"])
    return best_episode


def export_episode(episode_data, output_path: Path):
    """Export episode in format expected by frontend."""
    export_data = {
        "episode_id": episode_data["episode"],
        "strategy": episode_data.get("strategy", "unknown"),
        "total_reward": episode_data["reward"],
        "harvest_weight": episode_data["harvest_weight"],
        "days_survived": episode_data["days_survived"],
        "final_ph": episode_data["final_ph"],
        "final_ec": episode_data["final_ec"],
        "final_growth_stage": episode_data["final_growth_stage"],
        "steps": episode_data["steps"]
    }

    output_path.parent.mkdir(parents=True, exist_ok=True)

    with open(output_path, 'w') as f:
        json.dump(export_data, f, indent=2)

    print(f"✅ Exported episode #{export_data['episode_id']} to: {output_path}")
    print(f"   Reward: {export_data['total_reward']:.0f}")
    print(f"   Harvest: {export_data['harvest_weight']:.1f}g")
    print(f"   Days: {export_data['days_survived']}")
    print(f"   Steps: {len(export_data['steps'])}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Export episode for frontend replay")
    parser.add_argument("input", type=str,
                        help="Path to training logs JSON file")
    parser.add_argument("--episode", type=int, default=None,
                        help="Specific episode number to export (default: best episode)")
    parser.add_argument("--output", type=str, default="landing-page/public/data/episode-replay.json",
                        help="Output path for exported episode")

    args = parser.parse_args()

    input_path = Path(args.input)
    output_path = Path(args.output)

    if not input_path.exists():
        print(f"❌ Error: Input file not found: {input_path}")
        exit(1)

    with open(input_path, 'r') as f:
        training_data = json.load(f)

    if args.episode is not None:
        # Find specific episode
        episode_data = next(
            (e for e in training_data["episodes"] if e["episode"] == args.episode),
            None
        )
        if episode_data is None:
            print(f"❌ Error: Episode {args.episode} not found in training data")
            exit(1)
    else:
        # Find best episode
        episode_data = find_best_episode(training_data)
        print(f"📊 Found best episode: #{episode_data['episode']} with reward {episode_data['reward']:.0f}")

    export_episode(episode_data, output_path)
