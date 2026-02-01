export interface LoginForm {
  email: string
  password: string
  remember: boolean
}

export function createLoginForm(): LoginForm {
  return {
    email: '',
    password: '',
    remember: false,
  }
}
export interface User {
  user_uuid: string
  full_name: string
  email: string
  email_verified_at: string | null
  active: number
  deleted_at: string | null
  created_at: string
  updated_at: string
  role_name: string
}

export interface LoginResponse {
  status: string
  message?: string
  data: {
    token: string
    user: User
    expires_in: number
  }
}
