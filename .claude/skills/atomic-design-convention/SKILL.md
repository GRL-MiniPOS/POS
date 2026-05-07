---
name: atomic-design-convention
description: |
  This project's Atomic Design component architecture — atoms/molecules/organisms layers,
  camelCase filename convention, @/app/components/... absolute import paths, component
  composition style rules (border/margin/padding management), and responsive design baseline.
  Use when creating, placing, or reviewing React components in this codebase.
version: 1.0.0
---

# Atomic Design Convention

> This project uses Atomic Design Pattern paired with Next.js 15 App Router file structure.

## Tech Stack

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Radix UI + shadcn/ui

## Full Project Structure

```text
apps/frontend/
├── src/
│   └── app/
│       ├── components/                # Atomic Design components
│       │   ├── atoms/                 # Atom components
│       │   │   └── index.tsx          # Unified export
│       │   ├── molecules/             # Molecule components
│       │   │   └── index.tsx          # Unified export
│       │   ├── organisms/             # Organism components
│       │   │   └── index.tsx          # Unified export
│       │   ├── templates/             # Template components (as needed)
│       │   └── pages/                 # Page-level components (as needed)
│       ├── hooks/                     # Reusable React Hooks
│       ├── lib/                       # Utilities / API clients / strategy implementations
│       ├── types/                     # TypeScript type definitions
│       ├── fonts/                     # Font assets
│       ├── product/                   # Feature route module
│       ├── order/                     # Feature route module
│       ├── customer/                  # Feature route module
│       ├── report/                    # Feature route module
│       ├── layout.tsx                 # Root layout
│       ├── page.tsx                   # Home page
│       └── globals.css                # Global styles
├── public/                            # Static assets
├── docs/                              # Project docs (human reference, not a dev dependency)
├── .env.local                         # Environment variables (not committed)
└── package.json
```

### Project-Specific Rules

- Layer assignment for new components is based on **reusability + complexity**, not screen position.
- Even when applying **compound component** patterns, all sub-components must remain within their correct atoms / molecules / organisms layer — do not merge layers for co-location convenience.
- Feature route directories (`product/` / `order/` etc.): one `page.tsx` per route; dedicated `mock/` / `components/` subdirectories are allowed; shared logic goes back to `components/` / `hooks/` / `lib/` / `types/`.

### Directory Organization

#### Components Directory

- **atoms/**: The most basic UI elements, cannot be broken down further
  - One file per component; complex components can use a directory
  - Must be exported from `index.tsx`

- **molecules/**: Simple combinations of 2–5 atoms
  - Organized into subdirectories by feature (e.g. `sidebar/`, `order/`)
  - Must be exported from `index.tsx`

- **organisms/**: Complex functional sections
  - Can contain complex business logic
  - Organized by feature module

- **templates/** and **pages/**: Create as needed

#### Feature Module Directories (product/, order/, etc.)

- Follow Next.js App Router conventions
- One `page.tsx` per route
- Can include feature-specific subdirectories (e.g. `mock/`, `components/`)
- Layouts use `layout.tsx`

#### Shared Resource Directories

- **hooks/**: Reusable React Hooks
- **lib/**: Utilities, API clients, strategy patterns, etc.
- **types/**: Shared TypeScript type definitions
- **fonts/**: Custom font files

---

## Component Layer Definitions

This project follows Atomic Design Pattern. Components are divided into five layers by complexity:

### 1. Atoms

**Definition**: The most basic, indivisible UI elements  
**Location**: `src/app/components/atoms/`  
**Examples**: Button, Input, Label, Badge, Avatar, Checkbox, Separator  
**Rules**:

- Single responsibility — does one thing
- Highly reusable
- Contains no business logic
- Typically maps to a single HTML element or basic Radix UI component
- Must be exported from `src/app/components/atoms/index.tsx`

### 2. Molecules

**Definition**: Simple component groups composed of multiple atoms  
**Location**: `src/app/components/molecules/`  
**Examples**: SearchBar (Input + Button), FormField (Label + Input), stockManageListItem  
**Rules**:

- Composed of 2–5 atoms
- Begins to have simple interactive functionality
- Can contain basic state management (useState)
- Reference existing style: `src/app/components/molecules/stock/stockManageListItem.tsx`
- Organized into subdirectories by feature (e.g. stock/, inventoryList/)
- Must be exported from `src/app/components/molecules/index.tsx`

### 3. Organisms

**Definition**: More complex UI sections composed of molecules and atoms  
**Location**: `src/app/components/organisms/` (create if needed)  
**Examples**: Header, Sidebar, ProductTable, InventoryPanel  
**Rules**:

- Forms a distinct interface section
- Can contain complex business logic
- May need to receive API data or manage complex state
- Has complete functionality

### 4. Templates

**Definition**: Layout components that define page structure  
**Location**: `src/app/components/templates/` (create if needed)  
**Examples**: DashboardLayout, ProductPageLayout  
**Rules**:

- Defines the overall structure and layout of a page
- Uses slot/children pattern to place concrete content
- Contains no concrete business data

### 5. Pages

**Definition**: Concrete page instances that combine templates and organisms  
**Location**: `src/app/*/page.tsx` (Next.js App Router convention)  
**Examples**: `src/app/product/add-product/page.tsx`, `src/app/product/inventory-list/page.tsx`  
**Rules**:

- Follows Next.js App Router file structure
- Responsible for data fetching and page-level state management
- Passes data down to child components

---

## General Component Development Rules

- All components must use TypeScript with a complete Props interface
- Use Tailwind CSS utility classes for styling
- Follow the `className` naming patterns of existing components
- Prefer Radix UI primitives (installed: dialog, select, checkbox, scroll-area, popover, tooltip, etc.)
- Component filenames use camelCase (e.g. `button.tsx`, `stockManageListItem.tsx`)
- Props interface naming format: `[ComponentName]Props`

---

## File Naming Convention

```typescript
// Component files
productCard.tsx              // ✅ Use camelCase
ProductCard.tsx              // ❌ Avoid PascalCase
product-card.tsx             // ❌ Avoid kebab-case

// Hook files
useProductList.ts            // ✅ Prefix with use
productListHook.ts           // ❌

// Type files
product.ts                   // ✅ Concise name
productTypes.ts              // ❌ No Types suffix needed

// Test files
productCard.test.tsx         // ✅
productCard.spec.tsx         // ✅
```

---

## Import Path Convention

```typescript
// ✅ Use absolute paths (recommended)
import { Button, Input } from '@/app/components/atoms'
import { ProductCard } from '@/app/components/molecules'
import type { Product } from '@/app/types/product'
import { useAuth } from '@/app/hooks/useAuth'

// ✅ Relative paths (same or child directory)
import { ProductFilter } from './productFilter'
import { helper } from '../utils'

// ❌ Avoid complex relative paths
import { Button } from '../../../components/atoms/button'
```

---

## Component Composition Style Rules

When developing components that will be composed together, consider the following styling rules:

- **Border radius**:
  - Avoid full border radius (`rounded-lg` etc.) on components that will be stacked
  - Consider providing a `position` or `variant` prop to control which corners are rounded
  - Example: `position="first" | "middle" | "last" | "single"`

- **Border control**:
  - Stacked components should avoid setting full borders; let the container manage them
  - Or provide a `showBorder` prop to let the parent control it

- **External spacing**:
  - Components themselves should avoid setting external margin
  - Let the parent use gap, space-y/x, etc. to control spacing
  - Internal padding is managed by the component itself

```tsx
// Composable component design
interface ListItemProps {
  position?: 'first' | 'middle' | 'last' | 'single'
  // ... other props
}

const getRoundedClass = (position?: string) => {
  switch (position) {
    case 'first':
      return 'rounded-t-lg'
    case 'last':
      return 'rounded-b-lg'
    case 'single':
      return 'rounded-lg'
    default:
      return '' // middle needs no border radius
  }
}
```

---

## Component Selection Guide

When creating a new component, decide which layer it belongs to:

- Only one element? → **Atoms**
- Simple combination of 2–5 elements? → **Molecules**
- Complex functional section? → **Organisms**
- Layout frame for an entire page? → **Templates**
- A complete page? → **Pages** (Next.js App Router `page.tsx`)

---

## Responsive Design

- Use Tailwind responsive prefixes: `sm:` `md:` `lg:` `xl:` `2xl:`
- Mobile-first design principle
- Reference existing pages for responsive handling patterns
