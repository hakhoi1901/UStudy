import { AcademicRulesEngine } from './AcademicRulesEngine';
import { STORAGE_KEYS } from '../config';
import { readFromStorage } from '../helpers/localStorage/save';

export class RagAdvisor {
    /**
     * Chuyển đổi dữ liệu JSON thành văn bản thô để làm Context cho AI (Chương trình đào tạo)
     * @param departmentData Data từ DepartmentContext
     */
    public static getContext(departmentData: any): string {
        const { courses: allCoursesMeta, prerequisites, categories } = departmentData || { courses: [], prerequisites: {}, categories: {} };

    const majorName = readFromStorage(STORAGE_KEYS.MAJOR_ID, "");
    const facultyName = readFromStorage(STORAGE_KEYS.FACULTY_ID, "");
    const cohortId = readFromStorage(STORAGE_KEYS.COHORT_ID, "");
    const year = readFromStorage(STORAGE_KEYS.ACADEMIC_YEAR, "");
    const semester = readFromStorage(STORAGE_KEYS.ACADEMIC_SEMESTER, "");
    let context = `DỮ LIỆU CHƯƠNG TRÌNH ĐÀO TẠO - KHOA: ${facultyName.toUpperCase()} - NGÀNH: ${majorName.toUpperCase()} - KHÓA: ${cohortId.toUpperCase()} - NĂM: ${year.toUpperCase()} - HỌC KỲ: ${semester.toUpperCase()}:\n\n`;

    // 1. Thông tin về các nhóm môn
    if (allCoursesMeta && allCoursesMeta.length > 0) {
        allCoursesMeta.forEach((course: any) => {
            context += `Môn học: ${course.course_name_vi} - Số tín chỉ: ${course.credits} - Loại: ${course.course_type} - Nhóm: ${course.category}\n`;
        });
    }

    // 2. Thông tin về các nhóm môn
    if (categories && Object.keys(categories).length > 0) {
        context += "CẤU TRÚC CHƯƠNG TRÌNH:\n";
        Object.entries(categories).forEach(([key, cat]: [string, any]) => {
            if (cat.name) {
                context += `- Group ${key}: ${cat.name} (Yêu cầu: ${cat.total_credits_required || cat.credits || 0} tín chỉ).\n`;
                if (cat.note) context += `  Lưu ý: ${cat.note}\n`;
            }
        });
    }

    // 2. Thông tin về các môn tiên quyết
    if (prerequisites && Object.keys(prerequisites).length > 0) {
        context += "\nDANH SÁCH MÔN TIÊN QUYẾT:\n";
        Object.entries(prerequisites).forEach(([key, prereq]: [string, any]) => {
            context += `- [${key}] ${prereq.course_name_vi || 'N/A'}: ${prereq.credits || 0} TC (${prereq.theory_hours || 0}LT, ${prereq.lab_hours || 0}TH). Loại: ${prereq.course_type === 'BB' ? 'Bắt buộc' : 'Tự chọn'}. Nhóm: ${prereq.category || 'N/A'}.\n`;
        });
    }

    return context;
}

    /**
     * Chuyển đổi dữ liệu sinh viên thành văn bản để làm Context cá nhân hóa
     */
    public static getStudentContext(studentDb: any): string {
    if (!studentDb || studentDb.name === "Chưa cập nhật") {
        return "CHƯA CÓ DỮ LIỆU SINH VIÊN TRÊN HỆ THỐNG. HÃY KHUYÊN NGƯỜI DÙNG DÙNG BOOKMARKLET ĐỀ CẬP NHẬT.";
    }

    let context = `THÔNG TIN SINH VIÊN HIỆN TẠI:\n- Họ tên: ${studentDb.name}\n\n`;

    // 1. Điểm số
    if (studentDb.grades && studentDb.grades.length > 0) {
        context += "KẾT QUẢ HỌC TẬP (BẢNG ĐIỂM):\n";
        studentDb.grades.forEach((g: any) => {
            const nameVi = AcademicRulesEngine.extractVietnameseCourseName(g.name);
            context += `- [${g.id}] ${nameVi}: Điểm: ${g.score || 'Đang học'}, Học kỳ: ${g.semester || 'N/A'}\n`;
        });
    }

    // 2. Học phí
    if (studentDb.tuition) {
        context += `\nTÌNH TRẠNG HỌC PHÍ:\n`;
        Object.entries(studentDb.tuition).forEach(([semKey, semData]: [string, any]) => {
            if (!semData || typeof semData !== 'object') return;

            context += `Học kỳ ${semKey}:\n`;
            context += `- Tổng học phí: ${semData.total || semData.fee || '0'} VNĐ\n`;
            if (semData.details && Array.isArray(semData.details)) {
                semData.details.forEach((t: any) => {
                    context += `  + Môn ${t.name || t.course_name}: ${t.amount || t.fee} VNĐ (${t.status || 'Chưa rõ'})\n`;
                });
            }
        });
    }

    // 3. Đăng ký học phần
    if (studentDb.registrations && studentDb.registrations.length > 0) {
        context += "\nDANH SÁCH MÔN ĐANG ĐĂNG KÝ HỌC:\n";
        studentDb.registrations.forEach((r: any) => {
            const nameVi = AcademicRulesEngine.extractVietnameseCourseName(r.name);
            context += `- ${nameVi} (${r.id})\n`;
        });
    }

    return context;
}
}
