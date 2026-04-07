# Jest

- Use the project's existing test environment (`jsdom` vs `node`) and setup files.
- Prefer `jest.mock` for module boundaries; clear mocks between tests when needed.
- Use fake timers only in tests that need them; restore real timers afterward.
- Snapshot tests: keep snapshots small and intentional; avoid huge generated blobs.
- Align `describe` naming with product language and module under test.
