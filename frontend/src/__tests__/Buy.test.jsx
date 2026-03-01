import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { vi } from 'vitest'
import Buy from '../pages/user/Buy'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

const mockUser = { id: 1, firstname: 'John', role: 'user' }

const mockCryptos = [
  { id: 1, name: 'Bitcoin', symbol: 'BTC', currentPrice: 45000, change: 2.27 },
]

const mockWallet = { euroBalance: 500, cryptos: [] }

const renderBuy = () =>
  render(
    <MemoryRouter initialEntries={['/user/buy/1']}>
      <Routes>
        <Route path="/user/buy/:id" element={<Buy />} />
      </Routes>
    </MemoryRouter>
  )

describe('Buy Page', () => {

  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.setItem('user', JSON.stringify(mockUser))
    global.fetch = vi.fn((url) => {
      if (url.includes('/wallet')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockWallet) })
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockCryptos) })
    })
  })

  afterEach(() => {
    sessionStorage.clear()
  })

  // ── Rendering ──────────────────────────────────────────────────────────────

  test('shows loading initially', () => {
    global.fetch = vi.fn(() => new Promise(() => {}))
    renderBuy()
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  test('renders crypto name and symbol', async () => {
    renderBuy()
    await waitFor(() => {
      expect(screen.getByText('Bitcoin')).toBeInTheDocument()
      expect(screen.getAllByText(/BTC/)[0]).toBeInTheDocument()
    })
  })

  test('renders current price', async () => {
    renderBuy()
    await waitFor(() => {
      expect(screen.getByText('45,000.00 €')).toBeInTheDocument()
    })
  })

  test('renders EUR balance', async () => {
    renderBuy()
    await waitFor(() => {
      expect(screen.getByText('500.00 €')).toBeInTheDocument()
    })
  })

  test('renders quantity input', async () => {
    renderBuy()
    await waitFor(() => {
      expect(screen.getByPlaceholderText('0.00')).toBeInTheDocument()
    })
  })

  test('renders buy button', async () => {
    renderBuy()
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /buy BTC/i })).toBeInTheDocument()
    })
  })

  // ── Interactions ───────────────────────────────────────────────────────────

  test('buy button is disabled when quantity is empty', async () => {
    renderBuy()
    await waitFor(() => screen.getByRole('button', { name: /buy BTC/i }))
    expect(screen.getByRole('button', { name: /buy BTC/i })).toBeDisabled()
  })

  test('shows total cost when quantity is entered', async () => {
    renderBuy()
    await waitFor(() => screen.getByPlaceholderText('0.00'))

    const user = userEvent.setup()
    await user.type(screen.getByPlaceholderText('0.00'), '0.01')

    await waitFor(() => {
      expect(screen.getByText('450.00 €')).toBeInTheDocument()
    })
  })

  test('shows insufficient balance warning when cost exceeds balance', async () => {
    renderBuy()
    await waitFor(() => screen.getByPlaceholderText('0.00'))

    const user = userEvent.setup()
    await user.type(screen.getByPlaceholderText('0.00'), '1')

    await waitFor(() => {
      expect(screen.getByText(/insufficient balance/i)).toBeInTheDocument()
    })
  })

  test('buy button is disabled when balance is insufficient', async () => {
    renderBuy()
    await waitFor(() => screen.getByPlaceholderText('0.00'))

    const user = userEvent.setup()
    await user.type(screen.getByPlaceholderText('0.00'), '1')

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /buy BTC/i })).toBeDisabled()
    })
  })

  // ── Success ────────────────────────────────────────────────────────────────

  test('shows success message after successful purchase', async () => {
    global.fetch = vi.fn((url) => {
      if (url.includes('/wallet')) return Promise.resolve({ ok: true, json: () => Promise.resolve(mockWallet) })
      if (url.includes('/buy')) return Promise.resolve({ ok: true, json: () => Promise.resolve({ newBalance: 450 }) })
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockCryptos) })
    })

    renderBuy()
    await waitFor(() => screen.getByPlaceholderText('0.00'))

    const user = userEvent.setup()
    await user.type(screen.getByPlaceholderText('0.00'), '0.01')
    await user.click(screen.getByRole('button', { name: /buy BTC/i }))

    await waitFor(() => {
      expect(screen.getByText(/successfully bought/i)).toBeInTheDocument()
    })
  })

  test('clears quantity after successful purchase', async () => {
    global.fetch = vi.fn((url) => {
      if (url.includes('/wallet')) return Promise.resolve({ ok: true, json: () => Promise.resolve(mockWallet) })
      if (url.includes('/buy')) return Promise.resolve({ ok: true, json: () => Promise.resolve({ newBalance: 450 }) })
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockCryptos) })
    })

    renderBuy()
    await waitFor(() => screen.getByPlaceholderText('0.00'))

    const user = userEvent.setup()
    await user.type(screen.getByPlaceholderText('0.00'), '0.01')
    await user.click(screen.getByRole('button', { name: /buy BTC/i }))

    await waitFor(() => {
      expect(screen.getByPlaceholderText('0.00').value).toBe('')
    })
  })

  // ── Error ──────────────────────────────────────────────────────────────────

  test('shows error message when purchase fails', async () => {
    global.fetch = vi.fn((url) => {
      if (url.includes('/wallet')) return Promise.resolve({ ok: true, json: () => Promise.resolve(mockWallet) })
      if (url.includes('/buy')) return Promise.resolve({ ok: false, json: () => Promise.resolve({ message: 'Server error' }) })
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockCryptos) })
    })

    renderBuy()
    await waitFor(() => screen.getByPlaceholderText('0.00'))

    const user = userEvent.setup()
    await user.type(screen.getByPlaceholderText('0.00'), '0.01')
    await user.click(screen.getByRole('button', { name: /buy BTC/i }))

    await waitFor(() => {
      expect(screen.getByText(/server error/i)).toBeInTheDocument()
    })
  })

  // ── Navigation ─────────────────────────────────────────────────────────────

  test('navigates back to market on back button click', async () => {
    renderBuy()
    await waitFor(() => screen.getByText(/back to market/i))

    const user = userEvent.setup()
    await user.click(screen.getByText(/back to market/i))

    expect(mockNavigate).toHaveBeenCalledWith('/user/Market')
  })
})