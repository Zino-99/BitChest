import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import Wallet from '../pages/user/Wallet'

const mockUser = { id: 1, firstname: 'John', lastname: 'Doe', role: 'user' }

const mockWallet = {
  euroBalance: 500,
  cryptos: [
    {
      id: 1,
      name: 'Bitcoin',
      symbol: 'BTC',
      currentPrice: 45000,
      purchases: [
        { id: 1, quantity: 0.5, priceAtPurchase: 40000, date: '2024-01-01' },
        { id: 2, quantity: 0.25, priceAtPurchase: 42000, date: '2024-02-01' },
      ],
    },
  ],
}

const mockEmptyWallet = {
  euroBalance: 500,
  cryptos: [],
}

const renderWallet = () => render(<MemoryRouter><Wallet /></MemoryRouter>)

describe('Wallet Page', () => {

  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.setItem('user', JSON.stringify(mockUser))
  })

  afterEach(() => {
    sessionStorage.clear()
  })

  // ── Loading / Error ────────────────────────────────────────────────────────

  test('shows loading spinner initially', () => {
    global.fetch = vi.fn(() => new Promise(() => {}))
    renderWallet()
    expect(screen.getByText(/loading portfolio/i)).toBeInTheDocument()
  })

  test('shows error message when API fails', async () => {
    global.fetch = vi.fn(() => Promise.resolve({ ok: false }))
    renderWallet()
    await waitFor(() => {
      expect(screen.getByText(/unauthorized or server error/i)).toBeInTheDocument()
    })
  })

  // ── Rendering ──────────────────────────────────────────────────────────────

  test('renders wallet title', async () => {
    global.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve(mockWallet) }))
    renderWallet()
    await waitFor(() => {
      expect(screen.getByText('My Wallet')).toBeInTheDocument()
    })
  })

  test('renders EUR balance', async () => {
    global.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve(mockWallet) }))
    renderWallet()
    await waitFor(() => {
      expect(screen.getByText('500.00 €')).toBeInTheDocument()
    })
  })

  test('renders crypto card', async () => {
    global.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve(mockWallet) }))
    renderWallet()
    await waitFor(() => {
      expect(screen.getByText('Bitcoin')).toBeInTheDocument()
      expect(screen.getAllByText(/BTC/)[0]).toBeInTheDocument()
    })
  })

  test('renders empty state when no cryptos', async () => {
    global.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve(mockEmptyWallet) }))
    renderWallet()
    await waitFor(() => {
      expect(screen.getByText(/no assets yet/i)).toBeInTheDocument()
    })
  })

  // ── Stats ──────────────────────────────────────────────────────────────────

  test('renders correct number of positions', async () => {
    global.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve(mockWallet) }))
    renderWallet()
    await waitFor(() => {
      expect(screen.getAllByText(/1 active position/i)[0]).toBeInTheDocument()
    })
  })

  // ── Expand purchase history ────────────────────────────────────────────────

  test('expands purchase history on click', async () => {
    global.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve(mockWallet) }))
    renderWallet()
    await waitFor(() => screen.getByText('Bitcoin'))

    const user = userEvent.setup()
    await user.click(screen.getByText('Bitcoin'))

    await waitFor(() => {
      expect(screen.getByText(/purchase history/i)).toBeInTheDocument()
    })
  })

  test('shows purchase dates in history', async () => {
    global.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve(mockWallet) }))
    renderWallet()
    await waitFor(() => screen.getByText('Bitcoin'))

    const user = userEvent.setup()
    await user.click(screen.getByText('Bitcoin'))

    await waitFor(() => {
      expect(screen.getByText('Jan 1, 2024')).toBeInTheDocument()
      expect(screen.getByText('Feb 1, 2024')).toBeInTheDocument()
    })
  })
})