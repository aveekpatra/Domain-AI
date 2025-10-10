import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";

// Polyfill global APIs FIRST
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Polyfill TransformStream for AI SDK
global.TransformStream = class TransformStream {
  constructor() {
    this.readable = {
      getReader: () => ({
        read: () => Promise.resolve({ done: true, value: undefined }),
      }),
    };
    this.writable = {
      getWriter: () => ({
        write: () => Promise.resolve(),
        close: () => Promise.resolve(),
      }),
    };
  }
};

// Manual fetch API implementation for tests
class MockHeaders {
  constructor(init = {}) {
    this._headers = new Map()
    if (init) {
      if (typeof init === 'object' && init[Symbol.iterator]) {
        for (const [key, value] of init) {
          this.set(key, value)
        }
      } else if (typeof init === 'object') {
        for (const [key, value] of Object.entries(init)) {
          this.set(key, value)
        }
      }
    }
  }
  
  get(name) {
    return this._headers.get(name.toLowerCase()) || null
  }
  
  has(name) {
    return this._headers.has(name.toLowerCase())
  }
  
  set(name, value) {
    this._headers.set(name.toLowerCase(), String(value))
  }
  
  delete(name) {
    this._headers.delete(name.toLowerCase())
  }
  
  forEach(callback) {
    this._headers.forEach(callback)
  }
  
  entries() {
    return this._headers.entries()
  }
  
  keys() {
    return this._headers.keys()
  }
  
  values() {
    return this._headers.values()
  }
  
  append(name, value) {
    const existing = this.get(name)
    this.set(name, existing ? `${existing}, ${value}` : value)
  }
}

class MockRequest {
  constructor(input, options = {}) {
    this.url = input
    this.method = options.method || 'GET'
    this.headers = new MockHeaders(options.headers)
    this.body = options.body
  }
  
  async json() {
    if (this.body) {
      return JSON.parse(this.body)
    }
    return {}
  }
  
  async text() {
    return this.body || ''
  }
}

class MockResponse {
  constructor(body, options = {}) {
    this.body = body
    this.status = options.status || 200
    this.statusText = options.statusText || 'OK'
    this.headers = new MockHeaders(options.headers)
    this.ok = this.status >= 200 && this.status < 300
  }
  
  async json() {
    return typeof this.body === 'string' ? JSON.parse(this.body) : this.body
  }
  
  async text() {
    return typeof this.body === 'string' ? this.body : JSON.stringify(this.body)
  }
}

global.fetch = jest.fn()
global.Request = MockRequest
global.Response = MockResponse
global.Headers = MockHeaders

// Mock Next.js router
jest.mock("next/navigation", () => ({
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
  usePathname: () => "/test-path",
}));

// Mock Next.js dynamic imports
jest.mock("next/dynamic", () => () => {
  const DynamicComponent = () => null;
  DynamicComponent.displayName = "LoadableComponent";
  DynamicComponent.preload = jest.fn();
  return DynamicComponent;
});

// Mock window.fetch (already done above)

// Mock console methods for cleaner test output
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock Next.js edge runtime globals
global.EdgeRuntime = true;

// Mock edge-runtime cookies
jest.mock("@edge-runtime/cookies", () => ({
  RequestCookies: jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    getAll: jest.fn(),
    has: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    clear: jest.fn(),
    toString: jest.fn(),
  })),
}));

// Mock NextResponse
jest.mock("next/server", () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn((data, init) => {
      const response = {
        json: jest.fn().mockResolvedValue(data),
        status: init?.status || 200,
        headers: {
          get: jest.fn((name) => (init?.headers && init.headers[name]) || null),
        },
        ok: (init?.status || 200) >= 200 && (init?.status || 200) < 300,
      };
      return response;
    }),
  },
}));

// Mock environment variables
process.env.NODE_ENV = "test";
process.env.NEXT_PUBLIC_CONVEX_URL = "https://test.convex.cloud";
process.env.OPENROUTER_API_KEY = "test-openrouter-key";
process.env.NAMECOM_USERNAME = "testuser";
process.env.NAMECOM_API_TOKEN = "test-token";
