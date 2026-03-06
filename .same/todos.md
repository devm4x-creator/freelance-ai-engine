# Freelance AI Engine - Todos

## Project Setup (Same IDE)
- [x] Connected to GitHub: https://github.com/devm4x-creator/freelance-ai-engine
- [x] Branch: main (tracking origin/main)
- [x] Workflow: Changes → Commit → Push to GitHub → Netlify auto-deploys to aifreelancer.app
- [x] Supabase connected: https://wwsjoagnsjjynuaiwfuz.supabase.co
- [x] .env.local configured with database credentials

## Completed
- [x] Delete Brief Analyzer tool (محلل البريف)
- [x] Rename Business Builder to Proposal Writer (كاتب العروض)
- [x] Add currency selector to landing page generator
- [x] Add edit name icon in settings page
- [x] Set up GitHub repository for Netlify deployment
- [x] Fix Netlify deployment configuration
- [x] **Generation Tracking System Implemented:**
  - Free plan: 20 generations per month
  - Pro plan ($9): 300 generations per month
  - Business plan ($19): 1000 generations per month
  - Updated /api/generate route to check limits and log generations
  - Updated dashboard to show monthly generation stats with progress bar
  - Added database migrations for generation tracking (003_generation_tracking.sql)
  - Generation stats fetched from API and displayed in dashboard
- [x] **Updated Upgrade Page:**
  - Redesigned with 3 plan cards (Free, Pro, Business)
  - Shows current plan with generation usage
  - Pro: $9/month (2,000 DZD) - 300 generations
  - Business: $19/month (4,000 DZD) - 1000 generations
  - Payment methods with availability status

## Completed Recently
- [x] Removed "(X.XX USD/mo avg)" text from yearly billing display on upgrade page
- [x] Replaced OpenAI DALL-E with KREA Flux API for logo generation
- [x] Tested KREA Ideogram 3.0 (requires higher plan - reverted to Flux 1 Dev)
- [x] Enhanced logo generation API with improved prompt engineering
- [x] Added Arabic typography support for logo text
- [x] Added style variations and layout options for logo diversity
- [x] **Upgraded Logo Generation to Seedream 4:**
  - Replaced Flux 1 Dev with ByteDance Seedream 4 model
  - Better for text rendering and photorealism
  - Enhanced prompt engineering with detailed style/color keywords
  - Added random seeds for variation diversity
  - Improved composition and layout instructions
  - ~20 seconds per image generation time
  - Higher quality logos with better text accuracy
- [x] **Fixed Logo Mockups Display:**
  - Added separate "Brand Name" input field for mockups
  - Mockups now show brand name instead of full prompt
  - Logos display without white background using mix-blend-mode
  - Smart brand name extraction from prompt as fallback
  - Updated saved logos to store brand name

## Note on KREA Models
- **Flux 1 Dev**: Previous model (~6-7 seconds per image)
- **Seedream 4**: Current model - best for text/logos (~20 seconds per image) ✅ ACTIVE
- **Seedream 5 Lite**: Alternative model available on KREA
- **Ideogram 3.0**: Requires higher KREA subscription plan (HTTP 402 error)
- **Note**: Seedream 4.5 does NOT exist on KREA API - only Seedream 4 is available

## NEW Environment Variable Required
- `KREA_API_KEY` - Get from https://www.krea.ai/settings/api-tokens

## Completed Recently
- [x] **Generation Tracking Per User:**
  - Each tool deducts from user's monthly generation limit
  - Proposal Writer: 1 generation per proposal
  - Logo Generator: 3 generations for 3 logo variations
  - All tools check limits before generating
  - Shows remaining generations in success messages
  - Blocks generation when limit is reached with upgrade prompt
  - Updated database function to support count parameter

## Completed Recently
- [x] Updated roadmap goal from 20,000 DZD to $100 USD (currency in dollars)
- [x] Fixed corrupted/duplicated code in roadmap page

## In Progress
- [ ] Test Chargily payment integration with real credentials

## Critical - Payment Setup
- [ ] Add CHARGILY_SECRET_KEY to Netlify environment variables
- [ ] Add Webhook in Chargily Dashboard
- [ ] Add CHARGILY_WEBHOOK_SECRET to Netlify
- [ ] Update webhook handler to activate subscriptions in Supabase

## Generation Limits Summary
| Plan | Generations/Month | Price USD | Price DZD |
|------|------------------|-----------|-----------|
| Free | 20 | $0 | 0 د.ج |
| Pro | 300 | $9 | 2,000 د.ج |
| Business | 1000 | $19 | 4,000 د.ج |

## Deployment Info
- **Domain**: www.aifreelancer.app / aifreelancer.app
- **Repository**: https://github.com/devm4x-creator/freelance-ai-engine
- **Important**: Add these to Netlify Environment Variables:
  - `KREA_API_KEY` (for logo generation)
  - `OPENAI_API_KEY` (for text generation)
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `CHARGILY_SECRET_KEY`
