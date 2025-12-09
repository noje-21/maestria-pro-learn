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
│   │   ├── LessonIndexPanel.tsx # Left sidebar - search + module accordion
│   │   ├── ModuleAccordion.tsx  # Expandable module with progress
│   │   ├── LessonItem.tsx       # Individual lesson button with states
│   │   ├── LessonContent.tsx    # Center - video player + lesson content
│   │   ├── LessonFooter.tsx     # Navigation + completion with confetti
│   │   ├── LessonSidePanel.tsx  # Right panel - resources, notes, glossary
│   │   ├── CourseProgressBar.tsx # Top sticky progress bar
│   │   ├── CourseTimeline.tsx   # Vertical module timeline
│   │   └── ResourcesSection.tsx # Downloadable resource cards
│   └── common/
│       ├── VideoPlayer.tsx      # Lazy-loaded video player component
│       └── GlossaryTooltip.tsx  # Medical terms tooltip component
├── pages/
│   ├── Lesson.tsx               # Lesson page integrating all components
│   ├── Dashboard.tsx            # Role-based dashboard (admin/student)
│   └── CourseDetail.tsx         # Course overview with hero and timeline
```

## Component Hierarchy

```
CourseLayoutOS
├── CourseProgressBar (sticky top)
├── LessonIndexPanel (left sidebar)
│   ├── Search Input
│   └── ModuleAccordion[] (for each module)
│       └── LessonItem[] (for each lesson)
├── Main Content Area
│   └── LessonContent
│       ├── VideoPlayer (lazy-loaded, single iframe)
│       ├── Lesson Title + Metadata
│       ├── Description Card
│       └── LessonFooter (navigation + complete)
└── LessonSidePanel (right sidebar)
    ├── Resources Tab
    ├── Notes Tab (Supabase synced)
    └── Glossary Tab
```

## Key Features

### 1. Three-Panel Desktop Layout
- **Left Panel (300px)**: Lesson index with accordion modules, search, completion states
- **Center Content**: Video player, lesson metadata, description card
- **Right Panel (320px)**: Tabbed interface for resources, notes, glossary

### 2. VideoPlayer Component
- **Lazy Loading**: Only loads the active video iframe
- **Loading State**: Shows spinner while video loads
- **Lesson Key**: Uses unique key to force re-render on lesson change
- **Multi-video Support**: Selector for lessons with multiple videos
- **Fallback**: Shows image or placeholder when no video

### 3. ModuleAccordion Component
- **Smooth Animations**: Height + opacity transitions
- **Progress Indicator**: Mini progress bar per module
- **Current Highlight**: Visual indicator for module containing active lesson
- **Completion State**: Green styling when all lessons complete

### 4. Immersive Mode
- Toggle with `F` key or button
- Hides both sidebars
- Maximizes content viewing area
- Smooth panel animations

### 5. Mobile Experience
- Left panel transforms to bottom drawer
- Floating "Índice" button for quick access
- Compact progress bar with course title
- Touch-optimized navigation buttons
- Full-width content area with natural scroll
- No `overflow: hidden` issues

### 6. Keyboard Navigation
- `←` / `→`: Navigate between lessons
- `F`: Toggle immersive mode (when not in input fields)

### 7. Notes Persistence
- **Supabase Sync**: Notes saved to `lesson_notes` table
- **Auto-save**: Debounced save (500ms)
- **Status Indicator**: Shows saving/saved/synced
- **Local Backup**: localStorage fallback

## Bug Fixes Applied (v2.2)

1. **Single Video Rendering**: Only the active lesson's video is rendered
2. **Proper Lesson Change**: VideoPlayer uses lessonId as key
3. **Mobile Scroll Fixed**: Removed `overflow: hidden` and `h-screen` restrictions
4. **Stable Layout**: No jumps or overlaps during scroll
5. **Memoized Components**: Prevent unnecessary re-renders
6. **Panel Animations**: Uses `AnimatePresence mode="wait" initial={false}`

## Performance Optimizations

1. **Memoized Components**: All major components use `React.memo`
2. **Lazy Video Loading**: Only active video iframe is mounted
3. **CSS containment**: `overscroll-contain` prevents scroll chaining
4. **Debounced Notes**: Saves only after 500ms of inactivity
5. **Skeleton Loaders**: Immediate visual feedback

## Supabase Integration

| Feature | Table | Notes |
|---------|-------|-------|
| Lessons | `lessons` | Lesson content and metadata |
| Progress | `user_progress` | Completion tracking per user |
| Videos | `lesson_videos` | Multiple videos per lesson |
| Materials | `lesson_materials` | Downloadable resources |
| Modules | `modules` | Group lessons into modules |
| Notes | `lesson_notes` | User notes synced per lesson |

## Accessibility

- `aria-current="page"` on active lesson
- Focus management in panel toggles
- Keyboard navigation fully supported
- Screen reader labels on all interactive elements
- Proper heading hierarchy

## CSS Classes Used

```css
/* Scroll containment */
.overscroll-contain { overscroll-behavior: contain; }

/* Hide scrollbar but allow scroll */
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
```

## Usage Example

```tsx
<CourseLayoutOS
  courseId={courseId}
  courseTitle={courseTitle}
  modules={modules}
  currentLessonId={lessonId}
  progress={progress}
  onLessonSelect={handleLessonSelect}
  materials={materials}
>
  <LessonContent
    lesson={lesson}
    videos={videos}
    moduleName={moduleName}
    completed={completed}
    onComplete={handleComplete}
    onNextLesson={handleNext}
    onPreviousLesson={handlePrevious}
    hasNext={hasNext}
    hasPrevious={hasPrevious}
  />
</CourseLayoutOS>
```
