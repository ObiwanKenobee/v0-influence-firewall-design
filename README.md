# Influence Firewall MVP

An AI-powered cognitive defense system that analyzes digital content for manipulation, misinformation, toxicity, and values misalignment. Protect your digital sovereignty with four layers of analysis.

## Architecture

### Core Cognitive Defense Layers

1. **Toxicity Detection** - Identifies harmful, hateful, and abusive content
2. **Misinformation Detection** - Detects false claims and misleading statements
3. **Manipulation Patterns** - Identifies dark patterns, emotional manipulation, and exploitative tactics
4. **Values Alignment** - Measures alignment with human dignity, truthfulness, and autonomy

### Tech Stack

- **Frontend**: Next.js 16 with React 19.2, TailwindCSS, shadcn/ui
- **Backend**: Next.js API Routes with Vercel AI SDK
- **AI Engine**: OpenAI GPT-4o-mini via Vercel AI Gateway
- **Database**: Supabase PostgreSQL with Row Level Security
- **Authentication**: Supabase Auth with email/password
- **Content Types**: Text paste, URLs, documents, browser tab content

## Project Structure

```
app/
├── page.tsx                 # Landing page
├── auth/
│   ├── login/page.tsx       # Login page
│   ├── sign-up/page.tsx     # Registration page
│   ├── callback/route.ts    # OAuth callback
│   └── error/page.tsx       # Auth error page
├── dashboard/page.tsx       # Main dashboard
└── api/
    └── analyze/route.ts     # Analysis engine

components/
├── dashboard-client.tsx     # Main dashboard UI
├── content-input.tsx        # Multi-source input form
├── analysis-results.tsx     # 4-layer results display
└── analysis-history.tsx     # Analysis history timeline

lib/supabase/
├── client.ts               # Browser Supabase client
├── server.ts               # Server Supabase client
└── proxy.ts                # Proxy session handler

database/
├── profiles                # User profiles & preferences
├── analyzed_content        # Input content storage
└── analysis_results        # Analysis scores & details
```

## Database Schema

### profiles
- `id` (UUID) - References auth.users
- `display_name` (TEXT)
- `personal_values` (TEXT[]) - User's stated values for alignment scoring
- `created_at`, `updated_at` (TIMESTAMP)

### analyzed_content
- `id` (UUID) - Primary key
- `user_id` (UUID) - References auth.users
- `content_text` (TEXT) - Full content analyzed
- `content_type` (TEXT) - 'text', 'url', or 'document'
- `source_url` (TEXT) - Optional source URL
- `created_at` (TIMESTAMP)

### analysis_results
- `id` (UUID) - Primary key
- `content_id` (UUID) - References analyzed_content
- `user_id` (UUID) - References auth.users
- `toxicity_score` (INT 0-100) - Toxicity level
- `misinformation_score` (INT 0-100) - Misinformation likelihood
- `manipulation_score` (INT 0-100) - Manipulation tactics detected
- `values_alignment_score` (INT 0-100) - Values alignment (100 = aligned)
- `overall_risk_score` (INT) - Generated: max of toxicity, misinformation, manipulation, 100-values_alignment
- `risk_level` (TEXT) - Generated: 'Low' (0-25), 'Medium' (25-50), 'High' (50-75), 'Critical' (75-100)
- `*_details` (TEXT) - Explanations for each score

## API Endpoints

### POST /api/analyze
Analyzes content across all four cognitive defense layers.

**Request Body:**
```json
{
  "content": "string (required)",
  "contentType": "text|url|document",
  "sourceUrl": "string (optional)"
}
```

**Response:**
```json
{
  "contentId": "uuid",
  "toxicityScore": 0-100,
  "toxicityDetails": "explanation",
  "misinformationScore": 0-100,
  "misinformationDetails": "explanation",
  "manipulationScore": 0-100,
  "manipulationDetails": "explanation",
  "valuesAlignmentScore": 0-100,
  "valuesAlignmentDetails": "explanation",
  "overallRiskScore": 0-100,
  "riskLevel": "Low|Medium|High|Critical"
}
```

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase account with a PostgreSQL database
- Vercel account (for AI Gateway access)

### Environment Variables

The following env vars are required and will be automatically set by v0:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# AI Gateway (Vercel AI SDK automatically uses this)
# Leave empty to use default Vercel AI Gateway
```

### Installation

1. **Deploy to Vercel**: Click the Deploy button or run `vercel`
2. **Set up Supabase**: The Supabase integration will be configured automatically
3. **Install dependencies**:
   ```bash
   pnpm install
   ```

4. **Create database schema**: The Supabase migration is already applied

5. **Start development server**:
   ```bash
   pnpm dev
   ```

6. **Open browser**: Navigate to `http://localhost:3000`

## Features

### Dashboard
- **Real-time Analysis**: Analyze content instantly with streaming results
- **4-Layer Assessment**: Simultaneous analysis across all cognitive defense layers
- **Risk Scoring**: Quantified influence risk with visual gauges
- **History Timeline**: Full audit trail of analyzed content with metrics
- **User Preferences**: Set personal values for personalized alignment scoring

### Analysis Engine
- **Toxicity Detection**: Identifies harmful, dehumanizing language
- **Misinformation Detection**: Flags false claims and misleading statements
- **Manipulation Patterns**: Detects dark UX patterns and emotional manipulation
- **Values Alignment**: Scores alignment with constitutional human dignity principles

### Content Sources
- **Text Paste**: Direct text input for quick analysis
- **URL Analysis**: Paste social media URLs or articles
- **Document Upload**: Support for pasted document content
- **Browser Content**: Analyze content from open web pages

## Security & Privacy

- **Row Level Security (RLS)**: All user data is isolated by user_id
- **End-to-End**: Analysis happens server-side with no data logging
- **Auth**: Supabase email/password with secure session cookies
- **CORS Protected**: API endpoints validate authentication

## Future Enhancements

### Phase 2
- Browser extension for real-time content analysis
- Live social media feed monitoring
- Personalized values profiles with detailed customization
- Advanced manipulation pattern detection with behavioral signals
- Community fact-check integration

### Phase 3
- Multi-language support
- Federated learning for collaborative defense
- Influence source tracking and exposure metrics
- Constitutional AI guardrails for system behavior
- Privacy-preserving analytics dashboard

### Phase 4
- Decentralized fact-checking network
- Consumer-grade cognitive defense on mobile
- API for third-party content moderation
- Multi-modal analysis (images, video transcripts)
- Influence impact scoring for public figures

## Testing

### Manual Testing
1. Sign up with test email
2. Paste toxic content → Should see high toxicity score
3. Paste misinformation → Should detect false claims
4. Paste manipulative content → Should flag persuasion tactics
5. Paste aligned content → Should score high on values alignment

### Example Test Cases
- Toxicity: Hateful speech, slurs, dehumanizing language
- Misinformation: False statistics, debunked claims, misleading headlines
- Manipulation: FOMO tactics, scarcity language, emotional appeals
- Values Alignment: Content respecting autonomy, truthfulness, human dignity

## Performance Notes

- Analysis takes 2-5 seconds per content item (LLM inference time)
- Results are cached in database for instant historical retrieval
- Batch analysis coming in Phase 2

## License

MIT

## Contributing

This is an MVP for the Influence Firewall cognitive defense system. Contributions welcome for:
- Additional detection patterns
- Language support
- Performance optimization
- UI/UX improvements
- Documentation

## Support

For issues, questions, or feature requests, please open an issue in the repository or contact the team.
