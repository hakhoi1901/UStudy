/* VisualSchedule.tsx
** Entry point cho trang Thời khóa biểu (Thin Page)
*/

import { VisualSchedule as VisualScheduleFeature } from '../../features/visual-schedule';

interface SchedulePageProps {
  selectedSemester?: string;
}

export function SchedulePage(props: SchedulePageProps) {
  return <VisualScheduleFeature {...props} />;
}

export default SchedulePage;
