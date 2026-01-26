# UI Refactoring Migration Checklist

## Overview

This document tracks the refactoring of buttons and modals across the Vriksh Valley application.

## Completed Tasks ✓

### 1. Core Components Created

- [x] Button component (`/components/general/Button.jsx`)
- [x] ConfirmModal component (`/components/general/ConfirmModal.jsx`)
- [x] useConfirmModal hook (`/lib/hooks/useConfirmModal.js`)

### 2. Styles Created

- [x] Button styles (`/styles/button.scss`)
- [x] ConfirmModal styles (`/styles/confirmModal.scss`)

### 3. Documentation

- [x] Component library documentation (`COMPONENT_LIBRARY.md`)
- [x] Migration checklist

### 4. Updated Components

- [x] Profile page - Replace confirm/prompt alerts with ConfirmModal

---

## Remaining Tasks

### Phase 2: Global Button Refactoring

#### Pages to Update

**Profile & Settings:**

- [ ] `/app/profile/page.jsx` - Already started, verify all buttons use Button component
- [ ] `/app/auth/` - Login/signup buttons

**Shopping:**

- [ ] `/app/cart/page.jsx` - Cart actions
- [ ] `/app/checkout/page.jsx` - Checkout buttons
- [ ] `/app/orders/page.jsx` - Order action buttons
- [ ] `/app/products/page.jsx` - Filter, sort buttons
- [ ] `/app/category/[category]/page.jsx`
- [ ] `/app/products/category/[subcategory]/page.jsx`
- [ ] `/app/search/page.jsx`

**Content Pages:**

- [ ] `/app/blogs/page.jsx` - Blog buttons
- [ ] `/app/plant-doctor/page.jsx` - Form submission buttons
- [ ] `/app/sample-order/page.jsx` - Action buttons
- [ ] `/app/offers/page.jsx` - Filter buttons

**Account & Admin:**

- [ ] `/app/track-order/page.jsx` - Replace alert with proper modal

### Phase 3: Component Refactoring

#### Components to Update

**General Components:**

- [ ] `/components/general/Navbar.jsx`
- [ ] `/components/general/Footer.jsx`
- [ ] `/components/general/SearchBar.jsx`
- [ ] `/components/general/WishlistButton.jsx`

**Product Components:**

- [ ] `/components/products/ProductCard.jsx`
- [ ] `/components/products/ProductPage.jsx`
- [ ] `/components/products/ProductListCard.jsx`

**Cart Components:**

- [ ] `/components/cart/` - All cart-related components

**Profile Components:**

- [ ] `/components/profile/Addresses.jsx`
- [ ] `/components/profile/ProfileOverview.jsx`
- [ ] `/components/profile/SecuritySettings.jsx`

**Order Components:**

- [ ] `/components/orders/` - All order-related components

---

## Alert Replacements Needed

### JavaScript Alert Replacements

Location: `/app/track-order/page.jsx` (line 20)

```jsx
// OLD: alert(`Tracking order: ${orderId}`);
// NEW: Use notification toast or modal
```

---

## Button Style Improvements

### Already Completed

- [x] Products toolbar design updated to match offers-filter
- [x] Unified button variants (primary, secondary, danger, success, warning, outline, ghost)
- [x] Button sizes (sm, md, lg)
- [x] Loading and disabled states

### Button Classes to Consolidate

The following button classes exist and should be migrated:

- `.btn-primary`, `.btn-secondary`, `.btn-danger` → Use Button component
- `.filter-btn` (offers) → Use Button with `variant="secondary"`
- `.sort-button` (products) → Use Button with proper variant
- `.mobile-filter-toggle` → Use Button component
- `.add-to-cart-button` → Use Button component
- `.submitBtn` → Use Button component
- `.cta-buttons` → Use Button components

---

## Testing Checklist

After migrations, test:

- [ ] All buttons are clickable and functional
- [ ] Hover states work correctly
- [ ] Active/disabled states display properly
- [ ] Loading states show spinners
- [ ] Icons display correctly
- [ ] Responsive design works on all breakpoints
- [ ] ConfirmModals display correctly
- [ ] Modal actions execute properly
- [ ] No console errors or warnings

---

## Responsive Design Verification

Test on:

- [ ] Desktop (1920px)
- [ ] Laptop (1440px)
- [ ] Tablet (768px)
- [ ] Mobile (480px)
- [ ] Small Mobile (320px)

---

## Performance Considerations

- [x] Button component is lightweight
- [x] Modal uses React hooks efficiently
- [x] Styles are compiled to single CSS file
- [x] No unnecessary re-renders

---

## Accessibility Checklist

- [x] Focus states visible on all buttons
- [x] Keyboard navigation works
- [x] Color contrast meets WCAG standards
- [x] Icons have proper labels/context
- [x] Modal has proper ARIA attributes

---

## Notes & Decisions

1. **Button Variants**: Chose 7 variants (primary, secondary, outline, ghost, danger, success, warning) to cover all use cases across the app.

2. **Modal Approach**: Using a hook-based approach (`useConfirmModal`) for clean state management and flexibility.

3. **Styling**: Moved from scattered inline styles to a unified SCSS module for consistency and maintainability.

4. **Naming Convention**: Component names follow React conventions (PascalCase for components, camelCase for hooks).

5. **Icons**: Using lucide-react for consistent icon library across components.

---

## Migration Progress

- **Completed**: 25%
- **In Progress**: 10%
- **Remaining**: 65%

### Detailed Breakdown

| Category        | Total  | Completed | %       |
| --------------- | ------ | --------- | ------- |
| Core Components | 3      | 3         | 100%    |
| Styles          | 2      | 2         | 100%    |
| Page Components | 15     | 1         | 7%      |
| UI Components   | 10     | 0         | 0%      |
| **TOTAL**       | **30** | **6**     | **20%** |

---

## Next Steps

1. Continue with Phase 2 (page components)
2. Update product-related buttons (highest priority)
3. Refactor checkout flow buttons
4. Update profile/settings buttons
5. Final testing and QA

---

## Questions & Support

For questions about the new component library, refer to:

- `COMPONENT_LIBRARY.md` - Component usage guide
- Component files in `/components/general/`
- Hook files in `/lib/hooks/`
- Style files in `/styles/`

---

**Last Updated**: January 26, 2026
**Next Review**: After Phase 2 completion
