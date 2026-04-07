# Tailwind CSS

- Prefer design tokens from `tailwind.config` (colors, spacing, typography) over arbitrary one-off values unless prototyping.
- Group related utilities logically; consider `@apply` in component CSS only when the project already uses that pattern.
- Keep responsive and state variants readable; break very long class strings across lines.
- Do not fight specificity with `!important` unless fixing a documented override issue.
- Co-locate component markup and styling; avoid global leaky utility combinations.
