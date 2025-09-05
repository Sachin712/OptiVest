# OptiVest - Trading Logbook

A modern, full-stack web application for traders to track their options trades and analyze performance. Built with Next.js, TypeScript, Clerk authentication, and Supabase database.

## Features

- 🔐 **User Authentication**: Secure sign-up/login with Clerk
- 📊 **Trade Management**: Add, edit, and delete options trades
- 💰 **Performance Analytics**: Real-time P&L calculations and success ratios
- 📱 **Responsive Design**: Modern UI that works on all devices
- 🔒 **Data Security**: Row-level security with Supabase
- ✏️ **Inline Editing**: Edit trades directly in the table
- 📈 **Statistics Dashboard**: Overview cards showing total investment, P&L, and success rate

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Clerk
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React
- **Deployment**: Vercel (recommended)

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Clerk account
- Supabase account

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd optivest
npm install
```

### 2. Environment Configuration

Copy the example environment file and fill in your credentials:

```bash
cp env.example .env.local
```

Fill in the following variables in `.env.local`:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. Clerk Setup

1. Go to [clerk.com](https://clerk.com) and create an account
2. Create a new application
3. Copy your publishable key and secret key
4. Add your domain to the allowed origins

### 4. Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create an account
2. Create a new project
3. Go to SQL Editor and run the contents of `supabase-setup.sql`
4. Copy your project URL and anon key
5. Enable Row Level Security (RLS) on the trades table

### 5. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses a single `trades` table with the following structure:

```sql
trades (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  symbol TEXT NOT NULL,
  contracts INTEGER NOT NULL,
  purchase_price DECIMAL(10,2) NOT NULL,
  sell_price DECIMAL(10,2),
  purchase_date DATE NOT NULL,
  sell_date DATE,
  status TEXT NOT NULL DEFAULT 'open',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
```

## Key Features Explained

### Trade Management
- **Add Trades**: Use the "Add Trade" button to create new options positions
- **Edit Trades**: Click the edit icon to modify trade details inline
- **Close Positions**: Add a sell price to automatically close a position
- **Delete Trades**: Remove trades with confirmation dialog

### Performance Analytics
- **Total Investment**: Sum of all purchase prices × contracts
- **Total P&L**: Calculated from closed positions only
- **Success Ratio**: Percentage of profitable closed trades

### Security Features
- Row-level security ensures users only see their own trades
- Authentication required for all protected routes
- Input validation and sanitization

## Project Structure

```
optivest/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Main dashboard
│   └── sign-in/           # Authentication pages
├── components/             # React components
│   ├── Dashboard.tsx      # Main dashboard component
│   ├── StatsCards.tsx     # Statistics overview cards
│   ├── TradeList.tsx      # Trades table
│   ├── TradeRow.tsx       # Individual trade row
│   └── AddTradeModal.tsx  # Add trade modal
├── lib/                    # Utility functions
│   └── supabase.ts        # Supabase client & types
├── middleware.ts           # Clerk authentication middleware
├── supabase-setup.sql     # Database schema
└── package.json           # Dependencies
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support or questions:
- Create an issue in the GitHub repository
- Check the documentation
- Review the code comments

## Roadmap

- [ ] Trade filtering and search
- [ ] Export functionality (CSV, PDF)
- [ ] Advanced analytics and charts
- [ ] Mobile app
- [ ] Multi-currency support
- [ ] Trade templates
- [ ] Performance benchmarking
- [ ] Social features and sharing
