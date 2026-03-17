# Inline Editable Fields

> **Category:** UI Components
> **Source:** web-eco task status names

## Problem

Users need to rename items (column headers, labels, titles) in place without opening a modal. The field should look like static text until clicked, then become an input.

## When to Use

- Editable column/section headers
- Inline renaming (files, labels, tags, statuses)
- Any label the user should be able to customize with minimal friction

## When NOT to Use

- Fields requiring validation feedback (use a form)
- Multi-field editing (use a modal or drawer)
- Fields with complex types (dates, selects — use dedicated inputs)

## Pattern

```tsx
function EditableField({
  value,
  onSave,
  className,
}: {
  value: string;
  onSave: (newValue: string) => void;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const save = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) {
      onSave(trimmed);
    } else {
      setDraft(value); // Reset on empty or unchanged
    }
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === "Enter") save();
          if (e.key === "Escape") {
            setDraft(value);
            setEditing(false);
          }
        }}
        className="border-primary/30 focus:border-primary rounded border bg-transparent px-1 py-0.5 text-sm focus:outline-none"
      />
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className={className ?? "text-sm font-medium hover:text-white"}
      title="Click to rename"
    >
      {value}
    </button>
  );
}
```

## Usage

```tsx
<EditableField
  value={status.name}
  onSave={(name) => renameMutation.mutate({ id: status.id, name })}
/>
```

## Critical Details

- **Auto-select on focus**: `inputRef.current?.select()` so the user can immediately type a replacement
- **Escape reverts**: Reset draft to original value, don't save
- **Blur saves**: Clicking away commits the change (don't lose edits)
- **Empty guard**: Don't save empty strings — revert to original
- **No save if unchanged**: Skip the mutation if the value didn't actually change
- **Width hint**: Set a reasonable `min-width` on the input so it doesn't collapse to zero for short values
