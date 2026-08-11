import { PageHeader } from '../../components/layout/page-header';
import { PageShell } from '../../components/layout/page-shell';
import { BookmarkLabFeature } from '../../features/bookmark-lab/BookmarkLabFeature';

export function BookmarkLabPage() {
    return (
        <PageShell
            header={(
                <PageHeader
                    title="Bookmarklet Lab"
                    description="Mô phỏng một lần đồng bộ Portal với toàn bộ nguồn dữ liệu rỗng."
                />
            )}
        >
            <BookmarkLabFeature />
        </PageShell>
    );
}
