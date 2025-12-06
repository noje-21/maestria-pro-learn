# Course Layout V2 - OS-Style Documentation

## Overview

The new Course Viewer is a premium, immersive learning experience with a 3-panel OS-style layout.

## Architecture

```
src/
├── layouts/
│   └── CourseLayoutOS.tsx       # Main 3-panel layout
├── components/
│   ├── course/
│   │   ├── LessonIndexPanel.tsx # Left sidebar with modules/lessons
│   │   ├── LessonContent.tsx    # Center content area
│   │   ├── LessonFooter.tsx     # Navigation + completion buttons
│   │   ├── LessonSidePanel.tsx  # Right panel (resources, notes, glossary)
│   │   ├── CourseProgressBar.tsx # Top progress bar
│   │   ├── CourseTimeline.tsx   # Vertical module timeline
│   │   └── ResourcesSection.tsx # Resource cards display
│   └── common/
│       └── GlossaryTooltip.tsx  # Medical terms tooltip
```

## Features

### 1. Three-Panel Layout
- **Left**: Lesson index with accordion modules, search, completion states
- **Center**: Video player, lesson content, navigation
- **Right**: Resources, notes, glossary tabs

### 2. Immersive Mode
- Press `F` key to toggle
- Hides sidebars, maximizes content
- Sticky video when scrolling

### 3. Mobile Experience
- Left panel becomes drawer
- Floating index button
- Compact progress bar
- Touch-friendly navigation

### 4. Keyboard Navigation
- Arrow Left/Right: Navigate lessons
- F: Toggle immersive mode

### 5. Optimistic UI
- Instant completion feedback
- Confetti animation on completion
- Progress updates immediately

## Components

### CourseLayoutOS
Main wrapper providing the 3-panel structure with responsive behavior.

### LessonIndexPanel
- Accordion-style module list
- Search functionality
- Visual completion states
- Resource type icons

### LessonContent
- Premium video player
- Sticky video on scroll
- Animated transitions between lessons

### LessonFooter
- Previous/Next navigation
- Completion button with confetti
- Sticky positioning

### LessonSidePanel
Tabbed interface with:
- **Resources**: Downloadable materials
- **Notes**: Personal notes per lesson
- **Glossary**: Medical terms definitions

## Styling

Uses design system tokens from `index.css`:
- `--primary`, `--secondary` for brand colors
- `--card`, `--muted` for surfaces
- Framer Motion for animations

## Integration with Supabase

- Lessons loaded from `lessons` table
- Progress tracked in `user_progress`
- Materials from `lesson_materials`
- Videos from `lesson_videos`

## Accessibility

- `aria-current` for active lesson
- Keyboard navigation support
- Focus management
- Screen reader labels
