"use client";

import * as React from "react";
import { cn } from "~/lib/utils";

export interface BirthTimePickerProps {
  name: string;
  id?: string;
  className?: string;
  placeholder?: string;
  value?: string;
  onChange?: (time: string) => void;
  disabled?: boolean;
}

const BirthTimePicker = React.forwardRef<HTMLInputElement, BirthTimePickerProps>(
  ({ name, id, className, placeholder: _placeholder = "Select birth time", value, onChange, disabled }, ref) => {
    // Parse initial value if provided (format: "HH:mm")
    const parseInitialValue = (val: string | undefined) => {
      if (!val) return { hour: "", minute: "", period: "AM" };
      const [h, m] = val.split(":");
      if (!h || !m) return { hour: "", minute: "", period: "AM" };
      const hour24 = parseInt(h);
      const period = hour24 >= 12 ? "PM" : "AM";
      let hour12 = hour24 % 12;
      if (hour12 === 0) hour12 = 12;
      return { hour: hour12.toString(), minute: m, period };
    };

    const initial = parseInitialValue(value);
    const [hour, setHour] = React.useState<string>(initial.hour);
    const [minute, setMinute] = React.useState<string>(initial.minute);
    const [period, setPeriod] = React.useState<string>(initial.period);

    // Sync with external value changes
    React.useEffect(() => {
      const parsed = parseInitialValue(value);
      setHour(parsed.hour);
      setMinute(parsed.minute);
      setPeriod(parsed.period);
    }, [value]);

    // Generate hours 1-12
    const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString());

    // Generate minutes 00-59
    const minutes = Array.from({ length: 60 }, (_, i) =>
      i.toString().padStart(2, '0')
    );

    // Format time for hidden input (24-hour format)
    const getFormattedTime = (h: string, m: string, p: string) => {
      if (!h || !m || !p) return "";

      let hour24 = parseInt(h);
      if (p === "PM" && hour24 !== 12) {
        hour24 += 12;
      } else if (p === "AM" && hour24 === 12) {
        hour24 = 0;
      }

      return `${hour24.toString().padStart(2, '0')}:${m}`;
    };

    // Call onChange when values change
    const handleChange = (newHour: string, newMinute: string, newPeriod: string) => {
      const formatted = getFormattedTime(newHour, newMinute, newPeriod);
      if (onChange && formatted) {
        onChange(formatted);
      }
    };

    const handleHourChange = (newHour: string) => {
      setHour(newHour);
      handleChange(newHour, minute, period);
    };

    const handleMinuteChange = (newMinute: string) => {
      setMinute(newMinute);
      handleChange(hour, newMinute, period);
    };

    const handlePeriodChange = (newPeriod: string) => {
      setPeriod(newPeriod);
      handleChange(hour, minute, newPeriod);
    };

    const selectClass = cn(
      "bg-black/40 text-white border border-white/30 focus:border-[#facf39] rounded-md px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#facf39] focus-visible:ring-offset-2 cursor-pointer",
      "appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMUw2IDZMMTEgMSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4=')] bg-[length:12px] bg-[position:right_0.75rem_center] bg-no-repeat pr-10"
    );

    return (
      <div className={cn("flex gap-2", className)}>
        {/* Hour Select */}
        <select
          value={hour}
          onChange={(e) => handleHourChange(e.target.value)}
          className={cn(selectClass, "flex-1", disabled && "opacity-50 cursor-not-allowed")}
          aria-label="Hour"
          disabled={disabled}
        >
          <option value="" disabled>
            Hour
          </option>
          {hours.map((h) => (
            <option key={h} value={h} className="bg-black text-white">
              {h}
            </option>
          ))}
        </select>

        {/* Minute Select */}
        <select
          value={minute}
          onChange={(e) => handleMinuteChange(e.target.value)}
          className={cn(selectClass, "flex-1", disabled && "opacity-50 cursor-not-allowed")}
          aria-label="Minute"
          disabled={disabled}
        >
          <option value="" disabled>
            Min
          </option>
          {minutes.map((m) => (
            <option key={m} value={m} className="bg-black text-white">
              {m}
            </option>
          ))}
        </select>

        {/* AM/PM Select */}
        <select
          value={period}
          onChange={(e) => handlePeriodChange(e.target.value)}
          className={cn(selectClass, "w-20", disabled && "opacity-50 cursor-not-allowed")}
          aria-label="AM or PM"
          disabled={disabled}
        >
          <option value="AM" className="bg-black text-white">
            AM
          </option>
          <option value="PM" className="bg-black text-white">
            PM
          </option>
        </select>

        {/* Hidden input for form submission */}
        <input
          type="hidden"
          name={name}
          id={id}
          ref={ref}
          value={getFormattedTime(hour, minute, period)}
        />
      </div>
    );
  }
);

BirthTimePicker.displayName = "BirthTimePicker";

export { BirthTimePicker };
