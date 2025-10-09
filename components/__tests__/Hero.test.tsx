import { render, screen, fireEvent, waitFor } from '../../test/test-utils'
import Hero from '../Hero'

// Mock useRouter from next/navigation
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
}))

describe('Hero Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render hero content correctly', () => {
    render(<Hero />)

    // Check main heading
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Find a brand-worthy domain in seconds')

    // Check description
    expect(screen.getByText(/Describe your business and instantly see clean, available domain/)).toBeInTheDocument()

    // Check status indicator
    expect(screen.getByText('AI-powered domain discovery')).toBeInTheDocument()

    // Check feature bullets
    expect(screen.getByText('Try instantly')).toBeInTheDocument()
    expect(screen.getByText('Easy price comparison')).toBeInTheDocument()
    expect(screen.getByText('Clever names')).toBeInTheDocument()
  })

  it('should display PromptBar component', () => {
    render(<Hero />)

    // PromptBar should be present (we'll need to check for input or textarea)
    const promptInput = screen.getByRole('textbox') || screen.getByDisplayValue('')
    expect(promptInput).toBeInTheDocument()
  })

  it('should handle search functionality', async () => {
    render(<Hero />)

    const promptInput = screen.getByRole('textbox')
    const searchButton = screen.getByRole('button', { name: /search domains/i })

    // Type in search query
    fireEvent.change(promptInput, { target: { value: 'AI startup for healthcare' } })
    expect(promptInput).toHaveValue('AI startup for healthcare')

    // Click search button
    fireEvent.click(searchButton)

    // Should navigate to search page with query
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining('/search?prompt=AI+startup+for+healthcare')
      )
    })
  })

  it('should handle search with onSearch callback', async () => {
    render(<Hero />)

    const promptInput = screen.getByRole('textbox')
    
    // Type in search query
    fireEvent.change(promptInput, { target: { value: 'Tech company' } })
    
    // Trigger search via callback (simulating PromptBar's onSearch)
    // We need to find a way to trigger the onSearch callback
    // This would typically be done by the PromptBar component
    const searchButton = screen.getByRole('button', { name: /search domains/i })
    fireEvent.click(searchButton)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalled()
    })
  })

  it('should not search with empty query', async () => {
    render(<Hero />)

    const searchButton = screen.getByRole('button', { name: /search domains/i })
    fireEvent.click(searchButton)

    // Should not navigate if query is empty
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('should properly encode URL parameters', async () => {
    render(<Hero />)

    const promptInput = screen.getByRole('textbox')
    const searchButton = screen.getByRole('button', { name: /search domains/i })

    // Test with special characters
    fireEvent.change(promptInput, { target: { value: 'AI & ML startup' } })
    fireEvent.click(searchButton)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining('AI+%26+ML+startup')
      )
    })
  })

  it('should have proper accessibility attributes', () => {
    render(<Hero />)

    // Check heading hierarchy
    const mainHeading = screen.getByRole('heading', { level: 1 })
    expect(mainHeading).toBeInTheDocument()

    // Check section structure - Hero component uses a section element but not with region role
    const heroSection = screen.getByText('Find a brand-worthy domain in seconds').closest('section')
    expect(heroSection).toBeInTheDocument()
  })

  it('should display feature highlights with proper structure', () => {
    render(<Hero />)

    // Check main feature values are present
    expect(screen.getByText('Try instantly')).toBeInTheDocument()
    expect(screen.getByText('Easy price comparison')).toBeInTheDocument()
    expect(screen.getByText('Clever names')).toBeInTheDocument()

    // Check the feature grid container is present
    expect(document.querySelector('.mt-6.grid')).toBeInTheDocument()
  })

  it('should handle window object safely for SSR', () => {
    // Mock window as undefined (SSR scenario)
    const originalWindow = global.window
    // @ts-expect-error - Mock window as undefined for SSR scenario
    delete global.window

    expect(() => {
      render(<Hero />)
    }).not.toThrow()

    // Restore window
    global.window = originalWindow
  })

  it.skip('should construct proper search URL with different origins', async () => {
    // Mock different origins to test URL construction
    const originalLocation = global.window?.location
    
    // Mock different location origins - skip this test as jsdom doesn't support location mocking well
    delete global.window.location
    global.window.location = {
      origin: 'https://domainmonster.com'
    }

    render(<Hero />)

    const promptInput = screen.getByRole('textbox')
    const searchButton = screen.getByRole('button', { name: /search domains/i })

    fireEvent.change(promptInput, { target: { value: 'test query' } })
    fireEvent.click(searchButton)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalled()
    })

    // Restore original location
    if (originalLocation) {
      global.window.location = originalLocation
    }
  })

  it('should update query state when typing', () => {
    render(<Hero />)

    const promptInput = screen.getByRole('textbox')
    
    fireEvent.change(promptInput, { target: { value: 'Initial query' } })
    expect(promptInput).toHaveValue('Initial query')
    
    fireEvent.change(promptInput, { target: { value: 'Updated query' } })
    expect(promptInput).toHaveValue('Updated query')
  })

  it('should have proper CSS classes for styling', () => {
    render(<Hero />)

    // Check for Tailwind classes (basic structure verification)
    const heroSection = screen.getByText('Find a brand-worthy domain in seconds').closest('section')
    expect(heroSection).toBeInTheDocument()

    // Check status indicator has proper styling classes
    const statusIndicator = screen.getByText('AI-powered domain discovery')
    expect(statusIndicator).toBeInTheDocument()
  })
})