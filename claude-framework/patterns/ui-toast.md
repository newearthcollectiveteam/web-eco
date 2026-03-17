# Toast Notification Pattern

> **Category:** UI Feedback
> **Source:** website-ecosystem portal
> **Library:** sonner

## Problem

Users need immediate feedback when:
- Mutations succeed or fail
- Actions complete in the background
- Errors occur

## When to Use

- After successful mutations (create, update, delete)
- After failed operations (with error message)
- For transient information (copied to clipboard, saved)

## When NOT to Use

- Loading states (use spinners/skeletons instead)
- Persistent information (use banners or alerts)
- Form validation errors (show inline)

## Setup

### Install

```bash
npm install sonner
```

### Root Layout Configuration

```typescript
// src/app/layout.tsx
import { Toaster } from "sonner";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "rgba(0, 0, 0, 0.9)",
              border: "1px solid rgba(212, 175, 55, 0.2)",  // Gold accent
              color: "#fff",
            },
          }}
        />
      </body>
    </html>
  );
}
```

## Usage Patterns

### Basic Success/Error

```typescript
import { toast } from "sonner";

// Success
toast.success("Item saved");

// Error
toast.error("Failed to save item");

// Info
toast.info("Processing...");

// With description
toast.success("Item saved", {
  description: "Your changes have been saved to the database.",
});
```

### Context-Aware Mutation Feedback

```typescript
const updateItem = api.items.update.useMutation({
  onSuccess: (_, variables) => {
    // Different messages based on what changed
    if (variables.isActive === false) {
      toast.success("Item archived");
    } else if (variables.isActive === true) {
      toast.success("Item restored");
    } else if (variables.projectId !== undefined) {
      toast.success("Project assigned");
    } else {
      toast.success("Item updated");
    }

    // Invalidate cache to trigger refetch
    void utils.items.getAll.invalidate();
  },
  onError: (error) => {
    toast.error("Failed to update item", {
      description: error.message,
    });
  },
});
```

### Delete with Confirmation

```typescript
const deleteItem = api.items.delete.useMutation({
  onSuccess: () => {
    toast.success("Item deleted");
    void utils.items.getAll.invalidate();
  },
  onError: (error) => {
    toast.error("Failed to delete item", {
      description: error.message,
    });
  },
});
```

### Promise-Based (for async operations)

```typescript
const handleExport = async () => {
  toast.promise(exportData(), {
    loading: "Exporting data...",
    success: "Export complete!",
    error: "Export failed",
  });
};
```

## Anti-Patterns

```typescript
// ❌ Don't show toasts for loading states
toast.info("Loading..."); // Use skeleton/spinner instead

// ❌ Don't show toasts for every query fetch
useQuery({
  onSuccess: () => toast.success("Data loaded"), // Noisy, unnecessary
});

// ❌ Don't show toasts for inline validation
toast.error("Email is invalid"); // Show inline error instead

// ✅ DO show toasts for mutations
useMutation({
  onSuccess: () => toast.success("Saved"),
});
```

## Theme Customization

### Light Theme

```typescript
<Toaster
  theme="light"
  toastOptions={{
    style: {
      background: "#fff",
      border: "1px solid #e5e7eb",
      color: "#111",
    },
  }}
/>
```

### Custom Position

```typescript
<Toaster
  position="top-center"  // or "top-right", "bottom-left", etc.
  expand={true}          // Stack toasts vertically
  richColors             // Use semantic colors (green success, red error)
/>
```

## Combine With

- Mutations for user feedback
- Error boundaries for caught errors
- Form submissions for success/failure
