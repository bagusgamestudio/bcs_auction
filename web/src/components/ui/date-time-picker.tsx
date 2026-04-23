"use client"

import * as React from "react"
import { format, isValid, setHours, setMinutes, getHours, getMinutes } from "date-fns"
import { Calendar as CalendarIcon, Clock } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

export interface DateTimePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  format?: string
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Pick date & time",
  disabled = false,
  format: formatStr = "yyyy-MM-dd HH:mm",
}: DateTimePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(value)
  const [hours, setHoursState] = React.useState(() => value ? getHours(value) : 0)
  const [minutes, setMinutesState] = React.useState(() => value ? getMinutes(value) : 0)
  const [isOpen, setIsOpen] = React.useState(false)

  React.useEffect(() => {
    if (value) {
      setDate(value)
      setHoursState(getHours(value))
      setMinutesState(getMinutes(value))
    }
  }, [value])

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return

    const newDate = setMinutes(setHours(selectedDate, hours), minutes)
    setDate(newDate)
    onChange?.(newDate)
  }

  const handleTimeChange = (newHours: number, newMinutes: number) => {
    setHoursState(newHours)
    setMinutesState(newMinutes)

    if (date && isValid(date)) {
      const newDate = setMinutes(setHours(date, newHours), newMinutes)
      setDate(newDate)
      onChange?.(newDate)
    } else {
      const now = new Date()
      const newDate = setMinutes(setHours(now, newHours), newMinutes)
      setDate(newDate)
      onChange?.(newDate)
    }
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open && date && isValid(date)) {
      const newDate = setMinutes(setHours(date, hours), minutes)
      onChange?.(newDate)
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date && isValid(date)
            ? `${format(date, formatStr)}`
            : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex flex-col">
          <div className="flex items-center border-b p-2">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Time</span>
            </div>
            <div className="flex items-center gap-1 ml-4">
              <Input
                type="number"
                min={0}
                max={23}
                value={hours}
                onChange={(e) => {
                  const h = Math.max(0, Math.min(23, parseInt(e.target.value) || 0))
                  handleTimeChange(h, minutes)
                }}
                className="w-14 h-8 text-center"
              />
              <span>:</span>
              <Input
                type="number"
                min={0}
                max={59}
                value={minutes}
                onChange={(e) => {
                  const m = Math.max(0, Math.min(59, parseInt(e.target.value) || 0))
                  handleTimeChange(hours, m)
                }}
                className="w-14 h-8 text-center"
              />
            </div>
          </div>
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            initialFocus
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}