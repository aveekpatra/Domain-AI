import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { ConvexProvider, ConvexReactClient } from 'convex/react'

// Mock Convex client for testing
const mockConvexClient = new ConvexReactClient('https://test.convex.cloud')

// Custom render function with providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ConvexProvider client={mockConvexClient}>
      {children}
    </ConvexProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Re-export everything from RTL
export * from '@testing-library/react'

// Override render method
export { customRender as render }

// Test data factories
export const createMockDomainResult = (overrides = {}) => ({
  domain: 'testdomain',
  tld: '.com',
  available: true,
  price: '$12.99',
  registrar: 'Name.com',
  score: 85,
  length: 10,
  ...overrides,
})

export const createMockDomainSuggestion = (overrides = {}) => ({
  domain: 'testdomain',
  tld: '.com',
  score: 85,
  reason: 'Great brandability and memorable',
  available: true,
  price: '$12.99',
  registrar: 'Name.com',
  ...overrides,
})

export const createMockNamecomResult = (overrides = {}) => ({
  domainName: 'testdomain.com',
  available: true,
  premium: false,
  currency: 'USD',
  registerPrice: 12.99,
  renewPrice: 12.99,
  ...overrides,
})

// Mock fetch responses
export const mockFetchResponse = (data: any, status = 200) => {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  } as Response)
}

// Mock environment variables helper
export const mockEnvVars = (vars: Record<string, string>) => {
  const originalEnv = process.env
  
  beforeEach(() => {
    process.env = {
      ...originalEnv,
      ...vars,
    }
  })

  afterEach(() => {
    process.env = originalEnv
  })
}

// Wait for async operations
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0))

// Create a mock NextRequest without cookies issue
export function createMockNextRequest(url: string, options: {
  method?: string
  headers?: Record<string, string>
  body?: string
}) {
  // Create a simplified request object that doesn't trigger the cookies issue
  const request = {
    url,
    method: options.method || 'GET',
    headers: new Headers(options.headers || {}),
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
    // Add minimal cookies mock
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

  return request as any
}
