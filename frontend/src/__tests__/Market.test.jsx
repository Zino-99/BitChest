import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import Market from '../pages/User/Market'

global.SVGElement = global.HTMLElement

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('recharts', () => ({
  AreaChart: ({ children }) => <div data-testid="area-chart">{children}</div>,
  Area: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
}))

const mockCryptos = [
  { id: 1, name: 'Bitcoin', symbol: 'BTC', currentPrice: 45000, previousPrice: 44000, change: 2.27 },
  { id: 2, name: 'Ethereum', symbol: 'ETH', currentPrice: 3000, previousPrice: 3100, change: -3.22 },
]

const mockHistory = [
  { date: 'Jan 01', price: 40000 },
  { date: 'Jan 02', price: 42000 },
  { date: 'Jan 03', price: 45000 },
]

const renderMarket = () => render(<MemoryRouter><Market /></MemoryRouter>)

describe('Market Page', () => {

  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn((url) => {
      if (url.includes('/history')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockHistory) })
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockCryptos) })
    })
  })

  // ── Rendering ──────────────────────────────────────────────────────────────

  test('shows loading spinner initially', () => {
    global.fetch = vi.fn(() => new Promise(() => {}))
    renderMarket()
    expect(screen.getByText(/loading market/i)).toBeInTheDocument()
  })

  test('renders market title', async () => {
    renderMarket()
    await waitFor(() => {
      expect(screen.getAllByText(/market/i)[0]).toBeInTheDocument()
    })
  })

  test('renders list of cryptocurrencies', async () => {
    renderMarket()
    await waitFor(() => {
      expect(screen.getAllByText('Bitcoin')[0]).toBeInTheDocument()
      expect(screen.getAllByText('Ethereum')[0]).toBeInTheDocument()
    })
  })

  test('renders crypto prices', async () => {
    renderMarket()
    await waitFor(() => {
      expect(screen.getAllByText('45,000.00 €')[0]).toBeInTheDocument()
      expect(screen.getAllByText('3,000.00 €')[0]).toBeInTheDocument()
    })
  })

  test('renders positive change in green', async () => {
    renderMarket()
    await waitFor(() => {
      const changes = screen.getAllByText('+2.27%')
      expect(changes[0]).toHaveClass('text-emerald-500')
    })
  })

  test('renders negative change in red', async () => {
    renderMarket()
    await waitFor(() => {
      const changes = screen.getAllByText('-3.22%')
      expect(changes[0]).toHaveClass('text-red-500')
    })
  })

  test('shows error message when API fails', async () => {
    global.fetch = vi.fn(() => Promise.resolve({ ok: false }))
    renderMarket()
    await waitFor(() => {
      expect(screen.getByText(/server error/i)).toBeInTheDocument()
    })
  })

  // ── Chart ──────────────────────────────────────────────────────────────────

  test('renders chart for first crypto by default', async () => {
    renderMarket()
    await waitFor(() => {
      const charts = screen.getAllByTestId('area-chart')
      expect(charts.length).toBeGreaterThan(0)
    })
  })

  test('loads history when crypto is selected', async () => {
    renderMarket()
    await waitFor(() => screen.getAllByText('Ethereum')[0])

    const user = userEvent.setup()
    await user.click(screen.getAllByText('Ethereum')[0])

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/history')
      )
    })
  })

  // ── Navigation ─────────────────────────────────────────────────────────────

  test('navigates to buy page when Buy button is clicked', async () => {
    renderMarket()
    await waitFor(() => screen.getAllByRole('button', { name: /buy/i }))

    const user = userEvent.setup()
    const buyButtons = screen.getAllByRole('button', { name: /buy/i })
    await user.click(buyButtons[0])

    expect(mockNavigate).toHaveBeenCalledWith('/user/buy/1')
  })

  test('navigates to sell page when Sell button is clicked', async () => {
    renderMarket()
    await waitFor(() => screen.getAllByRole('button', { name: /sell/i }))

    const user = userEvent.setup()
    const sellButtons = screen.getAllByRole('button', { name: /sell/i })
    await user.click(sellButtons[0])

    expect(mockNavigate).toHaveBeenCalledWith('/user/sell/1')
  })
})