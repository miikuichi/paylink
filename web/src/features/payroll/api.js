import client from '../../shared/api/client.js'

export const getPayPeriods = () => client.get('/pay-periods').then((r) => r.data)
export const createPayPeriod = (body) => client.post('/pay-periods', body).then((r) => r.data)
export const updatePayPeriodStatus = (id, status) =>
  client.patch(`/pay-periods/${id}/status`, null, { params: { status } }).then((r) => r.data)

export const getMyPayrolls = () => client.get('/payrolls/me').then((r) => r.data)
export const getPayrollsByPeriod = (payPeriodId) =>
  client.get('/payrolls', { params: { payPeriodId } }).then((r) => r.data)
export const processPayroll = (body) => client.post('/payrolls/process', body).then((r) => r.data)
