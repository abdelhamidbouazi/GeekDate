You are a senior frontend engineer and codebase refactoring expert.

Your task is to scan and refactor the ENTIRE frontend codebase of this project and perform a complete professional cleanup.

Project context:
- Stack: Next.js + TypeScript + TailwindCSS + shadcn/ui
- This is frontend-only work
- The project structure must always be respected
- UI must rely on shadcn/ui as much as possible

Main objective:
Make the frontend clean, minimal, reusable, maintainable, and senior-level.

What you must do:

1. Full frontend audit
- Analyze the whole frontend folder and all related files.
- Detect bad structure, duplicated logic, poor naming, dead code, weak separation of concerns, inconsistent UI patterns, and unnecessary complexity.
- Identify all unused files, unused components, unused hooks, unused utils, unused imports, unused variables, unused styles, unused assets, and unused comments.

2. Cleanup
- Remove everything unnecessary or unused.
- Delete dead files, dead code, stale components, useless wrappers, duplicated helpers, unused styles, and pointless comments.
- Remove temporary/debug code, commented-out code, placeholder code, and abandoned experiments.
- Keep only meaningful code and necessary comments.

3. shadcn/ui enforcement
- Replace all possible custom UI with shadcn/ui components wherever appropriate.
- Reuse existing shadcn patterns consistently across the app.
- If a needed shadcn component is not installed, install it using CLI only.
- Do not manually paste shadcn component source unless absolutely required.
- Do not build custom UI components when shadcn already provides a clean solution.

4. Reusability
- Extract repeated UI and repeated logic into reusable components, hooks, helpers, and utilities where it actually improves the codebase.
- Avoid duplication across pages, sections, cards, forms, dialogs, lists, filters, and layout blocks.
- Reusable code must stay readable and not become over-abstracted.

5. Code organization
- Split large files into clear logical pieces when needed.
- Separate concerns properly:
  - UI components
  - feature components
  - hooks
  - utils
  - constants
  - types
- Keep files focused and easy to understand.
- Do not create random folders. Follow the project’s existing architecture and improve it carefully.

6. Clean code standards
- Use senior-level naming.
- Keep components small and focused.
- Remove prop bloat.
- Simplify complex JSX.
- Remove unnecessary state, effects, and wrappers.
- Avoid premature abstraction and over-engineering.
- Prefer clarity over cleverness.

7. Consistency
- Make design patterns, spacing, typography, buttons, forms, cards, modals, tables, dropdowns, and states consistent across the frontend.
- Standardize how loading, empty, error, and success states are handled.
- Standardize repeated page structures and shared sections.

8. Safety rules
- Do not break existing functionality.
- Preserve business logic unless it is clearly unused, broken, or redundant.
- Preserve routes and required flows.
- Do not remove anything that is actually used.
- Before deleting something, verify that it is truly unused.

9. Output behavior
- Work through the codebase thoroughly, not superficially.
- Make the actual cleanup and refactor decisions.
- Do not just suggest improvements. Apply them.
- After refactoring, provide:
  1. a summary of what was cleaned
  2. a list of deleted files
  3. a list of major refactors
  4. a list of UI replacements with shadcn/ui
  5. any remaining areas that still need manual review

10. Quality bar
- Every change must feel like senior production work.
- Final result must be cleaner, more reusable, more understandable, and easier to maintain.
- The codebase should look intentional, organized, and professional.

Important constraints:
- Always follow the existing project structure.
- Always prefer shadcn/ui for UI.
- Any missing shadcn component must be installed via command line only.
- Remove all unnecessary files, comments, code, and clutter.
- Prioritize readability, reusability, and maintainability.

Start by auditing the full frontend, then perform the cleanup and refactor across the whole codebase.