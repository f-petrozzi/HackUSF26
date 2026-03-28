## Overview

This document translates the approved business requirements into technical requirements for the MVP and identifies future phase items. The MVP is a web application with responsive mobile sizing support targeted at university students who want integrated health, meal, and workout guidance.

The MVP includes:

- Garmin integration
- AI meal and workout assistants
- Recipe extraction and parsing
- Personalized recommendations based on profile and health data
- Historical metric tracking and comparisons
- Developer analytics dashboard
- Pseudonymized data governance and PII protection

Future phase items include Apple Health integration, advanced collaborative filtering, push notifications, richer recovery logic, and multi-role admin access.

---

| System Area | Technical Requirement | Priority | MVP / Future |
| --- | --- | --- | --- |
| Authentication | Require authentication before any health or recommendation features are accessible | P0 | MVP |
| Authentication | Store only auth provider subject ID, internal pseudonymous user ID, and support email in the application database | P0 | MVP |
| Authentication | Separate PII storage from health, recommendation, and analytics data | P0 | MVP |
| Authentication | Support account deletion through soft delete followed by permanent purge after a retention period | P1 | MVP |
| Authentication | Allow users to disconnect wearable accounts | P1 | MVP |
| Authentication | Provide a single internal admin role with separate access controls | P1 | MVP |
| Onboarding | Require onboarding completion before dashboard access | P0 | MVP |
| Onboarding | Use a single-screen questionnaire to collect age range, sex, height, weight, goals, activity level, gym frequency, equipment, dietary style, allergies, injuries, sleep quality, and cooking time preference | P0 | MVP |
| Onboarding | Allow one active goal at a time and allow it to be changed later | P0 | MVP |
| Garmin Integration | Support Garmin as the only live wearable integration in MVP | P0 | MVP |
| Garmin Integration | Use OAuth and scheduled polling for Garmin sync | P0 | MVP |
| Garmin Integration | Store steps, sleep, heart rate, resting heart rate, HRV, stress, calories burned, workouts, and weight | P0 | MVP |
| Garmin Integration | Store both raw wearable data and normalized daily summaries | P1 | MVP |
| Garmin Integration | Retain historical data for day, week, and month comparisons | P0 | MVP |
| Garmin Integration | Support future webhook integration if Garmin later supports it | P2 | Future |
| Manual Input | Allow manual entry of weight, sleep hours, workouts, calories, and notes | P0 | MVP |
| Manual Input | Allow manual values to override Garmin values after a warning popup | P1 | MVP |
| Manual Input | Estimate missing values using profile and recent history and clearly label them as estimates | P1 | MVP |
| Meal Assistant | Provide a dedicated AI meal planning assistant with live web browsing | P0 | MVP |
| Meal Assistant | Return the top three meal recommendations for every request | P0 | MVP |
| Meal Assistant | Base recommendations on goals, calorie target, calories burned, dietary restrictions, allergies, and recent health metrics | P0 | MVP |
| Meal Assistant | Automatically calculate a daily calorie target and allow manual override after a warning | P1 | MVP |
| Meal Assistant | Explain every recommendation and reference the metrics used | P1 | MVP |
| Meal Assistant | Limit recommendation regeneration to control cost | P1 | MVP |
| Meal Assistant | Fall back to rule-based recommendations if the AI provider fails | P1 | MVP |
| Recipe Parsing | Support recipe import from URL, pasted text, and AI assistant search results | P0 | MVP |
| Recipe Parsing | Parse recipes into ingredients, measurements, instructions, servings, and calories per serving when possible | P0 | MVP |
| Recipe Parsing | Highlight ingredients inline within instructions | P1 | MVP |
| Recipe Parsing | Store only parsed recipe data, not raw text or source URL in user-facing storage | P1 | MVP |
| Recipe Parsing | Add duplicate recipe detection | P2 | Future |
| Workout Assistant | Provide a dedicated AI workout assistant | P0 | MVP |
| Workout Assistant | Return the top three workout session recommendations | P0 | MVP |
| Workout Assistant | Use goals, equipment, workout history, sleep, stress, HRV, heart rate, injuries, and available time to generate workouts | P0 | MVP |
| Workout Assistant | Include exercises, sets, reps, rest periods, and substitutions in every workout | P0 | MVP |
| Workout Assistant | Support both cardio and strength workouts | P1 | MVP |
| Workout Assistant | Use workout history to support progression over time | P1 | MVP |
| Safety Engine | Run a rule layer before showing AI recommendations | P0 | MVP |
| Safety Engine | Trigger warnings for poor sleep, high stress, low HRV, elevated heart rate, aggressive calorie deficit, and lack of recovery | P0 | MVP |
| Safety Engine | Allow user override after warning and log the override event | P1 | MVP |
| Safety Engine | Recommend rest days, lighter workouts, or increased calories when needed | P1 | MVP |
| Dashboard | Provide separate tabs for Dashboard, Chat, Meals, Recipes, Workouts, Profile, and Admin | P0 | MVP |
| Dashboard | Show today's metrics, recommendation summaries, trend charts, goal progress, recent meals, recent workouts, and raw metrics | P0 | MVP |
| Dashboard | Allow comparisons by day, week, and month | P1 | MVP |
| Dashboard | Support both chart-based and card-based views | P1 | MVP |
| Feedback | Allow recommendation ratings using thumbs up/down or 1-5 scale | P1 | MVP |
| Feedback | Store recommendation feedback with timestamp and recommendation inputs | P1 | MVP |
| Similar Users | Use clustering based on profile and questionnaire data with seeded synthetic users | P1 | MVP |
| Similar Users | Label similar-user functionality as beta | P2 | MVP |
| Admin Dashboard | Provide an internal admin dashboard behind admin authentication | P1 | MVP |
| Admin Dashboard | Track signups, onboarding completion, Garmin success, sync failures, AI usage, recipe import success, recommendation acceptance, workout saves, DAU, errors, and override rates | P1 | MVP |
| Admin Dashboard | Allow filtering by feature and error type | P1 | MVP |
| Admin Dashboard | Restrict admin views to anonymized analytics only | P0 | MVP |
| Data Governance | Log analytics events as append-only immutable records | P1 | MVP |
| Data Governance | Log and store every recommendation with inputs, outputs, timestamp, and feedback | P1 | MVP |
| Data Governance | Encrypt health and profile data in transit and at rest | P0 | MVP |
| Data Governance | Logically separate PII, health metrics, recipes, embeddings, and analytics storage domains | P0 | MVP |
| Data Governance | Support local development using mocked Garmin and AI data | P1 | MVP |
| Vector Database | Include a vector database for semantic recipe search, workout retrieval, user preference retrieval, and analytics exploration | P1 | MVP |
| Vector Database | Generate embeddings for recipes and user preferences | P1 | MVP |
| AI Architecture | Provide separate meal and workout assistants with tool calling and streaming responses | P1 | MVP |
| AI Architecture | Give assistants access to profile, health metrics, saved recipes, and workout history through a unified context layer | P1 | MVP |
| API | Expose a single backend API to the frontend | P0 | MVP |
| API | Document internal API contracts for major modules | P1 | MVP |
| Background Jobs | Run background jobs for Garmin sync, recipe parsing, embedding generation, and analytics aggregation | P1 | MVP |
| Reliability | Surface failed Garmin syncs, recipe parsing failures, and AI failures in the admin dashboard | P1 | MVP |
| Reliability | Continue functioning in manual mode when Garmin is unavailable | P0 | MVP |
| Reliability | Fail gracefully when external APIs are unavailable | P1 | MVP |
| Security | Add audit logging for admin actions | P1 | MVP |
| Security | Add rate limiting for chat and recipe import endpoints | P1 | MVP |
| Security | Use secrets management and separate local, staging, and production environments | P1 | MVP |
| Future Phase | Add Apple Health integration | P2 | Future |
| Future Phase | Add push notifications and reminders | P2 | Future |
| Future Phase | Add advanced collaborative filtering using real production user behavior | P2 | Future |
| Future Phase | Add global recommendation learning from user feedback | P2 | Future |
| Future Phase | Add multi-role admin access | P2 | Future |
| Future Phase | Add grocery list generation | P2 | Future |
| Future Phase | Add persistent conversational memory in the chatbot | P2 | Future |
- The system shall require user authentication before any health or recommendation features can be accessed.
- The system shall support authentication through a third-party identity provider.
- The application database shall store only the authentication provider subject ID, pseudonymous internal user ID, and required support email.
- Personally identifiable information shall be isolated in a dedicated user identity store separate from health, analytics, and recommendation data.
- The backend shall not use names or emails as primary keys.
- The system shall support account deletion through soft delete followed by permanent purge after a configurable retention period.
- The system shall allow users to disconnect wearable accounts.
- The system shall support a single admin role with separate access controls.

### Acceptance Criteria

- Users cannot access app data without authentication.
- Health and recommendation tables contain no names or direct identifiers.
- Deleting an account marks it inactive immediately and permanently removes data after the purge window.
- Admin users can only view anonymized user level analytics.

## 2. Onboarding and User Profile

### Technical Requirements

- The system shall require onboarding completion before recommendations are shown.
- The onboarding flow shall be a single-screen questionnaire.
- Required onboarding fields shall include:
    - Age range
    - Sex
    - Height
    - Weight
    - Primary goal
    - Activity level
    - Gym frequency
    - Equipment access
    - Dietary style
    - Allergies
    - Injuries or limitations
    - Typical sleep quality
    - Preferred cooking time
- Optional fields may include preferred cuisines, disliked foods, and manual calorie target override.
- The system shall allow users to maintain one active goal at a time and change it later.
- The system shall support manual override of calorie targets and recommendation warnings.

### Acceptance Criteria

- Users cannot continue to the dashboard until all required fields are completed.
- Users can change goals and profile settings after onboarding.
- Changing a goal updates recommendation inputs immediately.

## 3. Garmin Integration and Health Data

### Technical Requirements

- The MVP shall support live Garmin integration only.
- Garmin data shall be retrieved using OAuth and scheduled polling.
- The architecture shall support future webhook integration if Garmin later supports it.
- The system shall ingest and store:
    - Steps
    - Sleep duration
    - Heart rate
    - Resting heart rate
    - HRV
    - Stress
    - Calories burned
    - Workout sessions
    - Weight if available
- Garmin sync jobs shall run periodically in the background.
- The system shall store both raw wearable data and normalized daily summaries.
- Historical health data shall be retained for longitudinal trend analysis.
- If Garmin data is unavailable, the user may manually enter metrics.
- Manual values may override Garmin values after a warning confirmation.

### Acceptance Criteria

- Garmin connection succeeds for at least 90% of test accounts.
- Newly synced data appears in the dashboard after the next polling cycle.
- Manual overrides are logged and retained.
- Users can compare historical data by day, week, and month.

## 4. Manual Data Entry

### Technical Requirements

- The system shall support manual entry of:
    - Weight
    - Sleep hours
    - Workout completion
    - Calories consumed
    - Notes
- The system shall support full manual operation when no Garmin account is connected.
- The system shall estimate missing values where possible using profile and recent history.
- Estimated values shall be shown to the user and clearly labeled.

### Acceptance Criteria

- A user without Garmin can complete onboarding and receive recommendations.
- Estimated values are visually distinguished from measured values.

## 5. AI Meal Assistant

### Technical Requirements

- The system shall provide a dedicated AI meal planning assistant.
- The meal assistant shall be allowed to browse the web.
- The assistant shall return the top three meal recommendations.
- Meal recommendations shall incorporate:
    - User goal
    - Daily calorie target
    - Calories burned
    - Dietary restrictions
    - Allergies
    - Saved preferences
    - Recent activity and recovery metrics
- The assistant shall calculate a daily calorie target automatically.
- The user may manually override the calorie target after a warning.
- The assistant shall support limited recommendation regeneration to reduce API cost.
- The assistant shall explain why each recommendation was generated and cite the metrics used.
- The assistant shall fall back to rule-based recommendations if the LLM fails.

### Acceptance Criteria

- Meal recommendations always return three options.
- Recommendations include calorie estimates and reasoning.
- The system gracefully falls back if the AI provider fails.

## 6. Recipe Extraction and Parsing

### Technical Requirements

- The system shall support recipe creation from:
    - URL input
    - Raw pasted text
    - AI assistant web search
- Recipes shall be parsed into:
    - Ingredients
    - Measurements
    - Instructions
    - Servings
    - Estimated calories per serving when possible
- Ingredients referenced in instructions shall be highlighted inline.
- Parsed recipes shall be stored in a centralized recipe repository.
- Only the parsed recipe data shall be stored. Original source URLs and raw text shall not be stored in the user-facing database.
- Duplicate recipe detection is a future enhancement and not required for MVP.

### Acceptance Criteria

- At least 90% of supported recipe URLs and pasted text are parsed successfully.
- Parsed recipes display in a standardized format.

## 7. AI Workout Assistant

### Technical Requirements

- The system shall provide a dedicated AI workout assistant.
- The workout assistant shall return the top three workout session recommendations.
- Workout recommendations shall be generated using:
    - Goal
    - Equipment access
    - Workout history
    - Sleep
    - Stress
    - HRV
    - Resting heart rate
    - Injury limitations
    - Available workout time
- Each recommendation shall include:
    - Exercises
    - Sets
    - Reps
    - Rest periods
    - Exercise substitutions
- The assistant shall support both strength and cardio workouts.
- The assistant shall support progression using overall workout history.
- The assistant shall limit recommendation regeneration.

### Acceptance Criteria

- The assistant returns three complete workout options.
- Recommendations change when recovery metrics worsen.
- Workouts can be saved and logged.

## 8. Safety and Rule Engine

### Technical Requirements

- The system shall include a non-bypassable rule evaluation layer before any AI recommendation is shown.
- The rule engine shall evaluate:
    - Poor sleep
    - High stress
    - Low HRV
    - Elevated resting heart rate
    - Aggressive calorie deficits
    - Insufficient recovery days
- The system shall show a warning dialog when these thresholds are triggered.
- The user may override the recommendation after acknowledging the warning.
- The override action shall be logged.
- The system shall support recommending rest days, light workouts, or increased calories when appropriate.

### Acceptance Criteria

- Unsafe recommendations are intercepted before display.
- Warning overrides are recorded and visible in admin analytics.

## 9. Dashboard and Historical Views

### Technical Requirements

- The application shall provide separate tabs for:
    - Dashboard
    - Chat
    - Meals
    - Recipes
    - Workouts
    - Profile
    - Admin
- The dashboard shall default to today's metrics.
- The dashboard shall include:
    - Key metric cards
    - Recommendation summaries
    - Historical trend charts
    - Goal progress
    - Recent meals and workouts
    - Raw wearable metrics
- Users shall be able to compare metrics by day, week, and month.
- Users shall be able to switch between card-based and chart-based views.

### Acceptance Criteria

- Users can view both summarized and raw data.
- Dashboard views load within acceptable user expectations for the demo.

## 10. Feedback and Recommendation Learning

### Technical Requirements

- The system shall allow users to rate recommendations with either thumbs up/down or a 1-5 rating.
- Ratings shall be stored with the recommendation, inputs, and timestamp.
- Recommendation feedback shall affect future model quality analytics but not real-time learning during MVP.
- Similar-user logic shall use clustering of profile and questionnaire data combined with synthetic seed users.
- Similar-user features shall be labeled as beta.

### Acceptance Criteria

- Users can submit feedback on every recommendation.
- Feedback data is visible in admin analytics.

## 11. Admin Dashboard and Analytics

### Technical Requirements

- The system shall provide an internal admin dashboard inside the same application behind admin authentication.
- The admin dashboard shall track:
    - Signups
    - Onboarding completion
    - Garmin connection success
    - Sync failures
    - AI assistant usage
    - Recipe import success
    - Recommendation acceptance
    - Workout saves
    - Daily active users
    - Error types
    - Recommendation override rates
- Analytics events shall be append-only and immutable.
- Admin users shall be able to filter by feature and error type.
- The admin dashboard shall not expose identifiable user data.

### Acceptance Criteria

- The team can monitor feature adoption and failures in real time.
- Error spikes are visible without viewing user identities.

## 12. Data Storage and Governance

### Technical Requirements

- The system shall logically separate:
    - Identity and PII data
    - Health metrics
    - Recipes
    - Analytics logs
    - Vector embeddings
- The system shall encrypt health and profile data both in transit and at rest.
- The system shall support append-only event logging.
- The system shall store every recommendation with:
    - Inputs
    - Output text
    - Timestamp
    - User feedback
- The system shall not store raw AI prompts or conversations in MVP.
- The system shall support local development with mocked Garmin and AI data.
- Seed data and demo personas shall be provided.

### Acceptance Criteria

- PII and health data are stored in separate domains.
- Recommendation history is auditable.

## 13. Vector Database and AI Architecture

### Technical Requirements

- The MVP shall include a vector database.
- The vector database shall support:
    - Semantic recipe search
    - Retrieval of user preferences
    - Workout retrieval
    - Analytics exploration
- Embeddings shall be generated for recipes and user preferences.
- The chatbot shall access a unified context layer containing:
    - User profile
    - Health metrics
    - Saved recipes
    - Workout history
- AI interactions shall use structured tool-calling patterns.
- AI responses shall stream progressively in the UI.

### Acceptance Criteria

- Semantic search returns relevant recipes and workout suggestions.
- AI responses continue functioning even when some context sources are unavailable.

## 14. API and Background Processing

### Technical Requirements

- The frontend shall communicate through a single backend API.
- The backend shall expose documented internal API contracts.
- The system shall support background jobs for:
    - Garmin sync
    - Recipe parsing
    - Embedding generation
    - Analytics aggregation
- The system shall support local development using mocked integrations.
- Seed demo users and sample data shall be available for testing.

### Acceptance Criteria

- Developers can run the app locally without external services.
- Background jobs continue operating independently from the UI.

## 15. Security, Logging, and Reliability

### Technical Requirements

- The system shall support:
    - Audit logging for admin actions
    - Rate limiting for AI and recipe endpoints
    - Secrets management
    - Separate environments for local, staging, and production
- The system shall surface failed syncs, failed recipe parsing, and failed AI calls in the admin dashboard.
- The system shall fail gracefully when external APIs are unavailable.
- The system shall continue operating in manual-entry mode if Garmin is unavailable.

### Acceptance Criteria

- Failed external integrations are visible to the team.
- The application remains usable when integrations fail.

---

# Business Requirement to Technical Requirement

| Business Requirement | Technical Requirement |
| --- | --- |
| Combine wearable health data, nutrition, and fitness guidance into one app | System provides integrated dashboard, AI meal assistant, AI workout assistant, and historical health data in a single authenticated application. |
| Connect to wearable devices such as Garmin and Apple Watch | MVP supports Garmin integration through OAuth and polling. Apple Health is future phase. |
| Weight device data more heavily than manual input | Recommendation engine prioritizes Garmin values and only allows manual override after warning confirmation. |
| Create and maintain a user profile with demographics, goals, and preferences | Single-screen onboarding captures required profile fields and stores them in pseudonymized profile tables. |
| Track sleep, steps, exercise, heart rate, HRV, stress, calories burned, and other metrics | Garmin integration and manual entry support capture all required health metrics and store raw plus normalized values. |
| Allow manual entry of health metrics | Manual logging supports weight, sleep, calories, workouts, and notes. |
| Suggest values for manual entries based on profile and history | Missing value estimation uses profile and recent history and labels estimates clearly. |
| Estimate missing health metrics for users without devices | Rule-based estimation generates visible placeholder values when wearable data is unavailable. |
| Provide a dashboard with trends, insights, and recommendations | Dashboard includes summary cards, trend charts, recommendations, and raw metric views. |
| Recommend meals, nutrition, and workouts based on similar users | Similar-user clustering combines profile data and seed cohorts to influence recommendations. |
| Include meal logging and nutrition tracking | Meal assistant and manual logging support calorie tracking and meal history. |
| Import recipes from websites or text | Recipe parser accepts URLs, pasted text, and AI-discovered recipes. |
| Reformat imported recipes into ingredients, measurements, and instructions | Recipe parser outputs standardized recipe structure. |
| Highlight ingredients within recipe instructions and show measurements inline | Parsed instructions include inline ingredient highlighting. |
| Remember previously imported recipes to reduce duplicate processing | Duplicate detection deferred to future phase. |
| Search the internet for recipes based on goals, restrictions, ingredients, and time | AI meal assistant may browse the web and return top three filtered meal options. |
| Recommend meals and recipes based on recent health data | Meal assistant incorporates calorie burn, recovery metrics, and current goal. |
| Log selected recipes and meals into nutrition history | Selected meals are stored in the user meal history table. |
| Generate exercise recommendations and workout plans | Workout assistant generates three structured workout sessions. |
| Adapt meal and workout recommendations based on sleep, stress, and recovery | Rule engine and AI assistant use sleep, stress, HRV, and heart rate to modify recommendations. |
| Explain why each recommendation was made | Every recommendation includes a text explanation citing the metrics used. |
| Allow users to rate whether recommendations worked | Recommendations can be rated and stored with timestamps. |
| Improve recommendations over time using collected data and feedback | Recommendation feedback is stored for future model quality analytics. |
| Support a wide range of fitness levels and health goals | Onboarding captures activity level, equipment access, and one active goal. |
| Protect user privacy by limiting stored personally identifiable information | PII is isolated in a separate store and not mixed with health or analytics tables. |
| Securely store historical user data and recipe information | Health, recipes, and recommendations are retained and encrypted. |
| Provide an internal analytics dashboard for the development team | Admin dashboard tracks feature usage, errors, and recommendation quality. |
| Allow users to set a primary goal such as weight loss, muscle gain, or improved sleep | User profile supports one active goal that may be changed later. |
| Provide a daily summary of key metrics and next actions | Dashboard defaults to today's metrics and recommendation summaries. |
| Notify users when important trends are detected | Future phase item. Not included in MVP. |
| Support dietary styles and restrictions such as vegetarian, vegan, gluten-free, and allergies | Onboarding and meal assistant include dietary styles, allergies, and restrictions. |
| Allow users to save favorite meals, recipes, and workouts | Users can save recipes and workouts to personal history and favorites. |
| Allow users to compare their current metrics to previous weeks or months | Dashboard provides historical chart and card comparisons by day, week, and month. |

# Explicit Future Phase Items

- Apple Health integration
- Push notifications and reminders
- True webhook-based live sync if Garmin later supports it
- Duplicate recipe detection
- Advanced collaborative filtering based on real production users
- Multi-role admin access
- Global model retraining based on recommendation feedback

- Full medical-style recovery and risk logic
- Grocery list generation
- Persistent conversational memory for the chatbot