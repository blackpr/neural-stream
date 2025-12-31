# Product Requirements Document (PRD)

**Project Name:** The Neural Stream (Hacker News Reader) **Version:** 1.6
**Status:** Ready for Development

## 1. Executive Summary

"The Neural Stream" is a web application designed to radically transform the
User Experience (UX) of reading Hacker News. The current "Wall of Text" and
nested tree structures are overwhelming. This project aims to replace vertical
scrolling with a **"Focus Stream"** interface.

**The Core Metaphor:** Instead of viewing a map of the conversation (a tree),
the user "zooms in" to specific branches. The interface treats the conversation
like a curated timeline:

- **Depth (Context):** Handled by a "Stack" of breadcrumbs at the top.

- **Focus (Reading):** A single, large card in the center.

- **Breadth (Options):** A horizontal "Carousel" of reply cards at the bottom.

## 2. Technical Stack Recommendations

- **Framework:** **Next.js 16+ (App Router)**

  - **Architecture:** Hybrid approach. Use **React Server Components (RSC)** for
    the main "Focus" content (SEO & Performance) and **Client Components** for
    the "Carousel" and "Stack" (Interactivity).

  - **React 19:** Leverage modern features like `use()` for promise unwrapping
    and Server Actions if mutations are added later.

  - **Streaming:** Use `<Suspense>` boundaries to render the layout immediately
    while data streams in.

  - **Bundler:** Turbopack.

- **Styling:** **Tailwind CSS** (Assumed pre-installed/configured).

- **State Management:** URL-Driven State via `next/navigation`.

- **Data Source:** Official Hacker News Firebase API
  (`https://hacker-news.firebaseio.com/v0/`).

## 3. Functional Requirements (User Stories)

### Phase 1: Domain Modeling & Data Access (Pragmatic DDD)

**Goal:** Establish a clean separation between the "Hacker News Data Shape" and
the "Neural Stream Domain Shape" to prevent API quirks from leaking into the UI.

**Requirements:**

1. **Domain Entities:**

   - Define clear TypeScript interfaces for the Core Domain:

     - `Story` (The root content).

     - `Comment` (A node in the discussion).

     - `StreamNode` (A polymorphic type representing any focusable item).

   - **Rule:** These entities must _not_ contain raw API flags (like `poll`,
     `parts`, or specific HTML quirks) unless transformed into a domain-useful
     format.

2. **Repository Pattern (Infrastructure Layer):**

   - Implement a `HackerNewsRepository` that encapsulates all external data
     fetching.

   - **Methods:** `getStreamNode(id: string): Promise<StreamNode>`,
     `getTopStories(): Promise<Story[]>`.

   - **Caching:** The Repository is responsible for caching strategies (Next.js
     `fetch` cache tags), ensuring the Domain Layer remains pure.

3. **Anti-Corruption Layer (ACL):**

   - Implement DTO-to-Entity mappers.

   - **Responsibility:**

     - Cleanse HTML (sanitize).

     - Handle "deleted" or "dead" comments (filter or mark explicitly).

     - Resolve relative time to absolute timestamps.

   - This ensures the UI components never crash due to unexpected API data
     shapes.

### Phase 2: The Focus Stream UI Layout

**Goal:** A clean, distraction-free interface fixed to the viewport.

**Requirements:**

1. **The Stack (Client Component):**

   - **Function:** Shows the ancestry.

   - **Note:** Since this requires maintaining history across navigations, this
     must be a Client Component using a React Context or similar to track the
     "path" taken, or strictly derived from URL segments if possible.

2. **The Focus (Server Component):**

   - **Function:** Displays the content currently being read.

   - **Benefit:** Fetched on the server. No client-side "spinner" for the main
     text.

   - **Content Types:** Story (Title/Domain) or Comment (HTML).

3. **The Carousel (Client Component with Suspense):**

   - **Function:** Displays the _immediate children_ of the current focus item.

   - **Loading State:** Wrapped in `<Suspense fallback={<ReplySkeleton />}>`.

   - **Layout:** Horizontal scrolling list (`overflow-x-auto`).

### Phase 3: Interaction & Routing (CRITICAL)

**Goal:** The application must behave like a native web app where the URL is the
single source of truth.

**Requirements:**

1. **URL-Driven State (Next.js App Router):**

   - **Root:** `/` (Server Component) renders top stories.

   - **Item:** `/item/[id]/page.tsx` (Server Component) renders the specific
     story/comment.

2. **Navigation Logic:**

   - **Dive In:** `router.push('/item/{newId}')`. This triggers a server
     round-trip (soft navigation) to fetch the next comment.

   - **Optimistic UI:** (Optional) Use `useOptimistic` to instantly show the
     clicked card moving up before the new data arrives.

3. **Desktop Optimization (Keyboard Shortcuts):**

   - **Global Listener:** Use a `useEffect` in the root layout or a specialized
     Client Component wrapper.

   - **`ArrowRight` / `ArrowLeft`**: Cycle selection in the Carousel.

   - **`Enter`**: Trigger navigation to the selected child.

   - **`Escape`**: Trigger `router.back()`.

### Phase 4: Smart Content Features

**Goal:** Polish the raw content for better readability.

**Requirements:**

1. **Signature Stripping:**

   - Detect and hide common noise patterns in comments (e.g., "-- Sent from my
     iPhone").

2. **Code Block Styling:**

   - Target `<pre><code>` blocks within comments.

   - Apply a distinct background color (e.g., `bg-slate-800`) and monospace
     font.

3. **External Link Handling:**

   - All `<a>` tags within comment text must have `target="_blank"` and
     `rel="noopener noreferrer"`.

## 4. Visual Style Guide (Bold & Production Ready)

**Design Philosophy:** "Neo-Brutalist functionality meets Swiss Design."

- **Aesthetic:** High contrast, sharp edges, confident typography. Avoid subtle
  shadows; use borders and solid colors to define space.

- **Palette:**

  - **Background:** `bg-black` (True black #000000).

  - **Surface:** `bg-neutral-900` (for secondary elements).

  - **Text:** `text-white` (Primary) and `text-neutral-400` (Secondary).

  - **Accent:** `border-orange-500` (Hacker News Orange) - Use sparingly but
    boldly (e.g., 4px borders on active items).

- **Typography:**

  - **Headings/UI:** **Inter** or **Geist Sans** (Tight tracking, heavy weights
    like 700/800 for headers).

  - **Body Content:** **Merriweather** or **Playfair Display** (High readability
    serif, relaxed line-height `leading-relaxed`).

- **Micro-interactions:**

  - **Hover:** Immediate, snappy feedback. No slow fades.

  - **Transitions:** Slide-up animations for new content entering the stream.

## 5. Production Readiness Checklist

1. **Error Handling:**

   - Implement `error.tsx` in the `/item` route to gracefully handle API
     failures or deleted comments.

   - Show a "Retry" button.

2. **Accessibility (A11y):**

   - **Semantic HTML:** Use `<article>`, `<nav>`, and `<main>` tags.

   - **Focus Management:** Ensure keyboard focus moves logically to the new
     content after navigation.

   - **Screen Readers:** Ensure the Carousel cards have
     `aria-label="Reply by [author]"`.

3. **SEO & Metadata:**

   - Use `generateMetadata` in `page.tsx` to set dynamic titles
     (`Story Title | HN Stream`) and OpenGraph descriptions.

## 6. Success Metrics

- **Speed:** Time to load a comment < 200ms.

- **Flow:** A user should be able to read 10 comments in a thread without
  touching the mouse (using only keyboard).

## 7. Proposed Project Structure (Next.js App Router)

```text
/src
  /app                  # Presentation Layer
    layout.tsx
    page.tsx
    /item/[id]
      page.tsx
  /domain               # Domain Layer (Pure TS)
    /entities
      Story.ts
      Comment.ts
    /interfaces
      IHNRepository.ts
  /infrastructure       # Infrastructure Layer
    /repositories
      HNFirebaseRepository.ts
    /mappers
      HNApiMapper.ts    # ACL (Anti-Corruption Layer)
  /components
    /ui                 # Shared UI Components
      Stack.tsx
      Carousel.tsx
  /lib
    constants.ts
```
