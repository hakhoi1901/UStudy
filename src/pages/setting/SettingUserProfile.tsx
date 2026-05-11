import { Select } from "../../components/Selection"
import { useDepartmentData } from "../../context/DepartmentContext";
import { CheckCircle, GraduationCap, Upload, Shield } from "lucide-react";
import { useRef, useState } from "react";
import { useAppNotification } from "../../context/NotificationContext";
import { useCrypto } from "../../context/CryptoContext";
import { processRawData } from "../../logic/dataProcessor";
import { savePlain, saveSecure, populateSecureCache } from "../../helpers/localStorage/save";
import { SecurityLock } from "../../components/SecurityLock";
import { STORAGE_KEYS } from "../../config/storageKeys";

export function SettingUserProfile({ onPageChange }: { onPageChange: (page: string) => void }) {
    const {
        facultyId, majorId, cohortId, academicYear,
        currentFaculty, currentMajor,
        faculties, academicYears,
        setFaculty, setMajor, setCohort, setAcademicYear,
        isConfigured, setIsConfigured
    } = useDepartmentData();
    const { addNotification } = useAppNotification();
    const { cryptoKey, unlock, refreshHasData, hasData } = useCrypto();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [pendingImport, setPendingImport] = useState<any>(null);

    /** Lưu dữ liệu nhạy cảm đã mã hóa + populate RAM cache */
    const saveImportedSecure = async (rawData: any, metaData: any, key: CryptoKey) => {
        await saveSecure('raw_student_db', rawData, key);
        const { student, courses } = processRawData(rawData);
        await saveSecure('student_db_full', student, key);
        await saveSecure('course_db_offline', courses, key);
        if (metaData) await saveSecure('import_meta', metaData, key);

        // Populate RAM cache để hooks đọc được ngay
        populateSecureCache('raw_student_db', rawData);
        populateSecureCache('student_db_full', student);
        populateSecureCache('course_db_offline', courses);
        if (metaData) populateSecureCache('import_meta', metaData);

        refreshHasData();
        return student;
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            const content = e.target?.result;
            if (typeof content !== 'string') return;

            try {
                const importedContent = JSON.parse(content);

                // Hỗ trợ cả định dạng mới (có metadata) và định dạng cũ (flat object)
                let data = importedContent;
                if (importedContent.metadata && importedContent.data && importedContent.metadata.source === "hcmus-portal-tool") {
                    data = importedContent.data;
                }

                // 1. Kiểm tra xem có phải là bản export toàn bộ localStorage (từ trang Setting) không
                const isFullDump = typeof data === 'object' && !Array.isArray(data) && Object.keys(data).some(key =>
                    key.startsWith('db_') || key.startsWith('app_') || key.includes('semester') || key === 'raw_student_db'
                );

                if (isFullDump) {
                    if (window.confirm("Hành động này sẽ ghi đè toàn bộ dữ liệu hiện tại bằng dữ liệu từ file. Bạn có chắc chắn muốn tiếp tục?")) {
                        if (!cryptoKey) {
                            setPendingImport({ type: 'FULL_DUMP', data });
                            return;
                        }

                        // Lưu từng key: secure keys thì mã hóa, các key khác thì plain
                        const SECURE_KEYS = new Set(['raw_student_db', 'student_db_full', 'course_db_offline', 'import_meta']);
                        for (const key of Object.keys(data)) {
                            if (SECURE_KEYS.has(key)) {
                                await saveSecure(key, data[key], cryptoKey);
                                populateSecureCache(key, data[key]);
                            } else {
                                savePlain(key, data[key]);
                            }
                        }
                        refreshHasData();

                        addNotification({
                            title: 'Nhập dữ liệu thành công',
                            message: `Toàn bộ dữ liệu hệ thống đã được khôi phục.`,
                            type: 'success'
                        });

                        setIsConfigured(true);
                    }
                    return;
                }

                // 2. Nếu không phải bản dump, kiểm tra xem có phải là raw data từ Bookmarklet không
                let rawData = data.raw || data;
                let metaData = data.meta || null;

                if (rawData && typeof rawData === 'object' && (rawData.grades || rawData.courses)) {
                    if (!cryptoKey) {
                        setPendingImport({ type: 'RAW_DATA', data: { rawData, metaData } });
                        return;
                    }

                    const student = await saveImportedSecure(rawData, metaData, cryptoKey);

                    addNotification({
                        title: 'Nhập dữ liệu thành công',
                        message: `Dữ liệu của ${student.name} đã được tải lên và mã hóa.`,
                        type: 'success'
                    });

                    setIsConfigured(true);
                } else {
                    throw new Error("Định dạng file không hợp lệ. Vui lòng sử dụng file JSON xuất từ hệ thống hoặc Bookmarklet.");
                }

            } catch (error: any) {
                console.error("Import error:", error);
                addNotification({
                    title: 'Lỗi nhập dữ hiệu',
                    message: error.message || "Không thể đọc file JSON này. Vui lòng kiểm tra lại.",
                    type: 'error'
                });
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    };

    return (
        <div className="bg-white rounded-xl p-4 md:p-8 border border-gray-200 shadow-sm w-full">
            {pendingImport && (
                <SecurityLock 
                    setupMode={!hasData} 
                    onUnlock={async (key) => {
                        unlock(key);
                        const { type, data } = pendingImport;
                        if (type === 'FULL_DUMP') {
                            const SECURE_KEYS = new Set(['raw_student_db', 'student_db_full', 'course_db_offline', 'import_meta']);
                            for (const k of Object.keys(data)) {
                                if (SECURE_KEYS.has(k)) {
                                    await saveSecure(k, data[k], key);
                                    populateSecureCache(k, data[k]);
                                } else {
                                    savePlain(k, data[k]);
                                }
                            }
                        } else {
                            await saveImportedSecure(data.rawData, data.metaData, key);
                        }
                        
                        addNotification({
                            title: 'Nhập dữ liệu thành công',
                            message: `Dữ liệu đã được mã hóa và bảo vệ bằng mật khẩu.`,
                            type: 'success'
                        });
                        
                        setPendingImport(null);
                        setIsConfigured(true);
                    }} 
                />
            )}


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
                    options={faculties.sort((a, b) => a.name.localeCompare(b.name))}
                    onChange={setFaculty}
                />

                <Select
                    label="Ngành"
                    value={majorId}
                    options={currentFaculty?.majors.sort((a, b) => a.name.localeCompare(b.name)) || []}
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

                <div className="flex items-center gap-3">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".json"
                        className="hidden"
                    />
                    {!isConfigured && (
                        <button
                            onClick={handleImportClick}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-[#004A98] text-[#004A98] hover:bg-blue-50 transition-colors"
                        >
                            <Upload className="w-4 h-4" />
                            Nhập dữ liệu (JSON)
                        </button>
                    )}

                    <button
                        onClick={() => {
                            savePlain(STORAGE_KEYS.FACULTY_ID, facultyId);
                            savePlain(STORAGE_KEYS.MAJOR_ID, majorId);
                            savePlain(STORAGE_KEYS.COHORT_ID, cohortId);
                            savePlain(STORAGE_KEYS.ACADEMIC_YEAR, academicYear);
                            setIsConfigured(true);
                            addNotification({
                                title: 'Thiết lập thành công',
                                message: 'Thông tin chương trình đào tạo đã được lưu.',
                                type: 'success'
                            });
                        }}
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
            {/* Privacy link - chỉ hiện khi chưa cấu hình */}
            {!isConfigured && (
                <div className="mt-6 pt-5 border-t border-gray-200">
                    <button
                        onClick={(e) => { e.preventDefault(); onPageChange('privacy'); }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 transition-colors group"
                    >
                        <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition-colors">
                            <Shield className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-semibold">Bảo mật & Quyền dữ liệu</p>
                            <p className="text-xs text-blue-500">Tìm hiểu cách chúng tôi bảo vệ dữ liệu của bạn</p>
                        </div>
                    </button>
                </div>
            )}
        </div>
    );
}