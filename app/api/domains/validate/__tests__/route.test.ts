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

// Mock the external modules
jest.mock('@/lib/rateLimit', () => ({
  rateLimit: jest.fn(() => ({ ok: true, retryAfter: 0 }))
}))

jest.mock('@/lib/namecom')

import { checkAvailabilityNamecom } from '@/lib/namecom'
import { rateLimit } from '@/lib/rateLimit'

const mockCheckAvailabilityNamecom = checkAvailabilityNamecom as jest.MockedFunction<typeof checkAvailabilityNamecom>
const mockRateLimit = rateLimit as jest.MockedFunction<typeof rateLimit>

describe('/api/domains/validate', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Default environment variables
    process.env.NAMECOM_USERNAME = 'testuser'
    process.env.NAMECOM_API_TOKEN = 'testtoken'
    process.env.NODE_ENV = 'test'
    delete process.env.ALLOWED_ORIGIN
    delete process.env.NAMECOM_USE_CORE

    // Default successful mocks
    mockRateLimit.mockReturnValue({ ok: true, retryAfter: 0 })
    mockCheckAvailabilityNamecom.mockResolvedValue({
      'testdomain.com': {
        domainName: 'testdomain.com',
        available: true,
        registerPrice: 12.99,
        renewPrice: 12.99,
        currency: 'USD'
      }
    })
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  const createMockRequest = (body: unknown, options: { origin?: string } = {}) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.origin && { 'origin': options.origin })
    }

    return createMockNextRequest('http://localhost:3000/api/domains/validate', {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    })
  }

  describe('successful requests', () => {
    it('should validate domain successfully', async () => {
      const request = createMockRequest({
        domain: 'testdomain.com'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        domain: 'testdomain.com',
        available: true,
        price: '$12.99',
        registrar: 'Name.com'
      })

      expect(mockCheckAvailabilityNamecom).toHaveBeenCalledWith(['testdomain.com'])
    })

    it('should handle unavailable domains', async () => {
      mockCheckAvailabilityNamecom.mockResolvedValue({
        'example.com': {
          domainName: 'example.com',
          available: false,
          registerPrice: 12.99,
          renewPrice: 12.99,
          currency: 'USD'
        }
      })

      const request = createMockRequest({
        domain: 'example.com'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        domain: 'example.com',
        available: false,
        price: '$12.99',
        registrar: 'Name.com'
      })
    })

    it('should handle domains without pricing info', async () => {
      mockCheckAvailabilityNamecom.mockResolvedValue({
        'noprice.com': {
          domainName: 'noprice.com',
          available: true,
          registerPrice: undefined,
          renewPrice: undefined,
          currency: 'USD'
        }
      })

      const request = createMockRequest({
        domain: 'noprice.com'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        domain: 'noprice.com',
        available: true,
        price: undefined,
        registrar: 'Name.com'
      })
    })

    it('should handle domain not found in results', async () => {
      mockCheckAvailabilityNamecom.mockResolvedValue({})

      const request = createMockRequest({
        domain: 'notfound.com'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        domain: 'notfound.com',
        available: undefined,
        price: undefined,
        registrar: 'Name.com'
      })
    })

    it('should normalize domain to lowercase', async () => {
      const request = createMockRequest({
        domain: 'TestDomain.COM'
      })

      await POST(request)

      expect(mockCheckAvailabilityNamecom).toHaveBeenCalledWith(['testdomain.com'])
    })
  })

  describe('input validation', () => {
    it('should reject invalid domain formats', async () => {
      const invalidDomains = [
        'invalid-domain',
        'example.',
        'example.c',
        'example..com',
        'example com.com'
      ]

      for (const domain of invalidDomains) {
        const request = createMockRequest({ domain })
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toContain('Invalid domain')
      }
    })

    it('should reject missing domain field', async () => {
      const request = createMockRequest({})

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBeDefined()
    })

    it('should reject malformed JSON', async () => {
      const request = createMockNextRequest('http://localhost:3000/api/domains/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBeDefined()
    })
  })

  describe('rate limiting', () => {
    it('should enforce rate limits', async () => {
      mockRateLimit.mockReturnValue({ ok: false, retryAfter: 30 })

      const request = createMockRequest({
        domain: 'example.com'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(429)
      expect(data.error).toBe('Too many requests')
      expect(response.headers.get('Retry-After')).toBe('30')
    })

    it('should call rate limiter with correct parameters', async () => {
      const request = createMockRequest({
        domain: 'example.com'
      })

      await POST(request)

      expect(mockRateLimit).toHaveBeenCalledWith(request, 'domains-validate')
    })
  })

  describe('CORS handling', () => {
    it('should block requests when no origin provided and ALLOWED_ORIGIN is set', async () => {
      process.env.ALLOWED_ORIGIN = 'https://domainmonster.com'

      const request = createMockRequest({
        domain: 'example.com'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Forbidden')
    })

    it('should allow requests from allowed origin', async () => {
      process.env.ALLOWED_ORIGIN = 'https://domainmonster.com'

      const request = createMockRequest({
        domain: 'example.com'
      }, { origin: 'https://domainmonster.com' })

      const response = await POST(request)

      expect(response.status).toBe(200)
    })

    it('should block requests from disallowed origin', async () => {
      process.env.ALLOWED_ORIGIN = 'https://domainmonster.com'

      const request = createMockRequest({
        domain: 'example.com'
      }, { origin: 'https://evil.com' })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Forbidden')
    })
  })

  describe('credentials validation', () => {
    it('should return error when Name.com credentials are missing (v4 API)', async () => {
      delete process.env.NAMECOM_USERNAME
      delete process.env.NAMECOM_API_TOKEN

      const request = createMockRequest({
        domain: 'example.com'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Name.com credentials missing')
      expect(data.hint).toContain('For v4 API: Set NAMECOM_USERNAME and NAMECOM_API_TOKEN')
    })

    it('should return error when Name.com credentials are missing (Core API)', async () => {
      process.env.NAMECOM_USE_CORE = 'true'
      delete process.env.NAMECOM_USERNAME
      delete process.env.NAMECOM_API_TOKEN

      const request = createMockRequest({
        domain: 'example.com'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Name.com credentials missing')
      expect(data.hint).toContain('For Core API: Set NAMECOM_USERNAME and NAMECOM_API_TOKEN, plus NAMECOM_USE_CORE=true')
    })
  })

  describe('Name.com API integration', () => {
    it('should handle Name.com API errors', async () => {
      mockCheckAvailabilityNamecom.mockRejectedValue(new Error('API timeout'))

      const request = createMockRequest({
        domain: 'example.com'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('API timeout')
    })

    it('should handle Name.com v4 authentication errors', async () => {
      mockCheckAvailabilityNamecom.mockRejectedValue(
        new Error('name.com v4 check failed: 403 - Forbidden')
      )

      const request = createMockRequest({
        domain: 'example.com'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(502)
      expect(data.error).toBe('Name.com authentication failed')
      expect(data.hint).toContain('For v4 API: Set NAMECOM_USERNAME to your account username')
      expect(data.code).toBe('namecom_auth_error')
    })

    it('should handle Name.com Core API authentication errors', async () => {
      process.env.NAMECOM_USE_CORE = 'true'
      mockCheckAvailabilityNamecom.mockRejectedValue(
        new Error('name.com CORE availability failed: 401 - Unauthorized')
      )

      const request = createMockRequest({
        domain: 'example.com'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(502)
      expect(data.error).toBe('Name.com authentication failed')
      expect(data.hint).toContain('For Core API: Ensure NAMECOM_USERNAME is your account username')
      expect(data.code).toBe('namecom_auth_error')
    })

    it('should detect different API authentication error patterns', async () => {
      const authErrorPatterns = [
        'name.com v4 check failed: 403',
        'name.com CORE availability failed: 401',
        'name.com CORE pricing failed: 401',
        'name.com CORE availability failed: 403'
      ]

      for (const errorMessage of authErrorPatterns) {
        jest.clearAllMocks()
        mockCheckAvailabilityNamecom.mockRejectedValue(new Error(errorMessage))

        const request = createMockRequest({
          domain: 'example.com'
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(502)
        expect(data.error).toBe('Name.com authentication failed')
        expect(data.code).toBe('namecom_auth_error')
      }
    })
  })

  describe('development logging', () => {
    it('should log in development mode', async () => {
      process.env.NODE_ENV = 'development'

      const request = createMockRequest({
        domain: 'example.com'
      })

      await POST(request)

      expect(console.log).toHaveBeenCalledWith(
        '[domains.validate] hit',
        expect.objectContaining({
          origin: null,
          ip: undefined
        })
      )
    })

    it('should not log in production mode', async () => {
      process.env.NODE_ENV = 'production'

      const request = createMockRequest({
        domain: 'example.com'
      })

      await POST(request)

      expect(console.log).not.toHaveBeenCalled()
    })

    it('should log errors in development mode', async () => {
      process.env.NODE_ENV = 'development'
      mockCheckAvailabilityNamecom.mockRejectedValue(new Error('Test error'))

      const request = createMockRequest({
        domain: 'example.com'
      })

      await POST(request)

      expect(console.error).toHaveBeenCalledWith('[domains.validate] error', 'Test error')
    })
  })

  describe('price formatting', () => {
    it('should format prices correctly', async () => {
      const testCases = [
        { input: 12.99, expected: '$12.99' },
        { input: 0, expected: '$0.00' },
        { input: 99.9, expected: '$99.90' },
        { input: undefined, expected: undefined }
      ]

      for (const testCase of testCases) {
        jest.clearAllMocks()
        mockCheckAvailabilityNamecom.mockResolvedValue({
          'test.com': {
            domainName: 'test.com',
            available: true,
            registerPrice: testCase.input,
            renewPrice: testCase.input,
            currency: 'USD'
          }
        })

        const request = createMockRequest({
          domain: 'test.com'
        })

        const response = await POST(request)
        const data = await response.json()

        expect(data.price).toBe(testCase.expected)
      }
    })
  })

  describe('API configuration detection', () => {
    it('should detect Core API usage in error hints', async () => {
      process.env.NAMECOM_USE_CORE = 'true'
      delete process.env.NAMECOM_USERNAME

      const request = createMockRequest({
        domain: 'example.com'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(data.hint).toContain('For Core API:')
      expect(data.hint).toContain('NAMECOM_USE_CORE=true')
    })

    it('should detect v4 API usage in error hints', async () => {
      // Don't set NAMECOM_USE_CORE (defaults to v4)
      delete process.env.NAMECOM_USERNAME

      const request = createMockRequest({
        domain: 'example.com'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(data.hint).toContain('For v4 API:')
      expect(data.hint).not.toContain('NAMECOM_USE_CORE=true')
    })
  })
})