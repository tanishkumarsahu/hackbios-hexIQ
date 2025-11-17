# Alumni Connect - Frontend (JavaScript)

This is the JavaScript version of the Alumni Connect frontend, built with Next.js and React.

## Features

- **Modern UI/UX** - Beautiful, responsive design with Tailwind CSS
- **Authentication** - Complete auth system with login/register
- **API Integration** - Connected to Express.js backend with Supabase
- **Dashboard** - User dashboard with stats and quick actions
- **Real-time Updates** - Live data from backend API
- **Mobile Responsive** - Works perfectly on all devices

## Tech Stack

- **Framework**: Next.js 15.5.3
- **Language**: JavaScript (ES6+)
- **Styling**: Tailwind CSS
- **UI Components**: Custom component library
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Forms**: React Hook Form

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend server running on port 5000

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env.local
```

3. Update `.env.local` with your configuration:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3001](http://localhost:3001) in your browser

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard page
│   ├── globals.css        # Global styles
│   ├── layout.js          # Root layout
│   └── page.js            # Landing page
├── components/            # Reusable components
│   └── ui/               # UI component library
├── contexts/             # React contexts
│   └── AuthContext.js    # Authentication context
├── lib/                  # Utility functions
│   └── utils.js          # Helper functions
└── services/             # API services
    └── api.js            # API client
```

## Available Scripts

- `npm run dev` - Start development server on port 3001
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## API Integration

The frontend connects to the Express.js backend running on port 5000. Key features:

- **Authentication**: JWT-based auth with automatic token management
- **User Management**: CRUD operations for user profiles
- **Real-time Data**: Live updates from Supabase database
- **Error Handling**: Comprehensive error handling and user feedback

## Components

### UI Components
- **Button** - Versatile button with multiple variants
- **Card** - Container component with header/content/footer
- **Input** - Form input with validation support
- **LoadingSpinner** - Loading states and feedback

### Pages
- **Landing Page** - Marketing page with features showcase
- **Login/Register** - Authentication forms
- **Dashboard** - User dashboard with stats and actions

## Environment Variables

```env
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Supabase (for direct client access if needed)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI Features (optional)
GEMINI_API_KEY=your_gemini_api_key
```

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect to Vercel
3. Set environment variables
4. Deploy

### Manual Deployment
```bash
npm run build
npm run start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
