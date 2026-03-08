# GardenRL Benchmark Report

**Model**: meta-llama/Llama-3.1-8B-Instruct  
**Run**: gardenrl-llama-3.1-8b-instruct-20260308-081856  
**Seeds**: 20 fixed evaluation episodes (seeds 1000-1019)  
**Context turns**: 8  
**Episode days**: 30  
**Forced harvest**: Disabled  
**Date**: 2026-03-08T08:51:27.063139  

## Results by Checkpoint

| Step | Harvest (g) | Success | Reward | Agent Harvests | Agent Success | Forced | XML Parse | Recovered |
|------|-------------|---------|--------|----------------|---------------|--------|-----------|----------|
| 0 | 99.0 ± 93.2 | 50% | 0.482 ± 0.326 | 0.55 | 50% | 0.00 | 85% | 100% |
| 10 | 97.0 ± 90.6 | 55% | 0.477 ± 0.318 | 0.55 | 55% | 0.00 | 81% | 99% |
| 20 | 88.4 ± 92.2 | 45% | 0.446 ± 0.323 | 0.50 | 45% | 0.00 | 75% | 100% |
| 30 | 100.2 ± 85.6 | 50% | 0.491 ± 0.303 | 0.60 | 50% | 0.00 | 84% | 100% |
| 40 | 44.8 ± 79.8 | 25% | 0.293 ± 0.281 | 0.25 | 25% | 0.00 | 78% | 100% |
| 50 | 109.9 ± 93.2 | 60% | 0.522 ± 0.325 | 0.60 | 60% | 0.00 | 89% | 100% |

## Learning Assessment

**Step 0 → Step 50**:

- Harvest weight: 99.0g → 109.9g (+10.9g)
- Success rate: 50% → 60% (+10%)
- Reward: 0.482 → 0.522 (+0.041)
- Agent harvests: 0.55 → 0.60 (+0.05)
- Agent success: 50% → 60% (+10%)

**Conclusion**: Clear improvement — the model learned a better policy.

## End-to-End Policy Check

Criterion for independent full policy: agent_success >= 80%, agent_harvest_actions >= 0.8, and forced_harvests == 0.

Best checkpoint: step 50 | agent_success=60%, agent_harvest_actions=0.60, forced_harvests=0.00

## Action Distribution

| Step | pH Down | pH Up | Nutrients | Maintain | Harvest |
|------|---------|-------|-----------|----------|--------|
| 0 | 7.3 | 2.5 | 11.2 | 3.5 | 0.6 |
| 10 | 7.2 | 2.6 | 11.8 | 3.1 | 0.6 |
| 20 | 7.5 | 2.8 | 11.6 | 3.8 | 0.5 |
| 30 | 7.8 | 3.2 | 10.9 | 3.7 | 0.6 |
| 40 | 8.7 | 3.5 | 11.2 | 2.9 | 0.2 |
| 50 | 6.9 | 2.0 | 12.0 | 3.1 | 0.6 |
