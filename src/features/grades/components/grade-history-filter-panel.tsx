import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { ChevronDown, ChevronRight, Search } from 'lucide-react';
import { Checkbox } from '../../../components/ui/form/checkbox';
import type {
    GradeHistoryCategoryNode,
    GradeHistoryFilters,
    GradeHistoryStatusFilter,
} from '../types';
import { UNCATEGORIZED_CATEGORY_ID } from '../services/grade-history-filter';

export const GRADE_STATUS_OPTIONS: Array<{ value: GradeHistoryStatusFilter; label: string }> = [
    { value: 'passed', label: 'Đạt' },
    { value: 'retake', label: 'Cần học lại' },
    { value: 'ongoing', label: 'Đang học' },
    { value: 'ungraded', label: 'Chưa có điểm' },
    { value: 'exempted', label: 'Được miễn' },
];

interface GradeHistoryFilterPanelProps {
    value: GradeHistoryFilters;
    onChange: (filters: GradeHistoryFilters) => void;
    categoryTree: GradeHistoryCategoryNode[];
}

function toggleArrayValue<T extends string>(values: T[], value: T): T[] {
    return values.includes(value)
        ? values.filter((item) => item !== value)
        : [...values, value];
}

function collectDescendantIds(node: GradeHistoryCategoryNode): string[] {
    return node.children.flatMap((child) => [child.id, ...collectDescendantIds(child)]);
}

function hasSelectedDescendant(node: GradeHistoryCategoryNode, selectedIds: Set<string>): boolean {
    return node.children.some((child) => (
        selectedIds.has(child.id) || hasSelectedDescendant(child, selectedIds)
    ));
}

interface CategoryRowProps {
    node: GradeHistoryCategoryNode;
    depth: number;
    selectedIds: Set<string>;
    inheritedSelected?: boolean;
    onToggle: (node: GradeHistoryCategoryNode) => void;
}

function CategoryRow({
    node,
    depth,
    selectedIds,
    inheritedSelected = false,
    onToggle,
}: CategoryRowProps) {
    const [expanded, setExpanded] = useState(false);
    const hasChildren = node.children.length > 0;
    const ownSelected = selectedIds.has(node.id);
    const checked = ownSelected || inheritedSelected;
    const partiallySelected = !checked && hasSelectedDescendant(node, selectedIds);

    return (
        <div>
            <div
                className="flex min-h-9 items-center gap-2 rounded-md px-1.5 hover:bg-gray-50"
                style={{ paddingLeft: `${6 + depth * 18}px` }}
            >
                {hasChildren ? (
                    <button
                        type="button"
                        onClick={() => setExpanded((current) => !current)}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                        aria-label={expanded ? `Thu gọn ${node.name}` : `Mở ${node.name}`}
                    >
                        {expanded
                            ? <ChevronDown className="h-4 w-4" />
                            : <ChevronRight className="h-4 w-4" />}
                    </button>
                ) : (
                    <span className="h-7 w-7 shrink-0" />
                )}

                <label className={`flex min-w-0 flex-1 items-center gap-2 py-1.5 ${inheritedSelected ? 'cursor-default' : 'cursor-pointer'}`}>
                    <Checkbox
                        checked={checked ? true : partiallySelected ? 'indeterminate' : false}
                        disabled={inheritedSelected}
                        onCheckedChange={() => onToggle(node)}
                        className="border-gray-300 data-[state=checked]:border-[#004A98] data-[state=checked]:bg-[#004A98] data-[state=indeterminate]:border-[#004A98] data-[state=indeterminate]:bg-blue-50 data-[state=indeterminate]:text-[#004A98]"
                    />
                    <span className={`truncate text-sm ${depth === 0 ? 'font-medium text-gray-800' : 'text-gray-700'}`}>
                        {node.name}
                    </span>
                </label>
            </div>

            {hasChildren && expanded && (
                <div>
                    {node.children.map((child) => (
                        <CategoryRow
                            key={child.id}
                            node={child}
                            depth={depth + 1}
                            selectedIds={selectedIds}
                            inheritedSelected={checked}
                            onToggle={onToggle}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

interface FilterOptionGroupProps<T extends string> {
    options: Array<{ value: T; label: string }>;
    selected: T[];
    onToggle: (value: T) => void;
}

function FilterOptionGroup<T extends string>({ options, selected, onToggle }: FilterOptionGroupProps<T>) {
    return (
        <div className="grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-2">
            {options.map((option) => (
                <label
                    key={option.value}
                    className="flex min-h-9 cursor-pointer items-center gap-2 rounded-md px-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                    <Checkbox
                        checked={selected.includes(option.value)}
                        onCheckedChange={() => onToggle(option.value)}
                        className="border-gray-300 data-[state=checked]:border-[#004A98] data-[state=checked]:bg-[#004A98]"
                    />
                    <span>{option.label}</span>
                </label>
            ))}
        </div>
    );
}

interface RangeFilterProps {
    min: number;
    max: number;
    lowerValue: number;
    upperValue: number;
    step: number;
    unit?: string;
    onChange: (range: { min: number; max: number }) => void;
}

function formatRangeValue(value: number, step: number, unit = ''): string {
    const display = step < 1 ? value.toFixed(1) : String(value);
    return unit ? `${display} ${unit}` : display;
}

function RangeFilter({ min, max, lowerValue, upperValue, step, unit, onChange }: RangeFilterProps) {
    const trackRef = useRef<HTMLDivElement>(null);
    const dragRangeRef = useRef({ min: lowerValue, max: upperValue });
    const [draggingThumb, setDraggingThumb] = useState<'lower' | 'upper' | null>(null);
    const lowerPercent = ((lowerValue - min) / (max - min)) * 100;
    const upperPercent = ((upperValue - min) / (max - min)) * 100;

    useEffect(() => {
        if (!draggingThumb) {
            dragRangeRef.current = { min: lowerValue, max: upperValue };
        }
    }, [draggingThumb, lowerValue, upperValue]);

    const clampAndRound = (value: number) => {
        const rounded = min + Math.round((value - min) / step) * step;
        return Number(Math.min(max, Math.max(min, rounded)).toFixed(step < 1 ? 1 : 0));
    };

    const setThumbValue = (thumb: 'lower' | 'upper', rawValue: number) => {
        const value = clampAndRound(rawValue);
        const currentRange = dragRangeRef.current;
        const nextRange = thumb === 'lower'
            ? { min: Math.min(value, currentRange.max), max: currentRange.max }
            : { min: currentRange.min, max: Math.max(value, currentRange.min) };

        dragRangeRef.current = nextRange;
        onChange(nextRange);
    };

    const getValueFromPointer = (event: PointerEvent<HTMLElement>) => {
        const bounds = trackRef.current?.getBoundingClientRect();
        if (!bounds || bounds.width <= 0) return min;
        return min + ((event.clientX - bounds.left) / bounds.width) * (max - min);
    };

    const beginDragging = (event: PointerEvent<HTMLElement>, preferredThumb?: 'lower' | 'upper') => {
        if (event.pointerType === 'mouse' && event.button !== 0) return;
        event.preventDefault();
        const pointerValue = clampAndRound(getValueFromPointer(event));
        const thumb = preferredThumb ?? (
            Math.abs(pointerValue - lowerValue) <= Math.abs(pointerValue - upperValue) ? 'lower' : 'upper'
        );

        dragRangeRef.current = { min: lowerValue, max: upperValue };
        setDraggingThumb(thumb);
        trackRef.current?.setPointerCapture(event.pointerId);
        setThumbValue(thumb, pointerValue);
    };

    const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
        if (!draggingThumb) return;
        event.preventDefault();
        setThumbValue(draggingThumb, getValueFromPointer(event));
    };

    const stopDragging = (event: PointerEvent<HTMLDivElement>) => {
        if (trackRef.current?.hasPointerCapture(event.pointerId)) {
            trackRef.current.releasePointerCapture(event.pointerId);
        }
        setDraggingThumb(null);
    };

    const handleThumbKeyDown = (event: KeyboardEvent<HTMLButtonElement>, thumb: 'lower' | 'upper') => {
        const deltaByKey: Record<string, number> = {
            ArrowLeft: -step,
            ArrowDown: -step,
            ArrowRight: step,
            ArrowUp: step,
            Home: thumb === 'lower' ? min - lowerValue : min - upperValue,
            End: thumb === 'lower' ? max - lowerValue : max - upperValue,
        };
        const delta = deltaByKey[event.key];
        if (delta === undefined) return;

        event.preventDefault();
        dragRangeRef.current = { min: lowerValue, max: upperValue };
        setThumbValue(thumb, (thumb === 'lower' ? lowerValue : upperValue) + delta);
    };

    return (
        <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Khoảng đã chọn</span>
                <span className="font-semibold tabular-nums text-[#004A98]">
                    {formatRangeValue(lowerValue, step, unit)} – {formatRangeValue(upperValue, step, unit)}
                </span>
            </div>
            <div
                ref={trackRef}
                role="group"
                aria-label="Chọn khoảng giá trị"
                onPointerDown={(event) => beginDragging(event)}
                onPointerMove={handlePointerMove}
                onPointerUp={stopDragging}
                onPointerCancel={stopDragging}
                className="relative mt-3 h-8 touch-none"
            >
                <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-gray-200" />
                <div
                    className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[#004A98]"
                    style={{ left: `${lowerPercent}%`, right: `${100 - upperPercent}%` }}
                />
                <button
                    type="button"
                    role="slider"
                    aria-label="Giá trị nhỏ nhất"
                    aria-valuemin={min}
                    aria-valuemax={upperValue}
                    aria-valuenow={lowerValue}
                    aria-valuetext={formatRangeValue(lowerValue, step, unit)}
                    onPointerDown={(event) => {
                        event.stopPropagation();
                        beginDragging(event, 'lower');
                    }}
                    onKeyDown={(event) => handleThumbKeyDown(event, 'lower')}
                    className={`absolute top-1/2 z-20 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#004A98] bg-white shadow-sm outline-none transition-shadow focus-visible:ring-4 focus-visible:ring-blue-100 ${draggingThumb === 'lower' ? 'cursor-grabbing shadow-md' : 'cursor-grab'}`}
                    style={{ left: `${lowerPercent}%` }}
                />
                <button
                    type="button"
                    role="slider"
                    aria-label="Giá trị lớn nhất"
                    aria-valuemin={lowerValue}
                    aria-valuemax={max}
                    aria-valuenow={upperValue}
                    aria-valuetext={formatRangeValue(upperValue, step, unit)}
                    onPointerDown={(event) => {
                        event.stopPropagation();
                        beginDragging(event, 'upper');
                    }}
                    onKeyDown={(event) => handleThumbKeyDown(event, 'upper')}
                    className={`absolute top-1/2 z-30 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#004A98] bg-white shadow-sm outline-none transition-shadow focus-visible:ring-4 focus-visible:ring-blue-100 ${draggingThumb === 'upper' ? 'cursor-grabbing shadow-md' : 'cursor-grab'}`}
                    style={{ left: `${upperPercent}%` }}
                />
            </div>
            <div className="flex justify-between text-[11px] text-gray-400">
                <span>{formatRangeValue(min, step, unit)}</span>
                <span>{formatRangeValue(max, step, unit)}</span>
            </div>
        </div>
    );
}

export function GradeHistoryFilterPanel({ value, onChange, categoryTree }: GradeHistoryFilterPanelProps) {
    const selectedCategoryIds = new Set(value.categoryIds);

    const toggleCategory = (node: GradeHistoryCategoryNode) => {
        const descendants = new Set(collectDescendantIds(node));
        const nextIds = value.categoryIds.filter((id) => !descendants.has(id));
        onChange({
            ...value,
            categoryIds: selectedCategoryIds.has(node.id)
                ? nextIds.filter((id) => id !== node.id)
                : [...nextIds.filter((id) => id !== node.id), node.id],
        });
    };

    return (
        <div className="space-y-3 bg-gray-50/70 p-3">
            <section className="rounded-lg bg-white px-4 py-3 shadow-sm ring-1 ring-gray-100">
                <label htmlFor="grade-history-search" className="mb-2 block text-xs font-semibold uppercase text-gray-500">
                    Tìm môn học
                </label>
                <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                        id="grade-history-search"
                        value={value.query}
                        onChange={(event) => onChange({ ...value, query: event.target.value })}
                        placeholder="Nhập mã hoặc tên môn"
                        className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-800 outline-none transition focus:border-[#004A98] focus:ring-2 focus:ring-blue-100"
                    />
                </div>
            </section>

            <section className="rounded-lg bg-white px-4 py-3 shadow-sm ring-1 ring-gray-100">
                <h4 className="mb-2 text-xs font-semibold uppercase text-gray-500">Nhóm môn</h4>
                <div className="space-y-0.5">
                    {categoryTree.filter((node) => node.courseCodes.length > 0).map((node) => (
                        <CategoryRow
                            key={node.id}
                            node={node}
                            depth={0}
                            selectedIds={selectedCategoryIds}
                            onToggle={toggleCategory}
                        />
                    ))}
                    <label className="flex min-h-9 cursor-pointer items-center gap-2 rounded-md px-3 text-sm text-gray-700 hover:bg-gray-50">
                        <Checkbox
                            checked={selectedCategoryIds.has(UNCATEGORIZED_CATEGORY_ID)}
                            onCheckedChange={() => onChange({
                                ...value,
                                categoryIds: toggleArrayValue(value.categoryIds, UNCATEGORIZED_CATEGORY_ID),
                            })}
                            className="border-gray-300 data-[state=checked]:border-[#004A98] data-[state=checked]:bg-[#004A98]"
                        />
                        <span>Chưa phân loại</span>
                    </label>
                </div>
            </section>

            <section className="rounded-lg bg-white px-4 py-3 shadow-sm ring-1 ring-gray-100">
                <h4 className="mb-2 text-xs font-semibold uppercase text-gray-500">Trạng thái</h4>
                <FilterOptionGroup
                    options={GRADE_STATUS_OPTIONS}
                    selected={value.statuses}
                    onToggle={(status) => onChange({ ...value, statuses: toggleArrayValue(value.statuses, status) })}
                />
            </section>

            <section className="rounded-lg bg-white px-4 py-3 shadow-sm ring-1 ring-gray-100">
                <h4 className="mb-2 text-xs font-semibold uppercase text-gray-500">Khoảng điểm</h4>
                <RangeFilter
                    min={0}
                    max={10}
                    step={0.1}
                    lowerValue={value.gradeRange.min}
                    upperValue={value.gradeRange.max}
                    onChange={(gradeRange) => onChange({ ...value, gradeRange })}
                />
            </section>

            <section className="rounded-lg bg-white px-4 py-3 shadow-sm ring-1 ring-gray-100">
                <h4 className="mb-2 text-xs font-semibold uppercase text-gray-500">Số tín chỉ</h4>
                <RangeFilter
                    min={1}
                    max={10}
                    step={1}
                    unit="TC"
                    lowerValue={value.creditRange.min}
                    upperValue={value.creditRange.max}
                    onChange={(creditRange) => onChange({ ...value, creditRange })}
                />
            </section>
        </div>
    );
}
