import { AcademicRulesEngine } from './AcademicRulesEngine';

export class RagAdvisor {
    /**
     * Chuyển đổi dữ liệu JSON thành văn bản thô để làm Context cho AI (Chương trình đào tạo)
     * @param courses Danh sách môn học từ DepartmentContext
     * @param categories Danh sách chuyên mục từ DepartmentContext
     * @param majorName Tên ngành/chuyên ngành hiện tại
     */
    public static getContext(courses: any[], categories: any, majorName: string = "Hiện tại"): string {
        let context = `DỮ LIỆU CHƯƠNG TRÌNH ĐÀO TẠO - NGÀNH: ${majorName.toUpperCase()}:\n\n`;

        // 1. Thông tin về các nhóm (Categories)
        if (categories && Object.keys(categories).length > 0) {
            context += "CẤU TRÚC CHƯƠNG TRÌNH:\n";
            Object.entries(categories).forEach(([key, cat]: [string, any]) => {
                if (cat.name) {
                    context += `- Group ${key}: ${cat.name} (Yêu cầu: ${cat.total_credits_required || cat.credits || 0} tín chỉ).\n`;
                    if (cat.note) context += `  Lưu ý: ${cat.note}\n`;
                }
            });
        }

        // 2. Thông tin về các môn học (Courses)
        if (courses && courses.length > 0) {
            context += "\nDANH SÁCH MÔN HỌC CHI TIẾT:\n";
            courses.forEach(c => {
                if (!c?.course_id) return;
                context += `- [${c.course_id}] ${c.course_name_vi || 'N/A'}: ${c.credits || 0} TC (${c.theory_hours || 0}LT, ${c.lab_hours || 0}TH). Loại: ${c.course_type === 'BB' ? 'Bắt buộc' : 'Tự chọn'}. Nhóm: ${c.category || 'N/A'}.\n`;
                if (c.description) context += `  Mô tả: ${c.description}\n`;
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
