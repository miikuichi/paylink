// Hardcoded demo credentials for frontend-only development.
// TODO: remove once the real /api/auth/login endpoint is connected.

export const MOCK_ACCOUNTS = [
  {
    username: 'hr.admin',
    password: 'HrAdmin123!',
    role: 'ADMIN',
    profile: {
      id: 1,
      firstName: 'Michael',
      lastName: 'Sevilla',
      email: 'hr.admin@paylink.dev',
      position: 'HR Manager',
      department: 'Human Resources',
      employeeNumber: 'EMP-0001',
      avatarColor: '#841B2B',
    },
  },
  {
    username: 'employee',
    password: 'Employee123!',
    role: 'EMPLOYEE',
    profile: {
      id: 2,
      firstName: 'Jamie',
      lastName: 'Cruz',
      email: 'jamie.cruz@paylink.dev',
      position: 'Software Engineer I',
      department: 'Engineering',
      employeeNumber: 'EMP-0045',
      avatarColor: '#B8862F',
    },
  },
]

export function findMockAccount(username, password) {
  return MOCK_ACCOUNTS.find(
    (acc) => acc.username.toLowerCase() === username.trim().toLowerCase() && acc.password === password
  )
}
