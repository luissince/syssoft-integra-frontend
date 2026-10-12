import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import React from "react";
import { MdDateRange } from "react-icons/md";

interface DatePickerProps {
    value?: string | null;
    onChange: (date: string | null) => void;
    placeholder?: string;
}

export function DatePicker({
    value,
    onChange,
    placeholder = "Seleccionar fecha",
}: DatePickerProps) {
    const [open, setOpen] = React.useState(false);

    // Redux/API → Date para el Calendar
    const [date, setDate] = React.useState<Date | undefined>(
        value ? new Date(value) : undefined
    );

    // Actualizar si el value cambia desde afuera
    React.useEffect(() => {
        setDate(value ? new Date(value) : undefined);
    }, [value]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    id="date"
                    className="justify-start font-normal"
                >
                    <div className="w-full flex items-center justify-between gap-2">
                        <span>{date
                            ? date.toLocaleDateString()
                            : placeholder}</span>

                        <MdDateRange className="w-5 h-5" />
                    </div>
                </Button>
            </PopoverTrigger>

            <PopoverContent
                className="w-auto overflow-hidden p-0"
                align="start"
            >
                <Calendar
                    mode="single"
                    selected={date}
                    defaultMonth={date}
                    captionLayout="dropdown"
                    onSelect={(newDate) => {
                        if (!newDate) return;

                        setDate(newDate);

                        // Date → string para Redux
                        onChange(newDate.toISOString());

                        setOpen(false);
                    }}
                />
            </PopoverContent>
        </Popover>
    );
}