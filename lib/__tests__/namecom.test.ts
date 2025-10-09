import { mockFetchResponse } from '../../test/test-utils'

// Mock fetch globally for these tests
global.fetch = jest.fn()

describe('checkAvailabilityNamecom', () => {
  let originalEnv: NodeJS.ProcessEnv

  beforeEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
    // Store original env vars
    originalEnv = { ...process.env }
    // Reset environment variables
    delete process.env.NAMECOM_USE_CORE
    delete process.env.NAMECOM_CORE_API
    delete process.env.NAMECOM_API_BASE
    process.env.NAMECOM_USERNAME = 'testuser'
    process.env.NAMECOM_API_TOKEN = 'testtoken'
  })

  afterEach(() => {
    jest.resetAllMocks()
    // Restore original environment variables
    process.env = originalEnv
  })

  describe('v4 API (legacy)', () => {
    beforeEach(() => {
      // Default v4 API response
      ;(global.fetch as jest.Mock).mockResolvedValue(
        mockFetchResponse({
          results: [
            {
              domainName: 'testdomain.com',
              purchasable: true,
              purchasePrice: 12.99,
              renewalPrice: 12.99,
              currency: 'USD'
            },
            {
              domainName: 'example.ai',
              purchasable: false,
              purchasePrice: 55.00,
              renewalPrice: 55.00,
              currency: 'USD'
            }
          ]
        })
      )
    })

    it('should make successful v4 API call', async () => {
      const domains = ['testdomain.com', 'example.ai']
      const { checkAvailabilityNamecom } = await import('../namecom')
      const result = await checkAvailabilityNamecom(domains)

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.name.com/v4/domains:checkAvailability',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic dGVzdHVzZXI6dGVzdHRva2Vu' // base64 of testuser:testtoken
          },
          body: JSON.stringify({ domainNames: domains })
        }
      )

      expect(result).toEqual({
        'testdomain.com': {
          domainName: 'testdomain.com',
          available: true,
          currency: 'USD',
          registerPrice: 12.99,
          renewPrice: 12.99
        },
        'example.ai': {
          domainName: 'example.ai',
          available: false,
          currency: 'USD',
          registerPrice: 55.00,
          renewPrice: 55.00
        }
      })
    })

    it('should use custom API base URL when provided', async () => {
      process.env.NAMECOM_API_BASE = 'https://api.dev.name.com/v4'
      
      const { checkAvailabilityNamecom } = await import('../namecom')
      await checkAvailabilityNamecom(['test.com'])

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.dev.name.com/v4/domains:checkAvailability',
        expect.objectContaining({
          method: 'POST'
        })
      )
    })

    it('should handle API base URL without /v4 suffix', async () => {
      process.env.NAMECOM_API_BASE = 'https://api.dev.name.com'
      
      const { checkAvailabilityNamecom } = await import('../namecom')
      await checkAvailabilityNamecom(['test.com'])

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.dev.name.com/v4/domains:checkAvailability',
        expect.objectContaining({
          method: 'POST'
        })
      )
    })

    it('should handle batch processing for large domain lists', async () => {
      // Create a list of 75 domains (should be split into 2 batches)
      const domains = Array.from({ length: 75 }, (_, i) => `domain${i}.com`)
      
      // Mock multiple responses for batches
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce(
          mockFetchResponse({
            results: domains.slice(0, 50).map(domain => ({
              domainName: domain,
              purchasable: true,
              purchasePrice: 12.99,
              renewalPrice: 12.99,
              currency: 'USD'
            }))
          })
        )
        .mockResolvedValueOnce(
          mockFetchResponse({
            results: domains.slice(50).map(domain => ({
              domainName: domain,
              purchasable: true,
              purchasePrice: 12.99,
              renewalPrice: 12.99,
              currency: 'USD'
            }))
          })
        )

      const { checkAvailabilityNamecom } = await import('../namecom')
      const result = await checkAvailabilityNamecom(domains)

      expect(global.fetch).toHaveBeenCalledTimes(2)
      expect(Object.keys(result)).toHaveLength(75)
    })

    it('should handle v4 API error responses', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue(
        mockFetchResponse({ error: 'Invalid credentials' }, 403)
      )

      const { checkAvailabilityNamecom } = await import('../namecom')
      await expect(checkAvailabilityNamecom(['test.com']))
        .rejects.toThrow('name.com v4 checkAvailability failed: 403')
    })

    it('should include helpful hint for 403 errors', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue(
        mockFetchResponse({ error: 'Forbidden' }, 403)
      )

      const { checkAvailabilityNamecom } = await import('../namecom')
      await expect(checkAvailabilityNamecom(['test.com']))
        .rejects.toThrow('Hint: Ensure Basic Auth uses username (not email)')
    })
  })

  describe('Core API', () => {
    beforeEach(() => {
      process.env.NAMECOM_USE_CORE = 'true'
      ;(global.fetch as jest.Mock).mockResolvedValue(
        mockFetchResponse({
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
              domainName: 'premium.ai',
              available: true,
              premium: true,
              purchasePrice: 5500,
              renewalPrice: 5500,
              purchasable: true
            }
          ]
        })
      )
    })

    it('should make successful Core API call', async () => {
      const domains = ['testdomain.com', 'premium.ai']
      const { checkAvailabilityNamecom } = await import('../namecom')
      const result = await checkAvailabilityNamecom(domains)

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.name.com/domains:checkAvailability',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic dGVzdHVzZXI6dGVzdHRva2Vu'
          },
          body: JSON.stringify({ domainNames: domains })
        }
      )

      expect(result).toEqual({
        'testdomain.com': {
          domainName: 'testdomain.com',
          available: true,
          premium: false,
          currency: 'USD',
          registerPrice: 12.99, // Converted from cents
          renewPrice: 12.99
        },
        'premium.ai': {
          domainName: 'premium.ai',
          available: true,
          premium: true,
          currency: 'USD',
          registerPrice: 55.00,
          renewPrice: 55.00
        }
      })
    })

    it('should use custom Core API URL when provided', async () => {
      process.env.NAMECOM_CORE_API = 'https://api.dev.name.com'
      
      const { checkAvailabilityNamecom } = await import('../namecom')
      await checkAvailabilityNamecom(['test.com'])

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.dev.name.com/domains:checkAvailability',
        expect.objectContaining({
          method: 'POST'
        })
      )
    })

    it('should handle Core API error responses', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue(
        mockFetchResponse({ error: 'Unauthorized' }, 401)
      )

      const { checkAvailabilityNamecom } = await import('../namecom')
      await expect(checkAvailabilityNamecom(['test.com']))
        .rejects.toThrow('name.com CORE availability failed: 401')
    })

    it('should handle prices correctly when they are undefined', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue(
        mockFetchResponse({
          results: [
            {
              domainName: 'testdomain.com',
              available: true,
              premium: false,
              // No price fields
              purchasable: true
            }
          ]
        })
      )

      const { checkAvailabilityNamecom } = await import('../namecom')
      const result = await checkAvailabilityNamecom(['testdomain.com'])

      expect(result['testdomain.com']).toEqual({
        domainName: 'testdomain.com',
        available: true,
        premium: false,
        currency: 'USD',
        registerPrice: undefined,
        renewPrice: undefined
      })
    })
  })

  describe('common functionality', () => {
    it('should return empty object for empty domain list', async () => {
      const { checkAvailabilityNamecom } = await import('../namecom')
      const result = await checkAvailabilityNamecom([])
      expect(result).toEqual({})
      expect(global.fetch).not.toHaveBeenCalled()
    })

    it('should handle missing credentials', async () => {
      delete process.env.NAMECOM_USERNAME
      delete process.env.NAMECOM_API_TOKEN

      const { checkAvailabilityNamecom } = await import('../namecom')
      await expect(checkAvailabilityNamecom(['test.com']))
        .rejects.toThrow('Missing NAMECOM_USERNAME or NAMECOM_API_TOKEN')
    })

    it('should normalize domain names to lowercase', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue(
        mockFetchResponse({
          results: [
            {
              domainName: 'TestDomain.COM',
              purchasable: true,
              purchasePrice: 12.99,
              renewalPrice: 12.99,
              currency: 'USD'
            }
          ]
        })
      )

      const { checkAvailabilityNamecom } = await import('../namecom')
      const result = await checkAvailabilityNamecom(['TestDomain.COM'])

      // Should normalize the key to lowercase
      expect(result['testdomain.com']).toBeDefined()
      expect(result['TestDomain.COM']).toBeUndefined()
    })

    it('should handle network errors gracefully', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network timeout'))

      const { checkAvailabilityNamecom } = await import('../namecom')
      await expect(checkAvailabilityNamecom(['test.com']))
        .rejects.toThrow('Network timeout')
    })

    it('should handle malformed API responses', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue(
        mockFetchResponse({ invalid: 'response' })
      )

      const { checkAvailabilityNamecom } = await import('../namecom')
      const result = await checkAvailabilityNamecom(['test.com'])

      // Should handle missing results gracefully
      expect(result).toEqual({})
    })
  })

  describe('authentication', () => {
    it('should create correct Basic Auth header', async () => {
      process.env.NAMECOM_USERNAME = 'user@example.com'
      process.env.NAMECOM_API_TOKEN = 'secret123'

      ;(global.fetch as jest.Mock).mockResolvedValue(
        mockFetchResponse({ results: [] })
      )

      const { checkAvailabilityNamecom } = await import('../namecom')
      await checkAvailabilityNamecom(['test.com'])

      const expectedAuth = 'Basic ' + Buffer.from('user@example.com:secret123').toString('base64')
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': expectedAuth
          })
        })
      )
    })
  })

  describe('development logging', () => {
    it('should log errors in development mode', async () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'
      process.env.NAMECOM_USE_CORE = 'true'

      ;(global.fetch as jest.Mock).mockResolvedValue(
        mockFetchResponse({ error: 'Test error' }, 500)
      )

      const { checkAvailabilityNamecom } = await import('../namecom')
      await expect(checkAvailabilityNamecom(['test.com']))
        .rejects.toThrow('name.com CORE availability failed: 500')

      expect(console.error).toHaveBeenCalledWith('[namecom] Core API failed', expect.any(Error))

      process.env.NODE_ENV = originalEnv
    })

    it('should not log errors in production mode', async () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'
      process.env.NAMECOM_USE_CORE = 'true'

      ;(global.fetch as jest.Mock).mockResolvedValue(
        mockFetchResponse({ error: 'Test error' }, 500)
      )

      const { checkAvailabilityNamecom } = await import('../namecom')
      await expect(checkAvailabilityNamecom(['test.com']))
        .rejects.toThrow('name.com CORE availability failed: 500')

      expect(console.error).not.toHaveBeenCalled()

      process.env.NODE_ENV = originalEnv
    })
  })
})