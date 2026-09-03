# ADR-0006: Kysely with SQL-first migrations

- Status: Accepted
- Date: 2026-09-01

## Context

The first slice needs typed PostgreSQL access, explicit multi-module transactions, reviewed migrations, constraints, and database-backed jobs using `FOR UPDATE SKIP LOCKED`. A full entity ORM would add mapping and lifecycle abstractions that the domain contracts do not require.

## Choice

Use Kysely 0.29.5 with `pg` 8.23.0. Define narrow database row types in the platform adapter, keep domain/application types independent, and run ordered repository-owned SQL migrations through Kysely's migration primitives. Generated or written SQL is reviewed and tested; migrations never run implicitly at application startup.

## Reasons

- Kysely preserves explicit SQL, transactions, constraints, and raw queue queries while providing useful TypeScript query typing.
- One driver and a small migration runner are simpler than an entity/unit-of-work layer for this modular monolith.
- SQL ownership and public module ports remain visible to agents and reviewers.

## Alternatives

- Drizzle ORM: capable and schema-oriented, but adds a schema DSL/code-generation workflow not needed for the first slice.
- Prisma: mature tooling, but its generated client and abstraction around raw queue/transaction queries add more machinery.
- Raw `pg` plus a custom migration system: smallest runtime, but recreates migration ordering/locking/history without enough benefit.

## Tradeoffs and migration difficulty

Database row types and SQL constraints require deliberate synchronization, and Kysely does not replace migration review. Complex PostgreSQL features may use raw SQL. Replacing Kysely is moderate because domain/application ports remain independent, but migrations and platform repositories would be rewritten.
