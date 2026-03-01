import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { vi } from 'vitest'
import Sell from '../pages/user/Sell'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

const mockUser = { id: 1, firstname: 'John', role: 'user' }

const mockCryptos = [
  { id: 1, name: 'Bitcoin', symbol: 'BTC', currentPrice: 45000, change: 2.27 },
]

const mockWalletWithBTC = {
  euroBalance: 500,
  cryptos: [
    {
      id: 1,
      name: 'Bitcoin',
      symbol: 'BTC',
      currentPrice: 45000,
      purchases: [
        { id: 1, quantity: 0.5, priceAtPurchase: 40000, date: '2024-01-01' },
      ],
    },
  ],
}

const mockWalletEmpty = {
  euroBalance: 500,
  cryptos: [],
}

const renderSell = () =>
  render(
    <MemoryRouter initialEntries={['/user/sell/1']}>
      <Routes>
        <Route path="/user/sell/:id" element={<Sell />} />
      </Routes>
    </MemoryRouter>
  )

describe('Sell Page', () => {

  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.setItem('user', JSON.stringify(mockUser))
    global.fetch = vi.fn((url) => {
      if (url.includes('/wallet')) return Promise.resolve({ ok: true, json: () => Promise.resolve(mockWalletWithBTC) })
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockCryptos) })
    })
  })

  afterEach(() => {
    sessionStorage.clear()
  })

  // ── Rendering ──────────────────────────────────────────────────────────────

  test('shows loading initially', () => {
    global.fetch = vi.fn(() => new Promise(() => {}))
    renderSell()
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  test('renders crypto name', async () => {
    renderSell()
    await waitFor(() => {
      expect(screen.getByText(/sell bitcoin/i)).toBeInTheDocument()
    })
  })

  test('renders current price', async () => {
    renderSell()
    await waitFor(() => {
      expect(screen.getByText('45,000.00 €')).toBeInTheDocument()
    })
  })

  test('renders owned quantity', async () => {
    renderSell()
    await waitFor(() => {
      expect(screen.getByText('0.5000 BTC')).toBeInTheDocument()
    })
  })

  test('renders EUR balance', async () => {
    renderSell()
    await waitFor(() => {
      expect(screen.getByText('500.00 €')).toBeInTheDocument()
    })
  })

  test('renders quantity input and MAX button', async () => {
    renderSell()
    await waitFor(() => {
      expect(screen.getByPlaceholderText('0.00')).toBeInTheDocument()
      expect(screen.getByText('MAX')).toBeInTheDocument()
    })
  })

  test('shows empty state when user owns no crypto', async () => {
    global.fetch = vi.fn((url) => {
      if (url.includes('/wallet')) return Promise.resolve({ ok: true, json: () => Promise.resolve(mockWalletEmpty) })
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockCryptos) })
    })
    renderSell()
    await waitFor(() => {
      expect(screen.getByText(/you don't own any bitcoin/i)).toBeInTheDocument()
    })
  })

  // ── Interactions ───────────────────────────────────────────────────────────

  test('sell button is disabled when quantity is empty', async () => {
    renderSell()
    await waitFor(() => screen.getByRole('button', { name: /sell BTC/i }))
    expect(screen.getByRole('button', { name: /sell BTC/i })).toBeDisabled()
  })

  test('fills max quantity when MAX button is clicked', async () => {
    renderSell()
    await waitFor(() => screen.getByText('MAX'))

    const user = userEvent.setup()
    await user.click(screen.getByText('MAX'))

    await waitFor(() => {
      expect(screen.getByPlaceholderText('0.00').value).toBe('0.5')
    })
  })

  test('shows total received when quantity is entered', async () => {
    renderSell()
    await waitFor(() => screen.getByPlaceholderText('0.00'))

    const user = userEvent.setup()
    await user.type(screen.getByPlaceholderText('0.00'), '0.1')

    await waitFor(() => {
      expect(screen.getByText('4,500.00 €')).toBeInTheDocument()
    })
  })

  test('shows insufficient balance warning when quantity exceeds owned', async () => {
    renderSell()
    await waitFor(() => screen.getByPlaceholderText('0.00'))

    const user = userEvent.setup()
    await user.type(screen.getByPlaceholderText('0.00'), '1')

    await waitFor(() => {
      expect(screen.getByText(/insufficient BTC balance/i)).toBeInTheDocument()
    })
  })

  test('sell button is disabled when quantity exceeds owned', async () => {
    renderSell()
    await waitFor(() => screen.getByPlaceholderText('0.00'))

    const user = userEvent.setup()
    await user.type(screen.getByPlaceholderText('0.00'), '1')

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /sell BTC/i })).toBeDisabled()
    })
  })

  // ── Success ────────────────────────────────────────────────────────────────

  test('shows success message after successful sale', async () => {
    global.fetch = vi.fn((url) => {
      if (url.includes('/wallet')) return Promise.resolve({ ok: true, json: () => Promise.resolve(mockWalletWithBTC) })
      if (url.includes('/sell')) return Promise.resolve({ ok: true, json: () => Promise.resolve({ newBalance: 4500, totalReceived: 4500 }) })
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockCryptos) })
    })

    renderSell()
    await waitFor(() => screen.getByPlaceholderText('0.00'))

    const user = userEvent.setup()
    await user.type(screen.getByPlaceholderText('0.00'), '0.1')
    await user.click(screen.getByRole('button', { name: /sell BTC/i }))

    await waitFor(() => {
      expect(screen.getByText(/successfully sold/i)).toBeInTheDocument()
    })
  })

  test('clears quantity after successful sale', async () => {
    global.fetch = vi.fn((url) => {
      if (url.includes('/wallet')) return Promise.resolve({ ok: true, json: () => Promise.resolve(mockWalletWithBTC) })
      if (url.includes('/sell')) return Promise.resolve({ ok: true, json: () => Promise.resolve({ newBalance: 4500, totalReceived: 4500 }) })
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockCryptos) })
    })

    renderSell()
    await waitFor(() => screen.getByPlaceholderText('0.00'))

    const user = userEvent.setup()
    await user.type(screen.getByPlaceholderText('0.00'), '0.1')
    await user.click(screen.getByRole('button', { name: /sell BTC/i }))

    await waitFor(() => {
      expect(screen.getByPlaceholderText('0.00').value).toBe('')
    })
  })

  // ── Error ──────────────────────────────────────────────────────────────────

  test('shows error message when sale fails', async () => {
    global.fetch = vi.fn((url) => {
      if (url.includes('/wallet')) return Promise.resolve({ ok: true, json: () => Promise.resolve(mockWalletWithBTC) })
      if (url.includes('/sell')) return Promise.resolve({ ok: false, json: () => Promise.resolve({ message: 'Server error' }) })
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockCryptos) })
    })

    renderSell()
    await waitFor(() => screen.getByPlaceholderText('0.00'))

    const user = userEvent.setup()
    await user.type(screen.getByPlaceholderText('0.00'), '0.1')
    await user.click(screen.getByRole('button', { name: /sell BTC/i }))

    await waitFor(() => {
      expect(screen.getByText(/server error/i)).toBeInTheDocument()
    })
  })

  // ── Navigation ─────────────────────────────────────────────────────────────

  test('navigates back to market on back button click', async () => {
    renderSell()
    await waitFor(() => screen.getByText(/back to market/i))

    const user = userEvent.setup()
    await user.click(screen.getByText(/back to market/i))

    expect(mockNavigate).toHaveBeenCalledWith('/user/Market')
  })

  test('shows buy link when no crypto owned', async () => {
    global.fetch = vi.fn((url) => {
      if (url.includes('/wallet')) return Promise.resolve({ ok: true, json: () => Promise.resolve(mockWalletEmpty) })
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockCryptos) })
    })
    renderSell()
    await waitFor(() => {
      expect(screen.getByText(/buy BTC instead/i)).toBeInTheDocument()
    })
  })
})