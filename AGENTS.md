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
  - **icon usage**:
    - Use `Icon.Box` for resource list items by default. Use a resource-specific icon only when the existing feature already establishes that convention.
  - **subtitle usage**: 
    - Use for "auxiliary identifiers (e.g., email address)" or "descriptive text (e.g., cron schedule)" that help identify the item at a glance.
  - **accessories usage**: 
    - Use for "categorical attributes (metadata)" such as region, status, runtime, and creation date.
  - **Handling Empty Values**: Always filter the `accessories` array to prevent empty elements from appearing.
  - Implementation Example:
    ```tsx
    <List.Item
      title={resource.name}
      icon={Icon.Box}
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
- **Data Fetching**: Follow the established pattern using `usePromise` in feature hooks under `src/resources/` or existing custom hooks.
- **Type Definitions**: Organize resource-related types in a `types.ts` file within each feature directory.
- **Bounded Pagination**:
  - Avoid eager all-page fetching for resource list APIs. Initial loads should fetch only the first page.
  - API helpers should expose page-level functions that return both the resources and the pagination token, e.g. `{ resources, nextPageToken }`.
  - Hooks should own pagination state, including loaded resources, `nextPageToken`, `isLoadingMore`, `hasMore`, `isTruncated`, `loadMore`, and `error`.
  - Add explicit load-more behavior in the list UI instead of automatically following every page token.
  - Enforce a hard cap on retained resources, currently 500 items per resource list, to keep memory usage bounded.
  - If an API has multiple pagination streams for one list, keep each token explicit in hook state and merge/deduplicate loaded resources deterministically.
  - Search only the resources that have already been loaded. Search placeholders and empty states must make this clear when more results may exist.
  - When results are truncated by the hard cap, show an explicit truncated state in the UI.
  - Preserve existing partial-success behavior when converting progressive pagination to bounded pagination.

## 6. Communication
- **GitHub Interactions**: Always write Pull Request descriptions, Issue comments, and commit messages in **English**.
- **Pull Request Titles**: Use a concise title that directly describes the change. Do not add agent- or tool-specific prefixes such as `[codex]`.
- **Instruction Precedence**: Project rules in this file override default naming conventions from tools, skills, or agents.
- **Pull Request Preflight**: Immediately before creating or updating a Pull Request, verify its title and description against this section.
- **Automatic Issue Closing**: When work was started for the purpose of resolving an issue, always include "Closes #<issue_number>" or an equivalent closing keyword in the Pull Request description so that merging the Pull Request closes the issue.

## 7. Tool Usage
- **Command-Line First**: Prioritize using terminal commands for all operations (e.g., repository management, information gathering, and verification). Use the browser tool only when a task cannot be accomplished via the command line or when visual confirmation is explicitly required.
- **GitHub Authentication Verification**: If `gh auth status` fails in a sandboxed environment, retry it with network-enabled or escalated execution before concluding that the token is invalid. Ask the user to re-authenticate only if that retry also confirms an invalid or expired token.
- **GitHub MCP Fallback**: If authenticated `gh` access remains unavailable but the GitHub MCP connection is available, use GitHub MCP for repository and Pull Request operations. Treat Git remote authentication (such as SSH for `git push`) independently from GitHub CLI authentication, and stop for user authentication only when neither `gh` nor GitHub MCP can complete the operation.
