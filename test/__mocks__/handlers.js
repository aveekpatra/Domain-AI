import { http, HttpResponse } from 'msw'

// Mock responses for external APIs
export const handlers = [
  // OpenRouter API mock
  http.post('https://openrouter.ai/api/v1/chat/completions', ({ request }) => {
    const url = new URL(request.url)
    const headers = request.headers

    // Check for valid API key
    if (!headers.get('authorization')?.includes('Bearer')) {
      return HttpResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      )
    }

    return HttpResponse.json({
      choices: [
        {
          message: {
            content: JSON.stringify({
              suggestions: [
                {
                  domain: 'testdomain',
                  tld: '.com',
                  score: 85,
                  reason: 'Great brandability and memorable'
                },
                {
                  domain: 'aiventure',
                  tld: '.ai',
                  score: 90,
                  reason: 'Perfect for AI companies'
                }
              ]
            })
          }
        }
      ]
    })
  }),

  // Name.com v4 API mock
  http.post('https://api.name.com/v4/domains:checkAvailability', ({ request }) => {
    const headers = request.headers
    
    // Check for valid authorization
    if (!headers.get('authorization')?.includes('Basic')) {
      return HttpResponse.json(
        { error: 'Invalid credentials' },
        { status: 403 }
      )
    }

    return HttpResponse.json({
      results: [
        {
          domainName: 'testdomain.com',
          purchasable: true,
          purchasePrice: 12.99,
          renewalPrice: 12.99,
          currency: 'USD'
        },
        {
          domainName: 'aiventure.ai',
          purchasable: true,
          purchasePrice: 55.00,
          renewalPrice: 55.00,
          currency: 'USD'
        }
      ]
    })
  }),

  // Name.com Core API mock
  http.post('https://api.name.com/domains:checkAvailability', ({ request }) => {
    const headers = request.headers
    
    if (!headers.get('authorization')?.includes('Basic')) {
      return HttpResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    return HttpResponse.json({
      results: [
        {
          domainName: 'testdomain.com',
          available: true,
          premium: false,
          purchasePrice: 1299, // Core API returns cents
          renewalPrice: 1299,
          purchasable: true
        },
        {
          domainName: 'aiventure.ai',
          available: true,
          premium: true,
          purchasePrice: 5500,
          renewalPrice: 5500,
          purchasable: true
        }
      ]
    })
  }),

  // Error scenarios
  http.post('https://api.name.com/v4/domains:checkAvailability', ({ request }) => {
    const body = request.body
    if (body && body.includes('error-domain')) {
      return HttpResponse.json(
        { error: 'API Error' },
        { status: 500 }
      )
    }
  }),

  http.post('https://openrouter.ai/api/v1/chat/completions', ({ request }) => {
    const body = request.body
    if (body && body.includes('error-prompt')) {
      return HttpResponse.json(
        { error: 'Model error' },
        { status: 500 }
      )
    }
  })
]