import client from './client.js'

export async function apiLogin(username, password) {
  const { data } = await client.post('/auth/login', { username, password })
  return data // { token, userId, username, email, role }
}

export async function apiRegister(form) {
  const { data } = await client.post('/auth/register', {
    username: form.username,
    email: form.email,
    password: form.password,
    firstName: form.firstName,
    lastName: form.lastName,
    role: form.role,
  })
  return data // { token, userId, username, email, role }
}
