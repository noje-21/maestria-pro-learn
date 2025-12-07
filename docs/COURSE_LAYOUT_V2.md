# Course Layout V2 - OS-Style Documentation

## Overview

The Course Viewer is a premium, immersive learning experience with a 3-panel OS-style layout designed for optimal learning flow.

## Architecture

```
src/
├── layouts/
│   └── CourseLayoutOS.tsx       # Main 3-panel layout with responsive behavior
├── components/
│   ├── course/
│   │   ├── LessonIndexPanel.tsx # Left sidebar - modules/lessons accordion
│   │   ├── LessonContent.tsx    # Center - video player + lesson content
│   │   ├── LessonFooter.tsx     # Navigation + completion with confetti
│   │   ├── LessonSidePanel.tsx  # Right panel - resources, notes, glossary
│   │   ├── CourseProgressBar.tsx # Top sticky progress bar
│   │   ├── CourseTimeline.tsx   # Vertical module timeline
│   │   └── ResourcesSection.tsx # Downloadable resource cards
│   └── common/
│       └── GlossaryTooltip.tsx  # Medical terms tooltip component
├── pages/
│   ├── Lesson.tsx               # Lesson page integrating all components
│   ├── Dashboard.tsx            # Role-based dashboard (admin/student)
│   └── CourseDetail.tsx         # Course overview with hero and timeline
```

## Key Features

### 1. Three-Panel Desktop Layout
- **Left Panel (300px)**: Lesson index with accordion modules, search, completion states
- **Center Content**: Video player, lesson metadata, description card
- **Right Panel (320px)**: Tabbed interface for resources, notes, glossary

### 2. Immersive Mode
- Toggle with `F` key or button
- Hides both sidebars
- Maximizes content viewing area
- Smooth panel animations

### 3. Mobile Experience
- Left panel transforms to bottom drawer
- Floating "Índice" button for quick access
- Compact progress bar with course title
- Touch-optimized navigation buttons
- Full-width content area

### 4. Keyboard Navigation
- `←` / `→`: Navigate between lessons
- `F`: Toggle immersive mode (when not in input fields)

### 5. Bug Fixes Applied (v2.1)
- **Removed sticky video**: Was causing layout jumps and overlapping issues
- **Fixed scroll container**: Now uses proper `overflow-y-auto` with `overscroll-contain`
- **Improved panel animations**: Uses `AnimatePresence mode="wait"` for smoother transitions
- **Fixed z-index conflicts**: Proper layering of header, panels, and controls
- **Optimized mobile drawer**: No longer causes body scroll issues

## Components Deep Dive

### CourseLayoutOS
Main layout wrapper providing:
- Desktop: 3-panel flex layout with `h-screen` and `overflow-hidden`
- Mobile: Single column with drawer and floating button
- Handles keyboard events for navigation
- Manages panel visibility state

### LessonContent
Premium video player component:
- Supports multiple videos with tab selector
- Smooth fade transitions between lessons
- Video selector for multi-video lessons
- Skeleton loading state with Play icon

### LessonFooter
Navigation and completion:
- Previous/Next buttons with disabled states
- "Marcar Completada" with confetti animation
- Non-sticky positioning (inside card container)
- Mobile-optimized stacking

### LessonSidePanel
Tabbed resource panel:
- **Recursos**: PDF, images, audio with type-based icons
- **Notas**: Local storage persistence per lesson
- **Glosario**: Medical terms with tooltips

## Design System Integration

Uses semantic tokens from `index.css`:
```css
--primary: hsl(228.73 73.47% 46.47%);     /* #213ECC */
--secondary: hsl(0 74.19% 46.67%);        /* #CE2020 */
--background: dark theme base
--card: elevated surfaces
--muted: subtle backgrounds
--border: divider lines
```

## Supabase Integration

| Feature | Table | Notes |
|---------|-------|-------|
| Lessons | `lessons` | Lesson content and metadata |
| Progress | `user_progress` | Completion tracking per user |
| Videos | `lesson_videos` | Multiple videos per lesson |
| Materials | `lesson_materials` | Downloadable resources |
| Modules | `modules` | Group lessons into modules |

## Performance Optimizations

1. **No sticky video**: Removed complex scroll-based positioning
2. **CSS containment**: `overscroll-contain` prevents scroll chaining
3. **Lazy panel loading**: Panels animate in/out without re-rendering content
4. **Optimistic updates**: Completion state updates immediately

## Accessibility

- `aria-current="page"` on active lesson
- Focus management in panel toggles
- Keyboard navigation fully supported
- Screen reader labels on all interactive elements

## Migration Notes

If upgrading from V1:
1. The sticky video feature has been removed to fix layout bugs
2. LessonFooter is now inside a card container, not sticky at bottom
3. Panel toggle buttons have new icons (PanelLeftClose/PanelRightClose)
4. Mobile uses Sheet component instead of custom drawer

## Troubleshooting

**Video overlapping content**: Should no longer occur. If it does, ensure no custom CSS is overriding the layout.

**Panel animations choppy**: Check if hardware acceleration is enabled. Framer Motion requires GPU compositing for smooth animations.

**Mobile drawer not opening**: Ensure Sheet component has correct z-index and no conflicting click handlers.
