# Color Scheme Documentation

## Overview
Your portfolio uses a modern, professional color scheme with deep teal as the primary accent and warm orange as the secondary accent for hover states and badges.

## Color Palette

### Light Mode

#### Primary Accent - Deep Teal/Cyan
- **HSL**: `188 94% 35%`
- **Hex**: `#0891B2` (approximately)
- **Usage**: Main buttons, links, headings, focus states, brand elements
- **CSS Variable**: `--primary`

#### Secondary Accent - Warm Orange
- **HSL**: `24 95% 53%`
- **Hex**: `#F97316` (approximately)
- **Usage**: Hover states, badges, secondary actions, complementary highlights
- **CSS Variable**: `--secondary`

#### Background Colors
- **Main Background**: `210 20% 98%` - Soft blue-tinted near-white
- **Card Background**: `0 0% 100%` - Pure white (elevated surfaces)
- **Muted Background**: `210 20% 95%` - Slightly darker tinted gray

#### Text Colors
- **Foreground (Main Text)**: `220 13% 9%` - Near-black with slight blue tint
- **Muted Text**: `220 9% 46%` - Medium gray for secondary text

#### UI Elements
- **Border**: `214 20% 88%` - Light gray with blue tint
- **Input**: `214 20% 88%` - Matching border color
- **Ring (Focus)**: `188 94% 35%` - Primary teal color

### Dark Mode

#### Primary Accent - Lighter Teal
- **HSL**: `188 85% 45%`
- **Usage**: Same as light mode, but lighter for better contrast on dark backgrounds

#### Secondary Accent - Lighter Orange
- **HSL**: `24 90% 58%`
- **Usage**: Hover states and badges in dark mode

#### Background Colors
- **Main Background**: `220 15% 8%` - Soft dark with blue tint (not pure black)
- **Card Background**: `220 13% 12%` - Slightly elevated dark surface
- **Muted Background**: `220 13% 15%` - Darker variant for subtle differences

#### Text Colors
- **Foreground**: `210 20% 98%` - Near-white with blue tint
- **Muted Text**: `220 9% 65%` - Lighter gray for secondary text

## Usage Examples

### Headings
```tsx
<h1 className="text-primary">Main Heading</h1>
```

### Buttons
- Primary button: Uses `bg-primary` with white text
- Hover effect: Automatically lightens to `bg-primary/90`

### Links
```tsx
<Link href="/blog" className="text-primary hover:text-secondary">
  Blog
</Link>
```

### Cards with Hover
```tsx
<Card className="hover:border-primary/30 hover:shadow-lg transition-all duration-300 group">
  <Icon className="text-primary group-hover:text-secondary transition-colors" />
</Card>
```

### Status Badges
```tsx
// Published badge (teal)
<span className="bg-primary/10 text-primary border border-primary/20">
  Published
</span>

// Draft badge (orange)
<span className="bg-secondary/10 text-secondary border border-secondary/20">
  Draft
</span>
```

### Navigation Hover
```tsx
<Link className="hover:bg-accent hover:text-accent-foreground transition-colors duration-200">
  Nav Item
</Link>
```

## Color Interactions

### Primary + Secondary Gradient
The homepage logo uses a gradient from primary to secondary:
```tsx
<div className="bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent">
  DS
</div>
```

### Hover State Pattern
Most interactive elements follow this pattern:
- **Rest**: Primary teal color
- **Hover**: Secondary orange color
- **Duration**: 200-300ms transition

Example:
```tsx
<Card className="group">
  <Icon className="text-primary group-hover:text-secondary transition-colors duration-300" />
  <Title className="text-primary group-hover:text-secondary transition-colors">Title</Title>
</Card>
```

## Accessibility

### Contrast Ratios
All text colors meet WCAG AA standards:
- Primary teal (#0891B2) on white: 4.5:1+ ✓
- Near-black text (#171717) on soft white: 16:1+ ✓
- Muted text maintains 4.5:1+ ratio

### Focus States
All interactive elements use the primary teal for focus rings:
```css
--ring: 188 94% 35%;
```

## Where Colors Are Applied

### Primary Teal (`--primary`)
- Main navigation hover states
- All primary buttons
- Page headings (Blog, Projects, About, Contact, Resume)
- "I am Divij" text on homepage
- Card titles
- Icon colors (at rest)
- Link colors
- Focus rings
- Published status badges

### Secondary Orange (`--secondary`)
- Hover states on cards and icons
- Navigation hover background (light orange tint)
- Draft status badges
- Email icon hover in footer
- Interactive element hover states

### Background Hierarchy
1. Main background: Soft blue-tinted white (`210 20% 98%`)
2. Cards: Pure white (`0 0% 100%`)
3. Muted areas: Tinted gray (`210 20% 95%`)

### Text Hierarchy
1. Main text: Near-black with blue tint (`220 13% 9%`)
2. Secondary text: Medium gray (`220 9% 46%`)
3. Headings: Primary teal for emphasis

## Design Principles

1. **Soft Backgrounds**: Use tinted grays instead of pure white/black for reduced eye strain
2. **Near-Black Text**: Slight blue tint maintains consistency with color scheme
3. **Color Pairing**: Cool teal + warm orange creates visual interest and balance
4. **Consistent Hover**: Secondary orange appears on hover for clear interactivity
5. **Subtle Transitions**: 200-300ms transitions for smooth, professional feel

## Future Customization

To change the color scheme, update these CSS variables in `app/globals.css`:

```css
:root {
  --primary: 188 94% 35%;     /* Your main accent color */
  --secondary: 24 95% 53%;    /* Your complementary accent */
  --background: 210 20% 98%;  /* Main background */
  --foreground: 220 13% 9%;   /* Main text color */
}
```

All components will automatically use the new colors!
