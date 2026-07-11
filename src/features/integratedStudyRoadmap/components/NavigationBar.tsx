import type { ElementType } from 'react';

import type { Tab } from '../types';

export type NavTab = {
    id: Tab;
    label: string;
    icon: ElementType;
    showBadge?: boolean;
    badgeCount?: number;
};

export function NavigationBar({
    tabs,
    activeTab,
    setActiveTab,
}: {
    tabs: NavTab[];
    activeTab: Tab;
    setActiveTab: (tab: Tab) => void;
}) {
    return (
        <div className="ustudy-tabs">
            {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`ustudy-tab ${isActive ? 'ustudy-tab-active' : ''}`}
                    >
                        <Icon className="h-4 w-4 shrink-0 md:h-5 md:w-5" />
                        <span>{tab.label}</span>
                        {tab.showBadge && tab.badgeCount !== undefined && tab.badgeCount > 0 && (
                            <span className="ustudy-badge-count">
                                {tab.badgeCount}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
