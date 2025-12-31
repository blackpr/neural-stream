# The Neural Stream

> A radically reimagined Hacker News reader with a focus stream interface.

**The Neural Stream** is a specialized Hacker News client designed for
high-density information consumption with a "Cyber Terminal" aesthetic. It
emphasizes keyboard navigation, readability, and a unique "Focus Stream" user
experience.


https://github.com/user-attachments/assets/1fdcdc50-9af5-47ca-9e94-63f706251a12


## ✨ Features

- **Focus Stream Interface**: A linear, distraction-free reading mode.
- **Cyber Terminal Aesthetic**: High-contrast, monochromatic design with
  distinct typography (JetBrains Mono & Crimson Pro).
- **Keyboard-First Navigation**: Optimized for mouse-free interaction.
- **Hybrid View Modes**: Switch between Grid and List layouts.
- **Deep Discussion Threads**: Optimized rendering of nested Hacker News
  comments.
- **Real-Time Updates**: Powered by TanStack Query for efficient data fetching
  and caching.

## 🛠️ Technology Stack

Built with the latest modern web technologies:

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **State Management & Data fetching**:
  [TanStack Query v5](https://tanstack.com/query/latest)
- **UI Library**: [React 19](https://react.dev/)
- **Fonts**: [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono)
  (UI/Code) & [Crimson Pro](https://fonts.google.com/specimen/Crimson+Pro)
  (Content)

## 📂 Project Structure

The project follows a Domain-Driven Design (DDD) inspired structure:

```
src/
├── app/               # Next.js App Router pages and layouts
├── components/        # Reusable UI components
├── domain/            # Core business logic and type definitions
├── infrastructure/    # External services, API repositories, and providers
│   ├── api/           # Hacker News / Algolia API clients
│   ├── mappers/       # Data transformation layers
│   ├── repositories/  # Data access abstractions
│   └── providers/     # React Context and Query providers
└── lib/               # Utility functions and shared constants
```

## 🚀 Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open the application:** Visit
   [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Build & Deploy

To create a production build:

```bash
npm run build
```

To start the production server:

```bash
npm start
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
