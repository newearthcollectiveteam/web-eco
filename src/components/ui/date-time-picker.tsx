"use client";

import * as React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "~/styles/datepicker.css";
import { cn } from "~/lib/utils";

export interface DateTimePickerProps {
  name: string;
  id?: string;
  className?: string;
  placeholder?: string;
  showTimeSelect?: boolean;
  showTimeSelectOnly?: boolean;
  timeIntervals?: number;
  dateFormat?: string;
  onChange?: (date: Date | null) => void;
  value?: Date | null;
  showYearDropdown?: boolean;
  showMonthDropdown?: boolean;
  dropdownMode?: "scroll" | "select";
  yearDropdownItemNumber?: number;
}

const DateTimePicker = React.forwardRef<HTMLInputElement, DateTimePickerProps>(
  (
    {
      name,
      id,
      className,
      placeholder,
      showTimeSelect = false,
      showTimeSelectOnly = false,
      timeIntervals = 15,
      dateFormat,
      onChange,
      value,
      showYearDropdown = false,
      showMonthDropdown = false,
      dropdownMode = "select",
      yearDropdownItemNumber = 100,
    },
    ref
  ) => {
    const [selectedDate, setSelectedDate] = React.useState<Date | null>(
      value || null
    );

    // Sync with external value changes
    React.useEffect(() => {
      setSelectedDate(value || null);
    }, [value]);

    // Determine default date format based on picker type
    const defaultDateFormat = showTimeSelectOnly
      ? "h:mm aa"
      : showTimeSelect
        ? "MMMM d, yyyy h:mm aa"
        : "MMMM d, yyyy";

    const handleChange = (date: Date | null) => {
      setSelectedDate(date);
      if (onChange) {
        onChange(date);
      }
    };

    return (
      <div className="relative">
        <DatePicker
          selected={selectedDate}
          onChange={handleChange}
          showTimeSelect={showTimeSelect}
          showTimeSelectOnly={showTimeSelectOnly}
          timeIntervals={timeIntervals}
          dateFormat={dateFormat || defaultDateFormat}
          placeholderText={placeholder}
          showYearDropdown={showYearDropdown}
          showMonthDropdown={showMonthDropdown}
          dropdownMode={dropdownMode}
          yearDropdownItemNumber={yearDropdownItemNumber}
          className={cn(
            "border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          wrapperClassName="w-full"
          calendarClassName="bg-black border-2 border-[#facf39]/30 rounded-lg shadow-2xl"
        />
        {/* Hidden input for form submission */}
        <input
          type="hidden"
          name={name}
          id={id}
          ref={ref}
          value={
            selectedDate
              ? showTimeSelectOnly
                ? selectedDate.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })
                : selectedDate.toISOString().split("T")[0]
              : ""
          }
        />
      </div>
    );
  }
);

DateTimePicker.displayName = "DateTimePicker";

export { DateTimePicker };
