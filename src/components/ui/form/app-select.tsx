import { ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export interface AppSelectOption {
  id: string;
  name: string;
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
}

/** Dropdown custom chuẩn của UStudy, dùng cho form và toolbar. */
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
}: AppSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((option) => option.id === value);
  const isDisabled = disabled || options.length === 0;

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="mb-2 block text-sm font-medium text-gray-700">
          {label} {subLabel && <span className="font-normal text-gray-400">{subLabel}</span>}
        </label>
      )}
      <button
        type="button"
        disabled={isDisabled}
        onClick={() => setIsOpen((current) => !current)}
        className={`ustudy-dropdown-trigger ${triggerClassName} ${
          isDisabled
            ? 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400 hover:border-gray-200 hover:bg-gray-50'
            : isOpen ? 'ustudy-dropdown-trigger-open' : ''
        }`}
        aria-label={ariaLabel ?? label}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="min-w-0 flex-1 truncate">{selectedOption?.name ?? 'Chọn...'}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className={`ustudy-dropdown-menu border border-gray-400 ${menuClassName}`} role="listbox">
          {options.map((option) => {
            const isSelected = option.id === value;
            return (
              <button
                key={option.id}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(option.id);
                  setIsOpen(false);
                }}
                className={`ustudy-dropdown-option ${optionClassName} ${isSelected ? 'ustudy-dropdown-option-active' : ''}`}
              >
                {option.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
