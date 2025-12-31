# Architecture Document

**Project:** The Neural Stream (Hacker News Reader)\
**Version:** 1.0\
**Last Updated:** 2025-12-31

## Table of Contents

1. [Overview](#overview)
2. [Architectural Principles](#architectural-principles)
3. [Layered Architecture](#layered-architecture)
4. [Domain-Driven Design (DDD)](#domain-driven-design-ddd)
5. [Technical Stack](#technical-stack)
6. [Design Patterns](#design-patterns)
7. [Data Flow](#data-flow)
8. [Component Architecture](#component-architecture)
9. [Performance & Caching](#performance--caching)
10. [Error Handling](#error-handling)
11. [Testing Strategy](#testing-strategy)
12. [Future Considerations](#future-considerations)

---

## Overview

The Neural Stream is a Next.js 16+ application that reimagines the Hacker News
reading experience through a "Focus Stream" interface. The architecture follows
**Domain-Driven Design (DDD)** principles with a clear separation of concerns
across multiple layers.

### Core Design Philosophy

- **Separation of Concerns**: Clean boundaries between domain logic,
  infrastructure, and presentation
- **Type Safety**: Comprehensive TypeScript usage throughout the application
- **Server-First**: Leverage React Server Components for optimal performance
- **URL-Driven State**: The URL is the single source of truth for application
  state
- **Progressive Enhancement**: Core functionality works without JavaScript,
  enhanced with client-side interactivity

---

## Architectural Principles

### 1. Domain-Driven Design (DDD)

The application strictly separates business logic from infrastructure concerns:

- **Domain Layer**: Pure TypeScript entities and interfaces
- **Infrastructure Layer**: External API integration, data transformation
- **Application Layer**: Next.js App Router pages and routing
- **Presentation Layer**: React components (Server & Client)

### 2. Anti-Corruption Layer (ACL)

The `HNApiMapper` acts as an ACL, preventing external API quirks from leaking
into the domain:

- Transforms raw HN Firebase API responses into domain entities
- Sanitizes HTML content
- Handles deleted/dead comments
- Normalizes data types (e.g., number IDs → string IDs)

### 3. Repository Pattern

The `HNFirebaseRepository` encapsulates all external data fetching:

- Implements the `IHNRepository` interface
- Manages caching strategies
- Provides a clean API for the application layer
- Enables easy testing and future API swaps

### 4. Type-Driven Development

Strong TypeScript types guide development:

- Domain entities are well-defined interfaces
- Type guards (`isStory`, `isComment`) enable safe polymorphism
- No `any` types in production code

---

## Layered Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│  (React Server Components + Client Components)              │
│  - app/page.tsx, app/item/[id]/page.tsx                    │
│  - components/ui/*                                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                         │
│  (Next.js App Router, Routing, Server Actions)              │
│  - Route handlers                                            │
│  - Metadata generation                                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      Domain Layer                            │
│  (Pure TypeScript - Business Logic)                         │
│  - domain/entities/Story.ts                                 │
│  - domain/entities/Comment.ts                               │
│  - domain/entities/StreamNode.ts                            │
│  - domain/interfaces/IHNRepository.ts                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  Infrastructure Layer                        │
│  (External APIs, Data Transformation)                       │
│  - infrastructure/repositories/HNFirebaseRepository.ts      │
│  - infrastructure/mappers/HNApiMapper.ts (ACL)             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    External Systems                          │
│  (Hacker News Firebase API)                                 │
└─────────────────────────────────────────────────────────────┘
```

### Layer Responsibilities

#### Domain Layer (`/src/domain`)

**Purpose**: Contains pure business logic and domain models

**Rules**:

- No external dependencies (no imports from infrastructure or app layers)
- No framework-specific code
- Only TypeScript types and pure functions
- Defines interfaces for repositories (dependency inversion)

**Files**:

- `entities/Story.ts` - Story domain entity
- `entities/Comment.ts` - Comment domain entity
- `entities/StreamNode.ts` - Polymorphic type for Story | Comment
- `interfaces/IHNRepository.ts` - Repository contract

#### Infrastructure Layer (`/src/infrastructure`)

**Purpose**: Implements external integrations and data access

**Rules**:

- Implements domain interfaces
- Handles all external API calls
- Transforms external data to domain entities
- Manages caching and performance optimizations

**Files**:

- `repositories/HNFirebaseRepository.ts` - HN API integration
- `mappers/HNApiMapper.ts` - Anti-Corruption Layer

#### Application Layer (`/src/app`)

**Purpose**: Next.js routing and page orchestration

**Rules**:

- Uses domain entities and repository interfaces
- Handles routing and navigation
- Generates metadata for SEO
- Coordinates between domain and presentation layers

**Files**:

- `page.tsx` - Homepage (top stories)
- `item/[id]/page.tsx` - Item detail page
- `layout.tsx` - Root layout
- `item/[id]/error.tsx` - Error boundary
- `item/[id]/loading.tsx` - Loading state

#### Presentation Layer (`/src/components`)

**Purpose**: React components for UI rendering

**Rules**:

- Server Components by default
- Client Components only when needed (interactivity)
- Receives domain entities as props
- No direct API calls (use repositories)

**Files**:

- `ui/Stack.tsx` - Breadcrumb navigation (Client)
- `ui/FocusCard.tsx` - Main content display (Server)
- `ui/Carousel.tsx` - Reply cards carousel (Client)
- `ui/ReplyCard.tsx` - Individual reply card (Server)
- `ui/StoryCard.tsx` - Story card for homepage (Server)
- `KeyboardHandler.tsx` - Keyboard navigation (Client)

---

## Domain-Driven Design (DDD)

### Domain Entities

#### StreamNode (Union Type)

```typescript
type StreamNode = Story | Comment;
```

A polymorphic type representing any focusable item in the stream. Enables
type-safe handling of both stories and comments.

#### Story Entity

Represents a Hacker News story or job posting.

**Properties**:

- `id`: Unique identifier
- `title`: Story title
- `url`: External link (optional)
- `author`: Username of submitter
- `points`: Score/upvotes
- `commentCount`: Number of descendants
- `timestamp`: Unix timestamp
- `text`: Story text (for Ask HN, etc.)
- `childIds`: Array of direct reply IDs

#### Comment Entity

Represents a comment in a discussion thread.

**Properties**:

- `id`: Unique identifier
- `author`: Username of commenter
- `text`: Comment HTML content
- `timestamp`: Unix timestamp
- `childIds`: Array of direct reply IDs
- `parentId`: ID of parent story/comment
- `isDeleted`: Soft delete flag

### Domain Interfaces

#### IHNRepository

```typescript
interface IHNRepository {
  getStreamNode(id: string): Promise<StreamNode>;
  getTopStories(limit?: number): Promise<Story[]>;
}
```

Defines the contract for data access. Enables dependency inversion and
testability.

### Type Guards

```typescript
function isStory(node: StreamNode): node is Story;
function isComment(node: StreamNode): node is Comment;
```

Enable safe type narrowing when working with `StreamNode` union types.

---

## Technical Stack

### Core Technologies

| Technology       | Version  | Purpose                              |
| ---------------- | -------- | ------------------------------------ |
| **Next.js**      | 16.1.1   | React framework with App Router      |
| **React**        | 19.2.3   | UI library with Server Components    |
| **TypeScript**   | 5.x      | Type safety and developer experience |
| **Tailwind CSS** | 4.1.18   | Utility-first styling                |
| **Turbopack**    | Built-in | Fast bundler for development         |

### Key Features Used

#### Next.js App Router

- **Server Components**: Default for all components, client components only when
  needed
- **Streaming**: `<Suspense>` boundaries for progressive rendering
- **Dynamic Routes**: `/item/[id]` for parameterized pages
- **Metadata API**: `generateMetadata` for SEO
- **Error Boundaries**: `error.tsx` for graceful error handling
- **Loading States**: `loading.tsx` for skeleton UIs

#### React 19 Features

- **Server Components**: Fetch data on the server, zero client JS
- **Suspense**: Declarative loading states
- **Server Actions**: (Future) For mutations like voting

#### Caching Strategy

```typescript
// Next.js fetch cache configuration
const CACHE_CONFIG = {
  topStories: { revalidate: 300 }, // 5 minutes
  item: { revalidate: 3600 }, // 1 hour
};
```

---

## Design Patterns

### 1. Repository Pattern

**Problem**: Direct API calls in components create tight coupling and make
testing difficult.

**Solution**: Encapsulate data access behind a repository interface.

**Implementation**:

```typescript
// Domain defines the interface
interface IHNRepository {
  getStreamNode(id: string): Promise<StreamNode>;
}

// Infrastructure implements it
class HNFirebaseRepository implements IHNRepository {
  async getStreamNode(id: string): Promise<StreamNode> {
    // Fetch from API, transform to domain entity
  }
}
```

### 2. Anti-Corruption Layer (ACL)

**Problem**: External APIs have quirks (deleted flags, HTML encoding,
inconsistent types).

**Solution**: Transform external data at the boundary.

**Implementation**:

```typescript
class HNApiMapper {
  static toStreamNode(item: HNItem): StreamNode {
    // Transform raw API data to clean domain entity
  }

  private static sanitizeHtml(html: string): string {
    // Strip signatures, clean HTML
  }
}
```

### 3. Singleton Pattern

**Problem**: Multiple instances of repository create unnecessary overhead.

**Solution**: Export a singleton instance.

**Implementation**:

```typescript
export const hnRepository = new HNFirebaseRepository();
```

### 4. Type Guard Pattern

**Problem**: Union types require runtime type checking.

**Solution**: Type guard functions for safe narrowing.

**Implementation**:

```typescript
function isStory(node: StreamNode): node is Story {
  return "title" in node;
}
```

### 5. Composition over Inheritance

**Problem**: Deep component hierarchies are hard to maintain.

**Solution**: Compose small, focused components.

**Example**: `FocusCard` composes different content based on `StreamNode` type.

---

## Data Flow

### 1. Homepage Flow (Top Stories)

```
User visits /
    ↓
app/page.tsx (Server Component)
    ↓
hnRepository.getTopStories()
    ↓
HNFirebaseRepository.getTopStories()
    ↓
Fetch from HN API (with cache)
    ↓
HNApiMapper.toStory() (ACL)
    ↓
Return Story[] to page
    ↓
Render StoryCard components
    ↓
Stream HTML to client
```

### 2. Item Detail Flow

```
User clicks story → Navigate to /item/[id]
    ↓
app/item/[id]/page.tsx (Server Component)
    ↓
hnRepository.getStreamNode(id)
    ↓
HNFirebaseRepository.getStreamNode(id)
    ↓
Fetch from HN API (with cache)
    ↓
HNApiMapper.toStreamNode() (ACL)
    ↓
Return StreamNode to page
    ↓
Render FocusCard (Server) + Carousel (Client)
    ↓
Suspense boundary for child comments
    ↓
Stream HTML to client
```

### 3. Navigation Flow (Client-Side)

```
User clicks reply card in Carousel
    ↓
KeyboardHandler or onClick handler
    ↓
router.push('/item/[childId]')
    ↓
Next.js soft navigation (no full reload)
    ↓
Server Component re-renders with new data
    ↓
Client receives streamed HTML
    ↓
React hydrates new content
```

---

## Component Architecture

### Server vs Client Components

#### Server Components (Default)

**When to use**:

- Fetching data
- Accessing backend resources
- Rendering static content
- SEO-critical content

**Examples**:

- `app/page.tsx` - Fetches top stories
- `app/item/[id]/page.tsx` - Fetches item details
- `FocusCard` - Renders main content
- `StoryCard` - Renders story previews
- `ReplyCard` - Renders individual replies

**Benefits**:

- Zero client JavaScript
- Direct database/API access
- Automatic code splitting
- Better SEO

#### Client Components

**When to use**:

- Interactivity (onClick, onChange)
- Browser APIs (localStorage, window)
- React hooks (useState, useEffect)
- Event listeners

**Examples**:

- `Stack` - Breadcrumb navigation with state
- `Carousel` - Horizontal scrolling with selection state
- `KeyboardHandler` - Global keyboard event listener

**Directive**: `'use client'` at top of file

### Component Hierarchy

```
app/layout.tsx (Server)
├── KeyboardHandler (Client)
└── app/page.tsx (Server)
    └── StoryCard[] (Server)

app/item/[id]/page.tsx (Server)
├── Stack (Client)
├── FocusCard (Server)
└── Carousel (Client)
    └── Suspense
        └── ReplyCard[] (Server)
```

### Component Responsibilities

| Component         | Type   | Responsibility                              |
| ----------------- | ------ | ------------------------------------------- |
| `Stack`           | Client | Display breadcrumb trail, handle navigation |
| `FocusCard`       | Server | Render main story/comment content           |
| `Carousel`        | Client | Horizontal scrolling, keyboard selection    |
| `ReplyCard`       | Server | Render individual reply preview             |
| `StoryCard`       | Server | Render story on homepage                    |
| `KeyboardHandler` | Client | Global keyboard shortcuts                   |

---

## Performance & Caching

### Next.js Caching Strategy

#### 1. Data Cache (fetch)

```typescript
// Top stories: 5-minute cache
fetch(url, { next: { revalidate: 300 } });

// Individual items: 1-hour cache
fetch(url, { next: { revalidate: 3600 } });
```

#### 2. Full Route Cache

Server Component output is cached at the route level. Revalidates based on data
cache.

#### 3. Router Cache

Client-side navigation cache. Soft navigations reuse cached Server Component
payloads.

### Performance Optimizations

1. **Server Components**: Reduce client bundle size
2. **Streaming**: Progressive rendering with `<Suspense>`
3. **Parallel Data Fetching**: `Promise.all` for top stories
4. **Image Optimization**: (Future) Use `next/image` for avatars
5. **Code Splitting**: Automatic per-route splitting

### Performance Targets

- **Time to First Byte (TTFB)**: < 200ms
- **First Contentful Paint (FCP)**: < 1s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3s

---

## Error Handling

### Error Boundaries

#### Route-Level Error Boundary

```typescript
// app/item/[id]/error.tsx
export default function Error({ error, reset }) {
  return (
    <div>
      <h2>Failed to load item</h2>
      <button onClick={reset}>Retry</button>
    </div>
  );
}
```

### Repository Error Handling

```typescript
async getStreamNode(id: string): Promise<StreamNode> {
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch item ${id}`);
  }
  
  const data = await response.json();
  
  if (!data) {
    throw new Error(`Item ${id} not found`);
  }
  
  return HNApiMapper.toStreamNode(data);
}
```

### Error Types

1. **Network Errors**: API unavailable, timeout
2. **Not Found**: Item deleted or doesn't exist
3. **Parsing Errors**: Unexpected API response format
4. **Client Errors**: Navigation failures, state corruption

---

## Testing Strategy

### Unit Tests

**Target**: Domain entities, mappers, utilities

```typescript
// Example: HNApiMapper.test.ts
describe("HNApiMapper", () => {
  it("should transform HN story to domain Story", () => {
    const hnItem = { id: 123, type: "story", title: "Test" };
    const story = HNApiMapper.toStory(hnItem);
    expect(story.id).toBe("123");
  });
});
```

### Integration Tests

**Target**: Repository implementations

```typescript
// Example: HNFirebaseRepository.test.ts
describe("HNFirebaseRepository", () => {
  it("should fetch and transform top stories", async () => {
    const stories = await hnRepository.getTopStories(5);
    expect(stories).toHaveLength(5);
    expect(stories[0]).toHaveProperty("title");
  });
});
```

### Component Tests

**Target**: React components (Server & Client)

```typescript
// Example: FocusCard.test.tsx
describe('FocusCard', () => {
  it('should render story with title', () => {
    const story = { id: '1', title: 'Test Story', ... };
    render(<FocusCard node={story} />);
    expect(screen.getByText('Test Story')).toBeInTheDocument();
  });
});
```

### End-to-End Tests

**Target**: User flows (Playwright/Cypress)

```typescript
// Example: navigation.spec.ts
test("should navigate from homepage to story", async ({ page }) => {
  await page.goto("/");
  await page.click("text=First Story");
  await expect(page).toHaveURL(/\/item\/\d+/);
});
```

---

## Future Considerations

### Scalability

1. **State Management**: Consider Zustand/Jotai if client state grows
2. **API Rate Limiting**: Implement request throttling
3. **CDN**: Deploy to edge network (Vercel Edge)
4. **Database**: Add PostgreSQL for user data (votes, saved items)

### Features

1. **User Authentication**: NextAuth.js for login
2. **Voting**: Server Actions for upvoting
3. **Search**: Algolia HN Search API integration
4. **Offline Support**: Service Worker + IndexedDB
5. **Real-time Updates**: WebSocket for live comments

### Architecture Evolution

1. **Microservices**: Extract HN API proxy as separate service
2. **GraphQL**: Add GraphQL layer for flexible querying
3. **Event Sourcing**: Track user interactions for analytics
4. **CQRS**: Separate read/write models for complex features

---

## Conclusion

The Neural Stream architecture prioritizes:

1. **Maintainability**: Clear separation of concerns via DDD
2. **Performance**: Server Components + aggressive caching
3. **Type Safety**: Comprehensive TypeScript coverage
4. **Testability**: Dependency inversion via repository pattern
5. **Scalability**: Modular design ready for feature growth

The architecture is production-ready while remaining flexible for future
enhancements.
