# ADR 001: Redis sorted set for dynamic order priority

- Status: Accepted
- Date: 2026-11-11

## Context
The project requires dynamic prioritization where customer waiting time and customer type affect queue ordering. The priority score changes over time, and multiple API processes may observe the same shared queue concurrently.

The earlier simple in-memory queue and Celery priority queue were not sufficient because:

- Celery priority values are coarse buckets instead of live float scores.
- A queue stored only in a single process would not be shared consistently across API workers.
- The priority score changes while the order remains in the queue, so re-ranking must occur without losing order state.

## Decision
Use Redis sorted sets (ZSET) as the canonical ordering index for pending orders. Redis keeps a shared, globally visible ordering structure while the actual order record remains in Postgres.

The queue stores:

- member: order id
- score: dynamic priority score

The score formula is computed as:

- base score: 15 for premium, 10 for standard
- wait time weight: 0.5 per second
- total score = base + waiting_seconds * 0.5

The worker selects the highest score from the sorted set, processes the order, and only then updates the database state.

## Consequences
- Pros:
  - highly efficient ordering and re-ranking
  - easy cross-process visibility
  - no queue-loss if the order record remains in Postgres
- Trade-offs:
  - Redis becomes part of the runtime dependency set
  - the queue must be treated as an index, not the source of truth

