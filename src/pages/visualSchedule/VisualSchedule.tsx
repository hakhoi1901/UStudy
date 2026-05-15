/* VisualSchedule.tsx
** Entry point cho trang Thời khóa biểu (Thin Page)
*/

import { VisualSchedule as VisualScheduleFeature } from '../../features/visual-schedule';

interface VisualScheduleProps {
  selectedSemester?: string;
}

export function VisualSchedule(props: VisualScheduleProps) {
  return <VisualScheduleFeature {...props} />;
}

export default VisualSchedule;
