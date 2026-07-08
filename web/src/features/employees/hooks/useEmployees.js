import { useState, useCallback } from 'react'
import { getEmployees, createEmployee, updateEmployee } from '../api.js'

const EMPTY_EMP_FORM = {
  username: '',
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  position: '',
  department: '',
  basicRate: '',
}

export function useEmployees() {
  const [employees, setEmployees] = useState([])

  // Add employee modal state
  const [showAddEmployee, setShowAddEmployee] = useState(false)
  const [empForm, setEmpForm] = useState(EMPTY_EMP_FORM)
  const [empFormError, setEmpFormError] = useState('')
  const [empFormLoading, setEmpFormLoading] = useState(false)

  // Edit rate modal state
  const [showEditEmployee, setShowEditEmployee] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState(null)
  const [editRateValue, setEditRateValue] = useState('')
  const [editRateError, setEditRateError] = useState('')
  const [editRateLoading, setEditRateLoading] = useState(false)

  const refresh = useCallback(async () => {
    const data = await getEmployees()
    setEmployees(data)
    return data
  }, [])

  const handleAddEmployee = async (e) => {
    e.preventDefault()
    setEmpFormError('')
    setEmpFormLoading(true)
    try {
      await createEmployee({ ...empForm, basicRate: parseFloat(empForm.basicRate) })
      setShowAddEmployee(false)
      setEmpForm(EMPTY_EMP_FORM)
      await refresh()
    } catch (err) {
      setEmpFormError(err.message)
    } finally {
      setEmpFormLoading(false)
    }
  }

  const openEditRate = (employee) => {
    setEditingEmployee(employee)
    setEditRateValue(String(employee.basicRate ?? ''))
    setEditRateError('')
    setShowEditEmployee(true)
  }

  const handleUpdateRate = async (e) => {
    e.preventDefault()
    setEditRateError('')
    const parsed = parseFloat(editRateValue)
    if (Number.isNaN(parsed)) {
      setEditRateError('Please enter a valid basic rate.')
      return
    }
    setEditRateLoading(true)
    try {
      await updateEmployee(editingEmployee.id, { basicRate: parsed })
      await refresh()
      setShowEditEmployee(false)
      setEditingEmployee(null)
      setEditRateValue('')
    } catch (err) {
      setEditRateError(err.message)
    } finally {
      setEditRateLoading(false)
    }
  }

  return {
    employees,
    setEmployees,
    refresh,
    // add
    showAddEmployee,
    setShowAddEmployee,
    empForm,
    setEmpForm,
    empFormError,
    empFormLoading,
    handleAddEmployee,
    // edit rate
    showEditEmployee,
    setShowEditEmployee,
    editingEmployee,
    editRateValue,
    setEditRateValue,
    editRateError,
    editRateLoading,
    openEditRate,
    handleUpdateRate,
  }
}
