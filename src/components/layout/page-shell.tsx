import type { CSSProperties, ReactNode } from 'react';
import { PrivacyFooter } from '../layout/PrivacyFooter';

interface PageShellProps {
    header?: ReactNode;
    children: ReactNode;
    className?: string;
    contentClassName?: string;
    style?: CSSProperties;
}

export function PageShell({
    header,
    children,
    className = '',
    contentClassName = '',
    style,
}: PageShellProps) {
    return (
        <div className={`ustudy-page-shell ${className}`.trim()} style={style}>
            {header}
            <div className={`ustudy-page-content ${contentClassName}`.trim()}>{children}</div>
            <PrivacyFooter />
        </div>
    );
}
