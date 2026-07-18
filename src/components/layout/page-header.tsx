import type { ReactNode } from 'react';

interface PageHeaderProps {
    title: ReactNode;
    description?: ReactNode;
    actions?: ReactNode;
    className?: string;
}

export function PageHeader({ title, description, actions, className = '' }: PageHeaderProps) {
    return (
        <header className={`ustudy-page-header ${className}`.trim()}>
            <div className="min-w-0">
                <h1 className="ustudy-page-title">{title}</h1>
                {description && <p className="ustudy-page-description">{description}</p>}
            </div>

            {actions && <div className="flex shrink-0 items-start gap-2">{actions}</div>}
        </header>
    );
}
