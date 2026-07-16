import { useCallback, useState } from 'react'
import {
  getHolidays,
  createHoliday,
  updateHoliday,
  deactivateHoliday,
} from '../api.js'

export function useHolidays() {
  const [holidays, setHolidays] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const refreshHolidays = useCallback(async (includeInactive = false) => {
    setLoading(true)
    setError('')
    try {
      const data = await getHolidays(includeInactive)
      setHolidays(data)
      return data
    } catch (err) {
      setError(err.message || 'Failed to load holidays')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const handleCreateHoliday = useCallback(async (payload, includeInactive = false) => {
    setError('')
    await createHoliday(payload)
    return refreshHolidays(includeInactive)
  }, [refreshHolidays])

  const handleUpdateHoliday = useCallback(async (holidayId, payload, includeInactive = false) => {
    setError('')
    await updateHoliday(holidayId, payload)
    return refreshHolidays(includeInactive)
  }, [refreshHolidays])

  const handleDeactivateHoliday = useCallback(async (holidayId, includeInactive = false) => {
    setError('')
    await deactivateHoliday(holidayId)
    return refreshHolidays(includeInactive)
  }, [refreshHolidays])

  return {
    holidays,
    loading,
    error,
    setError,
    refreshHolidays,
    handleCreateHoliday,
    handleUpdateHoliday,
    handleDeactivateHoliday,
  }
}
