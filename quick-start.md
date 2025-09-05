# OptiVest Quick Start Guide

Get your trading logbook up and running in 5 minutes!

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
```bash
# Copy the example file
cp env.example .env.local

# Edit .env.local with your actual keys
```

### 3. Set Up Services

#### Clerk (Authentication)
1. Go to [clerk.com](https://clerk.com)
2. Create account & new application
3. Copy your keys to `.env.local`

#### Supabase (Database)
1. Go to [supabase.com](https://supabase.com)
2. Create account & new project
3. Run the SQL from `supabase-setup.sql`
4. Copy your keys to `.env.local`

### 4. Run the Application
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser!

## 🔑 Required Environment Variables

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

## 📊 What You'll Get

- ✅ User authentication (sign up/login)
- ✅ Add/edit/delete options trades
- ✅ Real-time P&L calculations
- ✅ Performance statistics
- ✅ Responsive design
- ✅ Secure data storage

## 🆘 Need Help?

- Check the full [README.md](README.md)
- Review [DEPLOYMENT.md](DEPLOYMENT.md)
- Run `npm run type-check` for TypeScript errors
- Ensure all environment variables are set

## 🎯 Next Steps

1. **Test the app** - Add some sample trades
2. **Customize** - Modify colors, branding, etc.
3. **Deploy** - Follow the deployment guide
4. **Scale** - Add more features as needed

Happy trading! 📈
