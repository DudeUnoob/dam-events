# DAM Event Management Platform - Frontend

A modern, sleek event management platform connecting planners with pre-vetted vendors.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (for backend services)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd dam-events
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials and API keys:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
dam-events/
├── src/
│   ├── app/                 # Next.js 14 app router pages
│   │   ├── planner/        # Planner pages (dashboard, browse, events)
│   │   ├── vendor/         # Vendor pages (dashboard, profile, packages)
│   │   ├── admin/          # Admin pages (vendor verification)
│   │   ├── messages/       # Messaging interface
│   │   ├── login/          # Authentication pages
│   │   └── signup/
│   ├── components/         # React components
│   │   ├── ui/            # Reusable UI components
│   │   ├── planner/       # Planner-specific components
│   │   ├── vendor/        # Vendor-specific components
│   │   ├── messaging/     # Messaging components
│   │   └── shared/        # Shared components (Navigation, Footer)
│   ├── lib/               # Utility functions
│   └── types/             # TypeScript type definitions
├── public/                # Static assets
└── instructions/          # Project documentation
```

## 🎨 Features

### For Planners
- **Event Creation**: Create events with budget, guest count, and location
- **Package Browsing**: Browse complete event packages with advanced filters
- **Quote Requests**: Request quotes from multiple vendors at once
- **Unified Messaging**: Communicate with vendors in one place
- **Dashboard**: Track all events and leads

### For Vendors
- **Profile Management**: Manage business information and services
- **Package Creation**: Create bundled packages (venue + catering + entertainment)
- **Lead Management**: View and respond to event leads
- **Real-time Notifications**: Get notified of new leads instantly
- **Analytics**: Track performance and conversion rates (coming soon)

### For Admins
- **Vendor Verification**: Review and approve vendor applications
- **Platform Monitoring**: Track users, packages, and activity
- **Content Moderation**: Manage platform content and quality

## 🎨 Design Features

- **Modern UI**: Clean, sleek design with Tailwind CSS
- **Responsive**: Mobile-first design that works on all devices
- **Accessible**: WCAG AA compliant with proper ARIA labels
- **Fast**: Optimized performance with Next.js 14
- **Type-Safe**: Full TypeScript support

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom component library
- **Icons**: Lucide React
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Deployment**: Vercel

## 📝 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler check
```

## 🔐 Authentication

The platform uses Supabase Auth with Google OAuth. To enable authentication:

1. Set up Google OAuth in Supabase Dashboard
2. Configure redirect URLs in Google Cloud Console
3. Add environment variables to `.env.local`

## 📦 Key Pages

### Landing Page (`/`)
- Hero section with value proposition
- Feature highlights
- Call-to-action buttons

### Planner Dashboard (`/planner/dashboard`)
- Event overview and stats
- Recent events list
- Quick actions

### Package Browse (`/planner/browse`)
- Advanced search and filters
- Package grid with details
- Quote request functionality

### Vendor Dashboard (`/vendor/dashboard`)
- Lead management
- Stats and analytics
- Quick actions

### Messages (`/messages`)
- Conversation list
- Real-time messaging
- Lead context

### Admin Dashboard (`/admin/dashboard`)
- Vendor application review
- Platform statistics
- Recent activity

## 🎨 Color Palette

- **Primary**: Blue (#3B82F6)
- **Secondary**: Green (#10B981)
- **Accent**: Purple (#8B5CF6)
- **Error**: Red (#EF4444)
- **Warning**: Yellow (#F59E0B)

## 🚧 Next Steps

To complete the backend integration:

1. Set up Supabase project and database
2. Run database migrations (see `instructions/prd.md`)
3. Configure Row Level Security (RLS) policies
4. Set up Twilio for SMS notifications
5. Configure SendGrid for email notifications
6. Add Google Maps API for geocoding

## 📚 Documentation

- [Full PRD](./instructions/prd.md)
- [Development Guide](./claude.md)

## 🤝 Contributing

This is a P0 MVP. Additional features will be added in future iterations.

## 📄 License

MIT License - see LICENSE file for details
