import client from '../../shared/api/client.js'

export const getMe = () => client.get('/employees/me').then((r) => r.data)
export const getEmployees = () => client.get('/employees').then((r) => r.data)
export const getEmployee = (id) => client.get(`/employees/${id}`).then((r) => r.data)
export const createEmployee = (body) => client.post('/employees', body).then((r) => r.data)
export const updateEmployee = (id, body) => client.put(`/employees/${id}`, body).then((r) => r.data)
