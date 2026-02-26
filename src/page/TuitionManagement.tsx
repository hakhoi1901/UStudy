/* tuitionManagement.tsx
** Trang Quản lý học phí
*/

import { PrivacyFooter } from '../components/PrivacyFooter';

// interface RegisteredCourse {
//   id: string;
//   code: string;
//   nameVi: string;
//   credits: number;
//   tuitionPerCourse: number; 
// }

export function TuitionManagement() {
  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-gray-900 mb-2">Học phí</h1>
      <p className="text-gray-600 mb-8">Quản lý học phí và thanh toán.</p>
      <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
        <p className="text-gray-500">Trang học phí đang được phát triển...</p>
      </div>

      <PrivacyFooter />
    </div>
  );
}