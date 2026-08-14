import { create } from 'zustand'

interface AuthState {
  token: string | null
  user: { email: string; id: number; role_id: number; first_name?: string; last_name?: string; organization_id?: number } | null
  setAuth: (token: string, user: any) => void
  logout: () => void
}

let initialUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') as string) : null;
if (initialUser && !initialUser.first_name && initialUser.email) {
  // Force logout to refresh token with new claims (first_name, last_name, organization_id)
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  initialUser = null;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  user: initialUser,
  setAuth: (token, user) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    set({ token, user })
  },
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ token: null, user: null })
  },
}))
