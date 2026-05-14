# 🎉 Wishme — Custom Greetings & Wishes App

> A full-stack web application for creating personalized greeting cards. Choose from beautiful templates, add your photo and name, and share customized cards with loved ones — all from your browser.

**Live Demo:** https://wishme-app.vercel.app/

---

## 📸 Screenshots

### Landing Page
![Landing Page](public/screenshots/landing.png)

### Template Dashboard
![Dashboard](public/screenshots/dashboard.png)

### Festival Templates
![Festivals](public/screenshots/festivals.png)

### Canvas Editor
![Editor](public/screenshots/editor.png)

### Login Page
![Login](public/screenshots/login.png)

---

## 🎯 What is Wishme?

Wishme is a community-driven platform for creating and sharing personalized greeting cards. Anyone can pick a beautiful template, overlay their name and photo using a live canvas editor, add animations, and share directly to WhatsApp — all in under 60 seconds.

Beyond simple cards, Wishme has a full Creator Economy: verified designers can publish their own templates to the Community Hub, build a following, and reach thousands of users worldwide. Think Figma Community meets Instagram — but for personalized wishes.

---

## 💡 Architecture & Design Decisions

### Why Next.js 16 (App Router)?

**Next.js** gives us a full-stack framework in a single repo — React for the frontend, API routes as the backend, server-side rendering for SEO on the landing page, and file-based routing that keeps the project structure clean. The App Router supports React Server Components, meaning the landing page ships less JavaScript and loads faster for users on slower mobile connections.

### Why Client-Side Canvas Instead of Server-Side Image Processing?

This was the most important architectural decision. We had two options:

| Approach | Pros | Cons |
|:--|:--|:--|
| **Server-side** (Sharp/ImageMagick) | Works on any device | Server compute costs, latency per render, no live preview |
| **Client-side** (HTML5 Canvas) | Instant live preview, zero server cost, works offline | Requires modern browser |

We went with **HTML5 Canvas API** for three reasons:
1. **Live preview** — Users see changes the instant they type their name or upload a photo. No waiting for a server round-trip.
2. **Zero server cost** — All image compositing happens in the browser. The server only stores template metadata.
3. **Offline-capable** — Once the template image is loaded, the editor works without internet.

### Why MongoDB Atlas (NoSQL) Over PostgreSQL?

Templates have a flexible `overlayConfig` object with nested properties (positions, fonts, colors, shapes). In a relational database, this would require either a JSON column or multiple join tables. MongoDB's document model stores the entire config as a nested object naturally — no schema migrations needed when new overlay features are added.

The **social follow graph** is also a natural fit for MongoDB: each user stores `followers` and `following` as arrays of ObjectIDs, enabling fast, atomic `$addToSet` / `$pull` operations identical to how Instagram and Twitter model their follow relationships.

### Why Auth.js (NextAuth v5)?

Three auth methods are needed: Google OAuth, email/password, and guest mode. Auth.js v5 supports all three out of the box with a unified session API. The JWT strategy means no server-side session storage — the entire session lives in a signed cookie, which deploys trivially on serverless platforms like Vercel.

### Why Custom CSS Over Tailwind?

We chose **CSS Modules with custom properties** instead of Tailwind because:
- Full control over the design system (custom dark theme with glassmorphism effects)
- CSS nesting (a modern CSS feature) keeps styles readable without preprocessors
- CSS Modules provide automatic scoping without class name conflicts
- No build-time dependency on a utility framework

### On the Payment System

The premium system is currently a **mock toggle** — clicking "Upgrade" sets `isPremium: true` in the database instantly. The architecture is designed so swapping in a real payment gateway (Razorpay/Stripe) only requires:
1. Adding a payment route
2. Changing the `/api/user/premium` endpoint to verify payment before toggling
3. Adding webhook handlers for subscription management

This is a great area for contributors to help with!

---

## ✨ Features

### For Users
- **🔐 Multi-Provider Auth** — Sign in with Google, Email/Password, or browse as Guest
- **🎨 Template Gallery** — Browse templates across Birthday, Anniversary, Festivals, Quotes, Shayari, Jokes, and Love categories
- **🖼️ Live Canvas Editor** — Real-time image compositing with circular photo crop and styled name text
- **✨ Dynamic Animations** — Built-in canvas particle effects (Snow, Confetti, Rain, Hearts) with intense text shadow/glow support
- **📤 Native Sharing** — Share via WhatsApp, Instagram, Email using the Web Share API on mobile
- **⬇️ Download** — Export the final card as a high-quality 1080×1080 PNG
- **👑 Premium Templates** — Upgrade to Pro to unlock exclusive designs

### Creator Economy 🌍
- **🎨 Creator Studio** — Verified users can build and publish their own templates directly to the Community feed
- **👥 Public Profiles & Follow Graph** — Dedicated creator profiles with live follower/following counts, PRO/Creator ring badges, and full portfolio grids
- **⚡ Real-time Social Graph** — Lightning-fast NoSQL Follow/Unfollow database connections similar to Instagram
- **🌍 Community Hub** — A public marketplace of user-generated templates with creator-attribution badges

### For Admins
- **📊 Dashboard** — View total templates, users, and premium subscriber counts
- **🎨 Template CRUD** — Add, edit, and delete templates with a visual overlay configurator
- **🖱️ Click-to-Place** — Set photo and name positions by clicking directly on the template image
- **👥 User Management** — Toggle user roles (admin/user) and premium status

---

## 🏗️ High-Level Architecture

```mermaid
graph TB
    subgraph Client["Client (Browser)"]
        UI["Next.js App (React)"]
        Canvas["HTML5 Canvas Engine"]
    end
    
    subgraph Server["Next.js Server (API Routes)"]
        Auth["Auth.js (Google/Email/Guest)"]
        API["REST API Routes"]
        MW["Proxy (Route Protection)"]
        Admin["Admin Panel (Role-Based)"]
    end
    
    subgraph External["External Services"]
        MongoDB["MongoDB Atlas"]
        Cloudinary["Cloudinary CDN"]
    end
    
    UI --> Auth
    UI --> API
    UI --> Canvas
    Canvas -->|"Merged Image Blob"| UI
    API --> MongoDB
    API --> Cloudinary
    MW --> Auth
    Admin --> API
```

### Data Flow: Creating a Greeting Card

```
1. User browses templates     →  GET /api/templates?category=birthday
2. User clicks a template     →  Navigate to /dashboard/editor/[id]
3. Editor loads template data  →  GET /api/templates/[id] (includes overlayConfig)
4. Canvas renders 3 layers:
   ┌─────────────────────────────────────┐
   │  Layer 1: Background Template (PNG) │
   │  Layer 2: User Photo (circular clip)│
   │  Layer 3: User Name (styled text)   │
   └─────────────────────────────────────┘
5. User types name / uploads photo → Canvas re-renders instantly
6. User clicks "Share"        →  canvas.toBlob() → navigator.share()
   User clicks "Download"     →  canvas.toDataURL() → <a download>
```

---

## 🛠️ Tech Stack

| Layer | Technology | Version | Why I Chose It |
|:--|:--|:--|:--|
| **Framework** | Next.js (App Router) | 16.2.4 | Full-stack React with SSR, API routes, file-based routing |
| **UI** | React | 19.2.4 | Component model, hooks, Server Components |
| **Auth** | Auth.js (NextAuth) | v5 beta | Multi-provider auth with JWT sessions |
| **Database** | MongoDB Atlas | — | Flexible documents for overlay configs, free tier |
| **ODM** | Mongoose | 9.6.1 | Schema validation, connection pooling |
| **Password Hashing** | bcryptjs | 3.0.3 | Secure credential storage |
| **Canvas** | HTML5 Canvas API | Native | Client-side image compositing, zero server cost |
| **Sharing** | Web Share API | Native | Native mobile share sheet (WhatsApp, etc.) |
| **Styling** | CSS Modules + Nesting | Native | Scoped styles, dark theme, no framework dependency |
| **Fonts** | Google Fonts (Inter, Outfit) | — | Modern, clean typography |
| **Dev Server** | Turbopack | Built-in | Fast HMR during development |
| **Env Management** | dotenv | 17.4.2 | Seed script environment loading |

---

## 📁 Project Structure

```
wishme/
├── app/
│   ├── layout.js                          # Root layout (fonts, AuthProvider, Navbar)
│   ├── page.js                            # Landing page (SSR — hero, features, CTA)
│   ├── globals.css                        # Design system (CSS custom properties, dark theme)
│   ├── page.module.css                    # Landing page styles
│   │
│   ├── (auth)/login/
│   │   ├── page.js                        # Login (Google, Email, Guest) + Suspense boundary
│   │   └── login.module.css
│   │
│   ├── dashboard/
│   │   ├── page.js                        # Template gallery with category tabs + premium gate
│   │   ├── dashboard.module.css
│   │   └── editor/[templateId]/
│   │       ├── page.js                    # ⭐ Canvas editor — the core feature
│   │       └── editor.module.css
│   │
│   ├── admin/
│   │   ├── layout.js                      # Admin sidebar layout (role-gated)
│   │   ├── page.js                        # Stats dashboard
│   │   ├── admin.module.css               # Shared admin styles
│   │   ├── templates/
│   │   │   ├── page.js                    # Template list + delete
│   │   │   ├── new/page.js               # Add template + overlay configurator
│   │   │   └── edit/[id]/page.js          # Edit template + overlay configurator
│   │   └── users/page.js                  # User management (role/premium toggle)
│   │
│   └── api/
│       ├── auth/[...nextauth]/route.js    # Auth.js handler
│       ├── templates/
│       │   ├── route.js                   # GET (list + filter) / POST (create)
│       │   └── [id]/route.js              # GET / PUT / DELETE single template
│       ├── user/
│       │   ├── route.js                   # GET / PUT user profile
│       │   └── premium/route.js           # POST toggle premium (mock)
│       └── admin/
│           ├── stats/route.js             # GET dashboard stats
│           └── users/route.js             # GET / PUT user management
│
├── components/
│   ├── layout/
│   │   ├── Navbar.js                      # Auth-aware navbar (admin link if role=admin)
│   │   └── Navbar.module.css
│   ├── providers/AuthProvider.js          # SessionProvider wrapper
│   └── editor/
│       ├── PremiumGate.js                 # Upgrade modal (plan comparison)
│       └── PremiumGate.module.css
│
├── lib/
│   ├── auth.js                            # Auth.js config (providers, callbacks, JWT)
│   └── db.js                              # Mongoose connection with caching
│
├── models/
│   ├── User.js                            # User schema (name, email, role, isPremium)
│   └── Template.js                        # Template schema (overlayConfig, category)
│
├── scripts/
│   ├── seed.js                            # Seed DB with 7 custom templates
│   └── make-admin.js                      # Promote user to admin by email
│
├── public/
│   ├── templates/                         # Template images (served statically)
│   ├── screenshots/                       # App screenshots for README
│   └── logo.png                           # Wishme logo
│
├── proxy.js                               # Route protection (replaces middleware.js in Next.js 16)
├── TECHNICAL_APPROACH.md                  # Detailed technical documentation
├── .env.local                             # Secrets (git-ignored)
├── .env.example                           # Credential template (committed)
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ ([download](https://nodejs.org/))
- **MongoDB Atlas** account (free tier) — [setup guide](#mongodb-atlas-setup)
- **Google Cloud Console** project — [setup guide](#google-oauth-setup)

### 1. Clone & Install

```bash
git clone https://github.com/your-username/wishme.git
cd wishme
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual credentials:

```env
# Auth.js — generate a random secret: openssl rand -base64 32
AUTH_SECRET=your-random-secret-string

# Google OAuth — from Google Cloud Console
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret

# MongoDB Atlas — your connection string
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/wishme?retryWrites=true&w=majority

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
ADMIN_EMAIL=your-email@example.com
```

### 3. Seed the Database

```bash
node scripts/seed.js
```

This loads 7 pre-designed templates (2 Birthday, 2 Anniversary, 3 Festival) with overlay positions pre-configured.

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you should see the landing page.

### 5. Create Your Admin Account

1. Sign up on the login page with your email
2. Run the admin promotion script:

```bash
node scripts/make-admin.js your-email@example.com
```

3. Refresh the browser — the **Admin** link appears in the navbar

---

## 🔧 Service Setup Guides

### MongoDB Atlas Setup

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) → Sign up (free)
2. Create a **free M0 cluster** (AWS, region closest to you)
3. **Database Access** → Add user with password (avoid special characters like `@`)
4. **Network Access** → Allow `0.0.0.0/0` (access from anywhere)
5. **Connect** → Copy the connection string → add database name `/wishme` before the `?`

### Google OAuth Setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com) → Create new project
2. **APIs & Services** → **OAuth consent screen** → External → fill app name
3. **Credentials** → Create OAuth 2.0 Client ID → Web application
4. Set **Authorized redirect URI**: `http://localhost:3000/api/auth/callback/google`
5. Copy Client ID and Client Secret into `.env.local`

---

## 🧩 How the Canvas Overlay Works

This is the core feature of the app. Here's the rendering pipeline:

```
Step 1: Load background template (1080×1080px PNG)
         ↓
Step 2: Draw background onto canvas using ctx.drawImage()
         ↓
Step 3: Load user's photo → create circular clipping path
         ctx.arc(x, y, radius, 0, 2π)
         ctx.clip()
         ctx.drawImage(photo, x, y, size, size)
         ↓
Step 4: Draw user's name with styled text
         ctx.font = "bold 36px Outfit"
         ctx.fillStyle = "#ffffff"
         ctx.textAlign = "center"
         ctx.fillText(name, x, y)
         ↓
Step 5: Export merged image
         canvas.toBlob() → Web Share API (mobile)
         canvas.toDataURL() → Download link (desktop)
```

Each template stores an `overlayConfig` that defines exactly where the photo and name should appear:

```javascript
overlayConfig: {
  photoPosition: { x: 540, y: 700 },   // Center point on 1080px canvas
  photoSize: 150,                        // Diameter in pixels
  photoShape: "circle",                  // Clipping shape
  namePosition: { x: 540, y: 900 },    // Text center point
  nameFont: "Outfit",                    // Font family
  nameFontSize: 36,                      // Size in px
  nameColor: "#ffffff",                  // Text color
}
```

Admins set these positions visually using the **click-to-place configurator** in the admin panel — click on the template image to place the photo and name markers.

---

## 📖 API Reference

| Method | Route | Auth | Description |
|:--|:--|:--|:--|
| `GET` | `/api/templates` | Public | List templates (with `?category=` filter) |
| `POST` | `/api/templates/user` | Creator | Publish a community template |
| `GET` | `/api/user/[id]` | Public | Get public creator profile and portfolio |
| `POST` | `/api/user/follow` | Auth | Toggle Follow/Unfollow social graph |
| `POST` | `/api/templates` | Admin | Create a new official template |
| `GET` | `/api/templates/[id]` | Public | Get single template with overlayConfig |
| `PUT` | `/api/templates/[id]` | Admin | Update template |
| `DELETE` | `/api/templates/[id]` | Admin | Delete template |
| `GET` | `/api/user` | Auth | Get current user profile |
| `PUT` | `/api/user` | Auth | Update user profile |
| `POST` | `/api/user/premium` | Auth | Toggle premium status (mock) |
| `POST` | `/api/user/creator` | Auth | Verify user as Creator |
| `GET` | `/api/admin/stats` | Admin | Dashboard statistics |
| `GET` | `/api/admin/users` | Admin | List all users |
| `PUT` | `/api/admin/users` | Admin | Update user role/premium |

---

## 🤝 Contributing

Wishme is **open source and community-driven**. We welcome contributions of all kinds — whether it's squashing a bug, adding a new template category, building an animation effect, or implementing a full feature like video export.

### How to Contribute

1. **Fork** the repository on GitHub
2. **Clone** your fork locally
   ```bash
   git clone https://github.com/your-username/wishme.git
   cd wishme
   ```
3. **Create a branch** for your feature or fix
   ```bash
   git checkout -b feat/my-awesome-feature
   ```
4. **Make your changes**, following the existing code style
5. **Test** your changes locally with `npm run dev`
6. **Open a Pull Request** with a clear description of what you changed and why

### Good First Issues

Looking for a place to start? Here are some high-impact contributions we would love help with:

| Area | Contribution |
|:--|:--|
| 🎥 **Video Export** | Use `MediaRecorder` API to export 5s canvas animations as MP4/GIF |
| 💳 **Real Payments** | Integrate Razorpay or Stripe into `/api/user/premium` |
| 🔍 **Template Search** | Full-text search on the community hub with debounce |
| 📱 **PWA Support** | Add a service worker and manifest for offline access |
| 🖱️ **Drag & Drop** | Replace the D-pad nudge controls with native drag handles on canvas |
| 🌐 **i18n** | Internationalization for Hindi, Tamil, Telugu, and other regional languages |
| 🧪 **Tests** | Add Playwright E2E tests for the editor and auth flows |
| 🎨 **New Templates** | Design and submit new 1080×1080 templates for the community |

### Code of Conduct

Be kind and respectful. We are building something for everyone — collaboration is everything.

---

## 📝 License

MIT — free for personal and commercial use. See [`LICENSE`](./LICENSE) for details.

Made with ❤️ by the Wishme open-source community.
