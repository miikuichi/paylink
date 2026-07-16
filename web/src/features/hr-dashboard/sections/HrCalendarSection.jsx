import { useMemo, useState } from 'react'
import Panel from '../../../shared/components/ui/Panel.jsx'
import Button from '../../../shared/components/ui/Button.jsx'
import Badge from '../../../shared/components/ui/Badge.jsx'
import Alert from '../../../shared/components/ui/Alert.jsx'
import './HrCalendarSection.css'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const EVENT_CONFIG = {
  HOLIDAY: {
    label: 'Holiday',
    tone: 'error',
    pillClass: 'calendar-event-pill--holiday',
  },
  PAY_PERIOD: {
    label: 'Pay Period',
    tone: 'success',
    pillClass: 'calendar-event-pill--period',
  },
  PAYROLL: {
    label: 'Payroll',
    tone: 'gold',
    pillClass: 'calendar-event-pill--payroll',
  },
  PAYSLIP: {
    label: 'Payslip',
    tone: 'info',
    pillClass: 'calendar-event-pill--payslip',
  },
}

const toDateKey = (value) => {
  if (!value) return ''
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

const humanDate = (dateKey) => {
  if (!dateKey) return 'Unknown date'
  const date = new Date(`${dateKey}T00:00:00`)
  return date.toLocaleDateString('en-PH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const monthTitle = (year, month) =>
  new Date(year, month, 1).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
  })

const range = (n) => Array.from({ length: n }, (_, i) => i)

const MONTH_OPTIONS = [
  { value: 0, label: 'January' },
  { value: 1, label: 'February' },
  { value: 2, label: 'March' },
  { value: 3, label: 'April' },
  { value: 4, label: 'May' },
  { value: 5, label: 'June' },
  { value: 6, label: 'July' },
  { value: 7, label: 'August' },
  { value: 8, label: 'September' },
  { value: 9, label: 'October' },
  { value: 10, label: 'November' },
  { value: 11, label: 'December' },
]

const WEEKDAY_OPTIONS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
]

const OCCURRENCE_OPTIONS = [
  { value: 'FIRST', label: '1st' },
  { value: 'SECOND', label: '2nd' },
  { value: 'THIRD', label: '3rd' },
  { value: 'FOURTH', label: '4th' },
  { value: 'LAST', label: 'Last' },
]

const OCCURRENCE_TO_INDEX = {
  FIRST: 1,
  SECOND: 2,
  THIRD: 3,
  FOURTH: 4,
}

const normalizeHolidayPayload = (form) => ({
  holidayDate: form.holidayDate,
  name: form.name.trim(),
  holidayType: form.holidayType,
  isTentative: form.isTentative,
  isActive: form.isActive,
})

const emptyHolidayForm = {
  holidayDate: '',
  name: '',
  holidayType: 'REGULAR',
  isTentative: false,
  isActive: true,
}

const emptyFloatingRule = (year) => ({
  year,
  month: 0,
  weekday: 0,
  occurrence: 'THIRD',
})

const buildFloatingDate = ({ year, month, weekday, occurrence }) => {
  const numericYear = Number(year)
  const numericMonth = Number(month)
  const numericWeekday = Number(weekday)

  if (!Number.isInteger(numericYear) || numericYear < 1900 || numericYear > 2500) {
    return null
  }

  if (occurrence === 'LAST') {
    const candidate = new Date(numericYear, numericMonth + 1, 0)
    const shift = (candidate.getDay() - numericWeekday + 7) % 7
    candidate.setDate(candidate.getDate() - shift)
    return toDateKey(candidate)
  }

  const nth = OCCURRENCE_TO_INDEX[occurrence]
  if (!nth) return null

  const first = new Date(numericYear, numericMonth, 1)
  const shift = (numericWeekday - first.getDay() + 7) % 7
  const dayOfMonth = 1 + shift + (nth - 1) * 7
  const candidate = new Date(numericYear, numericMonth, dayOfMonth)

  if (candidate.getMonth() !== numericMonth) {
    return null
  }

  return toDateKey(candidate)
}

function buildEvents({ holidays, payPeriods, payrolls, payslips }) {
  const events = []

  for (const holiday of holidays) {
    events.push({
      id: `holiday-${holiday.id}`,
      type: 'HOLIDAY',
      title: holiday.name,
      dateKey: toDateKey(holiday.holidayDate),
      meta: `${holiday.holidayType}${holiday.isTentative ? ' (Tentative)' : ''}${holiday.isActive ? '' : ' (Inactive)'}`,
    })
  }

  for (const period of payPeriods) {
    events.push({
      id: `period-start-${period.id}`,
      type: 'PAY_PERIOD',
      title: 'Pay Period Start',
      dateKey: toDateKey(period.startDate),
      meta: `${period.label} (${period.status})`,
    })
    events.push({
      id: `period-end-${period.id}`,
      type: 'PAY_PERIOD',
      title: 'Pay Period End',
      dateKey: toDateKey(period.endDate),
      meta: `${period.label} (${period.status})`,
    })
  }

  for (const payroll of payrolls) {
    if (!payroll.processedAt) continue
    events.push({
      id: `payroll-${payroll.id}`,
      type: 'PAYROLL',
      title: `Payroll: ${payroll.employeeName}`,
      dateKey: toDateKey(payroll.processedAt),
      meta: `${payroll.payPeriodLabel} (${payroll.status})`,
    })
  }

  for (const payslip of payslips) {
    if (!payslip.issuedAt) continue
    events.push({
      id: `payslip-${payslip.id}`,
      type: 'PAYSLIP',
      title: `Payslip: ${payslip.employeeName}`,
      dateKey: toDateKey(payslip.issuedAt),
      meta: payslip.periodLabel,
    })
  }

  return events.filter((event) => event.dateKey)
}

export function HrCalendarSection({
  holidays,
  holidaysLoading,
  holidaysError,
  payPeriods,
  payrolls,
  payslips,
  includeInactiveHolidays,
  setIncludeInactiveHolidays,
  onRefreshHolidays,
  onCreateHoliday,
  onUpdateHoliday,
  onDeactivateHoliday,
}) {
  const todayKey = toDateKey(new Date())
  const [viewYear, setViewYear] = useState(new Date().getFullYear())
  const [viewMonth, setViewMonth] = useState(new Date().getMonth())
  const [selectedDate, setSelectedDate] = useState(todayKey)
  const [showEventStream, setShowEventStream] = useState(false)
  const [eventFilter, setEventFilter] = useState({
    HOLIDAY: true,
    PAY_PERIOD: true,
    PAYROLL: true,
    PAYSLIP: true,
  })
  const [holidayForm, setHolidayForm] = useState(emptyHolidayForm)
  const [showHolidayModal, setShowHolidayModal] = useState(false)
  const [holidayInputMode, setHolidayInputMode] = useState('EXACT')
  const [floatingRule, setFloatingRule] = useState(() => emptyFloatingRule(new Date().getFullYear()))
  const [editingHolidayId, setEditingHolidayId] = useState(null)
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  const events = useMemo(
    () => buildEvents({ holidays, payPeriods, payrolls, payslips }),
    [holidays, payPeriods, payrolls, payslips],
  )

  const visibleEvents = useMemo(
    () => events.filter((event) => eventFilter[event.type]),
    [events, eventFilter],
  )

  const eventsByDate = useMemo(() => {
    const map = new Map()
    for (const event of visibleEvents) {
      const bucket = map.get(event.dateKey) ?? []
      bucket.push(event)
      map.set(event.dateKey, bucket)
    }
    return map
  }, [visibleEvents])

  const selectedDayEvents = useMemo(
    () => [...(eventsByDate.get(selectedDate) ?? [])].sort((a, b) => a.title.localeCompare(b.title)),
    [eventsByDate, selectedDate],
  )

  const filteredHolidays = useMemo(() => {
    const targetYear = String(viewYear)
    return holidays
      .filter((holiday) => toDateKey(holiday.holidayDate).startsWith(`${targetYear}-`))
      .sort((a, b) => toDateKey(a.holidayDate).localeCompare(toDateKey(b.holidayDate)))
  }, [holidays, viewYear])

  const floatingPreviewDate = useMemo(
    () => buildFloatingDate(floatingRule),
    [floatingRule],
  )

  const upcomingEvents = useMemo(
    () => visibleEvents
      .filter((event) => event.dateKey >= todayKey)
      .sort((a, b) => a.dateKey.localeCompare(b.dateKey) || a.title.localeCompare(b.title))
      .slice(0, 8),
    [visibleEvents, todayKey],
  )

  const monthStart = new Date(viewYear, viewMonth, 1)
  const monthEnd = new Date(viewYear, viewMonth + 1, 0)
  const mondayFirstOffset = (monthStart.getDay() + 6) % 7
  const daysInMonth = monthEnd.getDate()

  const prevMonthDays = range(mondayFirstOffset).map((index) => {
    const day = new Date(viewYear, viewMonth, index - mondayFirstOffset + 1)
    return {
      date: day,
      dateKey: toDateKey(day),
      dayNumber: day.getDate(),
      outside: true,
    }
  })

  const currentMonthDays = range(daysInMonth).map((index) => {
    const day = new Date(viewYear, viewMonth, index + 1)
    return {
      date: day,
      dateKey: toDateKey(day),
      dayNumber: index + 1,
      outside: false,
    }
  })

  const usedCells = prevMonthDays.length + currentMonthDays.length
  const trailingCells = usedCells % 7 === 0 ? 0 : 7 - (usedCells % 7)
  const nextMonthDays = range(trailingCells).map((index) => {
    const day = new Date(viewYear, viewMonth + 1, index + 1)
    return {
      date: day,
      dateKey: toDateKey(day),
      dayNumber: day.getDate(),
      outside: true,
    }
  })

  const calendarDays = [...prevMonthDays, ...currentMonthDays, ...nextMonthDays]

  const shiftMonth = (delta) => {
    const next = new Date(viewYear, viewMonth + delta, 1)
    setViewYear(next.getFullYear())
    setViewMonth(next.getMonth())
    setFloatingRule((prev) => ({ ...prev, year: next.getFullYear(), month: next.getMonth() }))
  }

  const toggleFilter = (type) => {
    setEventFilter((prev) => ({ ...prev, [type]: !prev[type] }))
  }

  const beginEdit = (holiday) => {
    setEditingHolidayId(holiday.id)
    setHolidayForm({
      holidayDate: toDateKey(holiday.holidayDate),
      name: holiday.name,
      holidayType: holiday.holidayType,
      isTentative: Boolean(holiday.isTentative),
      isActive: Boolean(holiday.isActive),
    })
    setHolidayInputMode('EXACT')
    const holidayDate = toDateKey(holiday.holidayDate)
    const parsedDate = new Date(`${holidayDate}T00:00:00`)
    setFloatingRule((prev) => ({
      ...prev,
      year: parsedDate.getFullYear(),
      month: parsedDate.getMonth(),
    }))
    setFormError('')
    setShowHolidayModal(true)
  }

  const closeHolidayModal = () => {
    setEditingHolidayId(null)
    setHolidayForm(emptyHolidayForm)
    setHolidayInputMode('EXACT')
    setFloatingRule(emptyFloatingRule(viewYear))
    setFormError('')
    setShowHolidayModal(false)
  }

  const openCreateModal = () => {
    setEditingHolidayId(null)
    setHolidayInputMode('EXACT')
    setHolidayForm({
      ...emptyHolidayForm,
      holidayDate: `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-01`,
    })
    setFloatingRule(emptyFloatingRule(viewYear))
    setFormError('')
    setShowHolidayModal(true)
  }

  const toggleIncludeInactive = async (checked) => {
    setIncludeInactiveHolidays(checked)
    await onRefreshHolidays(checked)
  }

  const submitHoliday = async (event) => {
    event.preventDefault()
    setFormError('')

    const effectiveDate =
      holidayInputMode === 'FLOATING'
        ? floatingPreviewDate
        : holidayForm.holidayDate

    if (!effectiveDate || !holidayForm.name.trim()) {
      setFormError('Valid date and holiday name are required.')
      return
    }

    setFormLoading(true)
    const payload = normalizeHolidayPayload({
      ...holidayForm,
      holidayDate: effectiveDate,
    })

    try {
      if (editingHolidayId) {
        await onUpdateHoliday(editingHolidayId, payload, includeInactiveHolidays)
      } else {
        await onCreateHoliday(payload, includeInactiveHolidays)
      }
      closeHolidayModal()
    } catch (err) {
      setFormError(err.message || 'Failed to save holiday.')
    } finally {
      setFormLoading(false)
    }
  }

  return (
    <div className="calendar-layout">
      <Panel
        title="Team Calendar"
        subtitle="Holiday management plus pay period, payroll, and payslip events"
      >
        <div className="calendar-card">
          <div className="calendar-toolbar">
            <Button size="sm" variant="ghost" onClick={() => shiftMonth(-1)}>
              Prev
            </Button>
            <p className="calendar-month">{monthTitle(viewYear, viewMonth)}</p>
            <Button size="sm" variant="ghost" onClick={() => shiftMonth(1)}>
              Next
            </Button>
          </div>

          <div className="calendar-grid">
            {WEEKDAYS.map((day) => (
              <div key={day} className="calendar-weekday">
                {day}
              </div>
            ))}

            {calendarDays.map((day) => {
              const dayEvents = eventsByDate.get(day.dateKey) ?? []
              const preview = dayEvents.slice(0, 2)
              const moreCount = dayEvents.length - preview.length
              const isSelected = selectedDate === day.dateKey

              return (
                <div
                  key={day.dateKey}
                  className={[
                    'calendar-cell',
                    day.outside ? 'calendar-cell--outside' : '',
                    isSelected ? 'calendar-cell--selected' : '',
                  ].join(' ')}
                  onClick={() => {
                    setSelectedDate(day.dateKey)
                    setShowEventStream(true)
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      setSelectedDate(day.dateKey)
                      setShowEventStream(true)
                    }
                  }}
                >
                  <span className="calendar-cell-day">{day.dayNumber}</span>
                  <div className="calendar-cell-events">
                    {preview.map((evt) => (
                      <span
                        key={evt.id}
                        className={`calendar-event-pill ${EVENT_CONFIG[evt.type].pillClass}`}
                        title={`${evt.title} - ${evt.meta}`}
                      >
                        {EVENT_CONFIG[evt.type].label}: {evt.title}
                      </span>
                    ))}
                    {moreCount > 0 && (
                      <span className="calendar-event-pill">+{moreCount} more</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </Panel>

      <div className="events-side">
        <Panel
          title="Event Filters"
          subtitle="Controls for calendar event visibility"
          actions={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRefreshHolidays(includeInactiveHolidays)}
              loading={holidaysLoading}
            >
              Refresh
            </Button>
          }
        >
          {holidaysError && <Alert tone="error">{holidaysError}</Alert>}

          <div className="events-filters">
            {Object.keys(EVENT_CONFIG).map((type) => (
              <label key={type} className="events-filter">
                <input
                  type="checkbox"
                  checked={eventFilter[type]}
                  onChange={() => toggleFilter(type)}
                />
                <Badge tone={EVENT_CONFIG[type].tone}>{EVENT_CONFIG[type].label}</Badge>
              </label>
            ))}

            <label className="events-filter">
              <input
                type="checkbox"
                checked={includeInactiveHolidays}
                onChange={(event) => toggleIncludeInactive(event.target.checked)}
              />
              Include inactive holidays
            </label>
          </div>

          <p className="events-hint">
            Click any date in the calendar to open the event stream popup.
          </p>
        </Panel>

        <Panel
          title="Holiday Library"
          subtitle={`Year ${viewYear} holiday records`}
          actions={
            <Button size="sm" onClick={openCreateModal}>
              Add Holiday
            </Button>
          }
        >
          {holidaysError && <Alert tone="error">{holidaysError}</Alert>}

          <ul className="holiday-list" style={{ marginTop: 4 }}>
            {filteredHolidays.length === 0 && (
              <li className="holiday-item">
                <p className="events-item-title">No holidays found for {viewYear}.</p>
              </li>
            )}
            {filteredHolidays.map((holiday) => (
              <li key={holiday.id} className="holiday-item">
                <div className="holiday-item-head">
                  <div>
                    <p className="events-item-title">{holiday.name}</p>
                    <p className="holiday-item-sub">
                      {humanDate(toDateKey(holiday.holidayDate))} - {holiday.holidayType}
                      {holiday.isTentative ? ' - Tentative' : ''}
                    </p>
                  </div>
                  <div className="holiday-item-actions">
                    <Button size="sm" variant="ghost" onClick={() => beginEdit(holiday)}>
                      Edit
                    </Button>
                    {holiday.isActive && (
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => onDeactivateHoliday(holiday.id, includeInactiveHolidays)}
                      >
                        Deactivate
                      </Button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      {showHolidayModal && (
        <div className="modal-overlay" onClick={closeHolidayModal}>
          <div
            className="modal holiday-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 6px' }}>
              {editingHolidayId ? 'Edit Holiday' : 'Add Holiday'}
            </h3>
            <p style={{ margin: '0 0 12px', color: 'var(--ink-500)', fontSize: '0.85rem' }}>
              Use Exact Date for one-off entries, or Floating Rule for schedules like 3rd Sunday of January.
            </p>

            {(formError || holidaysError) && (
              <Alert tone="error">{formError || holidaysError}</Alert>
            )}

            <form className="holiday-form" onSubmit={submitHoliday}>
              <div className="holiday-input-mode">
                <label className="events-filter">
                  <input
                    type="radio"
                    name="holiday-input-mode"
                    checked={holidayInputMode === 'EXACT'}
                    onChange={() => setHolidayInputMode('EXACT')}
                  />
                  Exact Date
                </label>

                <label className="events-filter">
                  <input
                    type="radio"
                    name="holiday-input-mode"
                    checked={holidayInputMode === 'FLOATING'}
                    onChange={() => setHolidayInputMode('FLOATING')}
                  />
                  Floating Rule
                </label>
              </div>

              {holidayInputMode === 'EXACT' ? (
                <label>
                  Date
                  <input
                    type="date"
                    value={holidayForm.holidayDate}
                    onChange={(event) =>
                      setHolidayForm((prev) => ({ ...prev, holidayDate: event.target.value }))
                    }
                    required
                  />
                </label>
              ) : (
                <div className="holiday-form-row holiday-form-row--3">
                  <label>
                    Year
                    <input
                      type="number"
                      min="1900"
                      max="2500"
                      value={floatingRule.year}
                      onChange={(event) =>
                        setFloatingRule((prev) => ({ ...prev, year: Number(event.target.value) || prev.year }))
                      }
                    />
                  </label>

                  <label>
                    Month
                    <select
                      value={floatingRule.month}
                      onChange={(event) =>
                        setFloatingRule((prev) => ({ ...prev, month: Number(event.target.value) }))
                      }
                    >
                      {MONTH_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Weekday
                    <select
                      value={floatingRule.weekday}
                      onChange={(event) =>
                        setFloatingRule((prev) => ({ ...prev, weekday: Number(event.target.value) }))
                      }
                    >
                      {WEEKDAY_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Occurrence
                    <select
                      value={floatingRule.occurrence}
                      onChange={(event) =>
                        setFloatingRule((prev) => ({ ...prev, occurrence: event.target.value }))
                      }
                    >
                      {OCCURRENCE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="holiday-preview">
                    <span>Resolved Date</span>
                    <strong>
                      {floatingPreviewDate ? humanDate(floatingPreviewDate) : 'Invalid pattern for selected month/year'}
                    </strong>
                  </div>
                </div>
              )}

              <label>
                Name
                <input
                  type="text"
                  value={holidayForm.name}
                  onChange={(event) =>
                    setHolidayForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  placeholder="e.g. Independence Day"
                  required
                />
              </label>

              <div className="holiday-form-row">
                <label>
                  Type
                  <select
                    value={holidayForm.holidayType}
                    onChange={(event) =>
                      setHolidayForm((prev) => ({ ...prev, holidayType: event.target.value }))
                    }
                  >
                    <option value="REGULAR">REGULAR</option>
                    <option value="SPECIAL">SPECIAL</option>
                  </select>
                </label>

                <label>
                  Status
                  <select
                    value={holidayForm.isActive ? 'ACTIVE' : 'INACTIVE'}
                    onChange={(event) =>
                      setHolidayForm((prev) => ({ ...prev, isActive: event.target.value === 'ACTIVE' }))
                    }
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </label>
              </div>

              <div className="events-filters" style={{ marginTop: 0 }}>
                <label className="events-filter">
                  <input
                    type="checkbox"
                    checked={holidayForm.isTentative}
                    onChange={(event) =>
                      setHolidayForm((prev) => ({ ...prev, isTentative: event.target.checked }))
                    }
                  />
                  Tentative holiday
                </label>
              </div>

              <div className="holiday-modal-actions">
                <Button type="button" variant="ghost" size="sm" onClick={closeHolidayModal}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" loading={formLoading}>
                  {editingHolidayId ? 'Update Holiday' : 'Save Holiday'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEventStream && (
        <div className="event-stream-popup" role="dialog" aria-label="Event Stream">
          <div className="event-stream-popup__header">
            <div>
              <h4 style={{ margin: 0 }}>Event Stream</h4>
              <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--ink-500)' }}>
                {humanDate(selectedDate)}
              </p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setShowEventStream(false)}>
              Close
            </Button>
          </div>

          <div className="events-panel-group" style={{ marginTop: 10 }}>
            <h4 style={{ margin: 0, fontSize: '0.86rem' }}>Selected Day Events</h4>
            <ul className="events-list" style={{ marginTop: 10 }}>
              {selectedDayEvents.length === 0 && (
                <li className="events-item">
                  <p className="events-item-title">No events</p>
                  <p className="events-item-meta">No matching events for this date.</p>
                </li>
              )}
              {selectedDayEvents.map((eventItem) => (
                <li key={eventItem.id} className="events-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <p className="events-item-title">{eventItem.title}</p>
                    <Badge tone={EVENT_CONFIG[eventItem.type].tone}>{EVENT_CONFIG[eventItem.type].label}</Badge>
                  </div>
                  <p className="events-item-meta">{eventItem.meta}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="events-panel-group" style={{ marginTop: 10 }}>
            <h4 style={{ margin: 0, fontSize: '0.86rem' }}>Upcoming</h4>
            <ul className="events-list" style={{ marginTop: 10 }}>
              {upcomingEvents.length === 0 && (
                <li className="events-item">
                  <p className="events-item-title">No upcoming events</p>
                </li>
              )}
              {upcomingEvents.map((eventItem) => (
                <li key={eventItem.id} className="events-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <p className="events-item-title">{eventItem.title}</p>
                    <Badge tone={EVENT_CONFIG[eventItem.type].tone}>{EVENT_CONFIG[eventItem.type].label}</Badge>
                  </div>
                  <p className="events-item-meta">
                    {humanDate(eventItem.dateKey)} - {eventItem.meta}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
