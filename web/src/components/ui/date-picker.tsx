"use client"

import * as React from "react"
import { format, isValid, setYear, getYear, parse } from "date-fns"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export interface DatePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  popoverContentClassName?: string
  triggerButtonClassName?: string
  yearSelectClassName?: string
  yearRange?: number
  placeholder?: string
  disabled?: boolean
  formatDate?: string
  allowInput?: boolean
  inputClassName?: string
}

export function DatePicker({
  value,
  onChange,
  popoverContentClassName,
  triggerButtonClassName,
  yearSelectClassName,
  yearRange = 100,
  placeholder = "Pick a date",
  disabled = false,
  formatDate = "yyyy-MM-dd",
  allowInput = false,
  inputClassName,
}: DatePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(value)
  const [inputValue, setInputValue] = React.useState(() => {
    if (value && isValid(value)) {
      return format(value, formatDate)
    }
    return ""
  })
  const [selectedYear, setSelectedYear] = React.useState(() => {
    if (value && isValid(value)) {
      return getYear(value)
    }
    return getYear(new Date())
  })
  const [currentMonth, setCurrentMonth] = React.useState(() => {
    if (value && isValid(value)) {
      return value
    }
    return new Date()
  })

  const years = React.useMemo(() => {
    const currentYear = getYear(new Date())
    return Array.from({ length: yearRange * 2 + 1 }, (_, i) => currentYear - yearRange + i)
  }, [yearRange])

  const handleYearChange = (newYear: string) => {
    const yearNumber = parseInt(newYear, 10)
    setSelectedYear(yearNumber)
    setCurrentMonth(prevMonth => setYear(prevMonth, yearNumber))
    if (date && isValid(date)) {
      const newDate = setYear(date, yearNumber)
      setDate(newDate)
      onChange?.(newDate)
    }
  }

  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate && isValid(newDate)) {
      const updatedDate = setYear(newDate, selectedYear)
      setDate(updatedDate)
      setInputValue(format(updatedDate, formatDate))
      onChange?.(updatedDate)
      setSelectedYear(getYear(updatedDate))
      setCurrentMonth(updatedDate)
    } else {
      setDate(newDate)
      setInputValue("")
      onChange?.(newDate)
    }
  }

  const formatInputValue = (value: string) => {
    const numbersOnly = value.replace(/\D/g, '')
    
    if (!numbersOnly) return ''
    
    const formatSegments: { type: 'day' | 'month' | 'year' | 'separator', char: string, length: number }[] = []
    let i = 0
    
    while (i < formatDate.length) {
      const char = formatDate[i]
      if (char === 'd' || char === 'M' || char === 'y') {
        let length = 1
        while (i + length < formatDate.length && formatDate[i + length] === char) {
          length++
        }
        
        const type = char === 'd' ? 'day' : char === 'M' ? 'month' : 'year'
        formatSegments.push({ type, char, length })
        i += length
      } else {
        formatSegments.push({ type: 'separator', char, length: 1 })
        i++
      }
    }
    
    let formatted = ''
    let numberIndex = 0
    
    for (const segment of formatSegments) {
      if (segment.type === 'separator') {
        if (numberIndex < numbersOnly.length && numberIndex > 0) {
          formatted += segment.char
        }
      } else {
        for (let j = 0; j < segment.length && numberIndex < numbersOnly.length; j++) {
          formatted += numbersOnly[numberIndex]
          numberIndex++
        }
        
        if (numberIndex >= numbersOnly.length) break
      }
    }
    
    return formatted
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value
    const formattedValue = formatInputValue(rawValue)
    setInputValue(formattedValue)
    
    const parsedDate = parse(formattedValue, formatDate, new Date())
    if (isValid(parsedDate)) {
      setDate(parsedDate)
      setSelectedYear(getYear(parsedDate))
      setCurrentMonth(parsedDate)
      onChange?.(parsedDate)
    }
  }

  const handleInputBlur = () => {
    if (inputValue && date && isValid(date)) {
      const parsedDate = parse(inputValue, formatDate, new Date())
      if (!isValid(parsedDate)) {
        setInputValue(format(date, formatDate))
      }
    } else if (!inputValue) {
      setDate(undefined)
      onChange?.(undefined)
    }
  }

  React.useEffect(() => {
    if (value !== date) {
      if (value && isValid(value)) {
        setDate(value)
        setInputValue(format(value, formatDate))
        setSelectedYear(getYear(value))
        setCurrentMonth(value)
      } else {
        setDate(undefined)
        setInputValue("")
      }
    }
  }, [value, formatDate])

  return (
    <div className="flex gap-2">
      {allowInput && (
        <Input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={cn("flex-1", inputClassName)}
        />
      )}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              allowInput ? "px-3" : "w-full justify-start text-left font-normal",
              !allowInput && !date && "text-muted-foreground",
              disabled && "opacity-50 cursor-not-allowed",
              triggerButtonClassName
            )}
            disabled={disabled}
          >
            <CalendarIcon className={cn("h-4 w-4", !allowInput && "mr-2")} />
            {!allowInput && (date && isValid(date) ? format(date, formatDate) : <span>{placeholder}</span>)}
          </Button>
        </PopoverTrigger>
      <PopoverContent className={cn("w-auto p-0", popoverContentClassName)}>
        <div className="flex items-center justify-between p-2 border-b">
          <Button
            variant="outline"
            className="h-7 w-7 p-0"
            onClick={() => {
              const newYear = selectedYear - 1
              setSelectedYear(newYear)
              setCurrentMonth(prevMonth => setYear(prevMonth, newYear))
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Select value={selectedYear.toString()} onValueChange={handleYearChange}>
            <SelectTrigger className={cn("w-[100px]", yearSelectClassName)}>
              <SelectValue>{selectedYear}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            className="h-7 w-7 p-0"
            onClick={() => {
              const newYear = selectedYear + 1
              setSelectedYear(newYear)
              setCurrentMonth(prevMonth => setYear(prevMonth, newYear))
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateChange}
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          initialFocus
        />
      </PopoverContent>
    </Popover>
    </div>
  )
}