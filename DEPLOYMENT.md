# OptiVest Deployment Guide

This guide will walk you through deploying your OptiVest trading logbook application to various platforms.

## Prerequisites

Before deploying, ensure you have:

1. ✅ Set up Clerk authentication
2. ✅ Set up Supabase database
3. ✅ Configured environment variables
4. ✅ Tested locally with `npm run dev`

## Environment Variables

Make sure these are set in your deployment platform:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Deployment Options

### 1. Vercel (Recommended)

Vercel is the platform created by the Next.js team and provides the best integration.

#### Steps:
1. **Push to GitHub**: Ensure your code is in a GitHub repository
2. **Connect to Vercel**: 
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your repository
3. **Configure Environment Variables**:
   - Go to Project Settings → Environment Variables
   - Add all variables from your `.env.local`
4. **Deploy**: Click "Deploy"

#### Benefits:
- Automatic deployments on git push
- Built-in analytics and monitoring
- Edge functions support
- Global CDN

### 2. Netlify

#### Steps:
1. **Build Command**: `npm run build`
2. **Publish Directory**: `.next`
3. **Environment Variables**: Add in Netlify dashboard
4. **Deploy**: Connect your GitHub repo

### 3. Railway

#### Steps:
1. **Connect Repository**: Link your GitHub repo
2. **Environment Variables**: Add in Railway dashboard
3. **Build Command**: `npm run build`
4. **Start Command**: `npm start`

### 4. DigitalOcean App Platform

#### Steps:
1. **Create App**: Choose your GitHub repo
2. **Build Command**: `npm run build`
3. **Run Command**: `npm start`
4. **Environment Variables**: Add in dashboard

## Post-Deployment Checklist

After deploying, verify:

- [ ] Authentication works (sign up/sign in)
- [ ] Database connection is successful
- [ ] Can add/edit/delete trades
- [ ] Statistics calculate correctly
- [ ] Responsive design works on mobile
- [ ] Error handling works properly

## Custom Domain Setup

### Vercel:
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

### Clerk:
1. Go to Clerk Dashboard → Domains
2. Add your production domain
3. Update allowed origins

### Supabase:
1. Go to Project Settings → API
2. Add your domain to allowed origins

## Monitoring & Analytics

### Vercel Analytics:
- Built-in performance monitoring
- Real-time metrics
- Error tracking

### Supabase:
- Database performance metrics
- Query analytics
- Error logs

## Troubleshooting

### Common Issues:

1. **Environment Variables Not Loading**:
   - Ensure variables are set in deployment platform
   - Check variable names match exactly
   - Restart deployment after adding variables

2. **Database Connection Errors**:
   - Verify Supabase URL and keys
   - Check RLS policies are enabled
   - Ensure database is accessible from deployment region

3. **Authentication Issues**:
   - Verify Clerk keys are correct
   - Check allowed origins in Clerk dashboard
   - Ensure middleware is properly configured

4. **Build Failures**:
   - Check TypeScript errors locally first
   - Run `npm run type-check`
   - Verify all dependencies are in package.json

### Performance Optimization:

1. **Enable Compression**:
   - Vercel: Automatic
   - Others: Configure gzip/brotli

2. **Image Optimization**:
   - Use Next.js Image component
   - Optimize image formats

3. **Bundle Analysis**:
   - Run `npm run build` locally
   - Check bundle size in `.next/analyze`

## Security Considerations

1. **Environment Variables**: Never commit `.env.local` to git
2. **Database**: Use RLS policies in Supabase
3. **Authentication**: Keep Clerk keys secure
4. **HTTPS**: Ensure SSL is enabled
5. **CORS**: Configure properly for your domain

## Backup & Recovery

1. **Database**: Enable Supabase backups
2. **Code**: Use Git for version control
3. **Environment**: Document all variables
4. **Deployment**: Keep deployment logs

## Support

If you encounter issues:

1. Check the [Next.js documentation](https://nextjs.org/docs)
2. Review [Clerk documentation](https://clerk.com/docs)
3. Check [Supabase documentation](https://supabase.com/docs)
4. Create an issue in the project repository

## Cost Optimization

### Vercel:
- Free tier: 100GB bandwidth/month
- Pro: $20/month for unlimited bandwidth

### Supabase:
- Free tier: 500MB database, 2GB bandwidth
- Pro: $25/month for 8GB database

### Clerk:
- Free tier: 5,000 monthly active users
- Pro: $25/month for 25,000 users
