"use client"

import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isSameDay,
  isToday,
  parseISO,
  startOfMonth,
} from "date-fns"
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

interface DatePickerProps {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  className,
}: DatePickerProps) {
  const selected = value ? parseISO(value) : undefined
  const [open, setOpen] = useState(false)
  const [viewMonth, setViewMonth] = useState(() =>
    startOfMonth(selected ?? new Date())
  )

  const days = eachDayOfInterval({
    start: startOfMonth(viewMonth),
    end: endOfMonth(viewMonth),
  })
  const leadingBlanks = getDay(days[0])

  const handleSelect = (day: Date) => {
    onChange(format(day, "yyyy-MM-dd"))
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={(o) => setOpen(o)}>
      <PopoverTrigger
        className={cn(
          "flex h-8 w-full items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent px-2.5 text-sm whitespace-nowrap transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
          !selected && "text-muted-foreground",
          className
        )}
      >
        {selected ? format(selected, "MMM d, yyyy") : placeholder}
        <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setViewMonth((m) => addMonths(m, -1))}
              className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="text-sm font-medium">
              {format(viewMonth, "MMMM yyyy")}
            </span>
            <button
              type="button"
              onClick={() => setViewMonth((m) => addMonths(m, 1))}
              className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {WEEKDAYS.map((d) => (
              <div
                key={d}
                className="flex h-7 w-7 items-center justify-center text-xs text-muted-foreground"
              >
                {d}
              </div>
            ))}
            {Array.from({ length: leadingBlanks }, (_, i) => (
              <div key={`blank-${i}`} />
            ))}
            {days.map((day) => (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => handleSelect(day)}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-md text-sm transition-colors hover:bg-accent",
                  isToday(day) && !(selected && isSameDay(day, selected)) &&
                    "font-semibold text-primary",
                  selected &&
                    isSameDay(day, selected) &&
                    "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
              >
                {format(day, "d")}
              </button>
            ))}
          </div>

          {selected && (
            <button
              type="button"
              onClick={() => { onChange(""); setOpen(false) }}
              className="w-full text-center text-xs text-muted-foreground hover:text-foreground"
            >
              Clear date
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
