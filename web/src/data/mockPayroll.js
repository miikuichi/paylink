// Static demo data to preview dashboard layouts before the backend is wired up.

export const EMPLOYEES = [
  { id: 1, employeeNumber: 'EMP-0001', name: 'Michael Sevilla', position: 'HR Manager', department: 'Human Resources', status: 'ACTIVE' },
  { id: 2, employeeNumber: 'EMP-0045', name: 'Jamie Cruz', position: 'Software Engineer I', department: 'Engineering', status: 'ACTIVE' },
  { id: 3, employeeNumber: 'EMP-0032', name: 'Alexis Reyes', position: 'UI/UX Designer', department: 'Product', status: 'ACTIVE' },
  { id: 4, employeeNumber: 'EMP-0018', name: 'Diego Santos', position: 'QA Analyst', department: 'Engineering', status: 'ACTIVE' },
  { id: 5, employeeNumber: 'EMP-0027', name: 'Carla Mendoza', position: 'Accountant', department: 'Finance', status: 'INACTIVE' },
]

export const CURRENT_PAY_PERIOD = { id: 12, label: 'Jun 16 – Jun 30, 2026', status: 'PROCESSED' }

export const PAYROLL_SUMMARY = [
  { id: 1, employee: 'Jamie Cruz', employeeNumber: 'EMP-0045', grossPay: 42000, deductions: 5320, netPay: 36680, status: 'PROCESSED' },
  { id: 2, employee: 'Alexis Reyes', employeeNumber: 'EMP-0032', grossPay: 38000, deductions: 4750, netPay: 33250, status: 'PROCESSED' },
  { id: 3, employee: 'Diego Santos', employeeNumber: 'EMP-0018', grossPay: 34000, deductions: 4180, netPay: 29820, status: 'PROCESSED' },
  { id: 4, employee: 'Carla Mendoza', employeeNumber: 'EMP-0027', grossPay: 36500, deductions: 4520, netPay: 31980, status: 'DRAFT' },
]

export const MY_PAYROLL_HISTORY = [
  { id: 101, period: 'Jun 16 – Jun 30, 2026', grossPay: 42000, deductions: 5320, netPay: 36680, status: 'PROCESSED' },
  { id: 102, period: 'Jun 1 – Jun 15, 2026', grossPay: 42000, deductions: 5320, netPay: 36680, status: 'PROCESSED' },
  { id: 103, period: 'May 16 – May 31, 2026', grossPay: 42000, deductions: 5180, netPay: 36820, status: 'PROCESSED' },
  { id: 104, period: 'May 1 – May 15, 2026', grossPay: 40000, deductions: 4950, netPay: 35050, status: 'PROCESSED' },
]

export const MY_LATEST_PAYSLIP = {
  period: 'Jun 16 – Jun 30, 2026',
  issuedAt: 'Jun 30, 2026',
  earnings: [
    { label: 'Basic Pay', amount: 38000 },
    { label: 'Overtime Allowance', amount: 2500 },
    { label: 'Transportation Allowance', amount: 1500 },
  ],
  deductions: [
    { label: 'Withholding Tax', amount: 3200 },
    { label: 'SSS Contribution', amount: 1200 },
    { label: 'PhilHealth', amount: 620 },
    { label: 'Pag-IBIG', amount: 300 },
  ],
  grossPay: 42000,
  totalDeductions: 5320,
  netPay: 36680,
}

export function currency(amount) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(
    amount
  )
}
