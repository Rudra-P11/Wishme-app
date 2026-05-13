# Technical Approach Document

## Wishme — Custom Greetings & Wishes Application

**Author:** Internship Candidate  
**Date:** May 2026  
**Project:** Custom Greetings & Wishes App (Internship Task)

---

## Table of Contents

1. [Problem Statement & Approach](#1-problem-statement--approach)
2. [Image Overlay Logic](#2-image-overlay-logic)
3. [Tech Stack](#3-tech-stack)
4. [Architecture Overview](#4-architecture-overview)
5. [Technical Challenges & Solutions](#5-technical-challenges--solutions)
6. [Future Improvements & Scalability](#6-future-improvements--scalability)

---

## 1. Problem Statement & Approach

### Objective
Build a web application that enables users to create personalized greeting cards by selecting background templates and automatically overlaying their profile picture and name onto the image. The final output is a shareable, merged image.

### Approach
The application follows a **layered rendering** architecture:

1. **Template Layer** — Admin-uploaded 1080×1080px greeting card images stored as static assets
2. **Overlay Layer** — User's profile photo (circular crop) composited on top of the template at configurable coordinates
3. **Text Layer** — User's name rendered with customizable font, size, color, and position
4. **Export Layer** — All layers merged into a single PNG using the HTML5 Canvas API

The key design decision was to perform **all image compositing client-side** using the Canvas API rather than server-side rendering (e.g., Sharp/ImageMagick). This eliminates server compute costs, ensures instant preview feedback, and works offline after the initial page load.

---

## 2. Image Overlay Logic

### Canvas Rendering Pipeline

The core rendering logic is implemented in `app/dashboard/editor/[templateId]/page.js` using the `renderCanvas()` function:

```
┌─────────────────────────────────────────────────┐
│  Step 1: Initialize Canvas (1080×1080px)        │
│                                                 │
│  Step 2: Load Background Template Image         │
│           ↓ (onload callback)                   │
│                                                 │
│  Step 3: Draw Background → ctx.drawImage()      │
│                                                 │
│  Step 4: Draw User Photo (async)                │
│    ├─ Load photo from URL/FileReader            │
│    ├─ Create circular clipping path             │
│    │   ctx.arc(x, y, radius, 0, 2π)            │
│    │   ctx.clip()                               │
│    ├─ Draw photo within clip region             │
│    └─ Draw white border stroke                  │
│                                                 │
│  Step 5: Draw User Name                         │
│    ├─ Set font, color, alignment                │
│    ├─ Apply text shadow for readability          │
│    └─ ctx.fillText(name, x, y)                  │
│                                                 │
│  Step 6: Export                                  │
│    ├─ canvas.toBlob() → Web Share API            │
│    └─ canvas.toDataURL() → Download link         │
└─────────────────────────────────────────────────┘
```

### Photo Clipping Algorithm

The photo overlay supports multiple clipping shapes configured per-template:

```javascript
// Circular clip (default)
ctx.beginPath();
ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
ctx.clip();
ctx.drawImage(photo, x, y, size, size);

// Square clip
ctx.beginPath();
ctx.rect(x, y, size, size);
ctx.clip();
ctx.drawImage(photo, x, y, size, size);
```

Each template has an `overlayConfig` object defining the exact positions:

```javascript
overlayConfig: {
  photoPosition: { x: 540, y: 700 },  // Center coordinates on 1080px canvas
  photoSize: 150,                       // Diameter in pixels
  photoShape: 'circle',                 // 'circle' | 'square' | 'rounded'
  namePosition: { x: 540, y: 900 },   // Text center coordinates
  nameFont: 'Outfit',                   // Google Font family
  nameFontSize: 36,                     // Size in pixels
  nameColor: '#ffffff',                 // Hex color
}
```

### Admin Overlay Configurator

Admins can visually configure overlay positions through a **click-to-place** interface. When creating or editing a template, the admin clicks directly on the template image to set photo and name positions. Mouse coordinates are scaled from the preview dimension back to the 1080px canvas coordinate system:

```javascript
const scaleX = 1080 / previewElement.width;
const scaleY = 1080 / previewElement.height;
const canvasX = Math.round(mouseX * scaleX);
const canvasY = Math.round(mouseY * scaleY);
```

---

## 3. Tech Stack

### Core Framework

| Technology | Version | Purpose |
|:--|:--|:--|
| **Next.js** | 16.2.4 | React meta-framework with App Router, server components, API routes |
| **React** | 19.2.4 | UI component library |
| **Node.js** | 24.x | Server runtime |

### Authentication

| Technology | Purpose |
|:--|:--|
| **Auth.js (NextAuth v5)** | Authentication framework supporting multiple providers |
| **bcryptjs** | Password hashing for email/password authentication |
| **Google OAuth 2.0** | Social sign-in provider |

### Database

| Technology | Purpose |
|:--|:--|
| **MongoDB Atlas** | Cloud-hosted NoSQL database |
| **Mongoose** | ODM for MongoDB with schema validation |

### Frontend

| Technology | Purpose |
|:--|:--|
| **HTML5 Canvas API** | Client-side image compositing and rendering |
| **CSS Modules** | Scoped component styling with CSS nesting |
| **Google Fonts** (Inter, Outfit) | Typography |
| **Web Share API** | Native mobile sharing (WhatsApp, Instagram, etc.) |

### Development Tools

| Tool | Purpose |
|:--|:--|
| **Turbopack** | Next.js development bundler |
| **ESLint** | Code linting |
| **dotenv** | Environment variable management |

---

## 4. Architecture Overview

### Application Structure

```
┌─────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                  │
│                                                     │
│  Landing Page ──→ Login ──→ Dashboard ──→ Editor     │
│                    │              │          │        │
│                    │         Category Tabs   Canvas   │
│                    │         Template Grid   Render   │
│                    │                        Share/DL  │
│                    │                                 │
│  Admin Panel ──→ Templates CRUD ──→ Overlay Config   │
│                  Users Management                    │
└─────────────┬───────────────────────────┬───────────┘
              │                           │
              ▼                           ▼
┌──────────────────┐         ┌──────────────────────┐
│   API Routes     │         │   Proxy (Middleware)  │
│                  │         │                      │
│  /api/templates  │         │  Route Protection:   │
│  /api/user       │         │  • Public: /, /login │
│  /api/admin/*    │         │  • Auth: /dashboard  │
│  /api/auth/*     │         │  • Admin: /admin     │
└────────┬─────────┘         └──────────────────────┘
         │
         ▼
┌──────────────────┐
│  MongoDB Atlas   │
│                  │
│  Collections:    │
│  • users         │
│  • templates     │
└──────────────────┘
```

### Authentication Flow

```
User → Login Page → Choose Provider
         │
    ┌────┴────┐
    │         │
  Google    Email/Password
    │         │
    ▼         ▼
 OAuth2.0   bcrypt.compare()
    │         │
    └────┬────┘
         │
    JWT Token Created
    (id, role, isPremium)
         │
    ┌────┴────┐
    │         │
  Session   Proxy
  (client)  (server)
    │         │
  useSession() checks  Route protection
  isPremium, role      redirects if needed
```

### Data Models

**User Schema:**
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed, select: false),
  image: String,
  provider: 'email' | 'google',
  role: 'user' | 'admin',
  isPremium: Boolean,
  profileComplete: Boolean,
}
```

**Template Schema:**
```javascript
{
  title: String,
  category: 'birthday' | 'anniversary' | 'festival' | 'general',
  imageUrl: String,
  isPremium: Boolean,
  isActive: Boolean,
  overlayConfig: {
    namePosition: { x, y },
    nameFont: String,
    nameFontSize: Number,
    nameColor: String,
    photoPosition: { x, y },
    photoSize: Number,
    photoShape: String,
  },
  sortOrder: Number,
}
```

---

## 5. Technical Challenges & Solutions

### Challenge 1: Next.js 16 Breaking Changes (Middleware → Proxy)

**Problem:** Next.js 16 deprecated the `middleware.js` file convention in favor of `proxy.js` with a named `proxy` export. The build failed with deprecation errors.

**Solution:** Migrated from `export default function middleware(req)` to `export async function proxy(req)` in a top-level `proxy.js` file. The proxy handles route protection for authenticated (`/dashboard`) and admin (`/admin`) routes, while allowing guest access via a `?guest=true` query parameter.

### Challenge 2: `useSearchParams` Suspense Boundary

**Problem:** The production build failed because `useSearchParams()` was called in the Login and Dashboard pages without a React Suspense boundary, which Next.js requires for static page generation.

**Solution:** Extracted the component logic using `useSearchParams()` into an inner component (`LoginForm`, `DashboardContent`) and wrapped it with `<Suspense fallback={...}>` in the page's default export. This allows Next.js to statically generate the page shell while hydrating the search-params-dependent content on the client.

### Challenge 3: Premium Status Not Persisting in Session

**Problem:** After a user upgraded to Pro, the premium gate modal would still appear when clicking premium templates. The `isPremium` field was stored in MongoDB but never included in the JWT session token.

**Solution:** Modified the Auth.js `jwt` callback to **fetch `isPremium` and `role` from the database on every request**, not just during sign-in. This ensures that changes to a user's subscription status are reflected immediately without requiring a re-login:

```javascript
async jwt({ token }) {
  if (token.id) {
    const dbUser = await User.findById(token.id).select('isPremium role').lean();
    if (dbUser) {
      token.isPremium = dbUser.isPremium || false;
      token.role = dbUser.role || 'user';
    }
  }
  return token;
}
```

### Challenge 4: Canvas Cross-Origin Image Rendering

**Problem:** When loading template images from external URLs (e.g., Cloudinary), the canvas becomes "tainted" and `toBlob()`/`toDataURL()` throw security errors, preventing export.

**Solution:** Applied `crossOrigin = 'anonymous'` to all `Image()` instances before setting their `src`. For the production deployment, template images are served from the same origin (`/templates/`) to completely avoid CORS issues. A graceful fallback renders an error message if an image fails to load.

### Challenge 5: Asynchronous Multi-Layer Rendering

**Problem:** The canvas rendering pipeline has three sequential dependencies — background must load before the photo, and the photo must render before the name text. Using synchronous code would block the UI.

**Solution:** Implemented a **Promise-based rendering chain**. The photo drawing returns a `Promise` that resolves after `Image.onload`, allowing the name drawing to execute only after the photo is composited:

```javascript
bgImage.onload = () => {
  ctx.drawImage(bgImage, 0, 0, 1080, 1080);  // Step 1
  drawPhoto().then(() => {                     // Step 2 (async)
    drawName();                                // Step 3
    setRendering(false);                       // Done
  });
};
```

---

## 6. Future Improvements & Scalability

### Short-Term Enhancements

| Improvement | Description |
|:--|:--|
| **Drag-and-drop positioning** | Let users drag their photo/name on the canvas instead of fixed positions |
| **Text customization** | Allow users to change font, color, and size in the editor |
| **Multiple photos** | Support templates with more than one photo placeholder |
| **Template search** | Full-text search across template titles and categories |
| **Undo/redo** | Canvas state history for the editor |

### Scalability Considerations

**1. Image Storage & CDN**
Currently, template images are served from the `/public` folder. For production scale:
- Migrate to **Cloudinary** or **AWS S3** for image storage
- Use a **CDN** (CloudFront/Cloudflare) for global edge caching
- Implement **responsive images** with `srcset` for different device sizes

**2. Database Optimization**
- Add **MongoDB indexes** on `category`, `isPremium`, and `isActive` fields for faster template queries
- Implement **cursor-based pagination** instead of offset-based for large template collections
- Use **Redis** for caching frequently accessed templates and session data

**3. Server-Side Rendering for Sharing**
- For social media preview cards (Open Graph images), implement **server-side canvas rendering** using the `canvas` npm package (node-canvas)
- This enables dynamic OG images without requiring client-side JavaScript

**4. Payment Integration**
- Replace the mock premium toggle with a real payment gateway (**Razorpay** for India, **Stripe** for global)
- Implement **webhook-based** subscription management with automatic expiry
- Add receipt generation and subscription history

**5. Performance**
- Implement **lazy loading** for template images using Intersection Observer
- Use **Web Workers** for canvas rendering to keep the main thread responsive
- Add **service worker** caching for offline access to previously loaded templates

**6. User-Generated Content**
- Allow users to **create and upload their own templates**
- Implement a **moderation queue** for admin review before publishing
- Add **template likes/favorites** for personalized recommendations

**7. Analytics**
- Track template usage, share counts, and download metrics
- Implement **A/B testing** for template layouts and overlay defaults
- Use analytics to surface trending templates on the home page

---

## Conclusion

Wishme demonstrates a complete, production-ready approach to client-side image compositing using the HTML5 Canvas API within a modern full-stack Next.js architecture. The layered rendering pipeline, configurable overlay system, and admin tooling provide a flexible foundation that can scale from a prototype to a production application serving millions of greeting cards.
