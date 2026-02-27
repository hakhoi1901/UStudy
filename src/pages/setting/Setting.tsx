/* setting.tsx
** Trang Cài đặt
*/

import { PrivacyFooter } from '../../components/PrivacyFooter';
import { useDepartmentData } from '../../context/DepartmentContext';

export function Setting() {
    const {
        facultyId, majorId, cohortId, academicYear,
        currentFaculty, currentMajor,
        faculties, academicYears,
        setFaculty, setMajor, setCohort, setAcademicYear
    } = useDepartmentData();

    return (
        <div className="max-w-7xl mx-auto">
            <h1 className="text-gray-900 mb-2">Cài đặt</h1>
            <p className="text-gray-600 mb-8">Quản lý tài khoản và tùy chọn của bạn.</p>

            {/* Chọn Khoa / Ngành / Khóa / Năm học */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-6">
                <h2 className="text-gray-900 font-semibold mb-4">Chương trình đào tạo</h2>
                <p className="text-sm text-gray-500 mb-6">Chọn Khoa, Ngành, Khóa tuyển và Năm học để hiển thị dữ liệu phù hợp.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Dropdown Khoa */}
                    <div>
                        <label htmlFor="faculty-select" className="block text-sm font-medium text-gray-700 mb-2">
                            Khoa
                        </label>
                        <select
                            id="faculty-select"
                            value={facultyId}
                            onChange={(e) => setFaculty(e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#004A98] focus:border-transparent transition-all"
                        >
                            {faculties.map(f => (
                                <option key={f.id} value={f.id}>{f.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Dropdown Ngành */}
                    <div>
                        <label htmlFor="major-select" className="block text-sm font-medium text-gray-700 mb-2">
                            Ngành
                        </label>
                        <select
                            id="major-select"
                            value={majorId}
                            onChange={(e) => setMajor(e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#004A98] focus:border-transparent transition-all"
                        >
                            {currentFaculty?.majors.map(m => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Dropdown Khóa tuyển */}
                    <div>
                        <label htmlFor="cohort-select" className="block text-sm font-medium text-gray-700 mb-2">
                            Khóa tuyển
                        </label>
                        <select
                            id="cohort-select"
                            value={cohortId}
                            onChange={(e) => setCohort(e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#004A98] focus:border-transparent transition-all"
                        >
                            {currentMajor?.cohorts.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Dropdown Năm học (cho Học phí) */}
                    <div>
                        <label htmlFor="year-select" className="block text-sm font-medium text-gray-700 mb-2">
                            Năm học <span className="text-gray-400 font-normal">(Học phí)</span>
                        </label>
                        <select
                            id="year-select"
                            value={academicYear}
                            onChange={(e) => setAcademicYear(e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#004A98] focus:border-transparent transition-all"
                        >
                            {academicYears.map(y => (
                                <option key={y.id} value={y.id}>{y.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Current selection badges */}
                <div className="mt-4 flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1 text-xs rounded-full bg-[#004A98] text-white font-medium">
                        {currentFaculty?.name}
                    </span>
                    <span className="text-gray-400">→</span>
                    <span className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-700 font-medium">
                        {currentMajor?.name}
                    </span>
                    <span className="text-gray-400">→</span>
                    <span className="px-3 py-1 text-xs rounded-full bg-green-50 text-green-700 font-medium">
                        {currentMajor?.cohorts.find(c => c.id === cohortId)?.name}
                    </span>
                    <span className="text-gray-400">|</span>
                    <span className="px-3 py-1 text-xs rounded-full bg-amber-50 text-amber-700 font-medium">
                        {academicYears.find(y => y.id === academicYear)?.name}
                    </span>
                </div>
            </div>

            <PrivacyFooter />
        </div>
    );
}