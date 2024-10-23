import * as React from "react";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "./ui/calendar";
import { DateRange } from "react-day-picker";
import { useSearchParams } from "react-router-dom";

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
  const [_, setSearchParams] = useSearchParams();
  const handleSetCurrentMonthRange = () => {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);

    const startOfMonthFormatted = format(start, "yyyy-MM-dd");
    const endOfMonthFormatted = format(end, "yyyy-MM-dd");

    setSearchParams((p) => {
      p.set("startAt", startOfMonthFormatted);
      p.set("endAt", endOfMonthFormatted);

      return p;
    });
  };
  const dateRange: DateRange | undefined =
    from || to ? { from, to } : undefined;

  return (
    <div className={cn("grid w-full xs:w-auto", className)}>
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

            <div className="flex items-center justify-center">
              <Button variant="ghost" onClick={handleSetCurrentMonthRange}>
                Mês corrente
              </Button>
            </div>
          </PopoverContent>
        </div>
      </Popover>
    </div>
  );
}
