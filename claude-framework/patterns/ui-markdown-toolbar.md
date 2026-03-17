# Markdown Formatting Toolbar for Textareas

> **Category:** UI Components
> **Source:** web-eco task notes

## Problem

You need rich text editing in a textarea (not a full WYSIWYG editor). Users want formatting buttons (bold, italic, headings, lists, checklists) that insert Markdown syntax at the cursor position, plus a lightweight renderer for display.

## When to Use

- Notes, descriptions, comments fields
- When Markdown is acceptable output format
- Lightweight alternative to full editors (TipTap, Slate, ProseMirror)

## When NOT to Use

- User-facing content that needs true WYSIWYG
- Documents with tables, images, or complex layouts
- When you need collaborative editing (use a real editor)

## Pattern

### Toolbar Component

```tsx
function FormattingToolbar({
  textareaRef,
  value,
  onChange,
}: {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (val: string) => void;
}) {
  // Wrap selection (or insert placeholder) with before/after tokens
  const insertAtCursor = useCallback(
    (before: string, after = "", placeholder = "") => {
      const ta = textareaRef.current;
      if (!ta) return;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const selected = value.slice(start, end);
      const text = selected || placeholder;
      const newValue =
        value.slice(0, start) + before + text + after + value.slice(end);
      onChange(newValue);
      requestAnimationFrame(() => {
        ta.focus();
        const pos = start + before.length + text.length;
        ta.setSelectionRange(
          selected ? pos + after.length : start + before.length,
          selected ? pos + after.length : start + before.length + text.length
        );
      });
    },
    [textareaRef, value, onChange]
  );

  // Toggle line prefix (heading, bullet, checklist)
  const insertLine = useCallback(
    (prefix: string) => {
      const ta = textareaRef.current;
      if (!ta) return;
      const start = ta.selectionStart;
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      const lineEnd = value.indexOf("\n", start);
      const end = lineEnd === -1 ? value.length : lineEnd;
      const line = value.slice(lineStart, end);

      if (line.startsWith(prefix)) {
        onChange(
          value.slice(0, lineStart) +
            line.slice(prefix.length) +
            value.slice(end)
        );
      } else {
        onChange(value.slice(0, lineStart) + prefix + line + value.slice(end));
      }
      requestAnimationFrame(() => ta.focus());
    },
    [textareaRef, value, onChange]
  );

  return (
    <div className="flex items-center gap-0.5 border-b px-2 py-1">
      <ToolbarBtn
        icon={Bold}
        onClick={() => insertAtCursor("**", "**", "bold")}
        title="Bold"
      />
      <ToolbarBtn
        icon={Italic}
        onClick={() => insertAtCursor("*", "*", "italic")}
        title="Italic"
      />
      <Divider />
      <ToolbarBtn
        icon={Heading2}
        onClick={() => insertLine("## ")}
        title="Heading"
      />
      <ToolbarBtn
        icon={ListIcon}
        onClick={() => insertLine("- ")}
        title="Bullet"
      />
      <ToolbarBtn
        icon={ListOrdered}
        onClick={() => insertLine("1. ")}
        title="Numbered"
      />
      <ToolbarBtn
        icon={CheckCircle2}
        onClick={() => insertLine("- [ ] ")}
        title="Checklist"
      />
    </div>
  );
}
```

### Lightweight Markdown Renderer

```tsx
function RichNotes({ text }: { text: string }) {
  return (
    <div className="space-y-1 text-sm">
      {text.split("\n").map((line, i) => {
        if (line.startsWith("## "))
          return (
            <h3 key={i} className="font-semibold">
              {renderInline(line.slice(3))}
            </h3>
          );
        if (line.startsWith("- [x] "))
          return (
            <div key={i} className="flex gap-2">
              <CheckCircle2 />
              <s>{renderInline(line.slice(6))}</s>
            </div>
          );
        if (line.startsWith("- [ ] "))
          return (
            <div key={i} className="flex gap-2">
              <Circle />
              {renderInline(line.slice(6))}
            </div>
          );
        if (line.startsWith("- "))
          return (
            <div key={i} className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-neutral-600" />
              {renderInline(line.slice(2))}
            </div>
          );
        if (line.trim() === "---") return <hr key={i} />;
        if (!line.trim()) return <div key={i} className="h-2" />;
        return <p key={i}>{renderInline(line)}</p>;
      })}
    </div>
  );
}

function renderInline(text: string): React.ReactNode {
  // Parse **bold** and *italic* with regex
  const parts: React.ReactNode[] = [];
  let remaining = text,
    key = 0;
  while (remaining.length > 0) {
    const bold = /\*\*(.+?)\*\*/.exec(remaining);
    if (bold?.index !== undefined) {
      if (bold.index > 0)
        parts.push(<span key={key++}>{remaining.slice(0, bold.index)}</span>);
      parts.push(<strong key={key++}>{bold[1]}</strong>);
      remaining = remaining.slice(bold.index + bold[0].length);
      continue;
    }
    const italic = /\*(.+?)\*/.exec(remaining);
    if (italic?.index !== undefined) {
      if (italic.index > 0)
        parts.push(<span key={key++}>{remaining.slice(0, italic.index)}</span>);
      parts.push(<em key={key++}>{italic[1]}</em>);
      remaining = remaining.slice(italic.index + italic[0].length);
      continue;
    }
    parts.push(<span key={key++}>{remaining}</span>);
    break;
  }
  return parts.length === 1 ? parts[0] : <>{parts}</>;
}
```

## Critical Details

- **requestAnimationFrame**: Cursor positioning must happen after React re-renders the textarea value
- **Toggle behavior**: If a line already has the prefix, `insertLine` removes it (toggle, not stack)
- **Bold before italic**: Parse `**bold**` before `*italic*` to avoid false matches
- **No dependencies**: This is zero-dependency — no remark, no rehype, no MDX
