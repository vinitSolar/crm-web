# Project Guidelines and Conventions

Use this file as context when generating code for this project.

## Tech Stack
- **Framework**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **State/Data**: Apollo Client (GraphQL)
- **Forms**: Controlled components with local state

## UI Components
Location: `src/components/ui` and `src/components/common`

### Common Components
1.  **Button**: import `{ Button }` from `@/components/ui/Button`
    - Props: `variant` (default, destructive, ghost), `isLoading`, `leftIcon`, etc.
2.  **Input**: import `{ Input }` from `@/components/ui/Input`
    - Props: `error` (string), `containerClassName`, etc.
3.  **Select**: import `{ Select }` from `@/components/ui/Select`
    - Props: `options` `[{ label, value }]`, `error`, `containerClassName`.
4.  **Modal**: import `{ Modal }` from `@/components/common`
    - Props: `isOpen`, `onClose`, `title`, `footer` (ReactNode), `size` (sm, md, lg).
5.  **DataTable**: import `{ DataTable }` from `@/components/common`
    - Props: `columns`, `data`, `loading`, `pagination` props (`page`, `hasMore`, `onLoadMore`).
6.  **Tooltip**: import `{ Tooltip }` from `@/components/ui/Tooltip`
    - Props: `content` (string).
7.  **StatusField**: import `{ StatusField }` from `@/components/common`
    - A reusable component for displaying and editing status/type fields.
    - Props:
      - `type`: `'customer_status' | 'user_status' | 'dnsp' | 'rate_type' | 'state'`
      - `value`: The current value (string or number).
      - `mode`: `'badge'` (default), `'select'`, or `'text'`.
      - `onChange`: Callback for select mode.
      - `showAllOption`: Add "All" option for filter selects.
      - `className`, `placeholder`: Standard styling/placeholder props.

## Domain Constants
Location: `src/lib/constants.ts`

Use centralized constants for domain-specific mappings and options:
- `CUSTOMER_STATUS_MAP`, `CUSTOMER_LEGACY_STATUS_MAP`: Customer status labels and colors.
- `USER_STATUS_OPTIONS`, `USER_FILTER_STATUS_OPTIONS`: User status options.
- `DNSP_MAP`, `DNSP_OPTIONS`: Distribution Network Service Provider mappings.
- `RATE_TYPE_MAP`, `RATE_TYPE_OPTIONS`: Rate plan type mappings.
- `STATE_OPTIONS`, `AUS_STATES`: Australian state options.

Example usage:
```tsx
import { DNSP_MAP, STATE_OPTIONS } from '@/lib/constants';
// For display: DNSP_MAP['0'] => 'Ausgrid'
// For selects: STATE_OPTIONS => [{ value: 'NSW', label: 'NSW' }, ...]
```

### Icons
- Import icons from `@/components/icons`
- Example: `import { PlusIcon, PencilIcon, TrashIcon } from '@/components/icons';`

## Utilities
- **Date Formatting**: `import { formatDate } from '@/lib/utils';`
- **Toasts**: `import { toast } from 'react-toastify';`

## Coding Patterns
1.  **Validation**:
    - Use inline validation for forms.
    - Create an `errors` state: `const [errors, setErrors] = useState<{ [key: string]: string }>({});`
    - Pass `error={errors.field}` to Input/Select components.
    - Clear errors on change: `if (errors.field) setErrors(prev => ({ ...prev, field: '' }));`
2.  **GraphQL**:
    - Define queries/mutations in `@/graphql`.
    - Use `useQuery` and `useMutation` hooks.
3.  **UI Structure**:
    - Use "Page Header" pattern with title and main action button.
    - Wrap tables in a styled container: `p-5 bg-background rounded-lg border border-border shadow-sm`.
4.  **Loading States**:
    - Always use the `isLoading` prop on `Button` components for async operations.
    - Use the `loadingText` prop (e.g., "Saving...", "Deleting...", "Restoring...") to provide feedback.
    - Avoid manual spinner rendering or conditional text children for loading states.
