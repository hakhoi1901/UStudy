import type { ElementType } from 'react';

import type { Tab } from '../types';
import { SectionTabs } from '../../../components/ui/navigation/section-tabs';

export type NavTab = {
    id: Tab;
    label: string;
    description?: string;
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
        <SectionTabs
            ariaLabel="Lộ trình học tập"
            activeTab={activeTab}
            onChange={setActiveTab}
            tabs={tabs.map((tab) => ({
                id: tab.id,
                label: tab.label,
                description: tab.description,
                icon: tab.icon,
                badgeCount: tab.showBadge ? tab.badgeCount : undefined,
            }))}
        />
    );
}
