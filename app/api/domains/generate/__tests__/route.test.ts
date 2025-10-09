import { POST } from '../route'

// Create a mock NextRequest without cookies issue
function createMockNextRequest(url: string, options: {
  method?: string
  headers?: Record<string, string>
  body?: string
}) {
  const request = {
    url,
    method: options.method || 'GET',
    headers: {
      get: (name: string) => (options.headers || {})[name.toLowerCase()] || null,
      has: (name: string) => name.toLowerCase() in (options.headers || {}),
      set: jest.fn(),
      delete: jest.fn(),
      forEach: jest.fn(),
      entries: jest.fn(),
      keys: jest.fn(),
      values: jest.fn(),
      append: jest.fn()
    },
    body: options.body,
    json: async () => {
      if (options.body) {
        try {
          return JSON.parse(options.body)
        } catch {
          throw new Error('Invalid JSON')
        }
      }
      return {}
    },
    text: async () => options.body || '',
    cookies: {
      get: jest.fn(),
      getAll: jest.fn(),
      has: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
      clear: jest.fn(),
      toString: jest.fn()
    },
    nextUrl: {
      pathname: new URL(url).pathname,
      search: new URL(url).search,
      searchParams: new URL(url).searchParams
    }
  }
  return request as unknown
}

// Mock external libraries
// Mock the external modules
jest.mock('@/lib/rateLimit', () => ({
  rateLimit: jest.fn(() => ({ ok: true, retryAfter: 0 }))
}))

jest.mock('@/lib/openrouter')
jest.mock('@/lib/namecom')

import { openRouterChat } from '@/lib/openrouter'
import { checkAvailabilityNamecom } from '@/lib/namecom'
import { rateLimit } from '@/lib/rateLimit'

const mockOpenRouterChat = openRouterChat as jest.MockedFunction<typeof openRouterChat>
const mockCheckAvailabilityNamecom = checkAvailabilityNamecom as jest.MockedFunction<typeof checkAvailabilityNamecom>
const mockRateLimit = rateLimit as jest.MockedFunction<typeof rateLimit>

describe('/api/domains/generate', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Default environment variables
    process.env.OPENROUTER_API_KEY = 'test-openrouter-key'
    process.env.NAMECOM_USERNAME = 'testuser'
    process.env.NAMECOM_API_TOKEN = 'testtoken'
    process.env.NODE_ENV = 'test'
    delete process.env.ALLOWED_ORIGIN

    // Default successful mocks
    mockRateLimit.mockReturnValue({ ok: true, retryAfter: 0 })
    mockOpenRouterChat.mockResolvedValue({
      text: JSON.stringify({
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
    })
    mockCheckAvailabilityNamecom.mockResolvedValue({
      'testdomain.com': {
        domainName: 'testdomain.com',
        available: true,
        registerPrice: 12.99,
        renewPrice: 12.99,
        currency: 'USD'
      },
      'aiventure.ai': {
        domainName: 'aiventure.ai',
        available: true,
        registerPrice: 55.00,
        renewPrice: 55.00,
        currency: 'USD'
      }
    })
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  const createMockRequest = (body: unknown, options: { origin?: string, headers?: Record<string, string> } = {}) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.origin && { 'origin': options.origin }),
      ...options.headers
    }

    return createMockNextRequest('http://localhost:3000/api/domains/generate', {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    })
  }

  describe('successful requests', () => {
    it('should generate domain suggestions successfully', async () => {
      const request = createMockRequest({
        prompt: 'AI startup for healthcare',
        tlds: ['.com', '.ai'],
        count: 2
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.suggestions).toHaveLength(2)
      expect(data.suggestions[0]).toEqual({
        domain: 'testdomain',
        tld: '.com',
        score: 85,
        reason: 'Great brandability and memorable',
        available: true,
        price: '$12.99',
        registrar: 'Name.com'
      })

      expect(mockOpenRouterChat).toHaveBeenCalledWith({
        messages: [
          { role: 'system', content: expect.stringContaining('Generate domain name ideas') },
          { role: 'user', content: 'AI startup for healthcare' }
        ],
        config: {
          apiKey: 'test-openrouter-key',
          siteUrl: undefined,
          appTitle: 'DomainMonster',
          model: undefined
        },
        responseFormatJson: true
      })

      expect(mockCheckAvailabilityNamecom).toHaveBeenCalledWith(['testdomain.com', 'aiventure.ai'])
    })

    it('should handle requests with minimal parameters', async () => {
      const request = createMockRequest({
        prompt: 'Tech startup'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.suggestions).toHaveLength(2)
    })

    it('should handle custom environment variables', async () => {
      process.env.OPENROUTER_SITE_URL = 'https://domainmonster.ai'
      process.env.OPENROUTER_APP_TITLE = 'Custom App'
      process.env.OPENROUTER_MODEL = 'gpt-4'

      const request = createMockRequest({
        prompt: 'Tech startup'
      })

      await POST(request)

      expect(mockOpenRouterChat).toHaveBeenCalledWith({
        messages: expect.any(Array),
        config: {
          apiKey: 'test-openrouter-key',
          siteUrl: 'https://domainmonster.ai',
          appTitle: 'Custom App',
          model: 'gpt-4'
        },
        responseFormatJson: true
      })
    })

    it('should return suggestions without availability when Name.com credentials are missing', async () => {
      delete process.env.NAMECOM_USERNAME
      delete process.env.NAMECOM_API_TOKEN

      const request = createMockRequest({
        prompt: 'Tech startup'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.suggestions).toHaveLength(2)
      expect(data.suggestions[0]).toEqual({
        domain: 'testdomain',
        tld: '.com',
        score: 85,
        reason: 'Great brandability and memorable',
        available: undefined,
        price: undefined,
        registrar: 'Name.com'
      })

      expect(mockCheckAvailabilityNamecom).not.toHaveBeenCalled()
    })

    it('should handle Name.com API failures gracefully', async () => {
      mockCheckAvailabilityNamecom.mockRejectedValue(new Error('Name.com API error'))

      const request = createMockRequest({
        prompt: 'Tech startup'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.suggestions).toHaveLength(2)
      expect(data.suggestions[0].available).toBeUndefined()
      expect(data.suggestions[0].price).toBeUndefined()
    })
  })

  describe('input validation', () => {
    it('should reject invalid input format', async () => {
      const request = createMockRequest({
        prompt: 'AI', // Too short
        count: 25 // Too high
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Prompt is too short')
    })

    it('should reject malformed JSON', async () => {
      const request = createMockNextRequest('http://localhost:3000/api/domains/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBeDefined()
    })

    it('should reject empty request body', async () => {
      const request = createMockRequest({})

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBeDefined()
    })
  })

  describe('rate limiting', () => {
    it('should enforce rate limits', async () => {
      mockRateLimit.mockReturnValue({ ok: false, retryAfter: 60 })

      const request = createMockRequest({
        prompt: 'Tech startup'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(429)
      expect(data.error).toBe('Too many requests')
      expect(response.headers.get('Retry-After')).toBe('60')
    })

    it('should call rate limiter with correct parameters', async () => {
      const request = createMockRequest({
        prompt: 'Tech startup'
      })

      await POST(request)

      expect(mockRateLimit).toHaveBeenCalledWith(request, 'domains-generate')
    })
  })

  describe('CORS handling', () => {
    it('should allow requests when ALLOWED_ORIGIN is not configured', async () => {
      const request = createMockRequest({
        prompt: 'Tech startup'
      }, { origin: 'https://evil.com' })

      const response = await POST(request)

      expect(response.status).toBe(200)
    })

    it('should allow requests from allowed origin', async () => {
      process.env.ALLOWED_ORIGIN = 'https://domainmonster.com'

      const request = createMockRequest({
        prompt: 'Tech startup'
      }, { origin: 'https://domainmonster.com' })

      const response = await POST(request)

      expect(response.status).toBe(200)
    })

    it('should block requests from disallowed origin', async () => {
      process.env.ALLOWED_ORIGIN = 'https://domainmonster.com'

      const request = createMockRequest({
        prompt: 'Tech startup'
      }, { origin: 'https://evil.com' })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Forbidden')
    })

    it('should handle invalid origin URLs', async () => {
      process.env.ALLOWED_ORIGIN = 'invalid-url'

      const request = createMockRequest({
        prompt: 'Tech startup'
      }, { origin: 'https://example.com' })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Forbidden')
    })
  })

  describe('OpenRouter integration', () => {
    it('should handle OpenRouter API errors', async () => {
      mockOpenRouterChat.mockRejectedValue(new Error('OpenRouter API error'))

      const request = createMockRequest({
        prompt: 'Tech startup'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toContain('OpenRouter API error')
    })

    it('should handle invalid JSON response from OpenRouter', async () => {
      mockOpenRouterChat.mockResolvedValue({
        text: 'Invalid JSON response'
      })

      const request = createMockRequest({
        prompt: 'Tech startup'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toContain('Failed to parse JSON')
    })

    it('should handle partial JSON in OpenRouter response', async () => {
      mockOpenRouterChat.mockResolvedValue({
        text: 'Some text before { \"suggestions\": [{ \"domain\": \"test\", \"tld\": \".com\" }] } some text after'
      })

      const request = createMockRequest({
        prompt: 'Tech startup'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.suggestions).toHaveLength(1)
    })

    it('should validate OpenRouter response schema', async () => {
      mockOpenRouterChat.mockResolvedValue({
        text: JSON.stringify({
          suggestions: [
            {
              domain: 'test',
              // Missing tld field
              score: 85
            }
          ]
        })
      })

      const request = createMockRequest({
        prompt: 'Tech startup'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBeDefined()
    })
  })

  describe('system prompt generation', () => {
    it('should include TLD guidance when TLDs are specified', async () => {
      const request = createMockRequest({
        prompt: 'Tech startup',
        tlds: ['.com', '.ai', '.tech']
      })

      await POST(request)

      const systemPrompt = mockOpenRouterChat.mock.calls[0][0].messages[0].content
      expect(systemPrompt).toContain('Prioritize these TLDs: .com, .ai, .tech')
    })

    it('should include general TLD guidance when no TLDs are specified', async () => {
      const request = createMockRequest({
        prompt: 'Tech startup'
      })

      await POST(request)

      const systemPrompt = mockOpenRouterChat.mock.calls[0][0].messages[0].content
      expect(systemPrompt).toContain('Choose the most appropriate TLDs')
      expect(systemPrompt).toContain('.com for general businesses')
    })

    it('should include correct count in system prompt', async () => {
      const request = createMockRequest({
        prompt: 'Tech startup',
        count: 15
      })

      await POST(request)

      const systemPrompt = mockOpenRouterChat.mock.calls[0][0].messages[0].content
      expect(systemPrompt).toContain('Return exactly 15 domain suggestions')
    })
  })

  describe('domain enrichment', () => {
    it('should correctly format TLDs in domain checking', async () => {
      mockOpenRouterChat.mockResolvedValue({
        text: JSON.stringify({
          suggestions: [
            { domain: 'test1', tld: '.com' },
            { domain: 'test2', tld: 'ai' }, // Missing dot
            { domain: 'test3', tld: '.io' }
          ]
        })
      })

      const request = createMockRequest({
        prompt: 'Tech startup'
      })

      await POST(request)

      expect(mockCheckAvailabilityNamecom).toHaveBeenCalledWith([
        'test1.com',
        'test2.ai',
        'test3.io'
      ])
    })

    it('should deduplicate domains before checking availability', async () => {
      mockOpenRouterChat.mockResolvedValue({
        text: JSON.stringify({
          suggestions: [
            { domain: 'test', tld: '.com' },
            { domain: 'test', tld: '.com' }, // Duplicate
            { domain: 'other', tld: '.ai' }
          ]
        })
      })

      const request = createMockRequest({
        prompt: 'Tech startup'
      })

      await POST(request)

      expect(mockCheckAvailabilityNamecom).toHaveBeenCalledWith([
        'test.com',
        'other.ai'
      ])
    })

    it('should correctly format prices', async () => {
      mockCheckAvailabilityNamecom.mockResolvedValue({
        'test.com': {
          domainName: 'test.com',
          available: true,
          registerPrice: 12.99,
          renewPrice: 12.99
        }
      })

      mockOpenRouterChat.mockResolvedValue({
        text: JSON.stringify({
          suggestions: [{ domain: 'test', tld: '.com' }]
        })
      })

      const request = createMockRequest({
        prompt: 'Tech startup'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(data.suggestions[0].price).toBe('$12.99')
    })
  })

  describe('development logging', () => {
    it('should log in development mode', async () => {
      process.env.NODE_ENV = 'development'

      const request = createMockRequest({
        prompt: 'Tech startup'
      })

      await POST(request)

      expect(console.log).toHaveBeenCalledWith(
        '[domains.generate] hit',
        expect.objectContaining({
          origin: null,
          ip: undefined
        })
      )
    })

    it('should not log in production mode', async () => {
      process.env.NODE_ENV = 'production'

      const request = createMockRequest({
        prompt: 'Tech startup'
      })

      await POST(request)

      expect(console.log).not.toHaveBeenCalled()
    })

    it('should extract IP from headers', async () => {
      process.env.NODE_ENV = 'development'

      const request = createMockRequest({
        prompt: 'Tech startup'
      }, {
        headers: {
          'x-forwarded-for': '192.168.1.1, 10.0.0.1',
          'x-real-ip': '192.168.1.1'
        }
      })

      await POST(request)

      expect(console.log).toHaveBeenCalledWith(
        '[domains.generate] hit',
        expect.objectContaining({
          ip: '192.168.1.1'
        })
      )
    })
  })
})