import { useState, useCallback } from 'react'
import {
  getPayPeriods,
  createPayPeriod,
  getPayrollsByPeriod,
  processPayroll,
} from '../api.js'

export function usePayroll() {
  const [payPeriods, setPayPeriods] = useState([])
  const [payrolls, setPayrolls] = useState([])
  const [selectedPeriodId, setSelectedPeriodId] = useState(null)

  // Add pay period modal state
  const [showAddPeriod, setShowAddPeriod] = useState(false)
  const [periodForm, setPeriodForm] = useState({ startDate: '', endDate: '' })
  const [periodFormError, setPeriodFormError] = useState('')
  const [periodFormLoading, setPeriodFormLoading] = useState(false)

  // Process payroll state
  const [processError, setProcessError] = useState('')
  const [processLoading, setProcessLoading] = useState(false)

  const refreshPayPeriods = useCallback(async () => {
    const data = await getPayPeriods()
    setPayPeriods(data)
    return data
  }, [])

  const refreshPayrolls = useCallback(async (periodId) => {
    const id = periodId ?? selectedPeriodId
    if (!id) return []
    const data = await getPayrollsByPeriod(id)
    setPayrolls(data)
    return data
  }, [selectedPeriodId])

  const selectPeriod = useCallback((id) => {
    setSelectedPeriodId(id)
  }, [])

  const handleAddPeriod = async (e) => {
    e.preventDefault()
    setPeriodFormError('')
    setPeriodFormLoading(true)
    try {
      const created = await createPayPeriod(periodForm)
      setShowAddPeriod(false)
      setPeriodForm({ startDate: '', endDate: '' })
      const periods = await refreshPayPeriods()
      const newPeriod = periods.find((p) => p.id === created.id) ?? created
      setSelectedPeriodId(newPeriod.id)
    } catch (err) {
      setPeriodFormError(err.message)
    } finally {
      setPeriodFormLoading(false)
    }
  }

  const handleProcessPayroll = async (employeeId, periodId, options = {}) => {
    const pid = periodId ?? selectedPeriodId
    if (!pid) return
    setProcessError('')
    setProcessLoading(true)
    try {
      const payload = {
        employeeId,
        payPeriodId: pid,
        additionalItems: options.additionalItems ?? [],
      }

      if (options.workedHours != null) payload.workedHours = options.workedHours
      if (options.overtimeHours != null) payload.overtimeHours = options.overtimeHours
      if (options.nightShiftHours != null) payload.nightShiftHours = options.nightShiftHours
      if (options.paidAbsenceHours != null) payload.paidAbsenceHours = options.paidAbsenceHours
      if (options.unpaidAbsenceHours != null) payload.unpaidAbsenceHours = options.unpaidAbsenceHours

      await processPayroll(payload)
      await refreshPayrolls(pid)
    } catch (err) {
      setProcessError(err.message)
    } finally {
      setProcessLoading(false)
    }
  }

  return {
    payPeriods,
    setPayPeriods,
    payrolls,
    setPayrolls,
    selectedPeriodId,
    setSelectedPeriodId,
    selectPeriod,
    refreshPayPeriods,
    refreshPayrolls,
    // add period
    showAddPeriod,
    setShowAddPeriod,
    periodForm,
    setPeriodForm,
    periodFormError,
    periodFormLoading,
    handleAddPeriod,
    // process
    processError,
    processLoading,
    handleProcessPayroll,
  }
}
