import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import Login from '../pages/Login'

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

// Helper
const renderLogin = () =>
  render(<MemoryRouter><Login /></MemoryRouter>)

describe('Login Page', () => {

  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
  })

  // ── Rendering ──────────────────────────────────────────────────────────────

  test('renders the login form', () => {
    renderLogin()
    expect(screen.getByText('BitChest')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('you@email.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('************')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  test('renders link to register page', () => {
    renderLogin()
    expect(screen.getByText(/sign up now/i)).toBeInTheDocument()
  })

  // ── Interactions ───────────────────────────────────────────────────────────

  test('updates email and password fields', () => {
    renderLogin()
    const emailInput = screen.getByPlaceholderText('you@email.com')
    const passwordInput = screen.getByPlaceholderText('************')

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    expect(emailInput.value).toBe('test@test.com')
    expect(passwordInput.value).toBe('password123')
  })

  test('shows loading state while submitting', async () => {
    global.fetch = vi.fn(() => new Promise(() => {})) // never resolves
    renderLogin()

    fireEvent.change(screen.getByPlaceholderText('you@email.com'), { target: { value: 'test@test.com' } })
    fireEvent.change(screen.getByPlaceholderText('************'), { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled()
    })
  })

  // ── Success ────────────────────────────────────────────────────────────────

  test('redirects to /Dashboard on successful login', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ user: { id: 1, firstname: 'John', role: 'user' } }),
      })
    )
    renderLogin()

    fireEvent.change(screen.getByPlaceholderText('you@email.com'), { target: { value: 'test@test.com' } })
    fireEvent.change(screen.getByPlaceholderText('************'), { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/Dashboard')
    })
  })

  test('saves user to sessionStorage on successful login', async () => {
    const fakeUser = { id: 1, firstname: 'John', role: 'user' }
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ user: fakeUser }),
      })
    )
    renderLogin()

    fireEvent.change(screen.getByPlaceholderText('you@email.com'), { target: { value: 'test@test.com' } })
    fireEvent.change(screen.getByPlaceholderText('************'), { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      const stored = JSON.parse(sessionStorage.getItem('user'))
      expect(stored).toEqual(fakeUser)
    })
  })

  // ── Errors ─────────────────────────────────────────────────────────────────

  test('shows error message on failed login', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Incorrect credentials' }),
      })
    )
    renderLogin()

    fireEvent.change(screen.getByPlaceholderText('you@email.com'), { target: { value: 'wrong@test.com' } })
    fireEvent.change(screen.getByPlaceholderText('************'), { target: { value: 'wrongpass' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText('Incorrect credentials')).toBeInTheDocument()
    })
  })

  test('shows server error message when fetch fails', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('Network error')))
    renderLogin()

    fireEvent.change(screen.getByPlaceholderText('you@email.com'), { target: { value: 'test@test.com' } })
    fireEvent.change(screen.getByPlaceholderText('************'), { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText(/unable to contact the server/i)).toBeInTheDocument()
    })
  })
})