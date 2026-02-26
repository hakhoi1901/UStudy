export class Bitset {
    parts: number[];

    constructor() {
        // Tăng lên 6 phần (6 * 32 = 192 bit) để chứa đủ 2 Phase (140 bit)
        this.parts = [0, 0, 0, 0, 0, 0];
    }

    // Set bit tại vị trí pos lên 1
    set(pos: number) {
        const index = Math.floor(pos / 32);
        const bit = pos % 32;
        this.parts[index] |= (1 << bit);
    }

    // Kiểm tra bit tại vị trí pos có phải là 1 không
    test(pos: number) {
        const index = Math.floor(pos / 32);
        const bit = pos % 32;
        return (this.parts[index] & (1 << bit)) !== 0;
    }

    // Reset toàn bộ về 0
    reset() {
        this.parts = [0, 0, 0, 0, 0, 0];
    }

    // Phép OR với Bitset khác (Dùng để gộp lịch)
    or(other: Bitset) {
        const res = new Bitset();
        // Duyệt 6 phần
        for (let i = 0; i < 6; i++) {
            res.parts[i] = this.parts[i] | other.parts[i];
        }
        return res;
    }

    // Phép AND (Kiểm tra trùng lịch)
    // Trả về true nếu có bất kỳ bit nào chung = 1
    anyCommon(other: Bitset) {
        for (let i = 0; i < 6; i++) {
            if ((this.parts[i] & other.parts[i]) !== 0) return true;
        }
        return false;
    }

    // Load từ mảng số nguyên
    loadFromData(data: number[]) {
        // Load tối đa độ dài data hoặc 6 phần
        for (let i = 0; i < 6 && i < data.length; i++) {
            this.parts[i] = data[i];
        }
    }
}