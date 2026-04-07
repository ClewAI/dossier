# Vue 3

- Prefer `<script setup lang="ts">` when the project uses TypeScript in SFCs.
- Keep composables (`useX`) pure and reusable; name them with a `use` prefix.
- Use `ref` vs `reactive` consistently with the codebase; prefer `ref` for primitives and reassignment clarity.
- Avoid deep watchers unless necessary; prefer explicit computed properties.
- Align with Pinia or Vuex patterns already present; do not add a second global store style silently.
