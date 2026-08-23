import type { ElementType } from 'react';

import { SectionTabs } from '../../../components/ui/navigation/section-tabs';

export type NavTab<T extends string> = {
    id: T;
    label: string;
    description?: string;
    icon: ElementType;
    showBadge?: boolean;
    badgeCount?: number;
};

export function NavigationBar<T extends string>({
    tabs,
    activeTab,
    setActiveTab,
    ariaLabel = 'Điều hướng',
}: {
    tabs: NavTab<T>[];
    activeTab: T;
    setActiveTab: (tab: T) => void;
    ariaLabel?: string;
}) {
    return (
        <SectionTabs
            ariaLabel={ariaLabel}
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
