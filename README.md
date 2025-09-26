# DomainMonster 🚀

An AI-powered domain name generator that helps you find brandable, memorable domain names for your business or project in seconds.

## Features

- **AI-Powered Generation**: Uses OpenRouter's advanced language models to generate creative, brandable domain suggestions
- **Multiple TLD Support**: Search across popular extensions (.com, .ai, .io, .co, .app, .dev)
- **Real-time Availability**: Checks domain availability and pricing through Name.com API
- **Smart Scoring**: Each suggestion includes a brandability score to help you choose
- **Prompt Improvement**: AI-powered prompt enhancement for better results
- **Modern UI**: Clean, responsive interface built with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14 with React and TypeScript
- **Styling**: Tailwind CSS with custom components
- **Backend**: Next.js API routes with server-side logic
- **AI Integration**: OpenRouter API for domain generation
- **Domain API**: Name.com for availability and pricing
- **Database**: Convex for data storage and real-time features
- **Rate Limiting**: Built-in request throttling
- **Validation**: Zod schemas for type-safe API validation

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd DomainMonster
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file with:
   ```env
   # OpenRouter API (required)
   OPENROUTER_API_KEY=your_openrouter_api_key
   OPENROUTER_SITE_URL=http://localhost:3001
   OPENROUTER_APP_TITLE=DomainMonster
   OPENROUTER_MODEL=openrouter/auto

   # Name.com API (optional, for availability checking)
   NAMECOM_USERNAME=your_namecom_username
   NAMECOM_API_TOKEN=your_namecom_api_token

   # CORS settings
   ALLOWED_ORIGIN=http://localhost:3001
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3001](http://localhost:3001)

## API Endpoints

### Generate Domain Suggestions
```
POST /api/domains/generate
```
**Body:**
```json
{
  "prompt": "AI bookkeeping for startups",
  "tlds": [".com", ".ai", ".io"],
  "count": 8
}
```

### Improve Prompt
```
POST /api/prompts/improve
```
**Body:**
```json
{
  "prompt": "need domain for my app"
}
```

### Validate Domain
```
POST /api/domains/validate
```
**Body:**
```json
{
  "domain": "example.com"
}
```

## Project Structure

```
├── app/
│   ├── api/                 # API routes
│   │   ├── domains/         # Domain-related endpoints
│   │   └── prompts/         # Prompt improvement
│   ├── search/              # Search page
│   └── page.tsx             # Home page
├── components/
│   ├── search/              # Search-related components
│   ├── prompt/              # Prompt input components
│   └── ui/                  # Reusable UI components
├── lib/
│   ├── openrouter.ts        # OpenRouter API integration
│   ├── namecom.ts           # Name.com API integration
│   ├── schemas.ts           # Zod validation schemas
│   └── rateLimit.ts         # Rate limiting utilities
└── convex/                  # Convex backend configuration
```

## Environment Setup

### OpenRouter API
1. Sign up at [OpenRouter](https://openrouter.ai/)
2. Get your API key from the dashboard
3. Add it to your `.env.local` file

### Name.com API (Optional)
1. Create a Name.com account
2. Generate API credentials in your account settings
3. Add them to your `.env.local` file

Without Name.com credentials, the app will still generate domain suggestions but won't show availability or pricing information.

## Deployment

The app is ready for deployment on Vercel, Netlify, or any platform that supports Next.js:

```bash
npm run build
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
