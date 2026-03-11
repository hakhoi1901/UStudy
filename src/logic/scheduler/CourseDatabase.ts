
import { encodeScheduleToMask } from '../Utils.js';
import { Bitset } from './Bitset.js'; // 1. Import class Bitset

export default class CourseDatabase {
    courses: any[] = [];
    mapIdToIndex: Record<string, number> = {};

    loadData(rawData: any) {
        this.courses = [];
        this.mapIdToIndex = {};

        if (!Array.isArray(rawData)) {
            console.error("Dữ liệu nạp vào CourseDatabase không phải là mảng:", rawData);
            return;
        }

        rawData.forEach((subj: any, index: number) => {
            // Chuẩn hóa danh sách lớp
            const processedClasses = subj.classes.map((cls: any) => {
                let bitsetMask = new Bitset();

                // Ưu tiên 1: Dùng Mask có sẵn (nếu là file JSON tĩnh)
                if (cls.mask && Array.isArray(cls.mask) && cls.mask.length === 4) {
                    bitsetMask.loadFromData(cls.mask);
                }
                // Ưu tiên 2: Tính toán từ lịch học (nếu là dữ liệu Portal)
                else if (cls.schedule) {
                    // Gọi hàm encode mới đã sửa ở Utils.js
                    const calculatedData = encodeScheduleToMask(cls.schedule, subj.id);
                    // calculatedData trả về { parts: [...] }
                    bitsetMask.loadFromData(calculatedData.parts);
                }
                // Fallback: Mask rỗng
                else {
                    bitsetMask.loadFromData([0, 0, 0, 0]);
                }

                return {
                    id: cls.id,
                    schedule: cls.schedule,
                    scheduleMask: bitsetMask // Lưu Object Bitset
                };
            });

            this.courses.push({
                id: subj.id,
                name: subj.name,
                credits: subj.credits,
                classes: processedClasses
            });

            this.mapIdToIndex[subj.id] = index;
        });
    }

    getCourse(id: string) {
        const idx = this.mapIdToIndex[id];
        return (idx !== undefined) ? this.courses[idx] : null;
    }
}