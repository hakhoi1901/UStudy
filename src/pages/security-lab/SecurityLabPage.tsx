import { PageHeader } from '../../components/layout/page-header';
import { PageShell } from '../../components/layout/page-shell';
import { SecurityLabFeature } from '../../features/security-lab/SecurityLabFeature';

export function SecurityLabPage() {
    return (
        <PageShell
            header={(
                <PageHeader
                    title="Security Lab"
                    description="Kiểm chứng WebAuthn PRF cho vault test gắn với một thiết bị."
                />
            )}
        >
            <SecurityLabFeature />
        </PageShell>
    );
}

