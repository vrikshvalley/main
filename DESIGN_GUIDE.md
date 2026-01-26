# Visual Design Guide - Button System

## 🎨 Button Variants Showcase

### Primary Button

```
┌──────────────────────────┐
│  PRIMARY (Teal)          │
│  Save  Search  Continue  │
└──────────────────────────┘
- Used for: Main actions, form submission, primary CTA
- Color: Linear gradient (Teal → Darker Teal)
- Hover: Lifts up with shadow
- States: Normal, Hover, Active, Disabled, Loading
```

### Secondary Button

```
┌──────────────────────────┐
│  SECONDARY (Light)       │
│  Cancel  Reset  Decline  │
└──────────────────────────┘
- Used for: Secondary actions, alternatives
- Color: Light teal background with teal border
- Hover: Darker background, lifted
- States: Normal, Hover, Active, Disabled
```

### Danger Button (Destructive)

```
┌──────────────────────────┐
│  DANGER (Red)            │
│  Delete  Remove  Clear   │
└──────────────────────────┘
- Used for: Destructive actions (delete, remove)
- Color: Linear gradient (Red → Darker Red)
- Hover: Lifts up with red shadow
- Warning: Always confirm with modal
- States: Normal, Hover, Active, Disabled
```

### Success Button

```
┌──────────────────────────┐
│  SUCCESS (Green)         │
│  Confirm  Complete  Yes  │
└──────────────────────────┘
- Used for: Success actions, confirmations
- Color: Linear gradient (Green → Darker Green)
- Hover: Lifts up with green shadow
- States: Normal, Hover, Active, Disabled
```

### Warning Button

```
┌──────────────────────────┐
│  WARNING (Amber)         │
│  Caution  Attention  Go  │
└──────────────────────────┘
- Used for: Warning actions, important notices
- Color: Linear gradient (Amber → Darker Amber)
- Hover: Lifts up with amber shadow
- States: Normal, Hover, Active, Disabled
```

### Outline Button

```
┌──────────────────────────┐
│  OUTLINE (Teal Border)   │
│  Browse  Learn  Explore  │
└──────────────────────────┘
- Used for: Alternative primary action
- Color: Transparent with teal border
- Hover: Fills with teal background
- States: Normal, Hover, Active, Disabled
```

### Ghost Button

```
┌──────────────────────────┐
│  GHOST (Minimal)         │
│  Help  More  Advanced    │
└──────────────────────────┘
- Used for: Minimal, text-like buttons
- Color: Transparent
- Hover: Light background
- States: Normal, Hover, Active, Disabled
```

---

## 📏 Button Sizes

### Small Button

```
┌──────────┐
│ Small    │  Height: 32px
│ Btn      │  Padding: 0.5rem 1rem
└──────────┘  Font: 0.875rem
```

### Medium Button (Default)

```
┌────────────────┐
│ Medium Button  │  Height: 40px
│ (Default)      │  Padding: 0.75rem 1.5rem
└────────────────┘  Font: 0.95rem
```

### Large Button

```
┌──────────────────────────┐
│ Large Button             │  Height: 48px
│ (Prominent)              │  Padding: 1rem 2rem
└──────────────────────────┘  Font: 1.05rem
```

---

## 🔄 Button States

### Normal State

```
┌──────────────────┐
│   Save Changes   │  Clickable, ready for interaction
└──────────────────┘
```

### Hover State

```
┌──────────────────┐
│   Save Changes   │  Lifted up, shadow increases
└──────────────────┘ Transform: -2px
```

### Active/Pressed State

```
┌──────────────────┐
│   Save Changes   │  Back on baseline
└──────────────────┘ Transform: 0px
```

### Disabled State

```
┌──────────────────┐
│   Save Changes   │  Opacity: 0.6
└──────────────────┘  Cursor: not-allowed
```

### Loading State

```
┌──────────────────┐
│   ⟳ Loading...   │  Shows spinner
└──────────────────┘  Text hidden
```

---

## 🎯 Modal Types Showcase

### Confirm Modal (Teal)

```
    ┌─────────────────────┐
    │        🔔          │
    │ Confirm Action      │
    │                     │
    │ Are you sure about  │
    │ this action?        │
    │                     │
    │ [Cancel]  [Confirm] │
    └─────────────────────┘

Type: 'confirm'
Icon: AlertCircle (teal)
Color Accent: Teal
```

### Warning Modal (Amber)

```
    ┌─────────────────────┐
    │        ⚠️           │
    │ Warning             │
    │                     │
    │ Please be careful   │
    │ before proceeding.  │
    │                     │
    │ [Cancel]  [Proceed] │
    └─────────────────────┘

Type: 'warning'
Icon: AlertCircle (amber)
Color Accent: Amber
```

### Danger Modal (Red)

```
    ┌─────────────────────┐
    │        ❌          │
    │ Delete Address      │
    │                     │
    │ This cannot be      │
    │ undone.             │
    │                     │
    │ [Keep it] [Delete]  │
    └─────────────────────┘

Type: 'danger'
Icon: XCircle (red)
Color Accent: Red
Action Button: Danger variant
```

### Success Modal (Green)

```
    ┌─────────────────────┐
    │        ✅          │
    │ Success             │
    │                     │
    │ Action completed    │
    │ successfully!       │
    │                     │
    │ [Cancel]  [Great]   │
    └─────────────────────┘

Type: 'success'
Icon: CheckCircle (green)
Color Accent: Green
```

### Info Modal (Blue)

```
    ┌─────────────────────┐
    │        ℹ️          │
    │ Information         │
    │                     │
    │ Important info for  │
    │ the user.           │
    │                     │
    │ [Cancel]  [OK]      │
    └─────────────────────┘

Type: 'info'
Icon: Info (blue)
Color Accent: Blue
```

---

## 🔀 Button with Icons

### Icon Positions

**Left Icon (Default)**

```
┌─────────────────────────┐
│  🔍  Search Products    │
└─────────────────────────┘
  └─┘  └───────────────┘
  Icon  Label
```

**Right Icon**

```
┌─────────────────────────┐
│  Next Page         →    │
└─────────────────────────┘
  └─────────────┘  └─┘
  Label         Icon
```

---

## 📱 Responsive Behavior

### Desktop View (1920px)

```
┌─────────────────────────────────────┐
│  Save Changes  │  Delete  │  Cancel  │
│  (Large)       │(Medium)  │(Medium)  │
└─────────────────────────────────────┘
```

### Tablet View (768px)

```
┌──────────────────────────────┐
│ Save Changes │ Delete │ Cancel│
│  (Medium)    |(Medium)|(Medium)
└──────────────────────────────┘
```

### Mobile View (480px)

```
┌──────────────┐
│ Save Changes │  (Full width)
└──────────────┘
┌──────────────┐
│   Delete     │  (Full width)
└──────────────┘
┌──────────────┐
│   Cancel     │  (Full width)
└──────────────┘
```

---

## 🎨 Color Palette

```
PRIMARY (Teal)
#1CB85B (Main)
#0B8F43 (Darker for gradient)
─────────────────────────────────

SECONDARY (Gray)
#E5E7EB (Light background)
#6B7280 (Medium)
#374151 (Dark text)
─────────────────────────────────

DANGER (Red)
#EF4444 (Main)
#DC2626 (Darker for gradient)
─────────────────────────────────

SUCCESS (Green)
#10B981 (Main)
#059669 (Darker for gradient)
─────────────────────────────────

WARNING (Amber)
#FBBF24 (Main)
#F59E0B (Darker for gradient)
─────────────────────────────────

INFO (Blue)
#3B82F6 (Main)
#2563EB (Darker for gradient)
```

---

## ✨ Shadow Hierarchy

```
Light Shadow (Buttons)
0 2px 8px rgba(0, 0, 0, 0.08)

Medium Shadow (Hover)
0 4px 12px rgba(0, 0, 0, 0.12)

Heavy Shadow (Modals)
0 20px 60px rgba(0, 0, 0, 0.3)
```

---

## 🎯 Spacing System

```
Extra Small: 0.25rem  (4px)
Small:       0.5rem   (8px)
Medium:      1rem     (16px)
Large:       1.5rem   (24px)
Extra Large: 2rem     (32px)

Button Padding
───────────────────────
sm:  0.5rem 1rem     (8px 16px)
md:  0.75rem 1.5rem  (12px 24px)
lg:  1rem 2rem       (16px 32px)

Button Gap (with icon)
───────────────────────
0.5rem between icon and text
```

---

## 🔔 Focus States (Accessibility)

```
┌────────────────────────┐
│ ◯ Focused Button       │  When tabbing with keyboard
└────────────────────────┘
    ╰─ Blue focus ring ─╯

Box Shadow: 0 0 0 3px rgba(Teal, 0.2)
```

---

## 📊 Design Metrics

### Button Dimensions

```
Small:  32px height, 0.5rem 1rem padding
Medium: 40px height, 0.75rem 1.5rem padding (default)
Large:  48px height, 1rem 2rem padding

Icon Size
─────────
16px for small buttons
18px for medium buttons
20px for large buttons
```

### Border Radius

```
Square:  8px (default)
Pill:    50px (alternate, for filter buttons)
Modal:   16px
Dropdown: 12px
```

### Transition Timing

```
Fast:     0.2s (opacity, color)
Normal:   0.3s (transform, shadow)
Slow:     0.6s (animations)
```

---

## 💡 Design Principles

### 1. Clarity

- Clear intent through color
- Icons support, not replace labels
- Text always visible

### 2. Consistency

- Same button same appearance
- Variants follow color logic
- Sizes scale proportionally

### 3. Accessibility

- High contrast ratios (WCAG AA)
- Clear focus states
- Keyboard navigation

### 4. Responsiveness

- Buttons shrink on mobile
- Full width on small screens
- Touch-friendly (44px minimum)

### 5. Feedback

- Hover states visible
- Active states clear
- Loading states obvious
- Disabled states clear

---

## 🎬 Animations

### Button Hover Animation

```
Transform: translateY(-2px)
Transition: 0.3s ease
Shadow increase: 0 2px → 0 6px
```

### Button Click Animation

```
Transform: translateY(0)
Transition: Instant
Shadow decrease back to normal
```

### Modal Appear Animation

```
Initial:  opacity 0, transform translate(-50%, -40%)
Final:    opacity 1, transform translate(-50%, -50%)
Duration: 0.3s cubic-bezier(0.22, 1, 0.36, 1)
```

### Icon Bounce Animation

```
0%:   scale(0.3), opacity 0
50%:  scale(1.1)
100%: scale(1), opacity 1
Duration: 0.6s ease-in-out
```

---

## 📋 Quick Checklist for Button Design

- [ ] Color matches action severity
- [ ] Size appropriate for prominence
- [ ] Icon helps clarify intent
- [ ] Text is clear and concise
- [ ] Hover state is obvious
- [ ] Mobile responsiveness verified
- [ ] Keyboard navigation works
- [ ] Focus state visible
- [ ] Disabled state clear
- [ ] Enough padding for touch

---

## 🎓 Real-World Examples

### Example 1: Delete with Modal

```
User sees:    [Delete Address] ← danger variant
User clicks:  Danger modal appears
User confirms: Address deleted, toast shown
```

### Example 2: Save Form

```
User enters:  Form data
User clicks:  [Save Changes] ← primary, loading state
System:       Shows spinner in button
User sees:    Success toast, form clears
```

### Example 3: Filter Products

```
User sees:    [All] [High 40%+] [Medium 20-39%]
              ↑ Active (filled)
User clicks:  [Medium 20-39%]
Updated:      Products filter, button fills
```

---

**Design Guide Version**: 1.0
**Last Updated**: January 26, 2026
**Status**: Production Ready
