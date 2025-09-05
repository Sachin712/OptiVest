# Support System Setup Guide

This guide will help you set up the complete support system for OptiVest.

## 1. Database Setup

Run the SQL script in your Supabase dashboard:

```sql
-- Copy and paste the contents of support-tickets-setup.sql
```

## 2. Storage Bucket Setup

In your Supabase dashboard, go to Storage and create a new bucket:

1. **Bucket Name**: `support-attachments`
2. **Public**: No (keep it private)
3. **File size limit**: 10MB
4. **Allowed MIME types**: 
   - `application/pdf`
   - `application/msword`
   - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
   - `text/plain`
   - `image/png`
   - `image/jpeg`
   - `image/gif`
   - `text/csv`
   - `application/vnd.ms-excel`
   - `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

## 3. Storage Policies

Add these policies in the Supabase dashboard under Storage > Policies:

```sql
-- Allow users to upload their own support attachments
CREATE POLICY "Users can upload their own support attachments" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'support-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to view their own support attachments
CREATE POLICY "Users can view their own support attachments" ON storage.objects
  FOR SELECT USING (bucket_id = 'support-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## 4. Email Service Setup

### Option A: SendGrid (Recommended)

1. Sign up for SendGrid
2. Get your API key
3. Add to your `.env.local`:
   ```
   SENDGRID_API_KEY=your_sendgrid_api_key
   FROM_EMAIL=noreply@yourdomain.com
   ```

4. Update the API route to use SendGrid:
   ```bash
   npm install @sendgrid/mail
   ```

5. Uncomment and modify the SendGrid code in `app/api/send-support-email/route.ts`

### Option B: AWS SES

1. Set up AWS SES
2. Add to your `.env.local`:
   ```
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_REGION=us-east-1
   FROM_EMAIL=noreply@yourdomain.com
   ```

3. Install AWS SDK:
   ```bash
   npm install @aws-sdk/client-ses
   ```

### Option C: Nodemailer (Simple)

1. Install nodemailer:
   ```bash
   npm install nodemailer
   ```

2. Add to your `.env.local`:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   FROM_EMAIL=your-email@gmail.com
   ```

## 5. Environment Variables

Add these to your `.env.local`:

```env
# Email Configuration
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=noreply@yourdomain.com

# Or for SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## 6. Testing

1. Navigate to `/support` in your application
2. Fill out the support form
3. Submit a test ticket
4. Check your email (knowitallroot@gmail.com) for the notification
5. Verify the ticket was created in the `support_tickets` table

## 7. Features

### Reference ID Format
- Format: `OPT-YYYYMMDD-XXXXXX`
- Example: `OPT-20241215-123456`
- Automatically generated and unique

### File Attachments
- Maximum file size: 10MB
- Supported formats: PDF, DOC, DOCX, TXT, PNG, JPG, JPEG, GIF, CSV, XLSX, XLS
- Stored securely in Supabase Storage

### Email Notifications
- Sent to: knowitallroot@gmail.com
- Subject: Support Ticket: [Reference ID]
- Includes all form data and attachment information

### Security
- Row Level Security (RLS) enabled
- Users can only see their own tickets
- File uploads are user-scoped
- All data is encrypted in transit and at rest

## 8. Admin Features (Future)

Consider adding these features for ticket management:

1. Admin dashboard to view all tickets
2. Ticket status updates
3. Response tracking
4. Email notifications to users when status changes
5. Ticket assignment to support agents

## 9. Troubleshooting

### Common Issues

1. **Email not sending**: Check your email service configuration and API keys
2. **File upload fails**: Verify storage bucket exists and policies are correct
3. **Reference ID generation fails**: Ensure the database function is created
4. **RLS errors**: Check that user authentication is working properly

### Debug Mode

To enable debug logging, add to your `.env.local`:
```
DEBUG_SUPPORT=true
```

This will log detailed information about the support ticket creation process.
