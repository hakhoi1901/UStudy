import { Bitset } from './Bitset.js';

export class Chromosome {
    constructor(length) {
        // Gen: Mảng chứa index của lớp học cho từng môn
        this.genes = new Array(length).fill(-1);
        this.fitness = 0;
        this.combinedMask = new Bitset();
    }

    // Copy dữ liệu từ cha mẹ sang con (tránh tham chiếu vùng nhớ)
    clone() {
        const copy = new Chromosome(this.genes.length);
        copy.genes = [...this.genes];
        copy.fitness = this.fitness;
        // Không cần copy mask vì nó sẽ được tính lại
        return copy;
    }
}