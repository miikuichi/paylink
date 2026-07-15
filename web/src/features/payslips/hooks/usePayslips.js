import { useState, useCallback } from 'react'
import { getMyPayslips, getPayslipsByPeriod, generatePayslip, revokePayslip } from '../api.js'

export function usePayslips() {
  const [payslips, setPayslips] = useState([])

  const refreshMyPayslips = useCallback(async () => {
    const data = await getMyPayslips()
    setPayslips(data)
    return data
  }, [])

  const refreshPayslipsByPeriod = useCallback(async (periodId) => {
    const data = await getPayslipsByPeriod(periodId)
    setPayslips(data)
    return data
  }, [])

  const handleGeneratePayslip = async (payrollId, onSuccess) => {
    await generatePayslip(payrollId)
    if (onSuccess) await onSuccess()
  }

  const handleRevokePayslip = async (payslipId, onSuccess) => {
    await revokePayslip(payslipId)
    if (onSuccess) await onSuccess()
  }

  return {
    payslips,
    setPayslips,
    refreshMyPayslips,
    refreshPayslipsByPeriod,
    handleGeneratePayslip,
    handleRevokePayslip,
  }
}
