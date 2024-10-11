import * as React from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { ptBR } from "date-fns/locale";
import { CalendarIcon, XIcon } from "lucide-react";
import { Calendar } from "./ui/calendar";
import { DateRange } from "react-day-picker";

//@ts-ignore
interface DatePickerWithRangeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  from: Date | undefined;
  to: Date | undefined;
  onChange: (range: DateRange | undefined) => void;
}

export function DatePickerWithRange({
  from,
  to,
  onChange,
  className,
}: DatePickerWithRangeProps) {
  const dateRange: DateRange | undefined =
    from || to ? { from, to } : undefined;

  const clearDates = () => {
    onChange(undefined);
  };

  return (
    <div className={cn("grid gap-2 mr-1", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "sm:w-auto justify-start text-left font-normal",
              !dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 block" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "LLL dd, y", { locale: ptBR })} -{" "}
                  {format(dateRange.to, "LLL dd, y", { locale: ptBR })}
                </>
              ) : (
                format(dateRange.from, "LLL dd, y", { locale: ptBR })
              )
            ) : (
              <span>Intervalo entre datas</span>
            )}
          </Button>
        </PopoverTrigger>
        <div className="relative">
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={onChange}
              numberOfMonths={1}
              locale={ptBR}
            />
          </PopoverContent>
          {dateRange && (
            <Button
              variant="ghost"
              onClick={clearDates}
              className="p-0 z-50 absolute bottom-2 right-2 hover:bg-transparent"
            >
              <XIcon size={20} color="#ff0000" />
            </Button>
          )}
        </div>
      </Popover>
    </div>
  );
}
