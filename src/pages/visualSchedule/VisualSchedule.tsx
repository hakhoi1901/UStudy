/* visualSchedule.tsx
** Trang Thời khóa biểu
*/

import { PrivacyFooter } from '../../components/PrivacyFooter';

export function VisualSchedule() {
  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-gray-900 mb-2">Thời khóa biểu</h1>
      <p className="text-gray-600 mb-8">Xem và quản lý thời khóa biểu học tập.</p>
      <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
        <p className="text-gray-500">Trang thời khóa biểu đang được phát triển...</p>
      </div>

      <PrivacyFooter />
    </div>
  );
}