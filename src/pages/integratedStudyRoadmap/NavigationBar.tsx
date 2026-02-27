
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
        <div className="flex gap-2 mb-6 border-b border-gray-200">
            {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${isActive
                            ? 'border-[#004A98] text-[#004A98]'
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{tab.label}</span>
                        {tab.showBadge && tab.badgeCount !== undefined && tab.badgeCount > 0 && (
                            <span className="px-2 py-0.5 bg-[#004A98] text-white text-xs rounded-full">
                                {tab.badgeCount}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}