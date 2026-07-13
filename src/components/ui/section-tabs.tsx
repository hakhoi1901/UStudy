import type { ElementType } from 'react';

export type SectionTab<T extends string> = {
    id: T;
    label: string;
    description?: string;
    icon?: ElementType;
    badgeCount?: number;
};

interface SectionTabsProps<T extends string> {
    tabs: SectionTab<T>[];
    activeTab: T;
    onChange: (tab: T) => void;
    ariaLabel: string;
}

export function SectionTabs<T extends string>({
    tabs,
    activeTab,
    onChange,
    ariaLabel,
}: SectionTabsProps<T>) {
    return (
        <nav className="flex overflow-x-auto border-b border-gray-200" aria-label={ariaLabel}>
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;

                return (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => onChange(tab.id)}
                        className={`relative min-w-max px-4 py-3 text-left transition-colors md:px-5 ${isActive ? 'text-[#004A98]' : 'text-gray-500 hover:text-gray-800'}`}
                    >
                        <span className="flex items-center gap-2 text-sm font-semibold">
                            {Icon && <Icon className="h-4 w-4 shrink-0" />}
                            {tab.label}
                            {tab.badgeCount !== undefined && tab.badgeCount > 0 && (
                                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${isActive ? 'bg-[#004A98] text-white' : 'bg-gray-200 text-gray-600'}`}>
                                    {tab.badgeCount}
                                </span>
                            )}
                        </span>
                        {tab.description && <span className="mt-0.5 hidden text-[11px] font-normal text-gray-400 sm:block">{tab.description}</span>}
                        {isActive && <span className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-[#004A98] md:inset-x-5" />}
                    </button>
                );
            })}
        </nav>
    );
}
