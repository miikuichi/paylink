import client from '../../shared/api/client.js'

export const getHolidays = (includeInactive = false) =>
  client.get('/holidays', { params: { includeInactive } }).then((r) => r.data)

export const createHoliday = (body) =>
  client.post('/holidays', body).then((r) => r.data)

export const updateHoliday = (id, body) =>
  client.put(`/holidays/${id}`, body).then((r) => r.data)

export const deactivateHoliday = (id) =>
  client.delete(`/holidays/${id}`).then((r) => r.data)
