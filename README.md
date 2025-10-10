# DomainMonster

A powerful AI-powered domain name generator that helps you find the perfect domain for your business using advanced AI models and real-time availability checking.

## Features

- **AI-Powered Domain Generation**: Uses OpenRouter AI models to generate creative, brandable domain names
- **Real-Time Availability**: Checks domain availability through Name.com API
- **Smart Prompt Improvement**: AI helps refine your domain search prompts
- **Security & Rate Limiting**: Built-in security measures and rate limiting to prevent abuse
- **Modern Tech Stack**: Built with Next.js, Convex, and Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Convex (database and server logic)
- **AI**: Vercel AI SDK with OpenRouter provider
- **Domain API**: Name.com for availability checking
- **Deployment**: Vercel (optimized for serverless)

## Setup

### Prerequisites

- Node.js 20+
- npm or yarn
- Convex account
- OpenRouter API key
- Name.com account (optional, for domain availability)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd domainmonster
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Fill in your environment variables:

   ```env
   # Convex Backend
   CONVEX_DEPLOYMENT=dev:your-deployment
   NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

   # OpenRouter AI Configuration
   OPENROUTER_API_KEY=sk-or-v1-your-key-here
   OPENROUTER_APP_TITLE=DomainMonster
   OPENROUTER_MODEL=openai/gpt-4o-mini
   OPENROUTER_SITE_URL=http://localhost:3000/
   ALLOWED_ORIGIN=http://localhost:3000/

   # Name.com Domain Availability API (optional)
   NAMECOM_USERNAME=your-username
   NAMECOM_API_TOKEN=your-token
   NAMECOM_API_BASE=https://api.name.com
   ```

4. **Set up Convex**

   ```bash
   npx convex dev
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## Environment Variables

| Variable                 | Description                                   | Required |
| ------------------------ | --------------------------------------------- | -------- |
| `CONVEX_DEPLOYMENT`      | Your Convex deployment ID                     | Yes      |
| `NEXT_PUBLIC_CONVEX_URL` | Your Convex deployment URL                    | Yes      |
| `OPENROUTER_API_KEY`     | Your OpenRouter API key                       | Yes      |
| `OPENROUTER_MODEL`       | AI model to use (default: openai/gpt-4o-mini) | No       |
| `OPENROUTER_SITE_URL`    | Your site URL for OpenRouter                  | No       |
| `OPENROUTER_APP_TITLE`   | App title for OpenRouter                      | No       |
| `ALLOWED_ORIGIN`         | CORS allowed origin                           | No       |
| `NAMECOM_USERNAME`       | Name.com username                             | No       |
| `NAMECOM_API_TOKEN`      | Name.com API token                            | No       |

## Deployment

### Vercel Deployment

1. **Connect to Vercel**
   - Push your code to GitHub
   - Connect your repository to Vercel
   - Vercel will automatically detect Next.js

2. **Set environment variables**
   - In Vercel dashboard, go to Settings → Environment Variables
   - Add all required environment variables from `.env.example`
   - Update `OPENROUTER_SITE_URL` and `ALLOWED_ORIGIN` to your production domain

3. **Deploy**
   - Vercel will automatically deploy on every push to main branch
   - Your app will be available at `https://your-app.vercel.app`

### Convex Production Setup

1. **Create production deployment**

   ```bash
   npx convex deploy --prod
   ```

2. **Update environment variables**
   - Use the production Convex URL in your Vercel environment variables

## API Endpoints

### Generate Domains

```
POST /api/domains/generate
```

**Request Body:**

```json
{
  "prompt": "AI startup for healthcare",
  "tlds": [".com", ".ai", ".io"],
  "count": 8
}
```

**Response:**

```json
{
  "suggestions": [
    {
      "domain": "healthai",
      "tld": ".com",
      "score": 85,
      "reason": "Perfect for AI healthcare companies",
      "available": true,
      "price": "$12.99",
      "registrar": "Name.com"
    }
  ]
}
```

### Improve Prompt

```
POST /api/prompts/improve
```

**Request Body:**

```json
{
  "prompt": "tech startup"
}
```

**Response:**

```json
{
  "improved": "Generate creative and brandable domain name ideas for a technology startup company"
}
```

## Security Features

- **Prompt Injection Protection**: Advanced security checks prevent malicious prompts
- **Rate Limiting**: Built-in rate limiting to prevent abuse
- **CORS Protection**: Configurable CORS settings
- **Input Validation**: Comprehensive input validation using Zod schemas

## Testing

Run the test suite:

```bash
npm test
```

Run tests with coverage:

```bash
npm run test:coverage
```

## Troubleshooting

### Common Issues

1. **TransformStream errors in tests**
   - This is handled by the Jest setup file
   - If you see errors, ensure `jest.setup.js` includes the TransformStream polyfill

2. **OpenRouter API errors**
   - Check your API key is valid
   - Ensure you have sufficient credits
   - Verify the model name is correct

3. **Name.com API errors**
   - Verify your credentials
   - Check API rate limits
   - Ensure your account has API access enabled

4. **Vercel deployment issues**
   - Check all environment variables are set
   - Ensure Convex deployment is accessible
   - Check Vercel function logs for detailed errors

### Getting Help

- Check the [Vercel AI SDK documentation](https://sdk.vercel.ai/)
- Review [OpenRouter documentation](https://openrouter.ai/docs)
- Join the [Convex Discord community](https://convex.dev/community)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
