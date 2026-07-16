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
  const [eventFilter, setEventFilter] = useState({
    HOLIDAY: true,
    PAY_PERIOD: true,
    PAYROLL: true,
    PAYSLIP: true,
  })
  const [holidayForm, setHolidayForm] = useState(emptyHolidayForm)
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
    setFormError('')
  }

  const cancelEdit = () => {
    setEditingHolidayId(null)
    setHolidayForm(emptyHolidayForm)
    setFormError('')
  }

  const submitHoliday = async (event) => {
    event.preventDefault()
    setFormError('')

    if (!holidayForm.holidayDate || !holidayForm.name.trim()) {
      setFormError('Date and holiday name are required.')
      return
    }

    setFormLoading(true)
    const payload = normalizeHolidayPayload(holidayForm)

    try {
      if (editingHolidayId) {
        await onUpdateHoliday(editingHolidayId, payload, includeInactiveHolidays)
      } else {
        await onCreateHoliday(payload, includeInactiveHolidays)
      }
      cancelEdit()
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
                  onClick={() => setSelectedDate(day.dateKey)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      setSelectedDate(day.dateKey)
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
          title="Event Stream"
          subtitle={humanDate(selectedDate)}
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
        </Panel>

        <Panel
          title={editingHolidayId ? 'Edit Holiday' : 'Add Holiday'}
          subtitle="Manage holiday records used by payroll and the calendar"
        >
          {(formError || holidaysError) && (
            <Alert tone="error">{formError || holidaysError}</Alert>
          )}

          <form className="holiday-form" onSubmit={submitHoliday}>
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

              <label className="events-filter">
                <input
                  type="checkbox"
                  checked={includeInactiveHolidays}
                  onChange={(event) => setIncludeInactiveHolidays(event.target.checked)}
                />
                Include inactive records
              </label>
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              {editingHolidayId && (
                <Button type="button" variant="ghost" size="sm" onClick={cancelEdit}>
                  Cancel Edit
                </Button>
              )}
              <Button type="submit" size="sm" loading={formLoading}>
                {editingHolidayId ? 'Update Holiday' : 'Save Holiday'}
              </Button>
            </div>
          </form>

          <ul className="holiday-list" style={{ marginTop: 12 }}>
            {holidays.length === 0 && (
              <li className="holiday-item">
                <p className="events-item-title">No holidays found.</p>
              </li>
            )}
            {holidays.map((holiday) => (
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
    </div>
  )
}
