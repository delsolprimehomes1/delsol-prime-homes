# Scheduled Publishing System - Setup Guide

This guide explains how to set up the automatic scheduled publishing system for QA clusters.

## Overview

The scheduled publishing system allows you to:
- Import QA clusters immediately (published right away)
- Schedule QA clusters to be published at a specific date and time
- View and manage scheduled content in the dashboard
- Manually publish scheduled content before the scheduled time

## System Components

### 1. Database Schema
✅ Already migrated - Added to `qa_clusters` and `qa_articles`:
- `scheduled_publish_at` (timestamptz) - Target publication time
- `publish_status` (text: 'draft', 'scheduled', 'published') - Current state
- `auto_published_at` (timestamptz) - When content was auto-published

### 2. Content Management UI
✅ Already implemented in `/content-manager`:
- **Cluster Mode tab**: Import with scheduling options
- **Scheduled tab**: View and manage scheduled content

### 3. Auto-Publish Edge Function
✅ Already deployed at `supabase/functions/auto-publish-scheduled/index.ts`:
- Runs every 5 minutes via cron job
- Finds clusters with `publish_status='scheduled'` and `scheduled_publish_at <= now()`
- Updates clusters and articles to `publish_status='published'`
- Sets `is_active=true` and `published=true`

### 4. Public QA Page Filtering
✅ Already updated in `/qa`:
- Only shows articles with `publish_status='published'`
- Scheduled/draft content is hidden from public view

## Setting Up the Cron Job

To enable automatic publishing, you need to set up a cron job in Supabase.

### Option 1: Using pg_cron (Recommended)

1. **Open Supabase SQL Editor**
   - Go to: https://supabase.com/dashboard/project/qvrvcvmoudxchipvzksh/sql/new

2. **Enable pg_cron extension** (if not already enabled):
   ```sql
   CREATE EXTENSION IF NOT EXISTS pg_cron;
   CREATE EXTENSION IF NOT EXISTS pg_net;
   ```

3. **Schedule the auto-publish function**:
   ```sql
   SELECT cron.schedule(
     'auto-publish-scheduled-content',
     '*/5 * * * *', -- Every 5 minutes
     $$
     SELECT net.http_post(
       url := 'https://qvrvcvmoudxchipvzksh.supabase.co/functions/v1/auto-publish-scheduled',
       headers := '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY", "Content-Type": "application/json"}'::jsonb
     ) as request_id;
     $$
   );
   ```

   **Important**: Replace `YOUR_SERVICE_ROLE_KEY` with your actual Supabase service role key from:
   https://supabase.com/dashboard/project/qvrvcvmoudxchipvzksh/settings/api

4. **Verify the cron job is scheduled**:
   ```sql
   SELECT * FROM cron.job;
   ```

5. **Check cron job execution logs**:
   ```sql
   SELECT * FROM cron.job_run_details 
   WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'auto-publish-scheduled-content')
   ORDER BY start_time DESC 
   LIMIT 10;
   ```

### Option 2: External Cron Service (Alternative)

If you prefer not to use pg_cron, you can use an external service:

1. **Services you can use**:
   - [Cron-job.org](https://cron-job.org)
   - [EasyCron](https://www.easycron.com)
   - GitHub Actions
   - Vercel Cron
   - Railway Cron

2. **Configure the cron job**:
   - URL: `https://qvrvcvmoudxchipvzksh.supabase.co/functions/v1/auto-publish-scheduled`
   - Method: `POST`
   - Schedule: `*/5 * * * *` (every 5 minutes)
   - Headers:
     ```
     Authorization: Bearer YOUR_SERVICE_ROLE_KEY
     Content-Type: application/json
     ```

## How to Use

### Creating Scheduled Content

1. Go to `/content-manager`
2. Click **Cluster Mode** tab
3. Fill in cluster metadata and articles
4. In the **Publishing Schedule** section:
   - Select "📆 Schedule for Later"
   - Choose date and time
5. Click **Import & Schedule for [Date Time]**
6. Content is saved with `publish_status='scheduled'`

### Managing Scheduled Content

1. Go to `/scheduled-content` or click **Scheduled** tab in Content Manager
2. View all scheduled clusters with:
   - Title, topic, language
   - Article count
   - Scheduled publication time
   - Time until publication
3. Actions available:
   - **Publish Now**: Immediately publish scheduled content
   - **Delete**: Remove scheduled cluster

### Auto-Publishing Process

Every 5 minutes, the cron job:
1. Queries for clusters with:
   - `publish_status = 'scheduled'`
   - `scheduled_publish_at <= now()`
2. Updates matching clusters:
   - `publish_status = 'published'`
   - `is_active = true`
   - `auto_published_at = now()`
3. Updates all articles in those clusters:
   - `publish_status = 'published'`
   - `published = true`
   - `auto_published_at = now()`
4. Content becomes visible on public QA page

## Monitoring

### Check Edge Function Logs

View auto-publish logs at:
https://supabase.com/dashboard/project/qvrvcvmoudxchipvzksh/functions/auto-publish-scheduled/logs

Look for:
- `🔍 Checking for scheduled content at [timestamp]`
- `📦 Found X clusters ready to publish`
- `✅ Published cluster: [title] (X articles)`
- `🎉 Auto-publish complete: X/Y clusters published successfully`

### Check Database

Query scheduled content:
```sql
-- View all scheduled clusters
SELECT 
  id, 
  title, 
  language, 
  publish_status,
  scheduled_publish_at,
  scheduled_publish_at - now() as time_until_publish
FROM qa_clusters 
WHERE publish_status = 'scheduled'
ORDER BY scheduled_publish_at;

-- View recently published clusters
SELECT 
  id, 
  title, 
  language, 
  publish_status,
  auto_published_at
FROM qa_clusters 
WHERE publish_status = 'published' 
  AND auto_published_at IS NOT NULL
ORDER BY auto_published_at DESC 
LIMIT 10;
```

## Troubleshooting

### Cron job not running
- Verify pg_cron extension is enabled
- Check cron job exists: `SELECT * FROM cron.job;`
- Check execution logs: `SELECT * FROM cron.job_run_details;`
- Ensure service role key is correct

### Content not publishing
- Check edge function logs for errors
- Verify `scheduled_publish_at` is in the past
- Ensure `publish_status = 'scheduled'`
- Manually trigger: Visit edge function URL with service role key

### Content published but not visible
- Verify `/qa` page filters by `publish_status='published'`
- Check `is_active=true` on cluster
- Clear browser cache

## Security Notes

- The auto-publish edge function uses `verify_jwt = false` (already configured)
- This is safe because it's called by the cron job, not by users
- Service role key should be kept secret
- Edge function only performs publish operations (no deletions)

## Next Steps

After setting up the cron job:
1. Test with a cluster scheduled 10 minutes in the future
2. Monitor edge function logs
3. Verify content appears on `/qa` at scheduled time
4. Set up bulk import for multiple scheduled clusters (future enhancement)

## Support

For issues or questions:
- Check edge function logs
- Review database `publish_status` values
- Verify cron job execution logs
- Consult Supabase pg_cron documentation
