# ADR 002: Transactional stock and budget updates for order execution

- Status: Accepted
- Date: 2026-11-11

## Context
Order processing must be safe under concurrency. If two requests try to buy the same item at the same time, the system must avoid overselling and budget abuse.

The business rule is strict:

- stock can never go below zero
- customer budget cannot go below zero
- both checks must be atomic with the update

## Decision
The project uses conditional SQL updates inside the same database transaction.

Pseudo-flow:

1. lock the order row
2. resolve customer and product
3. perform conditional stock update: `UPDATE products SET stock = stock - :quantity WHERE id = :product_id AND stock >= :quantity`
4. perform conditional budget update: `UPDATE customers SET budget = budget - :total_price WHERE id = :customer_id AND budget >= :total_price`
5. commit only if both updates hit a row
6. on failure, mark order as FAILED with a reason

This means overselling and negative budget scenarios fail immediately rather than silently producing invalid state.

## Consequences
- Pros:
  - prevents race conditions in a simple and explicit way
  - keeps all order-state changes inside one transaction
  - clearly exposes `INSUFFICIENT_STOCK` and `INSUFFICIENT_BUDGET` reasons
- Trade-offs:
  - a failed order must be handled explicitly by the logic
  - the API must treat failed updates as business-level failures, not as successful processing

