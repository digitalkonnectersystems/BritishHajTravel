# British Hajj Travel UK — Next.js Application

A modern, full-stack Next.js application built for **British Hajj Travel UK** — a licensed Canadian travel agency specializing in Hajj & Umrah pilgrimages, Saudi visa processing, and global airline ticketing.

---

## 🚀 Key Features

### Frontend (Client-Facing Site)
- **Header Navigation**: Responsive navigation bar with custom dropdowns (`About Us` → `LICENSES`)
- **Hero & Search Cards**: Dynamic hero banners with interactive package search and filter widgets.
- **Packages Showcase**: Dedicated pages for **Umrah Packages** (`/umrah-packages`), **Hajj Packages** (`/hajj-packages`), **Deluxe Hajj 2027**, and **Economy Hajj 2027**.
- **Services & Visas**: Specialized landing pages for **Saudi Visa Services** (`/saudi-visa`) and **Airline Tickets** (`/airlines`).
- **Trust Badges & Testimonials**: Fully integrated accreditation badges (ACTA, ATAC, TICO, IATA, ASTA, ATOL, ABTA) and Google Reviews carousel with verified ratings.
- **Progressive Reveal Animations**: Smooth scroll-triggered animations optimized for zero-blank SSR page rendering.


---

## 🛠️ Technology Stack

- **Framework**: Next.js 16+ (App Router & Turbopack)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 & Custom Global Design Tokens (`globals.css`)
- **Database ORM**: Drizzle ORM
- **Database Client**: MySQL2
- **Icons**: Font Awesome 6.5.1 & Lucide Icons

---

## 📦 Getting Started

### 1. Prerequisites
Ensure you have Node.js (v24+) installed on your machine.

### 2. Install Dependencies
You can install all dependencies at once using `npm install` (recommended if you have a `package.json`), or run the explicit commands below to install packages individually:

**Production Dependencies:**
```bash
npm install @tiptap/extension-image @tiptap/extension-link @tiptap/extension-text-align @tiptap/extension-underline @tiptap/pm @tiptap/react @tiptap/starter-kit @types/nodemailer drizzle-orm lucide-react mysql2 next nodemailer react react-dom
```

**Development Dependencies:**
```bash
npm install -D @tailwindcss/postcss @types/node @types/react @types/react-dom @types/uuid drizzle-kit tailwindcss typescript
```

### 3. Database Setup & Migrations
```bash
# Generate database migrations
npm run db:generate

# Push schema changes to database
npm run db:push

# Launch Drizzle Studio UI
npm run db:studio
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚙️ Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Next.js development server. |
| `npm run build` | Compiles the production build. |
| `npm run start` | Runs the compiled production server. |
| `npm run lint` | Runs Next.js linter checks. |
| `npm run db:generate` | Generates Drizzle migration files based on schema changes. |
| `npm run db:push` | Directly pushes schema updates to the connected MySQL database. |
| `npm run db:studio` | Launches Drizzle Studio in the browser to view/edit database records. |

