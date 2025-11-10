import { useState } from "react"
import { CalendarIcon } from "lucide-react"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { es } from "date-fns/locale"
import { format } from "date-fns"
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

    const handleDateSelect = (date: Date | undefined) => {
        if (date) {
            onChange(date)
            setIsOpen(false)
        }
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", className)}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(value, "dd-MM-yyyy", { locale: es })}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Calendar
                    mode="single"
                    selected={value}
                    onSelect={handleDateSelect}
                    defaultMonth={value}
                    locale={es}
                />
            </PopoverContent>
        </Popover>
    )
}