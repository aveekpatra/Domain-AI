// Zod schemas tests
import {
  GenerateDomainsSchema,
  ImprovePromptSchema,
  DomainSuggestionsResponse,
  ValidateDomainSchema,
  type GenerateDomainsInput,
  type ImprovePromptInput,
  type DomainSuggestions,
  type ValidateDomainInput
} from '../schemas'

describe('Schema Validations', () => {
  describe('GenerateDomainsSchema', () => {
    describe('valid inputs', () => {
      it('should validate minimal valid input', () => {
        const input = {
          prompt: 'AI startup for healthcare'
        }

        const result = GenerateDomainsSchema.parse(input)
        
        expect(result).toEqual({
          prompt: 'AI startup for healthcare',
          tlds: ['.com', '.ai', '.io', '.co', '.app', '.dev'], // default values
          count: 20 // default value
        })
      })

      it('should validate full valid input', () => {
        const input = {
          prompt: 'E-commerce platform for sustainable products',
          tlds: ['.com', '.shop', '.eco'],
          count: 10
        }

        const result = GenerateDomainsSchema.parse(input)
        
        expect(result).toEqual(input)
      })

      it('should accept custom TLD formats', () => {
        const input = {
          prompt: 'Tech company',
          tlds: ['.com', '.CO', '.Ai', '.tech'],
          count: 5
        }

        const result = GenerateDomainsSchema.parse(input)
        
        expect(result.tlds).toEqual(['.com', '.CO', '.Ai', '.tech'])
      })

      it('should accept boundary count values', () => {
        const minInput = {
          prompt: 'AI business platform',
          count: 3
        }
        const maxInput = {
          prompt: 'AI business platform',
          count: 20
        }

        expect(() => GenerateDomainsSchema.parse(minInput)).not.toThrow()
        expect(() => GenerateDomainsSchema.parse(maxInput)).not.toThrow()
      })
    })

    describe('invalid inputs', () => {
      it('should reject prompts that are too short', () => {
        const input = {
          prompt: 'AI' // Only 2 characters
        }

        expect(() => GenerateDomainsSchema.parse(input))
          .toThrow('Prompt is too short')
      })

      it('should reject prompts that are too long', () => {
        const input = {
          prompt: 'A'.repeat(801) // Too long
        }

        expect(() => GenerateDomainsSchema.parse(input))
          .toThrow('Prompt is too long')
      })

      it('should reject invalid TLD formats', () => {
        const input = {
          prompt: 'Test company',
          tlds: ['com', 'invalid-tld', '.toolongextension']
        }

        expect(() => GenerateDomainsSchema.parse(input))
          .toThrow()
      })

      it('should reject count values outside bounds', () => {
        const tooLowInput = {
          prompt: 'Test',
          count: 2
        }
        const tooHighInput = {
          prompt: 'Test',
          count: 21
        }

        expect(() => GenerateDomainsSchema.parse(tooLowInput)).toThrow()
        expect(() => GenerateDomainsSchema.parse(tooHighInput)).toThrow()
      })

      it('should reject non-integer count values', () => {
        const input = {
          prompt: 'Test',
          count: 5.5
        }

        expect(() => GenerateDomainsSchema.parse(input)).toThrow()
      })
    })
  })

  describe('ImprovePromptSchema', () => {
    describe('valid inputs', () => {
      it('should validate minimal valid prompt', () => {
        const input = { prompt: 'AI startup' }
        const result = ImprovePromptSchema.parse(input)
        
        expect(result).toEqual(input)
      })

      it('should validate long prompts within limit', () => {
        const input = { prompt: 'AI business platform for ' + 'A'.repeat(770) }
        
        expect(() => ImprovePromptSchema.parse(input)).not.toThrow()
      })
    })

    describe('invalid inputs', () => {
      it('should reject prompts that are too short', () => {
        const input = { prompt: 'AI' }
        
        expect(() => ImprovePromptSchema.parse(input))
          .toThrow('Prompt is too short')
      })

      it('should reject prompts that are too long', () => {
        const input = { prompt: 'A'.repeat(801) }
        
        expect(() => ImprovePromptSchema.parse(input))
          .toThrow('Prompt is too long')
      })

      it('should reject missing prompt field', () => {
        const input = {}
        
        expect(() => ImprovePromptSchema.parse(input)).toThrow()
      })
    })
  })

  describe('DomainSuggestionsResponse', () => {
    describe('valid responses', () => {
      it('should validate complete domain suggestions', () => {
        const input = {
          suggestions: [
            {
              domain: 'testdomain',
              tld: '.com',
              reason: 'Great for business',
              score: 85,
              available: true,
              price: '$12.99',
              registrar: 'Name.com'
            },
            {
              domain: 'aiventure',
              tld: '.ai',
              reason: 'Perfect for AI companies',
              score: 90,
              available: false,
              price: '$55.00',
              registrar: 'Domain.com'
            }
          ]
        }

        const result = DomainSuggestionsResponse.parse(input)
        expect(result).toEqual(input)
      })

      it('should validate minimal domain suggestions', () => {
        const input = {
          suggestions: [
            {
              domain: 'testdomain',
              tld: '.com'
            }
          ]
        }

        const result = DomainSuggestionsResponse.parse(input)
        expect(result).toEqual(input)
      })

      it('should validate empty suggestions array', () => {
        const input = { suggestions: [] }
        
        const result = DomainSuggestionsResponse.parse(input)
        expect(result).toEqual(input)
      })

      it('should validate score boundaries', () => {
        const input = {
          suggestions: [
            { domain: 'test1', tld: '.com', score: 0 },
            { domain: 'test2', tld: '.ai', score: 100 }
          ]
        }

        expect(() => DomainSuggestionsResponse.parse(input)).not.toThrow()
      })
    })

    describe('invalid responses', () => {
      it('should reject missing suggestions field', () => {
        const input = {}
        
        expect(() => DomainSuggestionsResponse.parse(input)).toThrow()
      })

      it('should reject suggestions with missing required fields', () => {
        const input = {
          suggestions: [
            {
              // Missing domain and tld
              reason: 'Test'
            }
          ]
        }

        expect(() => DomainSuggestionsResponse.parse(input)).toThrow()
      })

      it('should reject invalid score ranges', () => {
        const tooLowInput = {
          suggestions: [
            { domain: 'test', tld: '.com', score: -1 }
          ]
        }
        const tooHighInput = {
          suggestions: [
            { domain: 'test', tld: '.com', score: 101 }
          ]
        }

        expect(() => DomainSuggestionsResponse.parse(tooLowInput)).toThrow()
        expect(() => DomainSuggestionsResponse.parse(tooHighInput)).toThrow()
      })

      it('should reject non-array suggestions', () => {
        const input = {
          suggestions: 'not an array'
        }

        expect(() => DomainSuggestionsResponse.parse(input)).toThrow()
      })
    })
  })

  describe('ValidateDomainSchema', () => {
    describe('valid domains', () => {
      it('should validate standard domains', () => {
        const validDomains = [
          'example.com',
          'test.ai',
          'my-domain.co',
          'domain123.io',
          'a.co',
          'very-long-domain-name.tech'
        ]

        validDomains.forEach(domain => {
          const input = { domain }
          expect(() => ValidateDomainSchema.parse(input)).not.toThrow()
        })
      })

      it('should validate domains with numbers and hyphens', () => {
        const input = { domain: '123-test-domain.com' }
        
        expect(() => ValidateDomainSchema.parse(input)).not.toThrow()
      })

      it('should validate domains with long TLDs', () => {
        const input = { domain: 'test.photography' }
        
        expect(() => ValidateDomainSchema.parse(input)).not.toThrow()
      })
    })

    describe('invalid domains', () => {
      it('should reject domains without TLD', () => {
        const input = { domain: 'example' }
        
        expect(() => ValidateDomainSchema.parse(input))
          .toThrow('Invalid domain')
      })

      it('should reject domains with invalid characters', () => {
        const invalidDomains = [
          'example.com/path',
          'example..com',
          'example.com.',
          'example com.com',
          'example@domain.com',
          '_example.com',
          'example_.com'
        ]

        invalidDomains.forEach(domain => {
          const input = { domain }
          expect(() => ValidateDomainSchema.parse(input)).toThrow()
        })
      })

      it('should reject domains with too short TLD', () => {
        const input = { domain: 'example.c' }
        
        expect(() => ValidateDomainSchema.parse(input)).toThrow()
      })

      it('should reject empty domain', () => {
        const input = { domain: '' }
        
        expect(() => ValidateDomainSchema.parse(input)).toThrow()
      })

      it('should reject missing domain field', () => {
        const input = {}
        
        expect(() => ValidateDomainSchema.parse(input)).toThrow()
      })
    })
  })

  describe('TypeScript type exports', () => {
    it('should export correct types', () => {
      // This test ensures the types are properly exported and inferred
      const generateInput: GenerateDomainsInput = {
        prompt: 'Test',
        tlds: ['.com'],
        count: 5
      }

      const improveInput: ImprovePromptInput = {
        prompt: 'Test prompt'
      }

      const validateInput: ValidateDomainInput = {
        domain: 'test.com'
      }

      const suggestions: DomainSuggestions = {
        suggestions: [
          {
            domain: 'test',
            tld: '.com',
            score: 85,
            reason: 'Good domain',
            available: true,
            price: '$12.99',
            registrar: 'Name.com'
          }
        ]
      }

      // If this compiles without errors, the types are correct
      expect(generateInput).toBeDefined()
      expect(improveInput).toBeDefined()
      expect(validateInput).toBeDefined()
      expect(suggestions).toBeDefined()
    })
  })

  describe('Schema transformation', () => {
    it('should apply default values correctly', () => {
      const input = { prompt: 'Test startup' }
      const result = GenerateDomainsSchema.parse(input)

      expect(result.tlds).toEqual(['.com', '.ai', '.io', '.co', '.app', '.dev'])
      expect(result.count).toBe(20)
    })

    it('should not override provided values with defaults', () => {
      const input = {
        prompt: 'Test startup',
        tlds: ['.com', '.net'],
        count: 12
      }
      const result = GenerateDomainsSchema.parse(input)

      expect(result.tlds).toEqual(['.com', '.net'])
      expect(result.count).toBe(12)
    })
  })
})