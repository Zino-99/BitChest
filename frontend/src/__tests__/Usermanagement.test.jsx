import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import UserManagement from '../pages/admin/UserManagement'

vi.mock('../components/admin/Usercreatemodal', () => ({
  default: ({ onClose }) => (
    <div data-testid="create-modal">
      <button onClick={onClose}>Cancel</button>
    </div>
  ),
}))

vi.mock('../components/admin/Usereditmodal', () => ({
  default: ({ onClose }) => (
    <div data-testid="edit-modal">
      <button onClick={onClose}>Cancel</button>
    </div>
  ),
}))

vi.mock('../components/admin/Userdeletemodal', () => ({
  default: ({ onClose }) => (
    <div data-testid="delete-modal">
      <button onClick={onClose}>Cancel</button>
    </div>
  ),
}))

const mockUsers = [
  { id: 1, firstname: 'John', lastname: 'Doe', email: 'john@test.com', role: 'user', createdAt: '2024-01-01' },
  { id: 2, firstname: 'Jane', lastname: 'Smith', email: 'jane@test.com', role: 'admin', createdAt: '2024-02-01' },
]

const renderUserManagement = () =>
  render(<MemoryRouter><UserManagement /></MemoryRouter>)

describe('UserManagement Page', () => {

  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve(mockUsers) })
    )
  })

  // ── Rendering ──────────────────────────────────────────────────────────────

  test('shows loading initially', () => {
    global.fetch = vi.fn(() => new Promise(() => {}))
    renderUserManagement()
    expect(screen.getAllByText(/loading/i)[0]).toBeInTheDocument()
  })

  test('renders page title', async () => {
    renderUserManagement()
    await waitFor(() => {
      expect(screen.getByText('User Management')).toBeInTheDocument()
    })
  })

  test('renders user count', async () => {
    renderUserManagement()
    await waitFor(() => {
      expect(screen.getByText(/2 registered users/i)).toBeInTheDocument()
    })
  })

  test('renders user names', async () => {
    renderUserManagement()
    await waitFor(() => {
      expect(screen.getAllByText('John Doe')[0]).toBeInTheDocument()
      expect(screen.getAllByText('Jane Smith')[0]).toBeInTheDocument()
    })
  })

  test('renders user emails', async () => {
    renderUserManagement()
    await waitFor(() => {
      expect(screen.getAllByText('john@test.com')[0]).toBeInTheDocument()
      expect(screen.getAllByText('jane@test.com')[0]).toBeInTheDocument()
    })
  })

  test('renders role badges', async () => {
    renderUserManagement()
    await waitFor(() => {
      expect(screen.getAllByText('Admin')[0]).toBeInTheDocument()
      expect(screen.getAllByText('User')[0]).toBeInTheDocument()
    })
  })

  test('shows empty state when no users', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
    )
    renderUserManagement()
    await waitFor(() => {
      expect(screen.getAllByText(/no users found/i)[0]).toBeInTheDocument()
    })
  })

  test('shows error message when API fails', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('Network error')))
    renderUserManagement()
    await waitFor(() => {
      expect(screen.getByText(/unable to load users/i)).toBeInTheDocument()
    })
  })

  // ── Modals ─────────────────────────────────────────────────────────────────

  test('opens create modal when Add User button is clicked', async () => {
    renderUserManagement()
    await waitFor(() => screen.getByText('User Management'))

    const user = userEvent.setup()
    await user.click(screen.getByText('Add User'))

    expect(screen.getByTestId('create-modal')).toBeInTheDocument()
  })

  test('closes create modal on Cancel', async () => {
    renderUserManagement()
    await waitFor(() => screen.getByText('User Management'))

    const user = userEvent.setup()
    await user.click(screen.getByText('Add User'))
    expect(screen.getByTestId('create-modal')).toBeInTheDocument()

    await user.click(screen.getByText('Cancel'))
    expect(screen.queryByTestId('create-modal')).not.toBeInTheDocument()
  })

  test('opens edit modal when Edit button is clicked', async () => {
    renderUserManagement()
    await waitFor(() => screen.getAllByText('Edit'))

    const user = userEvent.setup()
    await user.click(screen.getAllByText('Edit')[0])

    expect(screen.getByTestId('edit-modal')).toBeInTheDocument()
  })

  test('closes edit modal on Cancel', async () => {
    renderUserManagement()
    await waitFor(() => screen.getAllByText('Edit'))

    const user = userEvent.setup()
    await user.click(screen.getAllByText('Edit')[0])
    expect(screen.getByTestId('edit-modal')).toBeInTheDocument()

    await user.click(screen.getByText('Cancel'))
    expect(screen.queryByTestId('edit-modal')).not.toBeInTheDocument()
  })

  test('opens delete modal when Delete button is clicked', async () => {
    renderUserManagement()
    await waitFor(() => screen.getAllByText('Delete'))

    const user = userEvent.setup()
    await user.click(screen.getAllByText('Delete')[0])

    expect(screen.getByTestId('delete-modal')).toBeInTheDocument()
  })

  test('closes delete modal on Cancel', async () => {
    renderUserManagement()
    await waitFor(() => screen.getAllByText('Delete'))

    const user = userEvent.setup()
    await user.click(screen.getAllByText('Delete')[0])
    expect(screen.getByTestId('delete-modal')).toBeInTheDocument()

    await user.click(screen.getByText('Cancel'))
    expect(screen.queryByTestId('delete-modal')).not.toBeInTheDocument()
  })

  test('refreshes user list when Refresh button is clicked', async () => {
    renderUserManagement()
    await waitFor(() => screen.getByText('User Management'))

    const user = userEvent.setup()
    await user.click(screen.getByText('Refresh'))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })
  })
})