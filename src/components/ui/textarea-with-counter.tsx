"use client";

import * as React from "react";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/lib/utils";

export interface TextareaWithCounterProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  minWords?: number;
  minChars?: number;
  helperText?: React.ReactNode;
}

const TextareaWithCounter = React.forwardRef<
  HTMLTextAreaElement,
  TextareaWithCounterProps
>(({ className, minWords, minChars, helperText, ...props }, ref) => {
  const [value, setValue] = React.useState<string>("");
  const [wordCount, setWordCount] = React.useState(0);
  const [charCount, setCharCount] = React.useState(0);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Combine refs
  React.useImperativeHandle(ref, () => textareaRef.current!);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setValue(text);

    // Count words (split by whitespace, filter empty strings)
    const words = text.trim().split(/\s+/).filter(Boolean);
    setWordCount(words.length);

    // Count characters
    setCharCount(text.length);

    // Update custom validity for word count
    if (minWords && words.length < minWords) {
      textareaRef.current?.setCustomValidity(
        `Please enter at least ${minWords} words (currently ${words.length})`
      );
    } else if (minChars && text.length < minChars) {
      textareaRef.current?.setCustomValidity(
        `Please enter at least ${minChars} characters (currently ${text.length})`
      );
    } else {
      textareaRef.current?.setCustomValidity("");
    }

    // Call original onChange if provided
    if (props.onChange) {
      props.onChange(e);
    }
  };

  // Determine if requirements are met
  const meetsWordRequirement = !minWords || wordCount >= minWords;
  const meetsCharRequirement = !minChars || charCount >= minChars;

  return (
    <div className="space-y-1">
      <Textarea
        {...props}
        ref={textareaRef}
        className={className}
        value={value}
        onChange={handleChange}
      />
      <div className="flex justify-between text-xs text-neutral-400 dark:text-neutral-500">
        {minWords && (
          <span
            className={cn(
              "transition-colors",
              meetsWordRequirement ? "text-green-400" : "text-neutral-400"
            )}
          >
            {helperText ? (
              <>
                {helperText}: {wordCount}/{minWords}
                {meetsWordRequirement && " ✓"}
              </>
            ) : (
              <>
                {wordCount} / {minWords} words
                {meetsWordRequirement && " ✓"}
              </>
            )}
          </span>
        )}
        {minChars && (
          <span
            className={cn(
              "transition-colors",
              meetsCharRequirement ? "text-green-400" : "text-neutral-400"
            )}
          >
            {charCount} / {minChars} characters
            {meetsCharRequirement && " ✓"}
          </span>
        )}
        {!minWords && !minChars && (
          <span className="text-neutral-400">{wordCount} words</span>
        )}
      </div>
    </div>
  );
});

TextareaWithCounter.displayName = "TextareaWithCounter";

export { TextareaWithCounter };
