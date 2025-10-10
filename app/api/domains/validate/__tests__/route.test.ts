import { POST } from '../route'
import { NextRequest } from 'next/server'

// Create a mock NextRequest that properly extends the real NextRequest
function createMockNextRequest(url: string, options: {
  method?: string
  headers?: Record<string, string>
  body?: string
}): NextRequest {
  const mockRequest = new Request(url, {
    method: options.method || 'POST',
    headers: new Headers(options.headers || {}),
    body: options.body
  })
  
  // Add NextRequest specific properties
  const nextRequest = mockRequest as unknown as NextRequest
  nextRequest.nextUrl = {
    pathname: new URL(url).pathname,
    search: new URL(url).search,
    searchParams: new URL(url).searchParams,
    href: url,
    origin: new URL(url).origin,
    protocol: new URL(url).protocol,
    host: new URL(url).host,
    hostname: new URL(url).hostname,
    port: new URL(url).port,
    hash: new URL(url).hash
  }
  
  return nextRequest
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

  const createMockRequest = (body: unknown) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }

    return createMockNextRequest('http://localhost:3000/api/domains/validate', {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    })
  }

  it('should validate available domain successfully', async () => {
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
    expect(data.available).toBe(false)
  })

  it('should reject invalid input', async () => {
    const request = createMockRequest({ invalid: 'data' })
    const response = await POST(request)
    
    expect(response.status).toBe(400)
  })
})