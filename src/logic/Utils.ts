import { SPLIT_SEMESTER_CONFIG } from "../config/splitSemester";

// Hàm encode mới hỗ trợ 2 Phase
// Tham số thứ 2 (subjectID) dùng để check xem môn này thuộc phase nào
export function encodeScheduleToMask(scheduleInput: string | string[], subjectID = "") {
    // Mở rộng mảng mask lên 6 phần tử
    let mask = [0, 0, 0, 0, 0, 0];
    const scheduleArr = Array.isArray(scheduleInput) ? scheduleInput : [scheduleInput];

    // Xác định Phase: 0 (Full), 1 (Đầu), 2 (Sau)
    let phase = 0; // Mặc định cả kỳ
    if (subjectID) {
        const cleanID = subjectID.trim().toUpperCase();
        // Check Phase 1
        if (SPLIT_SEMESTER_CONFIG.PHASE_1.some(id => cleanID.includes(id))) {
            phase = 1;
        }
        // Check Phase 2 (Nếu lỡ trùng cả 2 list thì ưu tiên phase 2)
        else if (SPLIT_SEMESTER_CONFIG.PHASE_2.some(id => cleanID.includes(id))) {
            phase = 2;
        }
    }

    const PHASE_OFFSET = 70; // 7 ngày * 10 tiết = 70 bit

    scheduleArr.forEach(str => {
        if (!str) return;
        const match = str.match(/T(\d|CN)\s*\((\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)\)/);

        if (match) {
            let day = match[1] === 'CN' ? 6 : parseInt(match[1]) - 2;
            const start = Math.floor(parseFloat(match[2]));
            const end = Math.ceil(parseFloat(match[3]));

            if (day >= 0 && day <= 6) {
                for (let i = start; i <= end; i++) {
                    const baseBitIndex = (day * 10) + (i - 1);

                    // Nếu là Phase 1 hoặc Cả kỳ -> Bật bit ở vùng 1 (0-69)
                    if (phase === 0 || phase === 1) {
                        mask[Math.floor(baseBitIndex / 32)] |= (1 << (baseBitIndex % 32));
                    }

                    // Nếu là Phase 2 hoặc Cả kỳ -> Bật bit ở vùng 2 (70-139)
                    if (phase === 0 || phase === 2) {
                        const phase2BitIndex = baseBitIndex + PHASE_OFFSET;
                        mask[Math.floor(phase2BitIndex / 32)] |= (1 << (phase2BitIndex % 32));
                    }
                }
            }
        }
    });

    return { parts: mask };
}

export interface ScheduleSlot {
    day: number;
    period: number;
}

export function decodeScheduleMask(parts: number[]) {
    let slots: ScheduleSlot[] = [];
    const PHASE_OFFSET = 70;

    // Quét vùng Phase 1 (0-69)
    // Thực tế chỉ cần quét vùng 1 là đủ hiển thị giờ học
    // Trừ khi môn đó CHỈ học phase 2 thì vùng 1 sẽ trống.

    // Logic mới: Quét cả 2 vùng để xác định
    for (let i = 0; i < 6; i++) {
        const part = (parts && parts[i] !== undefined) ? parts[i] : 0;
        if (part === 0) continue;

        for (let bit = 0; bit < 32; bit++) {
            if ((part & (1 << bit)) !== 0) {
                let totalBit = i * 32 + bit;

                // Xác định thông tin từ bit
                let actualBit = totalBit;
                let phaseNote = ""; // Để debug hoặc hiển thị

                if (totalBit >= PHASE_OFFSET) {
                    actualBit = totalBit - PHASE_OFFSET;
                    phaseNote = " (P2)";
                } else {
                    phaseNote = " (P1)";
                }

                if (actualBit >= 70) continue; // Bỏ qua rác

                let day = Math.floor(actualBit / 10);
                let period = actualBit % 10;

                // Lưu ý: Logic này sẽ push trùng (ví dụ môn học cả 2 kỳ sẽ push 2 lần)
                // Hàm formatScheduleFromSlots ở NewUI sẽ tự gom lại nên không sao.
                if (day < 7) slots.push({ day, period });
            }
        }
    }
    return slots;
}
