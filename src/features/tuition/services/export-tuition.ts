import type { TuitionCourse, TuitionSummary } from "../types";

export function exportTuitionData(summary: TuitionSummary, courses: TuitionCourse[]) {
    let content = `HÓA ĐƠN HỌC PHÍ - ${summary.semesterName}\n`;
    content += `${'='.repeat(80)}\n\n`;
    content += `THÔNG TIN CHUNG:\n`;
    content += `Học kỳ: ${summary.semester}\n`;
    content += `Tổng tín chỉ: ${summary.totalCredits} TC (${summary.totalTuitionCredits} TC học phí)\n`;
    content += `Tổng số tiết: ${summary.totalPeriods} tiết\n`;
    content += `Hạn thanh toán: ${new Date(summary.dueDate).toLocaleDateString('vi-VN')}\n`;
    content += `Trạng thái: ${summary.status === 'paid' ? 'Đã thanh toán' : summary.status === 'partial' ? 'Thanh toán một phần' : 'Chưa thanh toán'}\n\n`;

    content += `CHI TIẾT CÁC MÔN HỌC:\n`;
    content += `${'-'.repeat(80)}\n`;

    courses.forEach((course) => {
        content += `${course.stt}. ${course.courseCode} - ${course.courseName}\n`;
        content += `   Lớp: ${course.classCode} | TC: ${course.credits} | Tiết: ${course.periods}\n`;
        content += `   TC học phí: ${course.tuitionCredits} | Học phí: ${new Intl.NumberFormat('vi-VN').format(course.tuitionFee)}₫\n`;
        if (course.discount > 0) content += `   Giảm: ${new Intl.NumberFormat('vi-VN').format(course.discount)}₫\n`;
        if (course.support > 0) content += `   Hỗ trợ: ${new Intl.NumberFormat('vi-VN').format(course.support)}₫\n`;
        content += `   Thực đóng: ${new Intl.NumberFormat('vi-VN').format(course.actualFee)}₫\n\n`;
    });

    content += `${'-'.repeat(80)}\n`;
    content += `TỔNG KẾT:\n`;
    content += `Tổng học phí: ${new Intl.NumberFormat('vi-VN').format(summary.totalFee)}₫\n`;
    if (summary.hasAdvancePayment) {
        content += `Tổng đã đóng: ${new Intl.NumberFormat('vi-VN').format(summary.advancePayment)}₫\n`;
    }
    content += `Tổng phải đóng: ${new Intl.NumberFormat('vi-VN').format(summary.amountDue)}₫\n\n`;
    content += `Ngày xuất: ${new Date().toLocaleString('vi-VN')}\n`;
    content += `Cập nhật lần cuối: ${summary.lastUpdated}\n`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HocPhi_${summary.semester.replace(/\//g, '-')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
