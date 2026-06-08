import type { Tab } from './IntegratedStudyRoadmap';

export type NavTab = {
    id: Tab;
    label: string;
    icon: React.ElementType;
    showBadge?: boolean;
    badgeCount?: number;
};

export function NavigationBar({
    tabs,
    activeTab,
    setActiveTab
}: {
    tabs: NavTab[];
    activeTab: Tab;
    setActiveTab: (tab: Tab) => void;
}) {
    return (
        // overflow-x-auto để scroll ngang trên mobile, ẩn scrollbar
        <div
            className="flex gap-1 mb-6 border-b border-gray-200 overflow-x-auto"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
        >
            {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${isActive
                                ? 'border-[#004A98] text-[#004A98]'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        <Icon className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                        {/* Label: ẩn trên mobile rất nhỏ, hiện từ sm trở lên */}
                        <span className="font-medium text-sm md:text-base">{tab.label}</span>
                        {tab.showBadge && tab.badgeCount !== undefined && tab.badgeCount > 0 && (
                            <span className="px-1.5 py-0.5 bg-[#004A98] text-white text-xs rounded-full min-w-[20px] text-center">
                                {tab.badgeCount}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}