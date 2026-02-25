
/**
 * Recommender.js - Bộ não tư vấn môn học
 * Logic: Phân tích điểm -> Check Tiên quyết -> Check Nhóm ngành -> Gợi ý
 */

class PrerequisiteGraph {
    constructor(prereqData) {
        this.hardConstraints = {}; // Tiên quyết cứng (phải học trước)
        this.softConstraints = {}; // Song hành/Bổ trợ
        this.buildGraph(prereqData);
    }

    buildGraph(data) {
        if (!Array.isArray(data)) return;
        data.forEach(item => {
            const cId = String(item.course_id).trim();
            // Xử lý chuỗi ID (ví dụ "INT123, INT456" -> ["INT123", "INT456"])
            const pIds = String(item.prereq_id).replace(/,/g, ' ').split(/\s+/).filter(x => x.length > 0);

            pIds.forEach(pid => {
                if (item.type === 'PREVIOUS') {
                    if (!this.softConstraints[cId]) this.softConstraints[cId] = [];
                    this.softConstraints[cId].push(pid);
                } else {
                    if (!this.hardConstraints[cId]) this.hardConstraints[cId] = [];
                    this.hardConstraints[cId].push(pid);
                }
            });
        });
    }

    // Đệ quy tìm "nút thắt cổ chai" (Root Blocker)
    // Nếu môn A cần B, B cần C -> Trả về C (nếu chưa học C)
    findBlockingPrereq(courseId, passedCourses) {
        if (passedCourses.has(courseId)) return null; // Đã học rồi thì thôi
        
        const reqs = this.hardConstraints[courseId] || [];
        for (const req of reqs) {
            if (!passedCourses.has(req)) {
                // Đệ quy tìm sâu hơn xem thằng req này có bị ai chặn không
                return this.findBlockingPrereq(req, passedCourses) || req;
            }
        }
        // Không bị ai chặn -> Chính nó là môn cần học
        return courseId; 
    }
}

export class CourseRecommender {
    // Constructor giữ nguyên để tương thích với Utils.js
    constructor(studentData, openCourses, prereqs, allCoursesMeta, categories) {
        this.studentData = studentData;
        this.openCourses = openCourses || []; 
        this.prereqs = prereqs || [];
        this.allCoursesMeta = allCoursesMeta || []; 
        this.categories = categories || {}; 

        // Map kết quả: Key = CourseID, Value = status_code (Để tô màu UI)
        this.recommendationsMap = new Map();
        
        // Map tra cứu nhanh metadata (Số tín chỉ, Tên môn...)
        this.coursesMetaMap = new Map();
        this.allCoursesMeta.forEach(c => this.coursesMetaMap.set(c.course_id, c));
    }

    // Phân tích bảng điểm sinh viên
    getStudentStatus() {
        const passed = new Set();
        const studying = new Set();
        const failed = new Set();
        const passedCreditsMap = new Map(); // Lưu số tín chỉ thực tế đã tích lũy

        const grades = this.studentData?.grades || [];

        grades.forEach(g => {
            const cid = String(g.id).trim();
            let scoreRaw = g.score;
            const credits = parseInt(g.credits) || 0;

            // Đang học hoặc chưa có điểm
            if (scoreRaw === "" || scoreRaw === "(*)" || scoreRaw == null || scoreRaw === undefined) {
                studying.add(cid);
                return;
            }

            const score = parseFloat(scoreRaw);
            if (!isNaN(score)) {
                if (score >= 5.0) {
                    passed.add(cid);
                    passedCreditsMap.set(cid, credits);
                } else {
                    failed.add(cid);
                }
            } else {
                // Điểm chữ hoặc ký hiệu lạ -> coi như đang học
                studying.add(cid);
            }
        });

        return { passed, failed, studying, passedCreditsMap };
    }

    // Hàm thêm gợi ý với độ ưu tiên (QUAN TRỌNG CHO UI)
    addRec(id, status) {
        const priorities = {
            'RETAKE': 4,            // Màu Đỏ (Quan trọng nhất)
            'MANDATORY': 3,         // Màu Xanh Dương
            'ELECTIVE_REQUIRED': 2, // Màu Tím (Thiếu tín chỉ nhóm)
            'SUGGESTED': 1          // Màu Xanh Lá (Gợi ý thêm)
        };

        if (this.recommendationsMap.has(id)) {
            const currentStatus = this.recommendationsMap.get(id);
            // Chỉ ghi đè nếu trạng thái mới quan trọng hơn
            if (priorities[status] > priorities[currentStatus]) {
                this.recommendationsMap.set(id, status);
            }
        } else {
            this.recommendationsMap.set(id, status);
        }
    }

    // Kiểm tra nhóm tự chọn (Logic tính tín chỉ chuẩn xác)
    checkGroupRequirement(requiredCredits, courseList, passed, passedCreditsMap, studying, graph) {
        let currentCredits = 0;
        
        // 1. Tính tổng tín chỉ đã đạt trong nhóm này
        courseList.forEach(cid => {
            if (passed.has(cid) || studying.has(cid)) {
                // Ưu tiên lấy tín chỉ thực tế từ bảng điểm, nếu không có thì lấy từ file config
                const cr = passedCreditsMap.get(cid) || this.coursesMetaMap.get(cid)?.credits || 0;
                currentCredits += parseInt(cr);
            }
        });

        // 2. Nếu chưa đủ tín chỉ -> Gợi ý các môn còn lại
        if (currentCredits < requiredCredits) {
            courseList.forEach(cid => {
                // Chỉ gợi ý môn chưa học và không đang học
                if (!passed.has(cid) && !studying.has(cid)) {
                    // Tìm môn tiên quyết chặn nó (nếu có)
                    const target = graph.findBlockingPrereq(cid, passed);
                    
                    // Nếu target tìm được chưa học -> Gợi ý target đó
                    if (target && !passed.has(target) && !studying.has(target)) {
                        this.addRec(target, 'ELECTIVE_REQUIRED');
                    }
                }
            });
        }
    }

    // Duyệt cây Categories (Đệ quy - Hỗ trợ cả cấu trúc breakdown và sub_groups)
    traverseCategories(obj, passed, passedCreditsMap, studying, graph) {
        // Case 1: Cấu trúc breakdown (như file categories.json của bạn)
        if (obj.breakdown) {
            Object.values(obj.breakdown).forEach(sub => {
                this.traverseCategories(sub, passed, passedCreditsMap, studying, graph);
            });
            return;
        }

        // Case 2: Cấu trúc sub_groups (dự phòng)
        if (obj.sub_groups) {
            obj.sub_groups.forEach(sub => {
                this.traverseCategories(sub, passed, passedCreditsMap, studying, graph);
            });
            return;
        }

        // Case 3: Nút lá (Leaf Node) chứa danh sách môn và yêu cầu tín chỉ
        if (obj.courses && (obj.credits || obj.credits_required)) {
            // Lấy số tín chỉ yêu cầu (ưu tiên field credits_required, fallback sang credits)
            const req = obj.credits_required || obj.credits || 0;
            
            this.checkGroupRequirement(
                req, 
                obj.courses, 
                passed, passedCreditsMap, studying, graph
            );
        } else {
            // Case 4: Object lồng nhau thuần túy -> Duyệt tiếp
            for (const key in obj) {
                if (typeof obj[key] === 'object' && obj[key] !== null && key !== 'courses') {
                    this.traverseCategories(obj[key], passed, passedCreditsMap, studying, graph);
                }
            }
        }
    }

    // HÀM CHÍNH (MAIN FUNCTION)
    recommend() {
        
        // 1. Chuẩn bị dữ liệu
        const { passed, failed, studying, passedCreditsMap } = this.getStudentStatus();
        const graph = new PrerequisiteGraph(this.prereqs);
        
        // Map để check môn có mở lớp không
        const openClassesMap = new Map();
        this.openCourses.forEach(c => openClassesMap.set(c.id, c));

        // --- BƯỚC 1: ƯU TIÊN MÔN RỚT (RETAKE) ---
        failed.forEach(cid => {
            const target = graph.findBlockingPrereq(cid, passed);
            if (target && !passed.has(target) && !studying.has(target)) {
                this.addRec(target, 'RETAKE');
            }
        });

        // --- BƯỚC 2: MÔN BẮT BUỘC CHUNG (MANDATORY) ---
        // Duyệt qua file courses.json, tìm môn loại 'BB'
        this.allCoursesMeta.forEach(c => {
            const cid = c.course_id;
            if (c.course_type === 'BB' && !passed.has(cid) && !studying.has(cid)) {
                const target = graph.findBlockingPrereq(cid, passed);
                if (target && !passed.has(target) && !studying.has(target)) {
                    this.addRec(target, 'MANDATORY');
                }
            }
        });

        // --- BƯỚC 3: XÉT NHÓM NGÀNH (ELECTIVE_REQUIRED) ---
        if (this.categories) {
            this.traverseCategories(this.categories, passed, passedCreditsMap, studying, graph);
        }

        // --- BƯỚC 4: MÔN BỔ TRỢ (Soft Constraints) ---
        // (Chỉ gợi ý môn bổ trợ cho các môn ĐÃ ĐƯỢC CHỌN ở trên)
        const currentIds = Array.from(this.recommendationsMap.keys());
        currentIds.forEach(cid => {
            const softReqs = graph.softConstraints[cid] || [];
            softReqs.forEach(p => {
                if (!passed.has(p) && !this.recommendationsMap.has(p) && !studying.has(p)) {
                    const validP = graph.findBlockingPrereq(p, passed);
                    if (validP === p) {
                        this.addRec(p, 'SUGGESTED');
                    }
                }
            });
        });

        // --- BƯỚC 5: KHỚP VỚI LỚP MỞ & TRẢ VỀ ---
        const finalOutput = [];
        
        // Duyệt qua map gợi ý
        this.recommendationsMap.forEach((statusCode, cid) => {
            // Chỉ trả về nếu môn đó CÓ MỞ LỚP (nằm trong openCourses)
            if (openClassesMap.has(cid)) {
                const courseData = openClassesMap.get(cid);
                
                // Clone object để không ảnh hưởng dữ liệu gốc
                // Thêm thuộc tính status để UI hiển thị màu
                finalOutput.push({
                    ...courseData,
                    recommendationStatus: statusCode 
                });
            }
        });

        return finalOutput;
    }
}

// CHẠY
try {
    const app = new CourseRecommender();
    const result = app.run();
    const outputFilename = 'recommendation_result.json';
    fs.writeFileSync(outputFilename, JSON.stringify(result, null, 4), 'utf-8');

    if (result.length > 0) {
        console.log("Ví dụ kết quả:");
        console.log(JSON.stringify(result[0], null, 2));
    }

} catch (e) {
    console.error(e);
}