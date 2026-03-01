import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import Register from '../pages/user/Register'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

const renderRegister = () => render(<MemoryRouter><Register /></MemoryRouter>)

const fillAndSubmit = async (user) => {
  await user.type(screen.getByPlaceholderText('Sophie'), 'John')
  await user.type(screen.getByPlaceholderText('Doe'), 'Smith')
  await user.type(screen.getByPlaceholderText('example@email.com'), 'john@test.com')
  await user.type(screen.getByPlaceholderText('********'), 'password123')
  await user.click(screen.getByRole('button', { name: /register/i }))
}

describe('Register Page', () => {

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // ── Rendering ──────────────────────────────────────────────────────────────

  test('renders the register form', () => {
    renderRegister()
    expect(screen.getByText('BitChest')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Sophie')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Doe')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('example@email.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('********')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument()
  })

  test('renders link to login page', () => {
    renderRegister()
    expect(screen.getByText(/already have an account/i)).toBeInTheDocument()
  })

  // ── Interactions ───────────────────────────────────────────────────────────

  test('updates all fields correctly', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) })
    renderRegister()

    await user.type(screen.getByPlaceholderText('Sophie'), 'John')
    await user.type(screen.getByPlaceholderText('Doe'), 'Smith')
    await user.type(screen.getByPlaceholderText('example@email.com'), 'john@test.com')
    await user.type(screen.getByPlaceholderText('********'), 'password123')

    expect(screen.getByPlaceholderText('Sophie').value).toBe('John')
    expect(screen.getByPlaceholderText('Doe').value).toBe('Smith')
    expect(screen.getByPlaceholderText('example@email.com').value).toBe('john@test.com')
    expect(screen.getByPlaceholderText('********').value).toBe('password123')
  })

  test('shows loading state while submitting', async () => {
    global.fetch = vi.fn(() => new Promise(() => {}))
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) })
    renderRegister()
    await fillAndSubmit(user)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /creating/i })).toBeDisabled()
    })
  })

  // ── Success ────────────────────────────────────────────────────────────────

  test('shows success message on registration', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({ message: 'Account created!' }) })
    )
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) })
    renderRegister()
    await fillAndSubmit(user)

    await waitFor(() => {
      expect(screen.getByText('Account created!')).toBeInTheDocument()
    })
  })

  test('redirects to /Login after 1.5s on success', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({ message: 'Account created!' }) })
    )
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) })
    renderRegister()
    await fillAndSubmit(user)

    await waitFor(() => screen.getByText('Account created!'))
    vi.advanceTimersByTime(1500)
    expect(mockNavigate).toHaveBeenCalledWith('/Login')
  })

  test('clears fields after successful registration', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({ message: 'Account created!' }) })
    )
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) })
    renderRegister()
    await fillAndSubmit(user)

    await waitFor(() => screen.getByText('Account created!'))
    expect(screen.getByPlaceholderText('Sophie').value).toBe('')
    expect(screen.getByPlaceholderText('example@email.com').value).toBe('')
  })

  // ── Errors ─────────────────────────────────────────────────────────────────

  test('shows error message on failed registration', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({ ok: false, json: () => Promise.resolve({ message: 'Email already exists' }) })
    )
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) })
    renderRegister()
    await fillAndSubmit(user)

    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeInTheDocument()
    })
  })

  test('shows server error when fetch fails', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('Network error')))
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) })
    renderRegister()
    await fillAndSubmit(user)

    await waitFor(() => {
      expect(screen.getByText(/unable to contact the server/i)).toBeInTheDocument()
    })
  })
})