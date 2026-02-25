/**
 * Logic.js - Xử lý nghiệp vụ Xếp Lịch
 * Nhiệm vụ: Thu thập checkbox từ UI -> Chuẩn hóa dữ liệu -> Gọi Engine (Scheduler) -> Vẽ kết quả.
 */

import { runScheduleSolver } from './tkb/Scheduler.js';
import { runGroupScheduleSolver } from './tkb/GroupScheduler.js';
import { GLOBAL_COURSE_DB, getStoredPreferences } from './Utils.js';
import { renderScheduleResults, groupMembers, courseAssignments, isGroupMode } from '../../../src/js/render/NewUI.js';

// --- HÀM 1: XẾP LỊCH CÁ NHÂN (Hoặc Nhóm trong giao diện cũ) ---
export async function onNutBamXepLich() {
    const btn = document.querySelector('button[onclick="onNutBamXepLich()"]');
    const originalText = btn ? btn.innerText : "Xếp Lịch";

    if (btn) {
        btn.innerText = "⏳ ...";
        btn.disabled = true;
    }

    try {
        if (!GLOBAL_COURSE_DB || GLOBAL_COURSE_DB.length === 0) throw new Error("Chưa có dữ liệu môn học.");

        const preferences = getStoredPreferences();

        // 1. CHUẨN BỊ DỮ LIỆU ĐÃ LỌC (FIXED CLASSES)
        // Đây là bước quan trọng: Chỉ giữ lại các lớp user đã tick chọn
        const fixedClassesRaw = localStorage.getItem('hcmus_selected_classes');
        const fixedClassesMap = fixedClassesRaw ? JSON.parse(fixedClassesRaw) : {};

        // Tạo một DB mới đã được cắt gọt (Filtered DB)
        // Logic: Duyệt qua từng môn, nếu môn đó có danh sách lớp cố định -> Chỉ giữ lại lớp đó.
        const filteredDB = GLOBAL_COURSE_DB.map(course => {
            const allowed = fixedClassesMap[course.id];
            if (allowed && Array.isArray(allowed) && allowed.length > 0) {
                // Lọc lớp
                const validClasses = course.classes.filter(c => allowed.includes(c.id));
                if (validClasses.length > 0) {
                    return { ...course, classes: validClasses };
                } else {
                    console.warn(`⚠️ Môn ${course.id}: User chọn lớp ${allowed} nhưng không tìm thấy trong DB hiện tại. Fallback lấy hết.`);
                }
            }
            return course; // Giữ nguyên nếu không cố định
        });

        // CHECK: CHẠY CHẾ ĐỘ NHÓM HAY CÁ NHÂN?
        if (isGroupMode && groupMembers.length > 1) {
            console.log("👥 Đang chạy chế độ Xếp lịch nhóm...");

            const sharedCourses = [];
            const studentDataList = groupMembers.map(name => ({ name: name, ownCourseIDs: [] }));

            const savedSelection = JSON.parse(localStorage.getItem('selected_courses_basket') || '[]');

            if (Array.isArray(savedSelection)) {
                savedSelection.forEach(courseId => {
                    const assignedIndices = courseAssignments[courseId];

                    if (!assignedIndices || assignedIndices.length === groupMembers.length) {
                        sharedCourses.push(courseId);
                    } else {
                        assignedIndices.forEach(idx => {
                            if (studentDataList[idx]) {
                                studentDataList[idx].ownCourseIDs.push(courseId);
                            }
                        });
                    }
                });
            }

            setTimeout(() => {
                const results = runGroupScheduleSolver(
                    filteredDB, // <--- [FIX]: Dùng DB đã lọc thay vì GLOBAL_COURSE_DB
                    sharedCourses,
                    studentDataList,
                    preferences
                );

                console.log(`Group Logic: Tìm thấy ${results.length} phương án.`);
                renderScheduleResults(results);

                if (btn) { btn.innerText = originalText; btn.disabled = false; }
            }, 50);

        } else {
            // CHẠY CHẾ ĐỘ CÁ NHÂN
            console.log("👤 Đang chạy chế độ Xếp lịch cá nhân...");

            const userWants = [];
            const basketRaw = localStorage.getItem('selected_courses_basket');
            const basketList = basketRaw ? JSON.parse(basketRaw) : [];

            if (basketList.length === 0) throw new Error("Giỏ hàng trống!");

            basketList.forEach(subjID => userWants.push(subjID));

            setTimeout(() => {
                const results = runScheduleSolver(
                    GLOBAL_COURSE_DB, // Scheduler cá nhân có logic lọc riêng bên trong nó, nhưng dùng filteredDB cũng được
                    userWants,
                    fixedClassesMap, // Truyền map constraints vào
                    preferences
                );
                renderScheduleResults(results);
                if (btn) { btn.innerText = originalText; btn.disabled = false; }
            }, 50);
        }

    } catch (e) {
        console.error(e);
        alert(e.message);
        if (btn) { btn.innerText = originalText; btn.disabled = false; }
    }
}

// --- HÀM 2: XẾP LỊCH NHÓM (Từ nút bấm riêng trong tab Nhóm) ---
export async function onNutBamXepLichNhom() {
    const btn = document.querySelector('button[onclick="window.onNutBamXepLichNhom()"]');
    const originalText = btn ? btn.innerText : "Xếp Lịch Nhóm";

    if (btn) {
        btn.innerText = "⏳ Đang xử lý...";
        btn.disabled = true;
    }

    try {
        // 1. Thu thập dữ liệu từ Bảng Ma Trận
        const sharedCourses = [];
        const studentDataList = [];

        const headers = document.querySelectorAll('#group-course-table-body').previousElementSibling?.querySelectorAll('th');
        const memberNames = [];
        if (headers) {
            for (let i = 2; i < headers.length; i++) memberNames.push(headers[i].innerText);
        }

        memberNames.forEach(name => studentDataList.push({ name: name, ownCourseIDs: [] }));

        const rows = document.querySelectorAll('.group-course-row');
        rows.forEach(row => {
            const sharedChk = row.querySelector('.chk-group-shared');
            if (!sharedChk) return;
            const courseId = sharedChk.getAttribute('data-id');

            if (sharedChk.checked) {
                sharedCourses.push(courseId);
            } else {
                const privateChks = row.querySelectorAll('.chk-group-private');
                privateChks.forEach(chk => {
                    if (chk.checked) {
                        const memberIdx = parseInt(chk.getAttribute('data-member'));
                        if (studentDataList[memberIdx]) {
                            studentDataList[memberIdx].ownCourseIDs.push(courseId);
                        }
                    }
                });
            }
        });

        if (sharedCourses.length === 0 && studentDataList.every(s => s.ownCourseIDs.length === 0)) {
            throw new Error("Chưa chọn môn nào cả! Hãy tích chọn môn Chung hoặc môn Riêng.");
        }

        // 2. [FIX QUAN TRỌNG] Lọc DB theo lớp cố định
        const fixedClassesRaw = localStorage.getItem('hcmus_selected_classes');
        const fixedClassesMap = fixedClassesRaw ? JSON.parse(fixedClassesRaw) : {};

        const filteredDB = GLOBAL_COURSE_DB.map(course => {
            const allowed = fixedClassesMap[course.id];
            if (allowed && Array.isArray(allowed) && allowed.length > 0) {
                const validClasses = course.classes.filter(c => allowed.includes(c.id));
                return validClasses.length > 0 ? { ...course, classes: validClasses } : course;
            }
            return course;
        });

        // 3. Gọi Solver với DB đã lọc
        const preferences = getStoredPreferences();

        setTimeout(() => {
            const results = runGroupScheduleSolver(
                filteredDB, // <--- Sử dụng DB sạch
                sharedCourses,
                studentDataList,
                preferences
            );

            // Render Kết quả Nhóm
            if (window.renderGroupResults) {
                window.renderGroupResults(results);
            } else {
                console.error("Hàm renderGroupResults chưa được expose ra window");
            }

            if (btn) {
                btn.innerText = originalText;
                btn.disabled = false;
            }
        }, 50);

    } catch (e) {
        console.error("Group Logic Error:", e);
        alert(e.message);
        if (btn) {
            btn.innerText = originalText;
            btn.disabled = false;
        }
    }
}

window.onNutBamXepLich = onNutBamXepLich;
window.onNutBamXepLichNhom = onNutBamXepLichNhom;