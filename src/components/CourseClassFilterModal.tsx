import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { readFromStorage } from '../helpers/localStorage/save';
import { STORAGE_KEYS } from '../config';


// định nghĩa props cho modal lọc lớp
interface CourseClassFilterModalProps {
    courseCode: string;
    courseNameVi: string;
    isOpen: boolean;
    onClose: () => void;
    allowedClassesMap: Record<string, string[]>;
    setAllowedClassesMap: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
}

/**
 * 
 * @param courseCode mã môn học
 * @param courseNameVi tên môn học
 * @param isOpen trạng thái mở/đóng modal
 * @param onClose hàm đóng modal
 * @param allowedClassesMap map chứa các lớp được phép
 * @param setAllowedClassesMap hàm set các lớp được phép
 * @returns trả về modal lọc lớp chứa danh sách các lớp và trạng thái được phép/không được phép
 * 
 * render modal lọc lớp 
 */
export function CourseClassFilterModal({
    courseCode, // mã môn học
    courseNameVi, // tên môn học
    isOpen, // trạng thái mở/đóng modal
    onClose, // hàm đóng modal
    allowedClassesMap, // map chứa các lớp được phép
    setAllowedClassesMap, // hàm set các lớp được phép
}: CourseClassFilterModalProps) {
    // state chứa danh sách các lớp có sẵn (mặc định là tất cả các lớp)
    const [availableClasses, setAvailableClasses] = useState<{ id: string, schedule?: string[] }[]>([]);

    // effect xử lý khi mở modal
    useEffect(() => {
        if (!isOpen) return;

        // đọc dữ liệu từ storage
        const courseDb = readFromStorage<any[]>(STORAGE_KEYS.COURSE_DB_OFFLINE, [] as any[]);
        const courseData = courseDb.find((c: any) => c.id === courseCode);

        // set danh sách các lớp có sẵn
        if (courseData && courseData.classes) {
            setAvailableClasses(courseData.classes);
        } else {
            setAvailableClasses([]);
        }
    }, [isOpen, courseCode]);

    // nếu modal không mở thì return null
    if (!isOpen) return null;

    // set các lớp được phép
    const activeClasses = allowedClassesMap[courseCode]
        ? new Set(allowedClassesMap[courseCode])
        : new Set(availableClasses.map(c => c.id));

    // hàm xử lý khi click vào checkbox
    const handleToggle = (classId: string) => {
        setAllowedClassesMap(prev => {
            const currentSelected = prev[courseCode] ? [...prev[courseCode]] : availableClasses.map(c => c.id);
            let newSelected;
            if (currentSelected.includes(classId)) {
                newSelected = currentSelected.filter(id => id !== classId);
            } else {
                newSelected = [...currentSelected, classId];
            }
            return { ...prev, [courseCode]: newSelected };
        });
    };

    // hàm xử lý khi click vào chọn tất cả/bỏ chọn tất cả
    const handleSelectAll = (selectAll: boolean) => {
        setAllowedClassesMap(prev => ({
            ...prev,
            [courseCode]: selectAll ? availableClasses.map(c => c.id) : []
        }));
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-05 max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">

                    {/* tiêu đề modal */}
                    <div>
                        <h3 className="font-semibold text-gray-900 leading-tight">Lọc lớp: {courseCode}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{courseNameVi}</p>
                    </div>

                    {/* nút đóng modal */}
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-200 rounded-lg transition-colors text-gray-500 cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 flex-1 overflow-y-auto">

                    {/* hiển thị danh sách các lớp */}
                    {availableClasses.length === 0 ? (
                        <div className="text-center text-sm py-4 text-gray-500">
                            Không tìm thấy dữ liệu lớp học cho môn này.
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-gray-500 font-medium">Bỏ tick để loại trừ khỏi thuật toán xếp lịch</span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleSelectAll(true)}
                                        className="text-xs text-[#004A98] hover:underline"
                                    >
                                        Chọn tất cả
                                    </button>
                                    <span className="text-gray-300">|</span>
                                    <button
                                        onClick={() => handleSelectAll(false)}
                                        className="text-xs text-gray-500 hover:text-red-600 hover:underline"
                                    >
                                        Bỏ chọn tất cả
                                    </button>
                                </div>
                            </div>

                            {/* hiển thị danh sách các lớp */}
                            {availableClasses.sort((a, b) => a.id.localeCompare(b.id)).map((ac) => {
                                // kiểm tra xem lớp có được phép không
                                const isChecked = activeClasses.has(ac.id);
                                return (
                                    <label
                                        key={ac.id}
                                        className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${isChecked ? 'border-[#004A98] bg-blue-50/50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                                            }`}
                                    >
                                        <div className={`mt-0.5 shrink-0 flex items-center justify-center w-4 h-4 rounded border ${isChecked ? 'bg-[#004A98] border-[#004A98]' : 'bg-white border-gray-300'
                                            }`}>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={isChecked}
                                                onChange={() => handleToggle(ac.id)}
                                            />
                                            {isChecked && <Check className="w-3 h-3 text-white" />}
                                        </div>
                                        <div className="flex-1 min-w-0">

                                            {/* hiển thị tên lớp */}
                                            <p className={`text-sm font-medium ${isChecked ? 'text-blue-900' : 'text-gray-700'}`}>
                                                {ac.id.replace(/_/g, ' ')}
                                            </p>

                                            {/* hiển thị lịch học */}
                                            {ac.schedule && ac.schedule.length > 0 && (
                                                <div className="mt-1 flex flex-col gap-0.5">
                                                    {ac.schedule && ac.schedule.length > 0 && (
                                                        <div className="mt-1 flex flex-col gap-0.5">
                                                            {/* Nối các phần tử bằng dấu phẩy và khoảng trắng */}
                                                            <span className={`text-xs ${isChecked ? 'text-blue-700/80' : 'text-gray-500'}`}>
                                                                {ac.schedule.join(', ')}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </label>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50 sm:flex sm:flex-row-reverse">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#004A98] text-base font-medium text-white hover:bg-[#003A78] focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
}
