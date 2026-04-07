# Testing discipline

- Prefer fast, deterministic unit tests for pure logic and small modules.
- Use integration tests for I/O boundaries (DB, HTTP, queues) with clear fixtures; avoid flaky timing-dependent tests.
- When fixing a bug, add a regression test when cost is reasonable.
- Do not weaken assertions or skip tests to green the build without explicit user direction.
- Mock external services at stable boundaries; avoid over-mocking the system under test.
