import { CONFIG } from './Constants.js';
import { Chromosome } from './Chromosome.js';
// Lưu ý: Kiểm tra lại tên file FitnessValuator.js hay FitnessEvaluator.js trong dự án của bạn
import { FitnessEvaluator } from './FitnessValuator.js';

export default class GeneticSolver {
    // Bỏ tham số fixedConstraints, chỉ nhận danh sách môn đã lọc
    constructor(subjects, valuator) {
        this.targetSubjects = subjects;
        this.valuator = valuator;
    }

    // --- GENETIC CORE ---
    
    solve(topK) {
        let population = [];

        // 1. Khởi tạo quần thể
        for (let i = 0; i < CONFIG.POPULATION_SIZE; i++) {
            const ind = this.createIndividual();
            this.valuator.getFitness(ind, this.targetSubjects); 
            population.push(ind);
        }

        // 2. Vòng lặp tiến hóa
        for (let gen = 0; gen < CONFIG.GENERATIONS; gen++) {
            population.sort((a, b) => b.fitness - a.fitness);

            const newPop = [];
            
            // Elitism: Giữ lại top 10%
            const eliteCount = Math.floor(CONFIG.POPULATION_SIZE * 0.1) || 1;
            for(let i=0; i<eliteCount; i++) newPop.push(population[i]);

            // Lai ghép & Đột biến
            while(newPop.length < CONFIG.POPULATION_SIZE) {
                const p1 = this.tournamentSelect(population);
                const p2 = this.tournamentSelect(population);
                
                let child = this.crossover(p1, p2);
                this.mutate(child);
                
                this.valuator.getFitness(child, this.targetSubjects);
                newPop.push(child);
            }
            population = newPop;
        }

        // 3. Lọc kết quả tốt nhất
        population.sort((a, b) => b.fitness - a.fitness);
        return this.filterUniqueResults(population, topK);
    }

    // --- HELPER FUNCTIONS ---

    createIndividual() {
        const ind = new Chromosome(this.targetSubjects.length);
        for (let i = 0; i < this.targetSubjects.length; i++) {
            ind.genes[i] = this.randomizeGene(i);
        }
        return ind;
    }

    randomizeGene(subjectIdx) {
        // Đơn giản hóa: Chỉ random trong số lượng lớp được truyền vào
        // Vì danh sách lớp đã được lọc ở Scheduler.js rồi
        const classes = this.targetSubjects[subjectIdx].classes;
        if (!classes || classes.length === 0) return -1;
        
        // Nếu chỉ có 1 lớp (đã ghim), nó luôn trả về 0 -> Luôn đúng
        return Math.floor(Math.random() * classes.length);
    }

    crossover(p1, p2) {
        const child = new Chromosome(p1.genes.length);
        if (p1.genes.length > 1) {
            const split = Math.floor(Math.random() * (p1.genes.length - 1)) + 1;
            for(let i=0; i < p1.genes.length; i++) {
                child.genes[i] = (i < split) ? p1.genes[i] : p2.genes[i];
            }
        } else {
            child.genes = [...p1.genes];
        }
        return child;
    }

    mutate(chromo) {
        if (Math.random() < CONFIG.MUTATION_RATE) {
            const idx = Math.floor(Math.random() * chromo.genes.length);
            // Nếu môn đó chỉ có 1 lớp (đã ghim), randomizeGene vẫn trả về 0 -> Không ảnh hưởng
            chromo.genes[idx] = this.randomizeGene(idx);
        }
    }

    tournamentSelect(pop) {
        let best = pop[Math.floor(Math.random() * pop.length)];
        for(let i=0; i < CONFIG.TOURNAMENT_SIZE; i++) {
            const other = pop[Math.floor(Math.random() * pop.length)];
            if (other.fitness > best.fitness) best = other;
        }
        return best;
    }

    filterUniqueResults(population, topK) {
        const results = [];
        const seen = new Set();
        
        for(const ind of population) {
            if (results.length >= topK) break;
            const key = ind.genes.join(',');
            if (!seen.has(key)) {
                seen.add(key);
                results.push(ind);
            }
        }
        return results;
    }
}