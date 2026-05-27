# Influence Firewall MVP - Setup Guide

## Quick Start

### Step 1: Configure Supabase Integration

1. Click the **Settings** button (⚙️) in the top right of v0
2. Navigate to the **Vars** section
3. You should see these environment variables need to be configured:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. In the **Settings** tab, look for **Integrations** and enable **Supabase**
5. The integration will automatically populate your environment variables

### Step 2: Database Schema

The database schema is automatically created when you enable the Supabase integration. It includes:

- **profiles** - User profiles with personal values
- **analyzed_content** - Stores all analyzed content
- **analysis_results** - Stores the 4-layer analysis scores

### Step 3: Test the Application

1. Open the preview (the app should now load without errors)
2. Click **Sign Up** on the landing page
3. Create an account with your email and password
4. You'll be redirected to the dashboard
5. Paste some content and click **Analyze Now**

## Testing Content Examples

### Test Toxicity Detection
Paste content with hateful language or personal attacks:
```
This is absolutely disgusting! Everyone who thinks differently is subhuman garbage.
```

Expected: High toxicity score (70-100)

### Test Misinformation Detection
Paste false claims:
```
The moon is actually made of cheese. Scientists confirmed this in 2020 but the government covered it up.
```

Expected: High misinformation score (70-100)

### Test Manipulation Detection
Paste manipulative content:
```
WARNING: You must act NOW! Limited offer expires in 2 hours! Everyone else is buying, don't miss out! Click here IMMEDIATELY before it's too late!
```

Expected: High manipulation score (60-80)

### Test Values Alignment
Paste aligned content:
```
We believe in respecting all people regardless of background. Truth matters, and we're committed to transparent communication about our decisions.
```

Expected: High values alignment score (70-90)

## Deployment

### Deploy to Vercel

1. Click **Publish** in the top right of v0
2. This will create a Vercel deployment
3. Configure the Supabase integration on Vercel:
   - Add `NEXT_PUBLIC_SUPABASE_URL` to Vercel env vars
   - Add `NEXT_PUBLIC_SUPABASE_ANON_KEY` to Vercel env vars

### Deploy to Another Platform

To deploy elsewhere:

1. Clone the repository
2. Set environment variables:
   ```bash
   export NEXT_PUBLIC_SUPABASE_URL=your_url
   export NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   ```
3. Build and deploy:
   ```bash
   pnpm build
   pnpm start
   ```

## Architecture Overview

### Frontend Flow
1. User pastes content on dashboard
2. Client sends to `/api/analyze` endpoint
3. Server receives authenticated request
4. AI SDK (via Vercel AI Gateway) analyzes content
5. Results stored in Supabase
6. Results displayed in real-time with 4 scores + risk gauge

### Database Flow
1. Content input → `analyzed_content` table
2. Analysis results → `analysis_results` table
3. All data keyed to user via Row Level Security
4. History fetched on dashboard load

## Features Explained

### Content Input Types
- **Text**: Paste raw text directly
- **URL**: Paste social media URLs (content pasted below URL field)
- **Document**: Paste extracted text from documents

### Analysis Layers

1. **Toxicity (Red)** - 0-100 scale
   - 0-25: Safe content
   - 25-50: Some concerning language
   - 50-75: Significant toxicity
   - 75-100: Extreme toxicity/dehumanization

2. **Misinformation (Orange)** - 0-100 scale
   - 0-25: Appears factual
   - 25-50: Some dubious claims
   - 50-75: Significant false statements
   - 75-100: Mostly false/completely misleading

3. **Manipulation (Purple)** - 0-100 scale
   - 0-25: Straightforward messaging
   - 25-50: Some persuasion tactics
   - 50-75: Heavy manipulation
   - 75-100: Extreme exploitation attempts

4. **Values Alignment (Blue)** - 0-100 scale
   - 0-25: Violates values (autonomy, truth, dignity)
   - 25-50: Mixed alignment
   - 50-75: Mostly aligned
   - 75-100: Strongly aligned with human dignity

### Overall Risk Score
Calculated as: `max(toxicity, misinformation, manipulation, 100-values_alignment)`

- **Low**: 0-25
- **Medium**: 25-50
- **High**: 50-75
- **Critical**: 75-100

## Troubleshooting

### Error: "URL and Key are required"
- Supabase environment variables not set
- Solution: Configure Supabase integration in v0 Settings

### Error: "Unauthorized"
- User not authenticated
- Solution: Sign up/login first before analyzing

### Analysis taking long time
- LLM inference time is 2-5 seconds per analysis
- This is normal - the system is running 4 parallel analyses

### Content not saved to history
- Check Row Level Security policies are enabled
- Verify user is logged in
- Check database has storage space

## Next Steps

After getting the MVP working:

1. **Customize**: Update personal values in user profile
2. **Analyze More**: Build a content library with analysis history
3. **Share Feedback**: Test across different content types
4. **Extend**: Look at Phase 2 features (browser extension, batch analysis)

## Support

If you encounter issues:
1. Check the console logs for error messages
2. Verify Supabase credentials are correct
3. Ensure the user is authenticated
4. Check database schema was created
5. Review the README.md for architecture details
