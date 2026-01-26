# Vriksh Valley UI Component Library

## 1. Button Component

A unified, reusable button component that replaces scattered button styles across the application.

### Basic Usage

```jsx
import Button from '@/components/general/Button';

// Primary button (default)
<Button>Click Me</Button>

// With size
<Button size="lg">Large Button</Button>
<Button size="md">Medium Button</Button> {/* default */}
<Button size="sm">Small Button</Button>

// With variant
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="danger">Delete</Button>
<Button variant="success">Confirm</Button>
<Button variant="warning">Warning</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
```

### With Icons

```jsx
import Button from '@/components/general/Button';
import { Trash2, Plus, Save } from 'lucide-react';

<Button icon={Trash2} variant="danger">
  Delete
</Button>

<Button icon={Plus} iconPosition="left">
  Add New
</Button>

<Button icon={Save} iconPosition="right">
  Save Changes
</Button>
```

### States

```jsx
// Loading state
<Button loading>Processing...</Button>

// Disabled state
<Button disabled>Disabled</Button>

// Full width
<Button fullWidth>Full Width Button</Button>
```

### Variants

| Variant     | Use Case                             |
| ----------- | ------------------------------------ |
| `primary`   | Main actions (submit, confirm)       |
| `secondary` | Secondary actions, alternatives      |
| `danger`    | Destructive actions (delete, remove) |
| `success`   | Success/completion actions           |
| `warning`   | Warning actions                      |
| `outline`   | Alternative primary action           |
| `ghost`     | Minimal, text-only appearance        |

### Sizes

| Size | Usage                    |
| ---- | ------------------------ |
| `sm` | Compact, inline actions  |
| `md` | Default, most common     |
| `lg` | Prominent, large actions |

### Props

```typescript
interface ButtonProps {
  variant?:
    | "primary"
    | "secondary"
    | "danger"
    | "success"
    | "warning"
    | "outline"
    | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ComponentType<IconProps>;
  iconPosition?: "left" | "right";
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  type?: "button" | "submit" | "reset";
  fullWidth?: boolean;
}
```

---

## 2. ConfirmModal Component

Beautiful modal for confirmation dialogs, replacing browser `confirm()` alerts.

### Basic Usage

```jsx
import ConfirmModal from "@/components/general/ConfirmModal";
import { useConfirmModal } from "@/lib/hooks/useConfirmModal";

function MyComponent() {
  const { isOpen, modalProps, open, confirm, cancel } = useConfirmModal();

  const handleDelete = async () => {
    open({
      type: "danger",
      title: "Delete Item",
      message:
        "Are you sure you want to delete this item? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      onConfirm: async () => {
        // Handle deletion
        await deleteItem();
      },
    });
  };

  return (
    <>
      <button onClick={handleDelete}>Delete</button>

      <ConfirmModal
        isOpen={isOpen}
        type={modalProps.type}
        title={modalProps.title}
        message={modalProps.message}
        confirmText={modalProps.confirmText}
        cancelText={modalProps.cancelText}
        loading={modalProps.loading}
        onConfirm={confirm}
        onCancel={cancel}
      />
    </>
  );
}
```

### Modal Types

```jsx
// Confirmation (default)
open({
  type: "confirm",
  title: "Confirm Action",
  message: "Are you sure?",
  onConfirm: handleConfirm,
});

// Danger/Destructive
open({
  type: "danger",
  title: "Delete Address",
  message: "This action cannot be undone.",
  onConfirm: handleDelete,
});

// Warning
open({
  type: "warning",
  title: "Warning",
  message: "Are you sure about this?",
  onConfirm: handleConfirm,
});

// Success
open({
  type: "success",
  title: "Success",
  message: "Action completed successfully!",
  onConfirm: handleSuccess,
});

// Info
open({
  type: "info",
  title: "Information",
  message: "Important information for the user.",
  onConfirm: handleInfo,
});
```

### Hook: useConfirmModal

```jsx
const {
  isOpen, // boolean - modal visibility
  modalProps, // object - current modal configuration
  open, // function - open modal with options
  close, // function - close modal
  confirm, // function - confirm action
  cancel, // function - cancel action
} = useConfirmModal();
```

#### open() Options

```typescript
interface ConfirmOptions {
  type?: "confirm" | "warning" | "danger" | "info" | "success";
  title: string;
  message: string;
  confirmText?: string; // default: 'Confirm'
  cancelText?: string; // default: 'Cancel'
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  showIcon?: boolean; // default: true
}
```

### Real-World Example

```jsx
"use client";
import { useConfirmModal } from "@/lib/hooks/useConfirmModal";
import ConfirmModal from "@/components/general/ConfirmModal";
import Button from "@/components/general/Button";

export default function ProfilePage() {
  const confirmModal = useConfirmModal();

  const handleDeleteAddress = (addressId) => {
    confirmModal.open({
      type: "warning",
      title: "Delete Address",
      message: "Are you sure you want to delete this address?",
      confirmText: "Delete",
      onConfirm: async () => {
        await deleteAddressFromAPI(addressId);
        showToast("Address deleted");
      },
    });
  };

  const handleDeactivateAccount = () => {
    confirmModal.open({
      type: "danger",
      title: "Deactivate Account",
      message: "This will permanently delete your account and all data.",
      confirmText: "Deactivate",
      onConfirm: async () => {
        await deactivateAccount();
        // Redirect...
      },
    });
  };

  return (
    <>
      <Button onClick={() => handleDeleteAddress("addr-123")}>
        Delete Address
      </Button>

      <Button variant="danger" onClick={handleDeactivateAccount}>
        Deactivate Account
      </Button>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        type={confirmModal.modalProps.type}
        title={confirmModal.modalProps.title}
        message={confirmModal.modalProps.message}
        confirmText={confirmModal.modalProps.confirmText}
        cancelText={confirmModal.modalProps.cancelText}
        loading={confirmModal.modalProps.loading}
        onConfirm={confirmModal.confirm}
        onCancel={confirmModal.cancel}
      />
    </>
  );
}
```

---

## 3. Replacing Old Patterns

### Before: Browser Confirm

```jsx
// OLD PATTERN - Don't use this anymore!
const handleDelete = async () => {
  if (!confirm("Delete this item?")) return;

  await deleteItem();
  showToast("Deleted");
};
```

### After: ConfirmModal

```jsx
// NEW PATTERN - Use this!
const confirmModal = useConfirmModal();

const handleDelete = async () => {
  confirmModal.open({
    type: "danger",
    title: "Delete Item",
    message: "Are you sure you want to delete this item?",
    confirmText: "Delete",
    onConfirm: async () => {
      await deleteItem();
      showToast("Deleted");
    },
  });
};
```

---

## 4. Migration Guide

### Step 1: Import Components

```jsx
import Button from "@/components/general/Button";
import ConfirmModal from "@/components/general/ConfirmModal";
import { useConfirmModal } from "@/lib/hooks/useConfirmModal";
```

### Step 2: Replace Button Elements

Replace old button styles with the Button component:

```jsx
// Old
<button className="btn-primary">Save</button>

// New
<Button variant="primary">Save</Button>
```

### Step 3: Replace Confirmation Alerts

Replace `confirm()` with ConfirmModal:

```jsx
// Old
if (!confirm("Are you sure?")) return;

// New
confirmModal.open({
  type: "danger",
  title: "Confirm",
  message: "Are you sure?",
  onConfirm: async () => {
    /* action */
  },
});
```

### Step 4: Add Modal to Component

Don't forget to render the ConfirmModal in your component!

```jsx
return (
  <>
    {/* your content */}

    <ConfirmModal
      isOpen={confirmModal.isOpen}
      type={confirmModal.modalProps.type}
      title={confirmModal.modalProps.title}
      message={confirmModal.modalProps.message}
      confirmText={confirmModal.modalProps.confirmText}
      cancelText={confirmModal.modalProps.cancelText}
      loading={confirmModal.modalProps.loading}
      onConfirm={confirmModal.confirm}
      onCancel={confirmModal.cancel}
    />
  </>
);
```

---

## 5. Design System

### Colors

- **Primary (Teal)**: `$teal` - Main actions
- **Secondary (Gray)**: `$grey-dark` - Secondary actions
- **Danger (Red)**: `#ef4444` - Destructive actions
- **Success (Green)**: `#10b981` - Successful actions
- **Warning (Amber)**: `$yellow` - Warning actions

### Spacing

- **Small**: 0.5rem
- **Medium**: 1rem
- **Large**: 1.5rem

### Border Radius

- **Buttons**: 8px (compact), 50px (pill-shaped)
- **Modals**: 16px
- **Inputs**: 50px

### Shadows

- **Light**: `0 2px 8px rgba(0, 0, 0, 0.08)`
- **Medium**: `0 4px 12px rgba(0, 0, 0, 0.12)`
- **Heavy**: `0 20px 60px rgba(0, 0, 0, 0.3)`

---

## 6. Accessibility

- All buttons have proper focus states
- Modal includes backdrop for context
- Icons are decorative (not required for understanding)
- Proper color contrast ratios
- Keyboard navigation support

---

## 7. Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

## 8. Tips & Best Practices

1. **Use semantic sizes**: Use `lg` for important actions, `md` for standard, `sm` for inline
2. **Color meanings**: Use color variants to indicate action consequence
3. **Loading states**: Always use `loading` prop for async operations
4. **Icon pairs**: Use icons with labels for clarity
5. **Modal messages**: Be clear and concise in modal messages
6. **Confirmation text**: Use action verbs (Delete, Confirm, Save)

---

## Questions?

Refer to the component files:

- Button: `/components/general/Button.jsx`
- ConfirmModal: `/components/general/ConfirmModal.jsx`
- useConfirmModal Hook: `/lib/hooks/useConfirmModal.js`
- Styles: `/styles/button.scss`, `/styles/confirmModal.scss`
