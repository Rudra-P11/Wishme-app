# 🎉 Wishme — Custom Greetings & Wishes App

A full-stack web application for creating personalized greeting cards. Choose from beautiful templates, add your photo and name, and share customized cards with loved ones instantly.

**Built with Next.js 16, React 19, MongoDB, Auth.js, and HTML5 Canvas.**

## ✨ Features

- **🔐 Authentication** — Google OAuth, Email/Password, and Guest mode
- **🎨 Template Gallery** — Categorized templates (Birthday, Anniversary, Festivals)
- **🖼️ Canvas Editor** — Real-time image compositing with photo + name overlay
- **📤 Share & Download** — Web Share API (WhatsApp, Instagram, etc.) + PNG download
- **👑 Premium System** — Mock subscription with Free/Pro template gating
- **⚙️ Admin Panel** — Template CRUD, overlay configurator, user management

## 🛠️ Tech Stack

| Layer | Technology |
|:--|:--|
| Framework | Next.js 16 (App Router) |
| Frontend | React 19, CSS Modules |
| Canvas | HTML5 Canvas API |
| Auth | Auth.js v5 (NextAuth) |
| Database | MongoDB Atlas + Mongoose |
| Styling | Custom CSS with CSS Nesting |
| Fonts | Google Fonts (Inter, Outfit) |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Google Cloud Console project (for OAuth)

### Installation

```bash
git clone https://github.com/your-username/wishme.git
cd wishme
npm install
```

### Environment Setup

Create `.env.local` from the example:

```bash
cp .env.example .env.local
```

Fill in your credentials:

```env
AUTH_SECRET=your-secret-key
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/wishme
NEXT_PUBLIC_APP_URL=http://localhost:3000
ADMIN_EMAIL=admin@example.com
```

### Seed the Database

```bash
node scripts/seed.js
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Make Yourself Admin

```bash
node scripts/make-admin.js your-email@example.com
```

## 📁 Project Structure

```
wishme/
├── app/
│   ├── page.js                          # Landing page
│   ├── (auth)/login/page.js             # Login page
│   ├── dashboard/page.js                # Template gallery
│   ├── dashboard/editor/[templateId]/   # Canvas editor
│   ├── admin/                           # Admin panel
│   └── api/                             # REST API routes
├── components/
│   ├── layout/Navbar.js                 # Navigation
│   ├── providers/AuthProvider.js        # Session provider
│   └── editor/PremiumGate.js            # Upgrade modal
├── lib/
│   ├── auth.js                          # Auth.js config
│   └── db.js                            # MongoDB connection
├── models/
│   ├── User.js                          # User schema
│   └── Template.js                      # Template schema
├── scripts/
│   ├── seed.js                          # Database seeder
│   └── make-admin.js                    # Admin promotion
└── proxy.js                             # Route protection
```

## 📖 How It Works

1. **Choose a Template** — Browse categorized templates on the dashboard
2. **Personalize** — Enter your name and upload a photo in the editor
3. **Live Preview** — See changes in real-time on the HTML5 Canvas
4. **Share** — Use the native share sheet or download as PNG

The canvas rendering pipeline composites three layers:
- Background template image → User's circular photo → Styled name text

## 📄 Documentation

See [TECHNICAL_APPROACH.md](./TECHNICAL_APPROACH.md) for detailed technical documentation including:
- Image overlay logic and canvas rendering pipeline
- Architecture diagrams
- Technical challenges and solutions
- Future scalability considerations

## 📝 License

This project was built as an internship task submission.
