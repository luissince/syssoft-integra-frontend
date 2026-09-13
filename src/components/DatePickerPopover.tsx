import { useEffect, useState } from "react"
import { CalendarIcon } from "lucide-react"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { es } from "date-fns/locale"
import { format, isValid, parse } from "date-fns"
import { cn } from "@/lib/utils"

interface DatePickerPopoverProps {
    value: Date
    onChange: (date: Date) => void
    className?: string
}

export default function DatePickerPopover({
    value,
    onChange,
    className = "",
}: DatePickerPopoverProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [manualValue, setManualValue] = useState(format(value, "dd/MM/yyyy"))
    const [calendarMonth, setCalendarMonth] = useState(value)
    const [manualError, setManualError] = useState(false)

    useEffect(() => {
        setManualValue(format(value, "dd/MM/yyyy"))
        setCalendarMonth(value)
    }, [value])

    const getManualDate = () => {
        const date = parse(manualValue, "dd/MM/yyyy", new Date())

        return isValid(date) && format(date, "dd/MM/yyyy") === manualValue
            ? date
            : null
    }

    const handleManualChange = (inputValue: string) => {
        setManualValue(inputValue)
        setManualError(false)

        const date = parse(inputValue, "dd/MM/yyyy", new Date())

        if (isValid(date) && format(date, "dd/MM/yyyy") === inputValue) {
            setCalendarMonth(date)
            onChange(date)
        }
    }

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open)

        if (open) {
            setCalendarMonth(getManualDate() || value)
        }
    }

    const handleDateSelect = (date: Date | undefined) => {
        if (date) {
            setManualValue(format(date, "dd/MM/yyyy"))
            setCalendarMonth(date)
            setManualError(false)
            onChange(date)
            setIsOpen(false)
        }
    }

    return (
        <Popover open={isOpen} onOpenChange={handleOpenChange}>
            <div className={cn("flex w-full", className)}>
                <input
                    value={manualValue}
                    onChange={(event) => handleManualChange(event.target.value)}
                    onBlur={() => setManualError(!getManualDate())}
                    onKeyDown={(event) => {
                        if (event.key === "Enter" && getManualDate()) {
                            setIsOpen(false)
                        }
                    }}
                    placeholder="dd/MM/yyyy"
                    aria-label="Ingresar fecha"
                    aria-invalid={manualError}
                    className={cn(
                        "h-10 min-w-0 flex-1 rounded-l-md border border-r-0 bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring",
                        manualError ? "border-red-500" : "border-input"
                    )}
                />
                <PopoverTrigger asChild>
                    <Button
                        type="button"
                        variant="outline"
                        aria-label="Abrir calendario"
                        className="h-10 rounded-l-none px-3"
                    >
                        <CalendarIcon className="h-4 w-4" />
                    </Button>
                </PopoverTrigger>
            </div>
            <PopoverContent className="w-auto p-0">
                <Calendar
                    mode="single"
                    selected={getManualDate() || value}
                    onSelect={handleDateSelect}
                    month={calendarMonth}
                    onMonthChange={setCalendarMonth}
                    locale={es}
                />
            </PopoverContent>
        </Popover>
    )
}