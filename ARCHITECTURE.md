# Influence Firewall Architecture Guide

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐      ┌──────────────────┐                 │
│  │  Landing Page    │      │    Dashboard     │                 │
│  │  • Hero section  │      │  • Analyze UI    │                 │
│  │  • Sign up/Login │      │  • History view  │                 │
│  │  • Features      │      │  • Risk gauge    │                 │
│  └──────────────────┘      └──────────────────┘                 │
│         │                            │                           │
│         └────────────┬───────────────┘                           │
│                      │                                           │
│              React Components                                    │
│              • content-input.tsx                                 │
│              • analysis-results.tsx                              │
│              • analysis-history.tsx                              │
│              • dashboard-client.tsx                              │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
           │
           │ HTTPS (fetch/API calls)
           ↓
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────┐       │
│  │         Next.js API Routes (Route Handlers)          │       │
│  │                                                        │       │
│  │  ┌─────────────────────────────────────────────┐    │       │
│  │  │  POST /api/analyze                          │    │       │
│  │  │  ├─ Authenticate via Supabase Auth          │    │       │
│  │  │  ├─ Store content in analyzed_content table │    │       │
│  │  │  ├─ Call 4 parallel LLM endpoints           │    │       │
│  │  │  │  ├─ Toxicity detection (GPT-4o-mini)   │    │       │
│  │  │  │  ├─ Misinformation detection           │    │       │
│  │  │  │  ├─ Manipulation detection             │    │       │
│  │  │  │  └─ Values alignment scoring           │    │       │
│  │  │  ├─ Parse and validate responses           │    │       │
│  │  │  ├─ Store results in analysis_results      │    │       │
│  │  │  └─ Return JSON response                   │    │       │
│  │  └─────────────────────────────────────────────┘    │       │
│  └──────────────────────────────────────────────────────┘       │
│                      │                                           │
│              Vercel AI SDK                                       │
│              (openai/gpt-4o-mini)                                │
│                      │                                           │
└─────────────────────────────────────────────────────────────────┘
           │
           │ API calls
           ↓
┌─────────────────────────────────────────────────────────────────┐
│              EXTERNAL SERVICES LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐    ┌──────────────────┐                   │
│  │ Vercel AI Gateway│    │  Supabase Auth   │                   │
│  │  (OpenAI Route)  │    │  (Email/Password)│                   │
│  │  • GPT-4o-mini   │    │  • Sign up       │                   │
│  │  • 4x calls      │    │  • Login         │                   │
│  │  • JSON parsing  │    │  • Sessions      │                   │
│  └──────────────────┘    └──────────────────┘                   │
│           │                       │                             │
└─────────────────────────────────────────────────────────────────┘
           │                       │
           │                       ↓
           │           ┌──────────────────────┐
           │           │  Supabase PostgreSQL │
           │           └──────────────────────┘
           │                       │
           └───────────┬───────────┘
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│                    DATA LAYER                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐ │
│  │     profiles     │  │ analyzed_content │  │analysis_results│ │
│  ├──────────────────┤  ├──────────────────┤  ├────────────────┤ │
│  │ id (uuid)        │  │ id (uuid)        │  │ id (uuid)      │ │
│  │ user_id (fk)     │  │ user_id (fk)     │  │ user_id (fk)   │ │
│  │ display_name     │  │ content_text     │  │ content_id(fk) │ │
│  │ personal_values[]│  │ content_type     │  │ toxicity_score │ │
│  │ created_at       │  │ source_url       │  │ misinf_score   │ │
│  │ updated_at       │  │ created_at       │  │ manip_score    │ │
│  │                  │  │ analyzed_at      │  │ values_score   │ │
│  │ RLS Policies:    │  │                  │  │ overall_score  │ │
│  │ • SELECT own     │  │ RLS Policies:    │  │ risk_level     │ │
│  │ • UPDATE own     │  │ • SELECT own     │  │                │ │
│  │ • DELETE own     │  │ • INSERT own     │  │ RLS Policies:  │ │
│  │                  │  │ • DELETE own     │  │ • SELECT own   │ │
│  │                  │  │                  │  │ • INSERT own   │ │
│  └──────────────────┘  └──────────────────┘  └────────────────┘ │
│           │                     │                    │            │
│           └─────────┬───────────┴────────────────────┘            │
│                     │                                             │
│            Row Level Security (RLS)                              │
│            • auth.uid() = user_id enforced                       │
│            • Users can only access their own data                │
│            • Policies created automatically                      │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow: Content Analysis

```
USER FLOW:
┌─────────────────────────────────────────────────────────────┐
│ 1. User on Dashboard                                        │
│    └─ Pastes content into text area                         │
│       └─ Selects content type (text/url/document)           │
│          └─ Clicks "Analyze Now" button                     │
└──────────────┬────────────────────────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Client-Side Processing                                  │
│    └─ Validates input (not empty)                          │
│       └─ Shows loading state with spinner                  │
│          └─ Calls fetch() POST /api/analyze                │
└──────────────┬────────────────────────────────────────────┘
               │
               ↓ HTTPS POST Request
               │
┌─────────────────────────────────────────────────────────────┐
│ 3. Server Authentication                                    │
│    └─ Middleware validates auth token                       │
│       └─ Gets user ID from Supabase session                 │
│          └─ Authorizes request (401 if unauthorized)        │
└──────────────┬────────────────────────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Content Storage                                          │
│    └─ Insert into analyzed_content table                    │
│       ├─ content_text: user's content                       │
│       ├─ content_type: 'text' | 'url' | 'document'         │
│       ├─ user_id: from auth token                           │
│       └─ source_url: optional                               │
│          └─ RLS ensures only user can access                │
└──────────────┬────────────────────────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Parallel LLM Analysis                                    │
│    └─ Call 1: Toxicity Detection                            │
│    └─ Call 2: Misinformation Detection                      │
│    └─ Call 3: Manipulation Pattern Detection                │
│    └─ Call 4: Values Alignment Scoring                      │
│       All 4 run in parallel via Promise.all()               │
│       Each uses GPT-4o-mini with temperature=0.3            │
│       Response parsing with regex fallback error handling   │
└──────────────┬────────────────────────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. Response Parsing                                         │
│    └─ Parse each LLM response to JSON                       │
│       ├─ Extract "score" field (0-100)                      │
│       ├─ Extract "details" field (explanation)              │
│       └─ Validate ranges, use defaults on error             │
└──────────────┬────────────────────────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. Result Calculation                                       │
│    └─ Compute overall_risk_score:                           │
│       max(toxicity, misinformation, manipulation,           │
│           100 - values_alignment)                           │
│       └─ Classify risk_level:                               │
│          ├─ 0-25: Low                                       │
│          ├─ 25-50: Medium                                   │
│          ├─ 50-75: High                                     │
│          └─ 75-100: Critical                                │
└──────────────┬────────────────────────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────────────────────────┐
│ 8. Result Storage                                           │
│    └─ Insert into analysis_results table                    │
│       ├─ content_id: foreign key to analyzed_content        │
│       ├─ toxicity_score & details                           │
│       ├─ misinformation_score & details                     │
│       ├─ manipulation_score & details                       │
│       ├─ values_alignment_score & details                   │
│       ├─ overall_risk_score (generated)                     │
│       ├─ risk_level (generated)                             │
│       └─ RLS ensures only user can access                   │
└──────────────┬────────────────────────────────────────────┘
               │
               ↓ JSON Response
               │
┌─────────────────────────────────────────────────────────────┐
│ 9. Client Display                                           │
│    └─ Receive JSON with all scores                          │
│       └─ Render AnalysisResults component                   │
│          ├─ Display risk gauge                              │
│          ├─ Show 4 score cards with details                 │
│          ├─ Color-code based on risk levels                 │
│          └─ Hide loading spinner                            │
└──────────────┬────────────────────────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────────────────────────┐
│ 10. History Update                                          │
│    └─ Fetch updated analysis history from dashboard         │
│       └─ Query analysis_results table (last 10)             │
│          └─ Display in AnalysisHistory component            │
└─────────────────────────────────────────────────────────────┘
```

## Authentication Flow

```
SIGN UP:
User → Sign Up Page → Enter email & password → Supabase.signUp()
  → Email sent for verification → User clicks link → Redirected
  → Middleware validates session → Redirect to dashboard

LOGIN:
User → Login Page → Enter email & password → Supabase.signIn()
  → Session created (HTTP-only cookie) → Middleware validates
  → Redirect to dashboard

PROTECTED ROUTE:
User visits /dashboard → Middleware checks auth token
  → If valid: Render page (ServerComponent fetches data)
  → If invalid: Redirect to /auth/login

LOGOUT:
User clicks Logout → Supabase.signOut() → Session cleared
  → Redirect to /auth/login
```

## Component Hierarchy

```
app/page.tsx (Landing Page)
├── Navigation
│   ├── Logo + Brand
│   └── Auth Links (Login/Sign Up)
├── Hero Section
├── Features Grid
└── CTA Section

app/dashboard/page.tsx (Server Component)
├── Fetch user auth
├── Fetch analysis history
└── <DashboardClient>
    ├── Header with Logout
    ├── Tab Navigation (Analyze/History)
    ├── Tab: Analyze Content
    │   ├── <ContentInput>
    │   │   ├── Type selector (Text/URL/Document)
    │   │   └── Dynamic textarea/input
    │   └── <AnalysisResults> (if currentAnalysis)
    │       ├── Risk Gauge
    │       └── Score Cards Grid
    └── Tab: History
        └── <AnalysisHistory>
            └── History Items List
```

## Middleware Flow

```
All Requests → middleware.ts
  ├─ Check auth status
  │  └─ Get session from Supabase
  ├─ Route type detection
  │  ├─ Public routes: /auth/*, /
  │  ├─ Protected routes: /dashboard, /api/*
  │  └─ Special routes: /auth/callback
  ├─ Apply business logic
  │  ├─ Redirect unauth to /auth/login
  │  ├─ Handle token refresh
  │  └─ Update session in response
  └─ Continue to route handler
```

## Database Indexing Strategy

```
PRIMARY INDEXES:
- profiles(id) - Primary key
- analyzed_content(id) - Primary key
- analyzed_content(user_id) - For RLS filtering
- analyzed_content(created_at) - For sorting history
- analysis_results(id) - Primary key
- analysis_results(user_id) - For RLS filtering
- analysis_results(content_id) - For foreign key
- analysis_results(created_at) - For sorting history
- analysis_results(risk_level) - For filtering by risk

GENERATED COLUMNS (No index needed):
- analysis_results(overall_risk_score) - Computed on insert
- analysis_results(risk_level) - Computed on insert
```

## Error Handling Strategy

```
CLIENT ERRORS (4xx):
400 Bad Request
  ├─ Missing content field
  ├─ Invalid content type
  └─ Malformed JSON

401 Unauthorized
  ├─ Missing auth token
  ├─ Expired session
  └─ Invalid credentials

SERVER ERRORS (5xx):
500 Internal Server Error
  ├─ LLM API failure (with retry)
  ├─ Database error (logged)
  ├─ JSON parsing failure (fallback)
  └─ Unknown error (generic message)
```

## Security Layers

```
LAYER 1: Transport
  └─ HTTPS only (enforced by Vercel)

LAYER 2: Authentication
  └─ Supabase Auth with JWT tokens
     ├─ Email verification required
     └─ Session persisted in HTTP-only cookies

LAYER 3: Authorization
  └─ Row Level Security (RLS) on all tables
     ├─ SELECT: auth.uid() = user_id
     ├─ INSERT: auth.uid() = user_id
     ├─ UPDATE: auth.uid() = user_id
     └─ DELETE: auth.uid() = user_id

LAYER 4: Data Validation
  └─ Server-side validation of all inputs
     ├─ Content field presence check
     ├─ Score range validation (0-100)
     └─ Type validation

LAYER 5: Monitoring
  └─ Console logging of errors
  └─ Failed analysis tracking
```

## Scaling Considerations

```
HORIZONTAL SCALING:
├─ Stateless API design (can run on multiple instances)
├─ Database connection pooling via Supabase
├─ Vercel serverless functions auto-scale
└─ CDN caches static assets

VERTICAL SCALING:
├─ Optimize LLM response times
├─ Cache frequently analyzed content
├─ Implement rate limiting
└─ Database query optimization

FUTURE OPTIMIZATIONS:
├─ Add Redis for caching (Upstash)
├─ Implement batch analysis (process > 1 item)
├─ Add async job queues (longer analyses)
└─ Implement webhooks for async processing
```

This architecture is designed to be:
- **Secure** - Multi-layer security from transport to database
- **Scalable** - Stateless design, serverless infrastructure
- **Maintainable** - Clear separation of concerns
- **User-Centric** - Focus on user data privacy and control
- **Resilient** - Error handling at each layer
