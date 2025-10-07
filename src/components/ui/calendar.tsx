import * as React from 'react'
import { cn } from '@/lib/utils'

interface CalendarProps {
  selected?: Date
  onSelect?: (date: Date) => void
  className?: string
}

const Calendar: React.FC<CalendarProps> = ({ selected, onSelect, className }) => {
  const [currentMonth, setCurrentMonth] = React.useState(
    selected ? new Date(selected) : new Date()
  )

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDayOfMonth = new Date(year, month, 1).getDay()

    const days: (Date | null)[] = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null)
    }

    // Add the days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const days = getDaysInMonth(currentMonth)

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const isSameDay = (date1: Date | null, date2: Date | undefined) => {
    if (!date1 || !date2) return false
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    )
  }

  return (
    <div className={cn('p-3 bg-[#2d4a4a] rounded-md border border-[#4a6a6a]', className)}>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={previousMonth}
          className="p-1 hover:bg-[#3a5a5a] rounded text-white"
        >
          &lt;
        </button>
        <div className="font-semibold text-white">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </div>
        <button
          onClick={nextMonth}
          className="p-1 hover:bg-[#3a5a5a] rounded text-white"
        >
          &gt;
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
          <div key={day} className="text-center text-xs font-medium text-gray-400 p-2">
            {day}
          </div>
        ))}
        {days.map((day, index) => (
          <button
            key={index}
            onClick={() => day && onSelect?.(day)}
            disabled={!day}
            className={cn(
              'p-2 text-sm rounded',
              day ? 'hover:bg-[#3a5a5a] text-white' : 'text-transparent cursor-default',
              isSameDay(day, selected) && 'bg-[#7dd87d] hover:bg-[#6bc96b]'
            )}
          >
            {day?.getDate()}
          </button>
        ))}
      </div>
    </div>
  )
}

export { Calendar }
