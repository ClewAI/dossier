# React

- Prefer function components and hooks; do not introduce class components unless matching legacy code.
- Keep components focused; lift state only as high as needed; colocate state with the subtree that uses it.
- Memoize (`useMemo`, `useCallback`, `React.memo`) only when profiling or clear re-render cost justifies it.
- Lists need stable `key` props; never use array index for keys when order changes.
- Effects (`useEffect`) should declare correct dependencies; avoid empty-deps hacks unless truly mount-once.
- Prefer accessible semantics: labels for inputs, buttons for actions, headings in order, keyboard support for interactive widgets.
- For controlled inputs, keep a single source of truth; avoid half-controlled patterns.
