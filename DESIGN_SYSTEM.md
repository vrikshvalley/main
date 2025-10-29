# Vriksh Valley Design System

## Color Palette

The design system has been simplified to use **only 5 core colors** for brand consistency:

### Core Colors

1. **Dark Green** (`#073b22`) - Primary dark background color
2. **Deep Green** (`#1a5c3a`) - Secondary background & text on white
3. **White/Off-white** (`#f9f5f1`) - Text on dark backgrounds, light backgrounds
4. **Teal** (`#2dd4bf`) - Highlights, important elements, links
5. **Yellow** (`#fbbf24`) - Rare accent, CTAs only

### Usage Guidelines

#### Primary Color Scheme

- **White on Dark Green**: Main branding, navigation, hero sections
- Use `$text-primary` (white) on `$primary-bg` (dark green)

#### Alternative Color Scheme

- **Dark Green/Deep Green on White**: Content sections, cards
- Use `$text-dark` or `$text-deep` on `$white` backgrounds

#### Highlights

- **Teal**: Use for important text, links, active states, success messages
- Variable: `$teal` or `$accent-primary`

#### Accents (Use Sparingly)

- **Yellow**: Call-to-action buttons, rare highlights only
- Variable: `$yellow` or `$accent-secondary`

## Typography

### Fonts

Two fonts only for the entire website:

1. **Playfair Display** (Serif)

   - Use for: Headings, titles, hero text, section headers
   - Variable: `$font-primary`
   - Example: `font-family: $font-primary;`

2. **Alumni Sans** (Sans-serif)
   - Use for: Body text, descriptions, navigation links, buttons
   - Variable: `$font-secondary`
   - Example: `font-family: $font-secondary;`

### Font Hierarchy

```scss
h1,
h2,
h3,
.hero-title,
.section-header {
  font-family: $font-primary; // Playfair Display
}

p,
a,
button,
.body-text,
nav {
  font-family: $font-secondary; // Alumni Sans
}
```

## Gradients

### New Simplified Gradients

1. **Dark Gradient** - Dark to Deep Green

   ```scss
   background: $gradient-dark;
   ```

2. **Teal Gradient** - Teal highlight variations

   ```scss
   background: $gradient-teal;
   ```

3. **Yellow Gradient** - Yellow accent (rare use)

   ```scss
   background: $gradient-yellow;
   ```

4. **Light Gradient** - White/Off-white variations
   ```scss
   background: $gradient-light;
   ```

### Legacy Gradient Aliases (Deprecated)

These still work for compatibility but will be removed in future:

- `$accent-gradient` → Maps to `$gradient-teal`
- `$primary-gradient` → Maps to `$gradient-dark`
- `$background-gradient` → Maps to `$gradient-dark`
- `$warm-gradient` → Maps to `$gradient-yellow`

**Recommendation**: Update to use new gradient names.

## Shadows

```scss
$shadow-light: 0 2px 8px rgba($dark-green, 0.15);
$shadow-medium: 0 4px 16px rgba($dark-green, 0.25);
$shadow-strong: 0 8px 32px rgba($dark-green, 0.35);
$shadow-glow: 0 0 20px rgba($teal, 0.3); // For highlights
```

## Implementation

All design system variables are defined in:

```
styles/_variables.scss
```

### How to Use

Import variables in any SCSS file:

```scss
@use "variables" as *;

.my-component {
  background: $primary-bg;
  color: $text-primary;
  font-family: $font-primary;
  box-shadow: $shadow-medium;
}
```

## Migration Guide

### Removed Colors

The following colors have been removed from the system:

- ❌ `$bg-tertiary` (#966859) → Replace with `$dark-green`
- ❌ Old `$bg-secondary` (#599174) → Now `$deep-green` (#1a5c3a)
- ❌ Old `$text-secondary` (#99ccad) → Now `$teal` (#2dd4bf)
- ❌ Old `$accent-secondary` (#b9c446) → Now `$yellow` (#fbbf24)
- ❌ Old `$accent-primary` (#f8c377) → Now `$teal` (#2dd4bf)

### Color Replacements

| Old Variable        | New Variable  | Hex Code |
| ------------------- | ------------- | -------- |
| `$primary-bg`       | `$dark-green` | #073b22  |
| `$text-primary`     | `$white`      | #f9f5f1  |
| `$text-secondary`   | `$teal`       | #2dd4bf  |
| `$accent-primary`   | `$teal`       | #2dd4bf  |
| `$accent-secondary` | `$yellow`     | #fbbf24  |
| `$bg-secondary`     | `$deep-green` | #1a5c3a  |
| `$text-dark`        | `$dark-green` | #073b22  |

## Design Principles

1. **Simplicity**: Only 5 colors maximum
2. **Consistency**: Use semantic variable names
3. **Hierarchy**: Playfair Display for headings, Alumni Sans for body
4. **Contrast**: White on dark green, dark green on white
5. **Highlights**: Teal for emphasis, yellow sparingly for CTAs

## Examples

### Button Styles

```scss
// Primary CTA Button
.cta-button {
  background: $gradient-yellow;
  color: $dark-green;
  font-family: $font-secondary;

  &:hover {
    background: $gradient-teal;
  }
}

// Secondary Button
.secondary-button {
  background: rgba($teal, 0.2);
  color: $teal;
  border: 2px solid $teal;
  font-family: $font-secondary;
}
```

### Card Component

```scss
.card {
  background: $white;
  color: $text-dark;
  box-shadow: $shadow-medium;

  h3 {
    font-family: $font-primary;
    color: $dark-green;
  }

  p {
    font-family: $font-secondary;
    color: $deep-green;
  }

  a {
    color: $teal;
    font-family: $font-secondary;

    &:hover {
      color: $yellow;
    }
  }
}
```

### Hero Section

```scss
.hero {
  background: $gradient-dark;
  color: $text-primary;

  h1 {
    font-family: $font-primary;
    font-size: 3rem;
    text-shadow: 0 2px 4px rgba($dark-green, 0.6);
  }

  .cta {
    background: $gradient-yellow;
    color: $dark-green;
    font-family: $font-secondary;
  }
}
```

---

**Last Updated**: December 2024  
**Version**: 2.0 (Simplified System)
