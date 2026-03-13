import { Select } from "../../components/Selection"
import { useDepartmentData } from "../../context/DepartmentContext";
import { CheckCircle, GraduationCap } from "lucide-react";

export function SettingUserProfile() {
    const {
        facultyId, majorId, cohortId, academicYear,
        currentFaculty, currentMajor,
        faculties, academicYears,
        setFaculty, setMajor, setCohort, setAcademicYear,
        isConfigured, setIsConfigured
    } = useDepartmentData();

    return (
        <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm mb-6">
            {!isConfigured &&
                <div className="mb-6 w-full flex flex-col items-center justify-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Chào mừng bạn</h2>
                    <p className="text-gray-500">Vui lòng thiết lập chương trình đào tạo của bạn để bắt đầu sử dụng hệ thống.</p>
                    <div className="p-2"></div>
                </div>
            }
            <h2 className="text-gray-900 flex items-center gap-2 font-semibold mb-4"><GraduationCap className="w-7 h-7" />Chương trình đào tạo</h2>
            <p className="text-sm text-gray-500 mb-6">Chọn Khoa, Ngành, Khóa tuyển và Năm học để hiển thị dữ liệu phù hợp.</p>

            <div className="w grid grid-cols-1 md:grid-cols-1 gap-6">
                <Select
                    label="Khoa"
                    value={facultyId}
                    options={faculties}
                    onChange={setFaculty}
                />

                <Select
                    label="Ngành"
                    value={majorId}
                    options={currentFaculty?.majors || []}
                    onChange={setMajor}
                />

                <Select
                    label="Khóa tuyển"
                    value={cohortId}
                    options={currentMajor?.cohorts || []}
                    onChange={setCohort}
                />

                <Select
                    label="Năm học"
                    subLabel="(Học phí)"
                    value={academicYear}
                    options={academicYears}
                    onChange={setAcademicYear}
                    disabled={true}
                />
            </div>

            {/* Current selection badges */}
            <div className="mt-6 p-5 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                    {/* <span className="px-3 py-1 text-xs rounded-full bg-[#004A98] text-white font-medium">
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
                    </span> */}
                </div>

                <button
                    onClick={() => setIsConfigured(true)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isConfigured
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-[#004A98] text-white hover:bg-[#003B7A]'
                        }`}
                >
                    <CheckCircle className="w-4 h-4" />
                    {isConfigured ? 'Đã lưu thiết lập' : 'Xác nhận thông tin'}
                </button>
            </div>
        </div>
    );
}