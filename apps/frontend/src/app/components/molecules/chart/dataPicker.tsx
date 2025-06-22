import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'

import { cn } from '@/app/lib/utils'
import {
  Button,
  Calendar,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/app/components/atoms'
import { IDatePickerProps } from '@/app/types/chart'

export function DatePicker({
  date,
  setDate,
  placeholder = 'Pick a date',
}: IDatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'justify-start text-left font-normal',
            !date && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="h-4 w-4" />
          {date ? format(date, 'MMM dd, yyyy') : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar mode="single" selected={date} onSelect={setDate} />
      </PopoverContent>
    </Popover>
  )
}
