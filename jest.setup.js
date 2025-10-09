import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

// Polyfill global APIs
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Basic fetch polyfill
global.fetch = jest.fn()
global.Request = jest.fn()
global.Response = jest.fn()
global.Headers = jest.fn()

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
    toString: jest.fn(),
  }),
  usePathname: () => '/test-path',
}))

// Mock Next.js dynamic imports
jest.mock('next/dynamic', () => () => {
  const DynamicComponent = () => null
  DynamicComponent.displayName = 'LoadableComponent'
  DynamicComponent.preload = jest.fn()
  return DynamicComponent
})

// Mock window.fetch (already done above)

// Mock console methods for cleaner test output
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}

// Mock Next.js edge runtime globals
global.EdgeRuntime = true

// Mock edge-runtime cookies
jest.mock('@edge-runtime/cookies', () => ({
  RequestCookies: jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    getAll: jest.fn(),
    has: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    clear: jest.fn(),
    toString: jest.fn()
  }))
}))

// Mock NextResponse
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn((data, init) => {
      const response = {
        json: jest.fn().mockResolvedValue(data),
        status: init?.status || 200,
        headers: {
          get: jest.fn((name) => (init?.headers && init.headers[name]) || null)
        },
        ok: (init?.status || 200) >= 200 && (init?.status || 200) < 300
      }
      return Promise.resolve(response)
    })
  }
}))

// Mock environment variables
process.env.NODE_ENV = 'test'
process.env.NEXT_PUBLIC_CONVEX_URL = 'https://test.convex.cloud'
process.env.OPENROUTER_API_KEY = 'test-openrouter-key'
process.env.NAMECOM_USERNAME = 'testuser'
process.env.NAMECOM_API_TOKEN = 'test-token'
