
"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface ComboboxProps {
    options: { value: string; label: string }[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    noResultsText?: string;
    allowCreation?: boolean;
    className?: string;
}

export const Combobox = React.forwardRef<HTMLButtonElement, ComboboxProps>(
  ({ 
    options, 
    value, 
    onChange, 
    placeholder = "Select an option...",
    searchPlaceholder = "Search...",
    noResultsText = "No results found.",
    allowCreation = true,
    className 
  }, ref) => {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  const handleSelect = (currentValue: string) => {
    const option = options.find(o => o.value.toLowerCase() === currentValue.toLowerCase());
    onChange(option ? option.value : "");
    setInputValue(option ? option.label : "");
    setOpen(false);
  };
  
  const handleCreate = () => {
    if (!allowCreation || !inputValue.trim()) return;
    const isExisting = options.some(o => o.label.toLowerCase() === inputValue.toLowerCase());
    if (isExisting) {
        handleSelect(inputValue);
        return;
    }
    onChange(inputValue); // Pass the new name as the value
    setOpen(false);
  };

  const currentLabel = options.find((option) => option.value === value)?.label || value;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={ref}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          <span className="truncate">
            {value ? currentLabel : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput 
            placeholder={searchPlaceholder}
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandList>
            <CommandEmpty>
                {allowCreation && inputValue.trim() ? (
                    <Button variant="ghost" className='w-full justify-start' onClick={handleCreate}>
                        Criar "{inputValue}"
                    </Button>
                ) : noResultsText}
            </CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={handleSelect}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
});

Combobox.displayName = "Combobox";
