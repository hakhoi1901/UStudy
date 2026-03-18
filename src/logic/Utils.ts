import { SPLIT_SEMESTER_CONFIG } from "../config";

// Hàm encode mới hỗ trợ 2 Phase
// Tham số thứ 2 (subjectID) dùng để check xem môn này thuộc phase nào
export function encodeScheduleToMask(scheduleInput: string | string[], subjectID = "") {
    // Mở rộng mảng mask lên 10 phần tử (320 bit)
    let mask = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
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

    const PHASE_OFFSET = 140; // 7 ngày * 10 tiết * 2 bit/tiết = 140 bit

    scheduleArr.forEach(str => {
        if (!str) return;
        const match = str.match(/T(\d|CN)\s*\((\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)\)/);

        if (match) {
            let day = match[1] === 'CN' ? 6 : parseInt(match[1]) - 2;
            // 2 bit per period: bit 0,1 for P1, bit 2,3 for P2...
            // Start bit = (start - 1) * 2
            // End bit = (end * 2) - 1
            const startBitIdx = Math.round((parseFloat(match[2]) - 1) * 2);
            const endBitIdx = Math.round(parseFloat(match[3]) * 2 - 1);

            if (day >= 0 && day <= 6) {
                const dayOffset = day * 20; // 20 bits per day
                for (let i = startBitIdx; i <= endBitIdx; i++) {
                    const baseBitIndex = dayOffset + i;

                    // Nếu là Phase 1 hoặc Cả kỳ -> Bật bit ở vùng 1 (0-139)
                    if (phase === 0 || phase === 1) {
                        mask[Math.floor(baseBitIndex / 32)] |= (1 << (baseBitIndex % 32));
                    }

                    // Nếu là Phase 2 hoặc Cả kỳ -> Bật bit ở vùng 2 (140-279)
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
    const PHASE_OFFSET = 140;

    // Quét vùng Phase 1 (0-139)
    // Logic mới: Quét cả 2 vùng để xác định
    for (let i = 0; i < 10; i++) {
        const part = (parts && parts[i] !== undefined) ? parts[i] : 0;
        if (part === 0) continue;

        for (let bit = 0; bit < 32; bit++) {
            if ((part & (1 << bit)) !== 0) {
                let totalBit = i * 32 + bit;

                let actualBit = totalBit;
                if (totalBit >= PHASE_OFFSET) {
                    actualBit = totalBit - PHASE_OFFSET;
                }

                if (actualBit >= 140) continue; // Bỏ qua rác

                let day = Math.floor(actualBit / 20);
                let bitInDay = actualBit % 20;
                let period = Math.floor(bitInDay / 2) + 1;

                // Chỉ push 1 slot cho mỗi tiết (nếu bit 0 hoặc 1 của tiết đó bật)
                // NewUI hiện tại chỉ vẽ theo tiết nguyên, nên ta gom lại.
                if (day < 7) {
                    const exists = slots.some(s => s.day === day && s.period === period);
                    if (!exists) slots.push({ day, period });
                }
            }
        }
    }
    return slots;
}
