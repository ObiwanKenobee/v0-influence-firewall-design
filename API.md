# Influence Firewall API Documentation

## Overview

The Influence Firewall API provides a single endpoint for analyzing digital content across four cognitive defense layers: toxicity, misinformation, manipulation, and values alignment.

## Base URL

```
http://localhost:3000/api
```

## Authentication

All API endpoints require authentication via Supabase. The user must be logged in to access the API. Authentication is handled via secure HTTP-only cookies.

**Protected by**: Supabase Auth + Row Level Security

## Endpoints

### POST /api/analyze

Analyzes content across all four cognitive defense layers and returns risk scores.

#### Request

```http
POST /api/analyze HTTP/1.1
Content-Type: application/json
```

**Request Body:**

```json
{
  "content": "string (required)",
  "contentType": "text|url|document",
  "sourceUrl": "string (optional)"
}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `content` | string | Yes | The content to analyze (up to 1000 chars used) |
| `contentType` | enum | No | Type of content: "text" (default), "url", or "document" |
| `sourceUrl` | string | No | Source URL for reference (only for URLs) |

**Example Request:**

```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "content": "This is hateful and manipulative content trying to mislead you into buying our product through fear tactics.",
    "contentType": "text"
  }'
```

#### Response

**Success (200 OK):**

```json
{
  "contentId": "550e8400-e29b-41d4-a716-446655440000",
  "toxicityScore": 45,
  "toxicityDetails": "Content contains some aggressive language and personal attacks. Phrases like 'hateful' and negative characterizations present but not extreme.",
  "misinformationScore": 60,
  "misinformationDetails": "Claims appear exaggerated without specific evidence. The statement about product benefits is vague and potentially misleading.",
  "manipulationScore": 78,
  "manipulationDetails": "Strong fear-based manipulation detected. Uses FOMO (fear of missing out), urgency tactics, and emotional appeals to drive behavior.",
  "valuesAlignmentScore": 35,
  "valuesAlignmentDetails": "Low alignment with values of autonomy and truthfulness. Attempts to override user judgment through emotional pressure.",
  "overallRiskScore": 78,
  "riskLevel": "High"
}
```

**Error Responses:**

```json
// 401 Unauthorized
{
  "error": "Unauthorized"
}

// 400 Bad Request
{
  "error": "Missing required field: content"
}

// 500 Internal Server Error
{
  "error": "Failed to analyze content"
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `contentId` | UUID | Unique ID for the analyzed content (for history retrieval) |
| `toxicityScore` | Integer (0-100) | Harmful language and hate speech detection |
| `toxicityDetails` | String | Explanation of toxicity score |
| `misinformationScore` | Integer (0-100) | False claims and misleading statements detection |
| `misinformationDetails` | String | Explanation of misinformation score |
| `manipulationScore` | Integer (0-100) | Dark patterns and manipulation tactics detection |
| `manipulationDetails` | String | Explanation of manipulation score |
| `valuesAlignmentScore` | Integer (0-100) | Alignment with human dignity and truthfulness |
| `valuesAlignmentDetails` | String | Explanation of values alignment score |
| `overallRiskScore` | Integer (0-100) | Maximum of toxicity, misinformation, manipulation, and (100-values) |
| `riskLevel` | String | Categorical risk: "Low" (0-25), "Medium" (25-50), "High" (50-75), "Critical" (75-100) |

## Analysis Layers

### 1. Toxicity Detection

**Scale**: 0-100

**Detects**:
- Hateful speech
- Dehumanizing language
- Personal attacks
- Threats and intimidation
- Slurs and offensive language

**Scoring**:
- 0-25: Safe, respectful content
- 25-50: Some aggressive language or mild attacks
- 50-75: Significant toxicity or hateful content
- 75-100: Extreme toxicity, severe dehumanization

### 2. Misinformation Detection

**Scale**: 0-100

**Detects**:
- False factual claims
- Misleading statistics
- Debunked conspiracy theories
- False attributions
- Misleading headlines

**Scoring**:
- 0-25: Appears factually accurate
- 25-50: Some dubious or unverified claims
- 50-75: Significant false statements
- 75-100: Mostly false or completely misleading

### 3. Manipulation Patterns

**Scale**: 0-100

**Detects**:
- Emotional manipulation
- FOMO (Fear of Missing Out) tactics
- Scarcity/urgency language
- False authority claims
- Dark UX patterns
- Deceptive design patterns
- Sunk cost fallacies
- Social proof manipulation

**Scoring**:
- 0-25: Straightforward, honest messaging
- 25-50: Some persuasion techniques present
- 50-75: Heavy use of manipulation tactics
- 75-100: Extreme manipulation attempts

### 4. Values Alignment

**Scale**: 0-100

**Alignment With**:
- Human dignity and respect
- Truthfulness and transparency
- Autonomy and freedom of choice
- Wellbeing and safety
- Justice and fairness

**Scoring**:
- 0-25: Violates core values, dehumanizing
- 25-50: Mixed alignment with values
- 50-75: Mostly aligned with values
- 75-100: Strongly aligned with constitutional values

## Overall Risk Score

The overall risk score is calculated as:

```
overall_risk_score = max(
  toxicity_score,
  misinformation_score,
  manipulation_score,
  100 - values_alignment_score
)
```

This ensures that any single high-risk layer triggers a high overall score.

**Risk Levels**:
- **Low** (0-25): Safe to engage
- **Medium** (25-50): Worth reviewing carefully
- **High** (50-75): Significant risks present
- **Critical** (75-100): Severe risks, recommend avoiding

## Usage Examples

### Example 1: Analyzing Toxic Content

```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Anyone who believes that is absolutely stupid and should be eliminated from society.",
    "contentType": "text"
  }'
```

**Expected Response**:
```json
{
  "contentId": "...",
  "toxicityScore": 85,
  "toxicityDetails": "Extreme dehumanizing language with calls for elimination. Uses cognitive prejudice to justify harm.",
  "misinformationScore": 30,
  "misinformationDetails": "Opinion-based statement without factual claims",
  "manipulationScore": 25,
  "manipulationDetails": "Some inflammatory language but minimal tactical manipulation",
  "valuesAlignmentScore": 10,
  "valuesAlignmentDetails": "Severe violation of human dignity and respect for persons",
  "overallRiskScore": 85,
  "riskLevel": "Critical"
}
```

### Example 2: Analyzing Misinformation

```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Studies prove that 95% of vaccinations cause autism. The government is hiding this evidence from the public.",
    "contentType": "text"
  }'
```

**Expected Response**:
```json
{
  "toxicityScore": 20,
  "misinformationScore": 92,
  "manipulationScore": 55,
  "valuesAlignmentScore": 25,
  "overallRiskScore": 92,
  "riskLevel": "Critical"
}
```

### Example 3: Analyzing Manipulation

```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "content": "ACT NOW! Limited time offer - only 3 left in stock! Don't miss out like everyone else. Click immediately or regret it forever!",
    "contentType": "text"
  }'
```

**Expected Response**:
```json
{
  "toxicityScore": 10,
  "misinformationScore": 35,
  "manipulationScore": 72,
  "valuesAlignmentScore": 40,
  "overallRiskScore": 72,
  "riskLevel": "High"
}
```

### Example 4: Analyzing Aligned Content

```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "content": "We believe in treating all people with dignity and respect. Our transparent process ensures you have complete information to make your own choices.",
    "contentType": "text"
  }'
```

**Expected Response**:
```json
{
  "toxicityScore": 5,
  "misinformationScore": 15,
  "manipulationScore": 10,
  "valuesAlignmentScore": 85,
  "overallRiskScore": 15,
  "riskLevel": "Low"
}
```

## Error Handling

### 401 Unauthorized

**Cause**: User is not authenticated

**Solution**: Log in via the /auth/login page first

```json
{
  "error": "Unauthorized"
}
```

### 400 Bad Request

**Cause**: Missing required fields or invalid format

**Solution**: Verify request body includes "content" field

```json
{
  "error": "Missing required field: content"
}
```

### 500 Internal Server Error

**Cause**: Server error during analysis or database storage

**Solution**: Check logs and try again. If persistent, contact support.

```json
{
  "error": "Failed to analyze content"
}
```

## Rate Limiting

**Current Status**: Not implemented (Phase 2)

**Recommended Limits**:
- 100 analyses per day per user
- 10 analyses per minute per user
- 5 concurrent analyses per user

## Performance

- **Latency**: 2-5 seconds per analysis (due to 4 parallel LLM calls)
- **Throughput**: ~10-20 analyses per second per server instance
- **Data Storage**: ~1-2KB per analysis result

## Data Retention

All analyzed content and results are stored in the database:
- **User Data**: Retained indefinitely (user can request deletion)
- **Analysis History**: Available in dashboard
- **Automatic Deletion**: When user account is deleted (cascade)

## Privacy & Security

- All data encrypted in transit (HTTPS)
- Row Level Security prevents cross-user data access
- User authentication required for all operations
- LLM receives content but does not log/store separately
- Database backups retained per Supabase policies

## Changelog

### Version 1.0.0 (Current)
- Initial MVP release
- 4-layer analysis engine
- User authentication
- History persistence
- 3 content input types

## Future Enhancements

- [ ] Batch analysis endpoint
- [ ] Webhook support
- [ ] Advanced filtering and search
- [ ] Analytics API
- [ ] Export/download results
- [ ] Custom model fine-tuning
- [ ] Image/video analysis support
