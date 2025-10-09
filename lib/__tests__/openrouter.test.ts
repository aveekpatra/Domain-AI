import { openRouterChat } from '../openrouter'
import { mockFetchResponse } from '../../test/test-utils'

// Mock fetch globally for these tests
global.fetch = jest.fn()

describe('openRouterChat', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Default successful response
    ;(global.fetch as jest.Mock).mockResolvedValue(
      mockFetchResponse({
        choices: [
          {
            message: {
              content: 'AI generated response'
            }
          }
        ]
      })
    )
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('successful requests', () => {
    it('should make successful API call with required parameters', async () => {
      const config = {
        apiKey: 'test-api-key',
        siteUrl: 'https://example.com',
        appTitle: 'Test App'
      }

      const messages = [
        { role: 'system' as const, content: 'You are a helpful assistant' },
        { role: 'user' as const, content: 'Hello' }
      ]

      const result = await openRouterChat({ messages, config })

      expect(global.fetch).toHaveBeenCalledTimes(1)
      expect(global.fetch).toHaveBeenCalledWith(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-api-key',
            'HTTP-Referer': 'https://example.com',
            'X-Title': 'Test App'
          },
          body: JSON.stringify({
            model: 'openrouter/auto',
            messages
          })
        }
      )

      expect(result).toEqual({ text: 'AI generated response' })
    })

    it('should use custom model when provided', async () => {
      const config = {
        apiKey: 'test-api-key',
        model: 'gpt-4'
      }

      await openRouterChat({ 
        messages: [{ role: 'user', content: 'test' }], 
        config 
      })

      const callArgs = (global.fetch as jest.Mock).mock.calls[0]
      const requestBody = JSON.parse(callArgs[1].body)
      
      expect(requestBody.model).toBe('gpt-4')
    })

    it('should include JSON response format when requested', async () => {
      const config = { apiKey: 'test-api-key' }
      
      await openRouterChat({ 
        messages: [{ role: 'user', content: 'test' }], 
        config,
        responseFormatJson: true
      })

      const callArgs = (global.fetch as jest.Mock).mock.calls[0]
      const requestBody = JSON.parse(callArgs[1].body)
      
      expect(requestBody.response_format).toEqual({ type: 'json_object' })
    })

    it('should handle environment variable model override', async () => {
      const originalEnv = process.env.OPENROUTER_MODEL
      process.env.OPENROUTER_MODEL = 'claude-2'

      const config = { apiKey: 'test-api-key' }
      
      await openRouterChat({ 
        messages: [{ role: 'user', content: 'test' }], 
        config 
      })

      const callArgs = (global.fetch as jest.Mock).mock.calls[0]
      const requestBody = JSON.parse(callArgs[1].body)
      
      expect(requestBody.model).toBe('claude-2')

      // Restore original env
      process.env.OPENROUTER_MODEL = originalEnv
    })

    it('should handle optional headers correctly', async () => {
      const config = { apiKey: 'test-api-key' } // No siteUrl or appTitle

      await openRouterChat({ 
        messages: [{ role: 'user', content: 'test' }], 
        config 
      })

      const callArgs = (global.fetch as jest.Mock).mock.calls[0]
      const headers = callArgs[1].headers
      
      expect(headers['HTTP-Referer']).toBeUndefined()
      expect(headers['X-Title']).toBeUndefined()
    })
  })

  describe('error handling', () => {
    it('should throw error when API key is missing', async () => {
      const config = { apiKey: '' }
      
      await expect(openRouterChat({ 
        messages: [{ role: 'user', content: 'test' }], 
        config 
      })).rejects.toThrow('Missing OPENROUTER_API_KEY')
    })

    it('should handle HTTP error responses', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue(
        mockFetchResponse({ error: 'Invalid API key' }, 401)
      )

      const config = { apiKey: 'invalid-key' }
      
      await expect(openRouterChat({ 
        messages: [{ role: 'user', content: 'test' }], 
        config 
      })).rejects.toThrow('OpenRouter error: 401')
    })

    it('should handle network errors', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      const config = { apiKey: 'test-api-key' }
      
      await expect(openRouterChat({ 
        messages: [{ role: 'user', content: 'test' }], 
        config 
      })).rejects.toThrow('Network error')
    })

    it('should handle empty response content', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue(
        mockFetchResponse({
          choices: [
            {
              message: {
                content: ''
              }
            }
          ]
        })
      )

      const config = { apiKey: 'test-api-key' }
      
      await expect(openRouterChat({ 
        messages: [{ role: 'user', content: 'test' }], 
        config 
      })).rejects.toThrow('OpenRouter returned empty response')
    })

    it('should handle malformed response structure', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue(
        mockFetchResponse({ invalid: 'response' })
      )

      const config = { apiKey: 'test-api-key' }
      
      await expect(openRouterChat({ 
        messages: [{ role: 'user', content: 'test' }], 
        config 
      })).rejects.toThrow('OpenRouter returned empty response')
    })

    it('should handle text parsing error in HTTP error responses', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: jest.fn().mockRejectedValue(new Error('Text parsing failed'))
      }
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      const config = { apiKey: 'test-api-key' }
      
      await expect(openRouterChat({ 
        messages: [{ role: 'user', content: 'test' }], 
        config 
      })).rejects.toThrow('OpenRouter error: 500 Internal Server Error')
    })
  })

  describe('development mode logging', () => {
    it('should log in development mode', async () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      const config = { apiKey: 'test-api-key' }
      
      await openRouterChat({ 
        messages: [{ role: 'user', content: 'test' }], 
        config 
      })

      // Console logs are mocked in jest.setup.js, so we can check they were called
      expect(console.log).toHaveBeenCalledWith(
        '[openrouter] request',
        expect.objectContaining({
          model: expect.any(String),
          messages: 1,
          json: false
        })
      )
      expect(console.log).toHaveBeenCalledWith('[openrouter] response status', 200)

      process.env.NODE_ENV = originalEnv
    })

    it('should not log in production mode', async () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      const config = { apiKey: 'test-api-key' }
      
      await openRouterChat({ 
        messages: [{ role: 'user', content: 'test' }], 
        config 
      })

      expect(console.log).not.toHaveBeenCalled()

      process.env.NODE_ENV = originalEnv
    })
  })
})