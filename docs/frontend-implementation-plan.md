# Code Snippet Manager Frontend Implementation Plan

## Overview

We'll build a Next.js application with a four-area layout that allows users to manage code snippets, categories, and tags. We'll focus on core features first and use shadcn/ui components with CodeMirror for the code editor.

## Current Project Status

The project has a basic Next.js setup with:
- Next.js 15.3.2 with App Router
- React 19.0.0
- Tailwind CSS 4
- TypeScript
- Geist fonts (Sans and Mono)
- Basic layout structure

## Implementation Plan

### Phase 1: Setup and Configuration (2 days)

1. **Install Required Dependencies**
   - shadcn/ui components via CLI
   - Zustand for state management
   - CodeMirror for code editing
   - Other utility libraries

2. **Setup shadcn/ui Components**
   - Install and configure shadcn/ui CLI
   - Add necessary components (Button, Dialog, Dropdown, etc.)
   - Configure component theming

3. **Configure Theme and Styling**
   - Extend Tailwind configuration for custom colors
   - Set up dark/light mode support
   - Create design tokens for consistent styling

### Phase 2: Core Structure Implementation (3 days)

1. **Create Layout Components**
   - Implement the main layout with four areas:
     - Top menu bar
     - Left sidebar
     - Middle snippet list
     - Right detail/edit area
   - Create responsive layout with mobile support

2. **Implement State Management**
   - Set up Zustand store with the structure from the design doc
   - Create store slices for different data types (snippets, categories, tags)
   - Implement UI state management (current view, selected snippet, etc.)

3. **Setup API Client**
   - Create API client for backend communication
   - Implement API endpoints for all CRUD operations
   - Add error handling and loading states

### Phase 3: Feature Implementation (5 days)

1. **Implement Sidebar Navigation**
   - Create sidebar component with collapsible sections
   - Implement navigation items for categories, tags
   - Add create/edit functionality for navigation items

2. **Build Snippet List Component**
   - Create snippet list with search functionality
   - Implement virtual list for performance
   - Add sorting and filtering options

3. **Create Snippet Detail/Edit Area**
   - Build snippet detail view with syntax highlighting
   - Create snippet edit form with validation
   - Implement tag input and category selection

4. **Implement Code Editor**
   - Integrate CodeMirror
   - Add language selection and syntax highlighting
   - Implement editor themes and settings

### Phase 4: Integration and Connectivity (3 days)

1. **Connect Components with State**
   - Wire up UI components with Zustand store
   - Implement state updates on user actions
   - Add optimistic updates for better UX

2. **Implement API Integration**
   - Connect state management with API client
   - Add data fetching and caching
   - Implement error handling and retry logic

### Phase 5: Polish and Refinement (2 days)

1. **Add Search Functionality**
   - Implement real-time search with debouncing
   - Add search results highlighting

2. **Implement Responsive Design**
   - Optimize layout for mobile devices
   - Add responsive behaviors for different screen sizes

3. **Add Error Handling and Feedback**
   - Create toast notifications for user feedback
   - Implement error boundaries for component errors
   - Add loading states and skeletons

## Directory Structure

```
frontend/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Main layout
│   ├── page.tsx                  # Home page
│   ├── snippets/
│   │   ├── [id]/page.tsx         # Snippet detail page
│   │   └── page.tsx              # All snippets page
│   ├── categories/
│   │   ├── [id]/page.tsx         # Category snippets page
│   │   └── page.tsx              # Categories management
│   └── tags/
│       ├── [id]/page.tsx         # Tag snippets page
│       └── page.tsx              # Tags management
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── layout/
│   │   ├── top-menu-bar.tsx
│   │   ├── sidebar.tsx
│   │   ├── snippet-list.tsx
│   │   └── snippet-detail.tsx
│   ├── snippets/
│   │   ├── snippet-form.tsx
│   │   ├── snippet-item.tsx
│   │   └── code-block.tsx
│   ├── categories/
│   └── tags/
├── lib/
│   ├── store/                    # Zustand store
│   │   ├── index.ts
│   │   ├── snippets.ts
│   │   ├── categories.ts
│   │   └── tags.ts
│   ├── api/                      # API client
│   │   ├── index.ts
│   │   ├── snippets.ts
│   │   ├── categories.ts
│   │   └── tags.ts
│   └── utils/                    # Utility functions
└── types/                        # TypeScript types
```

## Key Components Implementation

### 1. Main Layout (app/layout.tsx)

The main layout will implement the four-area structure:
- Top menu bar with app title and settings
- Left sidebar with navigation
- Middle snippet list with search
- Right detail/edit area

### 2. State Management (lib/store/index.ts)

Zustand store with the following structure:
- Data states (snippets, categories, tags)
- UI states (current view, selected snippet, editor mode)
- Loading states
- Actions for data manipulation

### 3. Snippet List (components/layout/snippet-list.tsx)

- List of snippets with search functionality
- Filtering based on current view (all, category, tag, favorites, recycle bin)
- Sorting options

### 4. Snippet Detail (components/layout/snippet-detail.tsx)

- View mode with syntax highlighting
- Edit mode with form
- Actions (favorite, edit, delete)

### 5. Code Editor (components/snippets/snippet-form.tsx)

- CodeMirror integration
- Language selection
- Syntax highlighting

## Implementation Approach

1. **Incremental Development**
   - Start with core layout and navigation
   - Add basic CRUD functionality
   - Implement advanced features later

2. **Mock Data First**
   - Use mock data for initial development
   - Replace with API calls when backend is ready

3. **Mobile-First Design**
   - Design for mobile first
   - Enhance for larger screens

4. **Component-Based Architecture**
   - Build reusable components
   - Use composition for complex UIs

## Next Steps

1. Set up the project with required dependencies
2. Implement the core layout structure
3. Create basic components with mock data
4. Connect components with state management
5. Integrate with backend API when ready