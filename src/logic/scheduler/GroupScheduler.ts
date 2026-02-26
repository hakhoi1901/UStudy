import { CONFIG, WEIGHTS } from './Constants.js';
import { Chromosome } from './Chromosome.js';
import { FitnessEvaluator } from './FitnessValuator.js';
import CourseDatabase from './CourseDatabase.js';

/**
 * Class giải quyết bài toán xếp lịch nhóm
 */
class GroupGeneticSolver {
    constructor(sharedSubjects, studentProfiles, valuator) {
        // sharedSubjects: Mảng các object môn học chung
        // studentProfiles: Mảng [{ name: "Tui", subjects: [môn riêng...] }, { name: "Bạn A", subjects: [...] }]
        
        this.sharedSubjects = sharedSubjects;
        this.studentProfiles = studentProfiles;
        this.valuator = valuator; // Dùng chung bộ đánh giá (hoặc có thể tạo riêng cho từng người nếu muốn)

        // 1. Tạo bản đồ Gen (Gene Mapping)
        // Cấu trúc nhiễm sắc thể: [ --- SHARED GENES --- | --- STUDENT 1 GENES --- | --- STUDENT 2 GENES --- ]
        this.geneMap = [];
        
        // Map cho môn chung
        this.sharedSubjects.forEach((subj, idx) => {
            this.geneMap.push({ type: 'SHARED', course: subj, localIdx: idx });
        });

        // Map cho môn riêng từng người
        this.studentProfiles.forEach((student, sIdx) => {
            student.subjects.forEach((subj, cIdx) => {
                this.geneMap.push({ type: 'PRIVATE', studentIdx: sIdx, course: subj, localIdx: cIdx });
            });
        });
    }

    solve(topK = 5) {
        let population = [];

        // Khởi tạo
        for (let i = 0; i < CONFIG.POPULATION_SIZE; i++) {
            const ind = this.createIndividual();
            this.calculateGroupFitness(ind);
            population.push(ind);
        }

        // Tiến hóa
        for (let gen = 0; gen < CONFIG.GENERATIONS; gen++) {
            population.sort((a, b) => b.fitness - a.fitness);

            // Nếu tìm được phương án hoàn hảo (điểm rất cao), có thể dừng sớm (tùy chọn)
            
            const newPop = [];
            
            // Elitism
            const eliteCount = Math.floor(CONFIG.POPULATION_SIZE * 0.1) || 1;
            for(let i=0; i<eliteCount; i++) newPop.push(population[i]);

            while(newPop.length < CONFIG.POPULATION_SIZE) {
                const p1 = this.tournamentSelect(population);
                const p2 = this.tournamentSelect(population);
                
                let child = this.crossover(p1, p2);
                this.mutate(child);
                
                this.calculateGroupFitness(child);
                newPop.push(child);
            }
            population = newPop;
        }

        population.sort((a, b) => b.fitness - a.fitness);
        return this.filterUniqueResults(population, topK);
    }

    // --- LOGIC TÍNH ĐIỂM NHÓM (QUAN TRỌNG NHẤT) ---
    calculateGroupFitness(ind) {
        let totalFitness = 0;
        let hasHardConflict = false;

        // 1. Giải mã Gen thành Lịch học cụ thể cho từng người
        // Mảng chứa danh sách môn học ĐÃ CHỌN LỚP cho từng sinh viên
        // studentSchedules[0] = [ {course: ..., selectedClass: ...}, ... ]
        const studentSchedules = this.studentProfiles.map(() => []);

        // Biến tạm lưu class index của các môn chung để dùng lại
        const sharedClassIndices = {};

        ind.genes.forEach((geneVal, geneIdx) => {
            const mapInfo = this.geneMap[geneIdx];

            if (mapInfo.type === 'SHARED') {
                // Đây là môn chung, mọi người đều phải học lớp này
                const selectedClass = mapInfo.course.classes[geneVal];
                
                // Lưu lại để add vào lịch của tất cả mọi người
                this.studentProfiles.forEach((_, sIdx) => {
                    studentSchedules[sIdx].push({
                        course: mapInfo.course,
                        classObj: selectedClass,
                        classIdx: geneVal
                    });
                });

            } else if (mapInfo.type === 'PRIVATE') {
                // Đây là môn riêng, chỉ add cho đúng người đó
                const selectedClass = mapInfo.course.classes[geneVal];
                studentSchedules[mapInfo.studentIdx].push({
                    course: mapInfo.course,
                    classObj: selectedClass,
                    classIdx: geneVal
                });
            }
        });

        // 2. Tính điểm cho TỪNG NGƯỜI
        // Fitness của cả nhóm = Tổng fitness từng cá nhân / Số người (Trung bình cộng)
        // Hoặc = Fitness của người thấp điểm nhất (để đảm bảo không ai bị lịch xấu quá) -> Tôi chọn cách này để công bằng.
        
        let minMemberFitness = Infinity;

        for (let sIdx = 0; sIdx < this.studentProfiles.length; sIdx++) {
            const mySubjects = studentSchedules[sIdx];
            
            // Giả lập cấu trúc để đưa vào FitnessEvaluator
            // FitnessEvaluator cần input dạng: [{ classes: [..., {scheduleMask}, ...] }] 
            // Nhưng ta đã chọn cụ thể 1 lớp rồi, nên ta tạo một Chromosome giả chỉ có 1 gen/môn
            
            // Cách nhanh hơn: Viết lại logic check trùng nhẹ tại đây hoặc tái sử dụng Evaluator một cách khéo léo.
            // Để tận dụng tối đa file FitnessValuator.js xịn xò bạn đã có, ta sẽ làm như sau:
            
            // Tạo một Chromosome giả cho sinh viên này
            const dummyInd = new Chromosome(mySubjects.length);
            // Gen của dummyInd luôn là 0 (vì ta sẽ tạo một danh sách môn học giả chỉ chứa đúng 1 lớp đã chọn)
            dummyInd.genes.fill(0); 

            // Tạo danh sách môn học giả
            const dummySubjects = mySubjects.map(item => ({
                id: item.course.id,
                classes: [item.classObj] // Chỉ chứa đúng 1 lớp đã chọn từ gen tổng
            }));

            // Gọi Evaluator chấm điểm cho sinh viên này
            const memberFitness = this.valuator.getFitness(dummyInd, dummySubjects);

            // Nếu người này bị trùng lịch (Fitness âm), đánh dấu ngay
            if (memberFitness < 0) {
                hasHardConflict = true;
                // Phạt cực nặng vào tổng điểm nhóm
                totalFitness -= Math.abs(memberFitness) * 10; 
            } else {
                totalFitness += memberFitness;
            }

            if (memberFitness < minMemberFitness) minMemberFitness = memberFitness;
        }

        // Logic tổng hợp điểm: 
        // Nếu có bất kỳ ai bị trùng lịch -> Fitness nhóm cực thấp
        // Nếu không, lấy điểm trung bình
        if (hasHardConflict) {
            ind.fitness = -9999999; // Fail
        } else {
            ind.fitness = totalFitness / this.studentProfiles.length;
        }
    }

    // --- CÁC HÀM HELPER GENETIC (Tương tự GeneticSolver đơn) ---

    createIndividual() {
        const ind = new Chromosome(this.geneMap.length);
        this.geneMap.forEach((info, idx) => {
            // Random lớp dựa trên số lượng lớp của môn học đó
            const classCount = info.course.classes.length;
            ind.genes[idx] = Math.floor(Math.random() * classCount);
        });
        return ind;
    }

    crossover(p1, p2) {
        const child = new Chromosome(p1.genes.length);
        const split = Math.floor(Math.random() * p1.genes.length);
        for(let i=0; i<p1.genes.length; i++) {
            child.genes[i] = (i < split) ? p1.genes[i] : p2.genes[i];
        }
        return child;
    }

    mutate(ind) {
        if (Math.random() < CONFIG.MUTATION_RATE) {
            const idx = Math.floor(Math.random() * ind.genes.length);
            const info = this.geneMap[idx];
            const classCount = info.course.classes.length;
            ind.genes[idx] = Math.floor(Math.random() * classCount);
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
            const key = ind.genes.join('|');
            if (!seen.has(key)) {
                seen.add(key);
                results.push(ind);
            }
        }
        return results;
    }
}

/**
 * Hàm chạy chính cho Group Scheduler
 * @param {Object} dbData - Dữ liệu môn học gốc (JSON)
 * @param {Array} sharedCourseIDs - Danh sách mã môn học chung ["MTH...", "CSC..."]
 * @param {Array} studentDataList - Danh sách sinh viên và môn riêng 
 * Ví dụ: [ { name: "Tui", ownCourseIDs: ["PHY..."] }, { name: "Crush", ownCourseIDs: ["ENG..."] } ]
 * @param {Object} preferences - Cài đặt (Ngày nghỉ,...)
 */
export function runGroupScheduleSolver(dbData, sharedCourseIDs, studentDataList, preferences) {
    console.log("👥 Bắt đầu xếp lịch nhóm...");
    
    // 1. Chuẩn bị DB
    const db = new CourseDatabase();
    db.loadData(typeof dbData === 'string' ? JSON.parse(dbData) : dbData);

    // 2. Lấy dữ liệu Môn Chung
    const sharedSubjects = [];
    sharedCourseIDs.forEach(id => {
        const c = db.getCourse(id);
        if (c) sharedSubjects.push(c);
        else console.warn(`Không tìm thấy môn chung: ${id}`);
    });

    // 3. Lấy dữ liệu Môn Riêng cho từng người
    const studentProfiles = studentDataList.map(student => {
        const ownSubjects = [];
        student.ownCourseIDs.forEach(id => {
            const c = db.getCourse(id);
            if (c) ownSubjects.push(c);
            else console.warn(`Không tìm thấy môn riêng ${id} của ${student.name}`);
        });
        return {
            name: student.name,
            subjects: ownSubjects
        };
    });

    // 4. Khởi tạo Engine
    const valuator = new FitnessEvaluator(preferences);
    const solver = new GroupGeneticSolver(sharedSubjects, studentProfiles, valuator);

    // 5. Chạy
    const rawResults = solver.solve(5); // Top 5 phương án nhóm

    // 6. Mapping kết quả trả về (Format lại cho dễ hiển thị)
    // Cấu trúc trả về sẽ phức tạp hơn: Một phương án chứa N thời khóa biểu (cho N người)
    return rawResults.map((ind, optIdx) => {
        const groupResult = {
            optionName: `Phương án nhóm ${optIdx + 1}`,
            totalFitness: ind.fitness,
            schedules: {} // Key: Tên sinh viên, Value: Lịch của người đó
        };

        // Re-construct lại lịch từ genes
        ind.genes.forEach((geneVal, geneIdx) => {
            const mapInfo = solver.geneMap[geneIdx];
            const selectedClass = mapInfo.course.classes[geneVal];
            
            // Helper add vào list kết quả
            const addToResult = (studentName) => {
                if (!groupResult.schedules[studentName]) groupResult.schedules[studentName] = [];
                
                // Format dữ liệu giống Scheduler đơn để tái sử dụng UI render
                let visualMask = selectedClass.mask;
                if (!visualMask && selectedClass.scheduleMask) {
                    visualMask = selectedClass.scheduleMask.parts;
                }

                groupResult.schedules[studentName].push({
                    subjectID: mapInfo.course.id,
                    subjectName: mapInfo.course.name,
                    classID: selectedClass.id,
                    type: mapInfo.type, // SHARED hoặc PRIVATE
                    mask: visualMask || [0,0,0,0],
                    schedule: selectedClass.schedule
                });
            };

            if (mapInfo.type === 'SHARED') {
                studentProfiles.forEach(s => addToResult(s.name));
            } else {
                addToResult(studentProfiles[mapInfo.studentIdx].name);
            }
        });

        return groupResult;
    });
}