# プロジェクトマスタ (Project Master) UI Output

## Generated Files

### Core Files
- ✅ `page.tsx` - Main page component for Project Master list
- ✅ `components/ProjectList.tsx` - Table display with search and pagination
- ✅ `components/CreateProjectDialog.tsx` - Create project dialog
- ✅ `components/ProjectDetailDialog.tsx` - Detail/Edit dialog with optimistic locking
- ✅ `api/BffClient.ts` - BFF client interface
- ✅ `api/MockBffClient.ts` - Mock implementation with realistic EPM data
- ✅ `api/HttpBffClient.ts` - HTTP implementation for real BFF calls

## Design System Compliance

### Colors
- ✅ Uses semantic tokens: `bg-background`, `text-foreground`, `border-border`
- ✅ Uses primary/secondary tokens: `bg-primary`, `text-primary-foreground`
- ✅ Uses semantic colors: `border-success`, `text-error`, `bg-warning/10`
- ❌ NO arbitrary colors or raw literals used

### Spacing
- ✅ Uses Tailwind spacing scale: `p-4`, `gap-4`, `space-y-2`
- ❌ NO arbitrary values like `p-[16px]` used

### Typography
- ✅ Uses design system type scale: `text-xl font-semibold`, `text-sm text-muted-foreground`
- ✅ Uses `font-sans` for UI text

### Components (Tier 1 Only)
- ✅ Button, Input, Label, Card, Table, Dialog, Badge, Alert, Separator, Spinner
- ✅ Pagination, Tabs, Checkbox, Select, Textarea, Tooltip
- ✅ All imported from `@/shared/ui`
- ❌ NO custom base components created in feature folder

## BFF Integration

### Endpoints Used
- GET `/api/bff/master-data/project-master` - List projects
- GET `/api/bff/master-data/project-master/:id` - Get detail
- POST `/api/bff/master-data/project-master` - Create project
- PATCH `/api/bff/master-data/project-master/:id` - Update project
- POST `/api/bff/master-data/project-master/:id/deactivate` - Deactivate
- POST `/api/bff/master-data/project-master/:id/reactivate` - Reactivate

### DTOs Used (from @contracts/bff)
- ✅ `ListProjectMasterRequest`
- ✅ `ListProjectMasterResponse`
- ✅ `ProjectMasterListItem`
- ✅ `ProjectMasterDetailResponse`
- ✅ `CreateProjectMasterRequest`
- ✅ `UpdateProjectMasterRequest`

### Error Handling
- ✅ Validation errors (422) - Inline field errors
- ✅ Business errors (409) - Alert panels
- ✅ Not found errors (404) - Alert panels
- ✅ Permission errors (403) - Alert panels
- ✅ Optimistic lock conflict handling with version

## Mock Data

### States Covered
- ✅ Empty state (no projects)
- ✅ Typical state (15 realistic projects)
- ✅ Error states (duplicate, validation, optimistic lock)

### Realistic EPM Data
- Project codes: PRJ001-PRJ015
- Names: "新規事業開発プロジェクト", "システム刷新プロジェクト", etc.
- Department codes: SALES, ENGINEERING, FINANCE
- Employee codes: EMP001-EMP010
- ISO 8601 date strings
- Decimal budget amounts

## Features Implemented

### List Screen
- ✅ Table with sorting (projectCode, projectName, projectShortName, plannedPeriodFrom, budgetAmount)
- ✅ Search filters (projectCode, projectName, projectShortName, departmentCode, responsibleEmployeeCode)
- ✅ Include inactive toggle
- ✅ Pagination (default 50, max 200)
- ✅ Row click → Detail dialog
- ✅ Create button → Create dialog
- ✅ Status badge (Active/Inactive)
- ✅ Empty state message

### Create Dialog
- ✅ All required fields with validation
- ✅ Date pickers (ISO 8601)
- ✅ Decimal budget amount input
- ✅ Inline validation errors
- ✅ Alert for duplicate/business errors
- ✅ Loading state during submit
- ✅ Success → Close dialog + refresh list

### Detail/Edit Dialog
- ✅ Read-only detail view
- ✅ Edit mode toggle
- ✅ Version display (optimistic locking)
- ✅ ProjectCode read-only in edit mode
- ✅ Update button (with ifMatchVersion)
- ✅ Deactivate/Reactivate buttons
- ✅ Optimistic lock conflict error handling
- ✅ Timestamps display (createdAt, updatedAt)
- ✅ Created/Updated by display

## Missing Shared Components / Patterns

### Recommended Additions to Shared UI
- [ ] DatePicker component (apps/web/src/shared/ui/components/date-picker.tsx)
  - Wraps Calendar with popover and input
  - Props: value, onChange, placeholder, disabled
  - ISO 8601 string format
  
- [ ] DataTable wrapper (apps/web/src/shared/ui/components/data-table.tsx)
  - Wraps Table with sorting, pagination, loading states
  - Props: columns, data, onSort, onPageChange, isLoading
  
- [ ] SearchInput with debounce (apps/web/src/shared/ui/components/search-input.tsx)
  - Wraps Input with 300ms debounce
  - Props: onSearch, placeholder, defaultValue

## Integration Notes

### Move to Feature Folder
When ready to integrate, move files from:
```
apps/web/_v0_drop/master-data/project-master/src/
```
to:
```
apps/web/src/features/master-data/project-master/
```

### Switch to Real BFF
In `page.tsx`, change:
```typescript
// Current (mock)
const bffClient = new MockBffClient();

// Production (real BFF)
const bffClient = new HttpBffClient();
```

### Add Navigation Menu
Add to `apps/web/src/shared/navigation/menu.ts`:
```typescript
{
  title: 'プロジェクトマスタ',
  href: '/master-data/project-master',
  icon: 'folder',
}
```

## Testing Checklist

- [ ] List screen loads with mock data
- [ ] Search filters work correctly
- [ ] Sorting by each column works
- [ ] Pagination works (page 1, 2, etc.)
- [ ] Include inactive toggle works
- [ ] Create dialog opens and closes
- [ ] Create validation works (required fields, date ranges)
- [ ] Create success refreshes list
- [ ] Detail dialog opens on row click
- [ ] Edit mode toggles correctly
- [ ] Update with validation works
- [ ] Optimistic lock conflict shows error
- [ ] Deactivate/Reactivate works
- [ ] Empty state displays correctly
- [ ] Error states display correctly
