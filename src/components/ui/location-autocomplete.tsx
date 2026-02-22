"use client";

import * as React from "react";
import { Input } from "~/components/ui/input";

export interface LocationAutocompleteProps {
  name: string;
  id?: string;
  className?: string;
  placeholder?: string;
  required?: boolean;
  value?: string;
  onSelect?: (location: string) => void;
}

interface LocationSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  place_id: number;
}

const LocationAutocomplete = React.forwardRef<
  HTMLInputElement,
  LocationAutocompleteProps
>(
  (
    {
      name,
      id,
      className,
      placeholder,
      required,
      value: controlledValue,
      onSelect,
    },
    ref
  ) => {
    const [value, setValue] = React.useState(controlledValue || "");
    const [suggestions, setSuggestions] = React.useState<LocationSuggestion[]>(
      []
    );
    const [showSuggestions, setShowSuggestions] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const wrapperRef = React.useRef<HTMLDivElement>(null);

    // Debounce timer
    const debounceTimer = React.useRef<NodeJS.Timeout | undefined>(undefined);

    // Sync with external value changes
    React.useEffect(() => {
      setValue(controlledValue || "");
    }, [controlledValue]);

    // Close suggestions when clicking outside
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          wrapperRef.current &&
          !wrapperRef.current.contains(event.target as Node)
        ) {
          setShowSuggestions(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchLocations = async (query: string) => {
      if (query.length < 3) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        // Proxy through our API to set proper User-Agent (browsers strip it from client fetch)
        const response = await fetch(
          `/api/location-search?q=${encodeURIComponent(query)}`
        );

        if (response.ok) {
          const data = (await response.json()) as LocationSuggestion[];
          setSuggestions(data);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error("Error fetching locations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setValue(newValue);
      onSelect?.(newValue);

      // Clear previous timer
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      // Set new timer for debounced search
      debounceTimer.current = setTimeout(() => {
        void fetchLocations(newValue);
      }, 300);
    };

    const handleSelectSuggestion = (suggestion: LocationSuggestion) => {
      // Extract city and state/country from display_name
      const parts = suggestion.display_name.split(", ");
      const shortName =
        parts.length > 2
          ? `${parts[0]}, ${parts[parts.length - 2]}`
          : suggestion.display_name;

      setValue(shortName);
      onSelect?.(shortName);
      setShowSuggestions(false);
      setSuggestions([]);
    };

    return (
      <div ref={wrapperRef} className="relative">
        <Input
          ref={ref}
          id={id}
          name={name}
          value={value}
          onChange={handleInputChange}
          className={className}
          placeholder={placeholder}
          required={required}
          autoComplete="off"
          role="combobox"
          aria-expanded={showSuggestions && suggestions.length > 0}
          aria-autocomplete="list"
          aria-controls={showSuggestions ? "location-listbox" : undefined}
        />

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 mt-1 w-full rounded-md border-2 border-[#facf39]/30 bg-black shadow-2xl">
            <ul
              id="location-listbox"
              role="listbox"
              className="max-h-60 overflow-auto py-1"
            >
              {suggestions.map((suggestion) => (
                <li
                  key={suggestion.place_id}
                  role="option"
                  aria-selected={false}
                  className="cursor-pointer px-4 py-2 text-sm text-neutral-300 transition-colors hover:bg-[#facf39]/20 hover:text-white"
                  onClick={() => handleSelectSuggestion(suggestion)}
                >
                  {suggestion.display_name}
                </li>
              ))}
            </ul>
          </div>
        )}

        {isLoading && (
          <div className="absolute top-1/2 right-3 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#facf39] border-t-transparent"></div>
          </div>
        )}
      </div>
    );
  }
);

LocationAutocomplete.displayName = "LocationAutocomplete";

export { LocationAutocomplete };
