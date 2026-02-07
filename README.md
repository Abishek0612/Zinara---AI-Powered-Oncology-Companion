# Zinara - AI-Powered Oncology Companion

Zinara is a specialized healthcare application designed to support cancer patients through their journey by providing personalized, AI-driven medical insights. It combines secure medical profiling with advanced generative AI to offer treatment information, lifestyle guidance, and interactive support.


### System Design (Click the URL)

https://drive.google.com/file/d/1EGYYKG_Yxgxsuj7jIn4aMvcPWz260ZpJ/view?usp=sharing

## User Flow

1.  **Authentication**: Users sign up or log in securely. During registration, the system captures the user's IP address for security and compliance purposes.
2.  **Onboarding**: New users complete a specialized medical questionnaire (Cancer Type, Stage, Current Treatment). This creates the foundational Medical Profile.
3.  **Personalization**: The system uses the Medical Profile to tailor the Dashboard and all AI interactions.
4.  **Exploration**:
    *   **Treatment Plans**: Users view AI-curated treatment options relevant to their specific diagnosis.
    *   **AI Assistant**: A conversational interface for asking medical questions.
    *   **Reports**: Users can upload medical documents for analysis.
    *   **Side Effects**: A tracker to log and monitor daily symptoms.

## Key Features

*   **Smart Onboarding**: A logic-driven questionnaire that adapts to user responses to build an accurate medical profile.
*   **AI-Generated Treatment Plans**: Generates comprehensive treatment overviews, reducing the complexity of medical jargon.
*   **Intelligent Caching**: Implements Redis caching to store AI responses for 1 hour, ensuring instant load times for repeat visits and reducing API costs.
*   **Real-time AI Chat**: A context-aware chat interface that "knows" the patient's context (diagnosis and stage) without needing repetition.
*   **Medical Profile Management**: Centralized hub for managing sensitive diagnostics data.
*   **Secure Authentication**: Robust session management and route protection.

## Technical Decisions

### Why PostgreSQL?
I selected PostgreSQL as our primary database for several critical reasons:
1.  **Relational Integrity**: Healthcare data is inherently relational. Users map to Profiles, Profiles map to Reports, and Logs map to Timestamps. PostgreSQL ensures these relationships are strictly enforced.
2.  **ACID Compliance**: Data integrity is paramount in medical applications. PostgreSQL guarantees that transactions (like updating a medical profile) are processed reliably.
3.  **Scalability**: It handles complex queries efficiently, which is essential as we add more analytics features in the future.
4.  **Prisma Integration**: It works seamlessly with Prisma ORM, allowing for type-safe database interactions and easy schema migrations.

### Why Next.js?
Next.js acts as the backbone of our application because:
1.  **Server Components (RSC)**: We use Server Components for pages like the Dashboard and Treatment Plans. This allows us to fetch sensitive medical data directly on the server, reducing the amount of JavaScript sent to the client and improving performance (LCP).
2.  **Security**: Logic for connecting to databases and AI services stays on the server, exposing no API keys to the browser.
3.  **Rendering Performance**: The hybrid rendering model allows us to use static generation for marketing pages and dynamic server rendering for personalized patient dashboards.
4.  **Routing**: The App Router simplifies the layout structure, allowing us to easily nest navigation elements like the Sidebar across authenticated views.

## getting Started

Follow these instructions to set up the project locally.

### Prerequisites
Ensure you have Node.js and npm installed on your machine.

### Installation
Clone the repository and install the dependencies:

```bash
npm install
```


### Environment Setup
Create a .env file and a .env.local file in the root directory. Ensure you have the following variables configured:
*   DATABASE_URL (PostgreSQL Connection String)
*   REDIS_URL (Upstash or Local Redis Connection String)
*   AUTH_SECRET (NextAuth Secret)
*   GEMINI_API_KEY (AI Service Key)


# DATABASE
# ============================================
# CLOUD (Neon)
# DATABASE_URL="postgresql://neondb_owner:..."

# LOCAL (PostgreSQL)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/zinara_local"

# ============================================
# REDIS
# ============================================
REDIS_URL="rediss://default:..."

# ============================================
# NEXTAUTH
# ============================================
# Generated secret
NEXTAUTH_SECRET="your_generated_secret"
NEXTAUTH_URL="http://localhost:3000"

# ============================================
# GOOGLE OAUTH
# ============================================
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# ============================================
# FACEBOOK OAUTH
# ============================================
FACEBOOK_CLIENT_ID="your_facebook_client_id"
FACEBOOK_CLIENT_SECRET="your_facebook_client_secret"

# ============================================
# GOOGLE GEMINI AI
# ============================================
GEMINI_API_KEY="your_gemini_api_key"


# ============================================
# APP CONFIG
# ============================================
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="Zinara"


### Database Setup
Initialize the local PostgreSQL database schema and seed it with the necessary onboarding questions.

1.  Push the schema to your database:
    ```bash
    npx prisma db push
    ```

2.  Seed the database with initial data (Onboarding Questions):
    ```bash
    npx prisma db seed
    ```

### Running the Application
Start the development server:

```bash
npm run dev
```

The application will be available at http://localhost:3000.
