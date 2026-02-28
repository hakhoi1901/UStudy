import React, { useState, useRef, useEffect } from "react";

// --- 1. COMPONENT REUSABLE TỰ BUILT ---
interface Option {
    id: string;
    name: string;
}

interface SelectProps {
    label: string;
    value: string;
    options: Option[];
    onChange: (value: string) => void;
    subLabel?: string;
}

/**
*   @param label: Tên của Select
*   @param value: Giá trị của Select
*   @param options: Danh sách các option
*   @param onChange: Hàm callback khi giá trị thay đổi
*   @param subLabel: Label phụ
*/
export function Select({ label, value, options, onChange, subLabel }: SelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Lấy tên của option đang được chọn
    const selectedOption = options?.find(opt => opt.id === value);

    // Xử lý click ra ngoài để đóng menu
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label} {subLabel && <span className="text-gray-400 font-normal">{subLabel}</span>}
            </label>

            {/* Nút bấm giả lập Select */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg text-sm text-gray-900 cursor-pointer flex justify-between items-center transition-all ${isOpen ? "border-[#004A98] ring-2 ring-[#004A98] ring-opacity-20" : "border-gray-200"
                    }`}
            >
                <span className="truncate">{selectedOption ? selectedOption.name : "Chọn..."}</span>
                {/* Icon mũi tên */}
                <svg className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </div>

            {/* Cửa sổ xổ xuống được định dạng hoàn toàn bằng Tailwind */}
            {isOpen && (
                <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto custom-scrollbar">
                    {options && options.map((option) => (
                        <li
                            key={option.id}
                            onClick={() => {
                                onChange(option.id);
                                setIsOpen(false);
                            }}
                            className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${value === option.id
                                ? "bg-[#004A98] text-white font-medium"
                                : "text-gray-700 hover:bg-gray-100"
                                }`}
                        >
                            {option.name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}