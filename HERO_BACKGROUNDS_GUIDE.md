# Hero Background Images Implementation Guide

## Overview

Background images have been added to the SCSS files for individual page hero sections. The images are responsive with landscape versions for desktop and portrait versions for mobile.

## Files Updated

### 1. `styles/greenMovement.scss`

- Added background images to `.movement-hero` and `.green-movement-hero` sections
- **Pages affected**:
  - `/where-nature-meets-nurture`
  - `/join-green-movement`
- **Desktop**: `/Landscape Image for Pages/Our Story/Our Story.png`
- **Mobile**: `/Portrait Image for Pages for Mobile/Our Story/Untitled-36.png`

### 2. `styles/pages.scss`

- Added `.page-hero-wrapper` component for flexible hero sections
- Added page-specific background images using `data-page` attributes

## Implementation Methods

### Method 1: Using data-page Attribute (Recommended)

Add the `data-page` attribute to your page container:

```jsx
export default function ContactUs() {
  return (
    <div className="page-container" data-page="contact-us">
      <Breadcrumbs items={[{ label: "Contact Us" }]} />

      <div className="page-content">
        <div className="page-header">
          <h1>Get in Touch</h1>
          <p>We'd love to hear from you!</p>
        </div>
        {/* Rest of content */}
      </div>
    </div>
  );
}
```

**Current page header will work as-is**, the background will be applied to the page-container.

### Method 2: Using page-hero-wrapper (Optional - for dedicated hero sections)

If you want a more prominent hero section with the background:

```jsx
export default function ContactUs() {
  return (
    <>
      <Topbar />
      <Navbar />
      <div className="page-container" data-page="contact-us">
        {/* Hero Section with Background */}
        <div className="page-hero-wrapper">
          <div className="page-hero-content">
            <h1>Get in Touch</h1>
            <p>We'd love to hear from you. Reach out to us anytime!</p>
          </div>
        </div>

        {/* Breadcrumbs after hero */}
        <Breadcrumbs items={[{ label: "Contact Us" }]} />

        <div className="page-content">
          {/* Rest of content without page-header */}
        </div>
      </div>
      <Footer />
    </>
  );
}
```

## Available Page Backgrounds

| Page                | data-page Value       | Desktop Image                                                              | Mobile Image                                                                |
| ------------------- | --------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Contact Us          | `contact-us`          | `/Landscape Image for Pages/Contact Us/Contact Us.png`                     | `/Portrait Image for Pages for Mobile/Contact Us/Untitled-36.png`           |
| Our Story           | `our-story`           | `/Landscape Image for Pages/Our Story/Our Story.png`                       | `/Portrait Image for Pages for Mobile/Our Story/Untitled-36.png`            |
| FAQs                | `faqs`                | `/Landscape Image for Pages/FAQs/FAQs.png`                                 | `/Portrait Image for Pages for Mobile/FAQs/Untitled-36.png`                 |
| Privacy Policy      | `privacy-policy`      | `/Landscape Image for Pages/Privacy Policies/Privacy Policies.png`         | `/Portrait Image for Pages for Mobile/Privacy Policies/Untitled-36.png`     |
| Terms & Conditions  | `terms-conditions`    | `/Landscape Image for Pages/Terms and Conditions/Terms and Conditions.png` | `/Portrait Image for Pages for Mobile/Terms and Conditions/Untitled-36.png` |
| Terms of Service    | `terms-of-service`    | `/Landscape Image for Pages/Terms of Service/Terms of Service.png`         | `/Portrait Image for Pages for Mobile/Terms of Service/Untitled-36.png`     |
| Track Order         | `track-order`         | `/Landscape Image for Pages/Track Order/Track Order.png`                   | `/Portrait Image for Pages for Mobile/Track Order/Untitled-36.png`          |
| Profile             | `profile`             | `/Landscape Image for Pages/Profile/Profile.png`                           | `/Portrait Image for Pages for Mobile/Profile/Untitled-36.png`              |
| Shipping Policies   | `shipping-policies`   | `/Landscape Image for Pages/Shipping Plicies/Shipping Plicies.png`         | `/Portrait Image for Pages for Mobile/Shipping Policies/Untitled-36.png`    |
| Disclaimer          | `disclaimer`          | `/Landscape Image for Pages/Disclaimer/Disclaimer.png`                     | `/Portrait Image for Pages for Mobile/Disclaimer/Untitled-36.png`           |
| Cancellation/Refund | `cancellation-refund` | `/Landscape Image for Pages/Cancellation Terms/Cancellation Terms.png`     | `/Portrait Image for Pages for Mobile/Cancellation Terms/Untitled-36.png`   |
| Refund Policy       | `refund-policy`       | `/Landscape Image for Pages/Refund Policy/Refund Policy.png`               | `/Portrait Image for Pages for Mobile/Refund Policy/Untitled-36.png`        |
| Plant Care          | `plant-care`          | `/Landscape Image for Pages/Plant Care/Plant Care.png`                     | `/Portrait Image for Pages for Mobile/Plant Care/Untitled-36.png`           |
| Blogs               | `blogs`               | `/Landscape Image for Pages/Blogs/Blogs.png`                               | `/Portrait Image for Pages for Mobile/Blogs/Untitled-36.png`                |
| Plants              | `plants`              | `/Landscape Image for Pages/Plants/Plants.png`                             | `/Portrait Image for Pages for Mobile/Plants/Untitled-36.png`               |
| Seeds               | `seeds`               | `/Landscape Image for Pages/Seeds/Seeds.png`                               | `/Portrait Image for Pages for Mobile/Seeds/Untitled-36.png`                |
| Planters            | `planters`            | `/Landscape Image for Pages/Planters/Planters.png`                         | `/Portrait Image for Pages for Mobile/Planter/Untitled-36.png`              |
| Decor               | `decor`               | `/Landscape Image for Pages/Decor/Decor.png`                               | `/Portrait Image for Pages for Mobile/Decor/Untitled-36.png`                |
| Accessories         | `accessories`         | `/Landscape Image for Pages/Accessories/Accessories.png`                   | `/Portrait Image for Pages for Mobile/Accessories/Untitled-36.png`          |

## Quick Update Instructions

### For Existing Pages:

1. **Add data-page attribute** to the `.page-container` div
2. The background will automatically apply to the page
3. No other changes needed - current layout preserved!

### Example Updates:

#### Before:

```jsx
<div className="page-container">
```

#### After:

```jsx
<div className="page-container" data-page="contact-us">
```

## Pages Already Updated (No Action Needed)

✅ `/where-nature-meets-nurture` - Background applied to hero section
✅ `/join-green-movement` - Background applied to hero section

## Pages That Need the data-page Attribute

To enable backgrounds, add the `data-page` attribute to these pages:

- [ ] `/contact-us` - add `data-page="contact-us"`
- [ ] `/our-story` - add `data-page="our-story"`
- [ ] `/faqs` - add `data-page="faqs"`
- [ ] `/privacy-policy` - add `data-page="privacy-policy"`
- [ ] `/terms-conditions` - add `data-page="terms-conditions"`
- [ ] `/terms-of-services` - add `data-page="terms-of-service"`
- [ ] `/track-order` - add `data-page="track-order"`
- [ ] `/profile` - add `data-page="profile"`
- [ ] `/shipping-policies` - add `data-page="shipping-policies"`
- [ ] `/disclaimer` - add `data-page="disclaimer"`
- [ ] `/cancellation-refund` - add `data-page="cancellation-refund"`
- [ ] `/about-us` - add `data-page="our-story"` (uses same images)

## Customization

### To adjust the overlay opacity:

In `pages.scss`, modify the `::before` gradient:

```scss
background: linear-gradient(
  135deg,
  rgba($dark-green, 0.75) 0%,
  rgba($deep-green, 0.75) 100%
);
// Change 0.75 to make it lighter (0.5) or darker (0.9)
```

### To change breakpoint for mobile images:

Modify the media query:

```scss
@media (max-width: 768px) {
  // Change to 640px, 1024px, etc.
  background-image: url("...");
}
```

## Notes

- Images are set to `cover` with `center` positioning for best fit
- Gradient overlay (75% opacity) ensures text readability
- Mobile breakpoint is at 768px
- All images are served from `/public` folder
- Background images work with existing page layouts without breaking current design

## Testing

1. Check desktop view - should show landscape images
2. Check mobile view (< 768px) - should show portrait images
3. Verify text is readable over background
4. Ensure page load performance is acceptable
