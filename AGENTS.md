# Agent Instructions for raycast-google-cloud-shortcut

These are technical guidelines to be applied consistently across this entire project. Agents MUST always adhere to them.

## 1. Quality Control (Highest Priority)
- **Code Integrity**: When making changes, always ensure that the following commands run successfully without any warnings or errors:
  - `npm run lint`: Lint check
  - `npm run type-check`: Type check (`tsc --noEmit`)
  - `npm run build`: Build check
- **Submission Criteria**: All proposed code must pass these local checks before submission.

## 2. UI Design Patterns
- **Resource List (List.Item)**:
  - **subtitle usage**: 
    - Use for "auxiliary identifiers (e.g., email address)" or "descriptive text (e.g., cron schedule)" that help identify the item at a glance.
  - **accessories usage**: 
    - Use for "categorical attributes (metadata)" such as region, status, runtime, and creation date.
  - **Handling Empty Values**: Always filter the `accessories` array to prevent empty elements from appearing.
  - Implementation Example:
    ```tsx
    <List.Item
      title={resource.name}
      subtitle={resource.description} 
      accessories={[
        { text: resource.region },
        { text: resource.status },
      ].filter((a) => a.text)}
    />
    ```

## 3. Error Handling
- **Component Display**: If an error occurs during data fetching, notify the user using the common `ErrorDetail` component.
- **Hook Propagation**: Custom hooks for data fetching must properly return the `error` object (e.g., from `usePromise`) to allow handling at the component level.

## 4. GitHub Actions & CI
- **Action Pinning**: When using external GitHub Actions, always pin the version using a **commit hash** and include a comment with the tag name (e.g., `uses: actions/checkout@11bd71... # v4.2.2`).
- **Shared Logic**: Centralize logic used across multiple workflows into local composite actions under `.github/actions/`.

## 5. Common Implementation Patterns
- **Data Fetching**: Follow the established pattern using `usePromise` in `src/service/` or existing custom hooks.
- **Type Definitions**: Organize resource-related types in a `types.ts` file within each feature directory.

## 6. Communication
- **GitHub Interactions**: Always write Pull Request descriptions, Issue comments, and commit messages in **English**.
