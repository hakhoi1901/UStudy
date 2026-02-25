/**
 * Main.js - Entry Point (Nhạc trưởng)
 * Nhiệm vụ: Khởi tạo ứng dụng, lắng nghe sự kiện từ Portal, và điều phối luồng dữ liệu.
 */

import { setupBookmarklet, openPortal } from './PortalHandler.js';
import { initApp, processPortalData } from './Utils.js';
import { onNutBamXepLich } from './Logic.js';
import { renderNewUI, renderSidebar, updateHeaderUI } from '../../../src/js/render/NewUI.js';
import {
    handleSaveSchedule,
    openSavedSchedulesModal,
    loadSavedSchedule,
    removeSavedSchedule,
    renderScheduleResults,
    renderExamSchedule
} from '../../../src/js/render/NewUI.js'

// --- SETUP BAN ĐẦU ---
setupBookmarklet();

// Export các hàm Global cần thiết cho HTML (onClick events)
Object.assign(window, {
    openPortal,         // Mở trang Portal
    onNutBamXepLich,
    toggleNewRow,       // Tick chọn môn
    filterCourses,      // Tìm kiếm môn
    openInfoModal,      // Popup Info
    openPrereqModal,    // Popup Flowchart
    closeModal,         // Đóng Popup
    handleSaveSchedule,
    openSavedSchedulesModal,
    loadSavedSchedule,
    removeSavedSchedule,
    renderScheduleResults,
    renderExamSchedule
});

// Gắn sự kiện cho nút tĩnh (nếu có)
const btnPortal = document.getElementById('btn-open-portal');
if (btnPortal) btnPortal.addEventListener('click', openPortal);

// --- LẮNG NGHE DỮ LIỆU TỪ BOOKMARKLET ---
window.addEventListener("message", (event) => {
    // Security check
    if (!event.data || !event.data.type) return;

    const { type, payload } = event.data;

    // Case A: Dữ liệu Sinh Viên (Điểm, Lịch thi...) (Legacy Support - nếu cần)
    if (type === 'PORTAL_DATA') {
        console.log("📥 Main: Đã nhận dữ liệu Sinh viên (Legacy).");
        processPortalData(null, payload);
    }

    // Case B: Dữ liệu Lớp Mở (Legacy Support - nếu cần)
    if (type === 'OPEN_CLASS_DATA') {
        console.log(`📥 Main: Đã nhận ${payload.length} lớp mở (Legacy).`);
        processPortalData(payload, null);
    }

    // Case C: Dữ liệu FULL (Gói mới)
    if (type === 'IMPORT_FULL_DATA') {
        console.log("📥 Main: Đã nhận gói dữ liệu FULL (SV + Lớp).");

        // 1. Kiểm tra payload.courses
        let courses = payload.courses;

        // Nếu courses không tồn tại hoặc rỗng, gán là mảng rỗng để tránh lỗi
        if (!courses || !Array.isArray(courses)) {
            console.warn("⚠️ Cảnh báo: Dữ liệu lớp mở (courses) bị rỗng hoặc không hợp lệ.");
            courses = [];
        }

        // 2. Kiểm tra payload.student
        let student = payload.student;
        if (!student) {
            console.error("❌ Lỗi: Không có dữ liệu sinh viên trong gói tin.");
            return;
        }

        // 3. Gọi hàm xử lý chính
        // Hàm processPortalData trong Utils đã được thiết kế để handle (null, student) hoặc (courses, null)
        // nên việc truyền ([], student) hoàn toàn hợp lệ và an toàn.
        processPortalData(courses, student);

        // Thông báo cho người dùng
        if (courses.length > 0) {
            alert(`✅ Đã cập nhật thành công!\n- Thông tin SV: ${student.mssv}\n- Lịch thi: ${student.exams?.midterm?.length + student.exams?.final?.length || 0} môn\n- Lớp mở: ${courses.length} môn`);
        } else {
            alert(`✅ Đã cập nhật thông tin Sinh viên!\n(Không có dữ liệu Lớp mở nào được nhập)`);
        }
    }
}, false);

// ---  KHỞI ĐỘNG ỨNG DỤNG ---
// Khi trang load xong, gọi hàm initApp bên Utils để nạp dữ liệu từ Cache
window.onload = () => {
    initApp();
};

// --- QUAN TRỌNG: Gán hàm vào window để HTML gọi được ---
window.onNutBamXepLich = onNutBamXepLich;
window.toggleNewRow = toggleNewRow;
window.filterCourses = filterCourses;


// Gắn hàm render vào window
window.renderCourseList = (courses) => {
    renderNewUI(courses);
    updateHeaderUI();
};

// Khởi động
document.addEventListener('DOMContentLoaded', () => {
    // 1. Vẽ Sidebar ngay lập tức
    renderSidebar('roadmap');
    updateHeaderUI();
    // 2. Load dữ liệu logic
    initApp();
});

