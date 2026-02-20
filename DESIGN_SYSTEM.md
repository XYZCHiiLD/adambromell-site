# Design System Documentation

This site now has a reusable design system that makes adding new pages and features consistent and fast.

## Quick Start

### Adding a New Page

1. Create a new folder in `/src/app/` (e.g., `/src/app/projects/`)
2. Add a `page.js` file
3. Import and use the design system components

Example:
```jsx
import SectionHeader from '@/components/SectionHeader';
import ExternalLink from '@/components/ExternalLink';
import { colors } from '@/styles/theme';

export default function Projects() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-12 py-16 md:py-24 min-h-screen bg-cloud-dancer">
        <SectionHeader>My Projects</SectionHeader>
        <p>Check out <ExternalLink href="https://example.com">this project</ExternalLink>.</p>
      </div>
    </main>
  );
}
```

## Design System Components

### Colors (Tailwind Classes)
Use these anywhere in your `className`:
- `text-ribbon-red` - Your signature red
- `bg-cloud-dancer` - Background color
- `text-deep-blue` - Deep blue
- `text-piquant-green` - Green accent
- `text-flax` / `text-sandstorm` / `text-allure` - Yellow/red accents

### Components

#### `<SectionHeader>`
For h2 section titles
```jsx
<SectionHeader>About Me</SectionHeader>
```

#### `<ExternalLink>`
For all external links (automatically styled with red color and hover underline)
```jsx
<ExternalLink href="https://example.com">Link text</ExternalLink>
<ExternalLink href="https://example.com" bold>Bold link</ExternalLink>
```

#### `<ProfileSection>`
For job history / profile entries
```jsx
<ProfileSection title="COMPANY NAME">
  <p>2020-PRESENT</p>
  <p>Job title and description</p>
</ProfileSection>
```

Use `spacing="large"` for entries that need extra top margin:
```jsx
<ProfileSection title="NEXT COMPANY" spacing="large">
  <p>2015-2020</p>
</ProfileSection>
```

#### `<ParallaxImage>`
For the scrolling header image
```jsx
<ParallaxImage 
  images={['/photo-1.jpg', '/photo-2.jpg']} 
  alt="Description"
/>
```

### Theme File (`/src/styles/theme.js`)

Access colors, typography, and spacing programmatically:

```jsx
import { colors, typography, spacing } from '@/styles/theme';

// Use in inline styles
style={{ color: colors.ribbonRed }}
style={{ fontSize: typography.sizes.h1 }}
style={{ marginBottom: spacing.section }}
```

## File Structure

```
/src
  /app
    /blog              # Blog pages
    /projects          # Future projects section
    page.js            # Homepage
    layout.js          # Site-wide layout
  /components
    SectionHeader.js   # Reusable h2 headers
    ExternalLink.js    # Styled links
    ProfileSection.js  # Job/project entries
    ParallaxImage.js   # Scrolling header image
  /styles
    theme.js           # Design tokens (colors, typography, spacing)
    globals.css        # Global styles
```

## Adding Blog Posts

1. Create `/src/app/blog/[slug]/page.js`
2. Use the same components and styling
3. Example structure is already in `/src/app/blog/page.js`

## Best Practices

1. **Always use components** instead of inline styles when possible
2. **Use Tailwind classes** for colors (e.g., `text-ribbon-red` not `style={{ color: '#C5003E' }}`)
3. **Keep the theme.js file updated** if you add new design decisions
4. **Test new pages** to ensure they match the visual consistency of the homepage

## Common Patterns

### Page Wrapper
Every page should use this structure:
```jsx
<main className="min-h-screen bg-white">
  <div className="max-w-3xl mx-auto px-12 py-16 md:py-24 min-h-screen bg-cloud-dancer">
    {/* Your content here */}
  </div>
</main>
```

### Section Spacing
Use `mb-12` between major sections (matches the homepage)

### Text Colors
- Body text: `text-gray-800` 
- Muted text: `text-gray-600`
- Links: Use `<ExternalLink>` component (auto-styled)
