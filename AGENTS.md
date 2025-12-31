# AI Agents Collaboration Guide

**Project:** The Neural Stream (Hacker News Reader)\
**Version:** 1.0\
**Last Updated:** 2025-12-31

## Table of Contents

1. [Purpose](#purpose)
2. [Project Context](#project-context)
3. [Architectural Guidelines](#architectural-guidelines)
4. [Code Style & Conventions](#code-style--conventions)
5. [Component Development](#component-development)
6. [Domain-Driven Design Rules](#domain-driven-design-rules)
7. [Common Tasks & Patterns](#common-tasks--patterns)
8. [Testing Requirements](#testing-requirements)
9. [Performance Considerations](#performance-considerations)
10. [Troubleshooting Guide](#troubleshooting-guide)

---

## Purpose

This document serves as a guide for AI agents (like Claude, GPT, Gemini) working
on The Neural Stream codebase. It ensures consistency, maintains architectural
integrity, and accelerates development by providing clear patterns and rules.

**Key Principles**:

- Follow Domain-Driven Design (DDD) strictly
- Maintain clear separation between Server and Client Components
- Preserve the "Focus Stream" UX metaphor
- Prioritize type safety and performance

---

## Project Context

### Vision

The Neural Stream transforms Hacker News from a "Wall of Text" into a curated,
focused reading experience. Instead of viewing a tree of comments, users "zoom
in" to specific branches.

### Core Metaphor

- **Depth (Context)**: Stack of breadcrumbs at the top
- **Focus (Reading)**: Single large card in the center
- **Breadth (Options)**: Horizontal carousel of replies at the bottom

### Design Aesthetic

**"Cyber Terminal"** - Neo-brutalist functionality meets Swiss Design:

- **Palette**: True black (`#000000`), neutral grays, HN orange accents
- **Typography**: Inter/Geist Sans (UI), Merriweather/Playfair (content)
- **Interactions**: Snappy, immediate feedback, no slow fades
- **Borders**: Bold 4px orange borders for active elements

---

## Architectural Guidelines

### Layer Separation (CRITICAL)

The codebase follows strict layered architecture. **NEVER violate these rules**:

```
Domain Layer (Pure TS)
    ↑ depends on
Infrastructure Layer (API, Mappers)
    ↑ depends on
Application Layer (Next.js Pages)
    ↑ depends on
Presentation Layer (React Components)
```

#### Rule 1: Domain Layer Purity

**Location**: `/src/domain`

**Rules**:

- ✅ Pure TypeScript interfaces and types
- ✅ Type guards and utility functions
- ❌ NO imports from `infrastructure`, `app`, or `components`
- ❌ NO framework-specific code (React, Next.js)
- ❌ NO external API calls

**Example**:

```typescript
// ✅ GOOD - Pure domain entity
export interface Story {
  id: string;
  title: string;
  url?: string;
  author: string;
  points: number;
  commentCount: number;
  timestamp: number;
  text?: string;
  childIds: string[];
}

// ❌ BAD - Framework dependency
import { useEffect } from "react"; // NEVER in domain layer
```

#### Rule 2: Infrastructure Implements Domain

**Location**: `/src/infrastructure`

**Rules**:

- ✅ Implement domain interfaces (`IHNRepository`)
- ✅ Handle all external API calls
- ✅ Transform external data via Anti-Corruption Layer (ACL)
- ❌ NO direct use in components (use through domain interfaces)

**Example**:

```typescript
// ✅ GOOD - Implements domain interface
export class HNFirebaseRepository implements IHNRepository {
  async getStreamNode(id: string): Promise<StreamNode> {
    const response = await fetch(`${HN_API_BASE}/item/${id}.json`);
    const data = await response.json();
    return HNApiMapper.toStreamNode(data); // ACL transformation
  }
}

// ❌ BAD - Leaking raw API data
async getStreamNode(id: string): Promise<any> { // NO 'any'!
  return await fetch(url).then(r => r.json()); // NO raw API data!
}
```

#### Rule 3: Anti-Corruption Layer (ACL)

**Location**: `/src/infrastructure/mappers/HNApiMapper.ts`

**Purpose**: Prevent external API quirks from leaking into domain

**Rules**:

- ✅ Transform ALL external data through ACL
- ✅ Sanitize HTML content
- ✅ Handle deleted/dead items
- ✅ Normalize types (e.g., `number` → `string` for IDs)

**Example**:

```typescript
// ✅ GOOD - Clean transformation
static toComment(item: HNItem): Comment {
  return {
    id: String(item.id), // Normalize to string
    author: item.by || 'unknown', // Handle missing data
    text: this.sanitizeHtml(item.text || ''), // Sanitize HTML
    isDeleted: item.deleted || item.dead || false, // Explicit flag
    // ... rest of fields
  };
}
```

#### Rule 4: Server Components by Default

**Rules**:

- ✅ Use Server Components for data fetching and static content
- ✅ Use Client Components ONLY for interactivity
- ✅ Mark Client Components with `'use client'` directive
- ❌ NO unnecessary client components

**Decision Tree**:

```
Does it need interactivity (onClick, useState, useEffect)?
├─ YES → Client Component ('use client')
└─ NO → Server Component (default)
```

**Examples**:

```typescript
// ✅ GOOD - Server Component (no directive needed)
export default async function ItemPage({ params }: Props) {
  const node = await hnRepository.getStreamNode(params.id);
  return <FocusCard node={node} />;
}

// ✅ GOOD - Client Component (needs interactivity)
"use client";
export function Carousel({ childIds }: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  // ... interactive logic
}

// ❌ BAD - Unnecessary client component
"use client"; // WHY? No interactivity!
export function StoryCard({ story }: Props) {
  return <div>{story.title}</div>;
}
```

---

## Code Style & Conventions

### TypeScript

#### Type Safety Rules

1. **NO `any` types** - Use `unknown` if type is truly unknown
2. **Explicit return types** for public functions
3. **Interface over type** for object shapes (domain entities)
4. **Type over interface** for unions and primitives

**Examples**:

```typescript
// ✅ GOOD
export async function getStreamNode(id: string): Promise<StreamNode> {
  // ...
}

// ❌ BAD
export async function getStreamNode(id: any): Promise<any> {
  // ...
}
```

#### Naming Conventions

| Type       | Convention                           | Example                |
| ---------- | ------------------------------------ | ---------------------- |
| Interfaces | PascalCase, `I` prefix for contracts | `IHNRepository`        |
| Types      | PascalCase                           | `StreamNode`           |
| Classes    | PascalCase                           | `HNFirebaseRepository` |
| Functions  | camelCase                            | `getStreamNode`        |
| Constants  | UPPER_SNAKE_CASE                     | `HN_API_BASE`          |
| Components | PascalCase                           | `FocusCard`            |
| Hooks      | camelCase, `use` prefix              | `useExternalLinks`     |

### File Organization

```
/src
  /domain
    /entities
      Story.ts          # One entity per file
      Comment.ts
      StreamNode.ts     # Union type + type guards
    /interfaces
      IHNRepository.ts  # One interface per file
  /infrastructure
    /repositories
      HNFirebaseRepository.ts
    /mappers
      HNApiMapper.ts
  /app
    layout.tsx
    page.tsx
    /item/[id]
      page.tsx
      error.tsx
      loading.tsx
  /components
    /ui
      Stack.tsx         # One component per file
      FocusCard.tsx
      Carousel.tsx
      ReplyCard.tsx
      StoryCard.tsx
    KeyboardHandler.tsx
  /lib
    constants.ts
    useExternalLinks.ts
```

### Import Order

```typescript
// 1. React/Next.js
import { Suspense } from "react";
import Link from "next/link";

// 2. Domain layer
import { isStory, StreamNode } from "@/domain/entities/StreamNode";

// 3. Infrastructure layer
import { hnRepository } from "@/infrastructure/repositories/HNFirebaseRepository";

// 4. Components
import { FocusCard } from "@/components/ui/FocusCard";

// 5. Utilities
import { HN_API_BASE } from "@/lib/constants";

// 6. Styles (if any)
import styles from "./styles.module.css";
```

---

## Component Development

### Server Component Pattern

**When**: Data fetching, SEO-critical content, static rendering

**Template**:

```typescript
// NO 'use client' directive

import { hnRepository } from "@/infrastructure/repositories/HNFirebaseRepository";
import { StreamNode } from "@/domain/entities/StreamNode";

interface Props {
  id: string;
}

export default async function ItemPage({ params }: { params: Props }) {
  // Fetch data directly in component
  const node = await hnRepository.getStreamNode(params.id);

  return (
    <article>
      <h1>{node.title}</h1>
      {/* Render content */}
    </article>
  );
}
```

### Client Component Pattern

**When**: Interactivity, browser APIs, React hooks

**Template**:

```typescript
"use client"; // REQUIRED at top

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  initialData: SomeType; // Receive data from Server Component parent
}

export function InteractiveComponent({ initialData }: Props) {
  const [state, setState] = useState(initialData);
  const router = useRouter();

  const handleClick = () => {
    // Interactive logic
    router.push("/new-route");
  };

  return (
    <button onClick={handleClick}>
      {state.value}
    </button>
  );
}
```

### Composition Pattern

**Server Component wraps Client Component**:

```typescript
// app/item/[id]/page.tsx (Server)
export default async function ItemPage({ params }: Props) {
  const node = await hnRepository.getStreamNode(params.id);

  return (
    <>
      <Stack /> {/* Client Component */}
      <FocusCard node={node} /> {/* Server Component */}
      <Carousel childIds={node.childIds} /> {/* Client Component */}
    </>
  );
}
```

### Styling Guidelines

**Use Tailwind utility classes**:

```typescript
// ✅ GOOD - Tailwind utilities
<div className="bg-black text-white p-6 rounded-lg border-4 border-orange-500">
  {content}
</div>

// ❌ BAD - Inline styles
<div style={{ backgroundColor: 'black', color: 'white' }}>
  {content}
</div>
```

**Design System Classes**:

```typescript
// Background
bg - black; // Primary background
bg - neutral - 900; // Secondary surfaces
bg - neutral - 800; // Tertiary surfaces

// Text
text - white; // Primary text
text - neutral - 400; // Secondary text
text - neutral - 500; // Tertiary text

// Accent
border - orange - 500; // HN orange accent
text - orange - 500; // HN orange text

// Typography
font - sans; // Inter/Geist (UI)
font - serif; // Merriweather (content)
leading - relaxed; // Comfortable reading
```

---

## Domain-Driven Design Rules

### Adding New Entities

**Process**:

1. Define interface in `/src/domain/entities/[EntityName].ts`
2. Add to union types if polymorphic (e.g., `StreamNode`)
3. Create type guards if needed
4. Update repository interface in `/src/domain/interfaces`
5. Implement in infrastructure layer
6. Add ACL mapper in `/src/infrastructure/mappers`

**Example - Adding a "User" entity**:

```typescript
// 1. /src/domain/entities/User.ts
export interface User {
  id: string;
  username: string;
  karma: number;
  about?: string;
  created: number;
}

// 2. /src/domain/interfaces/IHNRepository.ts
export interface IHNRepository {
  getStreamNode(id: string): Promise<StreamNode>;
  getTopStories(limit?: number): Promise<Story[]>;
  getUser(username: string): Promise<User>; // NEW
}

// 3. /src/infrastructure/mappers/HNApiMapper.ts
export class HNApiMapper {
  static toUser(item: HNUserItem): User {
    return {
      id: item.id,
      username: item.id,
      karma: item.karma || 0,
      about: item.about ? this.sanitizeHtml(item.about) : undefined,
      created: item.created,
    };
  }
}

// 4. /src/infrastructure/repositories/HNFirebaseRepository.ts
export class HNFirebaseRepository implements IHNRepository {
  async getUser(username: string): Promise<User> {
    const response = await fetch(`${HN_API_BASE}/user/${username}.json`);
    const data = await response.json();
    return HNApiMapper.toUser(data);
  }
}
```

### Modifying Existing Entities

**Rules**:

1. Update domain interface first
2. Update ACL mapper
3. Update all consuming components
4. Update tests

**Example - Adding `score` to Comment**:

```typescript
// 1. /src/domain/entities/Comment.ts
export interface Comment {
  // ... existing fields
  score?: number; // NEW - optional for backwards compatibility
}

// 2. /src/infrastructure/mappers/HNApiMapper.ts
static toComment(item: HNItem): Comment {
  return {
    // ... existing fields
    score: item.score, // NEW
  };
}

// 3. Update components that render comments
// /src/components/ui/ReplyCard.tsx
export function ReplyCard({ comment }: Props) {
  return (
    <div>
      <p>{comment.text}</p>
      {comment.score && <span>{comment.score} points</span>}
    </div>
  );
}
```

---

## Common Tasks & Patterns

### Task 1: Adding a New Page

**Example**: Add a user profile page at `/user/[username]`

```typescript
// 1. Create route: /src/app/user/[username]/page.tsx
import { hnRepository } from "@/infrastructure/repositories/HNFirebaseRepository";

interface Props {
  params: { username: string };
}

export default async function UserPage({ params }: Props) {
  const user = await hnRepository.getUser(params.username);

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <h1 className="text-4xl font-bold">{user.username}</h1>
      <p className="text-neutral-400">{user.karma} karma</p>
      {user.about && <div dangerouslySetInnerHTML={{ __html: user.about }} />}
    </main>
  );
}

// 2. Add metadata: generateMetadata function
export async function generateMetadata({ params }: Props) {
  const user = await hnRepository.getUser(params.username);
  return {
    title: `${user.username} | The Neural Stream`,
    description: `Profile of ${user.username} on Hacker News`,
  };
}

// 3. Add loading state: /src/app/user/[username]/loading.tsx
export default function Loading() {
  return <div className="animate-pulse">Loading user...</div>;
}

// 4. Add error boundary: /src/app/user/[username]/error.tsx
"use client";
export default function Error({ error, reset }: Props) {
  return (
    <div>
      <h2>Failed to load user</h2>
      <button onClick={reset}>Retry</button>
    </div>
  );
}
```

### Task 2: Adding a New UI Component

**Example**: Create a `CommentTree` component

```typescript
// 1. Determine if Server or Client Component
// Needs interactivity (expand/collapse)? → Client Component

// 2. Create file: /src/components/ui/CommentTree.tsx
'use client';

import { useState } from 'react';
import { Comment } from '@/domain/entities/Comment';

interface Props {
  comment: Comment;
  depth?: number;
}

export function CommentTree({ comment, depth = 0 }: Props) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  return (
    <div className="ml-4 border-l-2 border-neutral-800 pl-4">
      <button onClick={() => setIsExpanded(!isExpanded)}>
        {isExpanded ? '−' : '+'}
      </button>
      <div dangerouslySetInnerHTML={{ __html: comment.text }} />
      {isExpanded && comment.childIds.map(id => (
        <CommentTree key={id} comment={/* fetch child */} depth={depth + 1} />
      ))}
    </div>
  );
}
```

### Task 3: Adding Keyboard Shortcuts

**Pattern**: Extend `KeyboardHandler.tsx`

```typescript
// /src/components/KeyboardHandler.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function KeyboardHandler() {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Existing shortcuts
      if (e.key === "Escape") router.back();

      // NEW: Add 'h' to go home
      if (e.key === "h") router.push("/");

      // NEW: Add 's' to toggle search
      if (e.key === "s") {
        e.preventDefault();
        // Open search modal
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  return null; // No UI
}
```

### Task 4: Optimizing Performance

**Pattern**: Add caching and streaming

```typescript
// 1. Configure cache in repository
const response = await fetch(url, {
  next: {
    revalidate: 3600, // 1 hour cache
    tags: ["stories"], // For on-demand revalidation
  },
});

// 2. Add Suspense boundaries
import { Suspense } from "react";

export default function Page() {
  return (
    <>
      <Suspense fallback={<Skeleton />}>
        <SlowComponent />
      </Suspense>
      <FastComponent /> {/* Renders immediately */}
    </>
  );
}

// 3. Parallel data fetching
const [stories, user] = await Promise.all([
  hnRepository.getTopStories(),
  hnRepository.getUser("username"),
]);
```

---

## Testing Requirements

### Unit Tests (Domain Layer)

**Location**: `__tests__/domain/`

**Example**:

```typescript
// __tests__/domain/entities/StreamNode.test.ts
import { isComment, isStory } from "@/domain/entities/StreamNode";
import { Story } from "@/domain/entities/Story";
import { Comment } from "@/domain/entities/Comment";

describe("StreamNode type guards", () => {
  it("should identify Story correctly", () => {
    const story: Story = { id: "1", title: "Test" /* ... */
    };
    expect(isStory(story)).toBe(true);
    expect(isComment(story)).toBe(false);
  });
});
```

### Integration Tests (Infrastructure Layer)

**Location**: `__tests__/infrastructure/`

**Example**:

```typescript
// __tests__/infrastructure/repositories/HNFirebaseRepository.test.ts
import { hnRepository } from "@/infrastructure/repositories/HNFirebaseRepository";

describe("HNFirebaseRepository", () => {
  it("should fetch top stories", async () => {
    const stories = await hnRepository.getTopStories(5);
    expect(stories).toHaveLength(5);
    expect(stories[0]).toHaveProperty("title");
    expect(stories[0]).toHaveProperty("id");
  });

  it("should handle errors gracefully", async () => {
    await expect(hnRepository.getStreamNode("invalid"))
      .rejects.toThrow("Failed to fetch item");
  });
});
```

### Component Tests

**Location**: `__tests__/components/`

**Example**:

```typescript
// __tests__/components/ui/FocusCard.test.tsx
import { render, screen } from "@testing-library/react";
import { FocusCard } from "@/components/ui/FocusCard";

describe("FocusCard", () => {
  it("should render story with title", () => {
    const story = {
      id: "1",
      title: "Test Story",
      author: "testuser",
      points: 100,
      commentCount: 10,
      timestamp: Date.now() / 1000,
      childIds: [],
    };

    render(<FocusCard node={story} />);
    expect(screen.getByText("Test Story")).toBeInTheDocument();
  });
});
```

---

## Performance Considerations

### Caching Strategy

```typescript
// /src/lib/constants.ts
export const CACHE_CONFIG = {
  topStories: { revalidate: 300 }, // 5 minutes
  item: { revalidate: 3600 }, // 1 hour
  user: { revalidate: 86400 }, // 24 hours
};
```

### Bundle Size Optimization

1. **Server Components**: Default to reduce client JS
2. **Dynamic Imports**: For heavy client components
   ```typescript
   const HeavyComponent = dynamic(() => import("./HeavyComponent"), {
     loading: () => <Skeleton />,
   });
   ```
3. **Tree Shaking**: Import only what you need
   ```typescript
   // ✅ GOOD
   import { isStory } from "@/domain/entities/StreamNode";

   // ❌ BAD
   import * as StreamNode from "@/domain/entities/StreamNode";
   ```

### Image Optimization

```typescript
import Image from "next/image";

<Image
  src="/avatar.png"
  alt="User avatar"
  width={40}
  height={40}
  loading="lazy"
/>;
```

---

## Troubleshooting Guide

### Common Issues

#### Issue 1: "Cannot use hooks in Server Component"

**Error**: `Error: useState can only be used in Client Components`

**Solution**: Add `'use client'` directive

```typescript
"use client"; // Add this at the top

import { useState } from "react";
```

#### Issue 2: "Module not found" in domain layer

**Error**: `Cannot find module '@/app/...'`

**Solution**: Domain layer should NOT import from app/infrastructure

```typescript
// ❌ BAD - Domain importing from infrastructure
import { hnRepository } from "@/infrastructure/repositories/HNFirebaseRepository";

// ✅ GOOD - Use dependency injection via interfaces
import { IHNRepository } from "@/domain/interfaces/IHNRepository";
```

#### Issue 3: Hydration mismatch

**Error**: `Hydration failed because the initial UI does not match`

**Solution**: Ensure Server and Client render the same initial HTML

```typescript
// ❌ BAD - Client-only data
"use client";
export function Component() {
  const [time] = useState(Date.now()); // Different on server/client!
  return <div>{time}</div>;
}

// ✅ GOOD - Pass server data as prop
export function Component({ serverTime }: { serverTime: number }) {
  return <div>{serverTime}</div>;
}
```

#### Issue 4: Stale cache

**Solution**: Use cache tags for on-demand revalidation

```typescript
// In repository
fetch(url, { next: { tags: ["stories"] } });

// Revalidate programmatically
import { revalidateTag } from "next/cache";
revalidateTag("stories");
```

---

## Quick Reference Checklist

### Before Committing Code

- [ ] TypeScript compiles without errors (`npm run build`)
- [ ] ESLint passes (`npm run lint`)
- [ ] No `any` types in production code
- [ ] Server/Client components correctly marked
- [ ] Domain layer has no external dependencies
- [ ] ACL transforms all external data
- [ ] Components follow design system (Tailwind classes)
- [ ] Error boundaries added for new routes
- [ ] Loading states added for async components
- [ ] Tests written for new functionality
- [ ] Performance: Caching configured appropriately
- [ ] Accessibility: Semantic HTML, ARIA labels
- [ ] SEO: Metadata added for new pages

### When Stuck

1. **Check PRD**: `/docs/PRD.md` - Product requirements and vision
2. **Check Architecture**: `/docs/ARCHITECTURE.md` - System design
3. **Check This Guide**: `/docs/AGENTS.md` - Patterns and examples
4. **Check Existing Code**: Look for similar patterns in codebase
5. **Ask for Clarification**: If requirements are unclear

---

## Conclusion

This guide ensures all AI agents working on The Neural Stream maintain:

1. **Architectural Integrity**: Strict DDD layering
2. **Code Quality**: Type-safe, performant, testable
3. **Consistency**: Unified patterns and conventions
4. **UX Excellence**: "Focus Stream" metaphor preserved

When in doubt, **prioritize simplicity and follow existing patterns**. The
codebase is designed to be maintainable and scalable - keep it that way!
