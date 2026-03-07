# Sub-Bounty Analysis for GardenRL

| Sponsor | Prize | Problem Statement | Sub-Bounty Description | Fit for GardenRL | Analysis |
|---------|-------|-------------------|------------------------|------------------|----------|
| **Fleet AI** | $10k | Multi-Agent (1) | "Scalable Oversight: Environments that train **oversight agents** to monitor, analyze, and explain the behavior of other AI agents operating in complex, multi-agent settings." | Weak | Would need a **supervisor agent** overseeing garden-bot agents. Could work if we have multiple garden zones with one oversight agent, but that's scope creep. |
| **Halluminate** | $10k | Multi-Agent (1) | "Multi-Actor Environments: Build a realistic environment where an agent **interacts with and manages multiple actors** (agents) to discover and achieve the task" | Moderate | Could frame as managing multiple garden zones or crops simultaneously, but pushes toward multi-agent complexity. |
| **Mercor** | $10k | Long-Horizon (2) | "Make an environment with capped/uncapped rewards where **frontier model rewards scale with token output**." | **Strong** | Perfect fit - encourage detailed reasoning about nutrient interactions, diagnosis of deficiencies. More thoughtful analysis = better garden outcomes. |
| **Scale AI** | $10k | Long-Horizon (2) | "Environments for long horizon workflows for **non-code use cases** within a **business setting**: focusing on either **Sales, Project management, or HR & IT**." | Weak | They explicitly want Sales/PM/HR&IT. Commercial farm management is a stretch unless you pivot to "farm operations management." |
| **Scaler AI Labs** | $10k | World Modeling - Professional (3.1) | "Multi-App RL Environment for **Enterprise Workflows**: Create RL environments to demonstrate **complex workflows, business rule nuances** etc in a **large enterprise**" | Moderate | Could position as agri-business enterprise (inventory, compliance, crop planning), but would need to add business workflow complexity beyond just growing. |
| **Patronus AI** | $10k | World Modeling - Personalized (3.2) | "Consumer Workflows with **Schema Drift**: Multi-step consumer workflow environments where the underlying **data schemas, API contracts, and t&cs/policies/rules change**." | Weak | They want changing APIs/schemas. Could stretch to sensor API changes or supplier catalog changes, but feels forced. |
| **Snorkel AI** | $10k | Self-Improvement (4) | "Simulated Experts-in-the-Loop: Environment that simulates interactions with **real subject-matter experts**, with **changing requirements / preferences**." | **Very Strong** | Excellent fit - simulate expert gardeners giving feedback, seasonal preference changes, new cultivar requirements. Self-improvement through expert guidance. |

## Recommended Strategy

**Primary Problem Statement:** Statement 2 (Long-Horizon Planning)

**Target Sub-Bounties (max 2):**
1. **Mercor** ($10k) - Design reward function where detailed plant diagnosis and reasoning improves outcomes
2. **Snorkel AI** ($10k) - Add simulated expert gardener that provides feedback and evolving seasonal preferences

**Infrastructure to use:**
- Hugging Face (credits + required HF Spaces deployment)
- Unsloth AI (required for training script)
- Cursor (makes coding faster)

## Prize Potential
- Main track: $6k-$15k (3rd to 1st place)
- Sub-bounties: $10k-$20k (if we win 1-2 partner prizes)
- Total potential: $16k-$35k
