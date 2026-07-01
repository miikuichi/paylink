import client from './client.js'

export const getMyPayslips = () => client.get('/payslips/me').then((r) => r.data)
export const getPayslipsByPeriod = (payPeriodId) =>
  client.get('/payslips', { params: { payPeriodId } }).then((r) => r.data)
export const generatePayslip = (payrollId) =>
  client.post(`/payslips/generate/${payrollId}`).then((r) => r.data)
