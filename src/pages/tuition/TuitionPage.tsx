/* TuitionPage.tsx
** Entry point cho trang Quản lý học phí (Thin Page)
*/

import { TuitionPage as TuitionFeature } from '../../features/tuition';

interface TuitionPageProps {
  selectedSemester?: string;
}

export function TuitionPage(props: TuitionPageProps) {
  return <TuitionFeature {...props} />;
}

export default TuitionPage;