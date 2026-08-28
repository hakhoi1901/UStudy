import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';
import type { ReactNode } from 'react';

export interface AppSelectOption {
  id: string | number;
  name: string;
  disabled?: boolean;
}

interface AppSelectProps {
  label?: string;
  value: string;
  options: AppSelectOption[];
  onChange: (value: string) => void;
  subLabel?: string;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  optionClassName?: string;
  valueContent?: ReactNode;
}

/** Dropdown chuẩn của UStudy dùng chung cho form và toolbar. */
export function AppSelect({
  label,
  value,
  options,
  onChange,
  subLabel,
  disabled = false,
  ariaLabel,
  className = '',
  triggerClassName = '',
  menuClassName = '',
  optionClassName = '',
  valueContent,
}: AppSelectProps) {
  const selectedOption = options.find((option) => String(option.id) === value);
  const isDisabled = disabled || options.length === 0;

  return (
    <div className={className}>
      {label && (
        <label className="mb-2 block text-sm font-medium text-gray-700">
          {label} {subLabel && <span className="font-normal text-gray-400">{subLabel}</span>}
        </label>
      )}

      <Select value={selectedOption ? value : undefined} onValueChange={onChange} disabled={isDisabled}>
        <SelectTrigger
          aria-label={ariaLabel ?? label}
          className={`ustudy-dropdown-trigger h-auto border-gray-200 bg-white shadow-none focus:ring-[3px] focus:ring-[var(--ustudy-ring)] ${triggerClassName}`}
        >
          <SelectValue placeholder="Chọn...">{selectedOption ? valueContent : undefined}</SelectValue>
        </SelectTrigger>
        <SelectContent
          position="popper"
          className={`ustudy-dropdown-menu !relative !mt-0 z-[9100] border-gray-200 bg-white p-0 text-gray-800 shadow-lg ${menuClassName}`}
        >
          {options.map((option) => (
            <SelectItem
              key={option.id}
              value={String(option.id)}
              disabled={option.disabled}
              className={`ustudy-dropdown-option rounded-none focus:bg-blue-50 focus:text-[var(--ustudy-brand)] data-[state=checked]:bg-[var(--ustudy-brand)] data-[state=checked]:text-white ${optionClassName}`}
            >
              {option.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
