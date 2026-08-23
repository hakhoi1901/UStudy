import { AcademicRulesEngine } from '../../features/grades/services/academic-rules-engine';

export type RecommendationStatus = 'RETAKE' | 'MANDATORY' | 'ELECTIVE_REQUIRED' | 'SUGGESTED';

export interface StudentCourseStatus {
    passed: Set<string>;
    studying: Set<string>;
    failed: Set<string>;
    passedCreditsMap: Map<string, number>;
}

function normalizeCourseId(value: unknown): string {
    return String(value ?? '').trim().toUpperCase();
}

function getCourseId(course: any): string {
    return normalizeCourseId(course?.id ?? course?.course_id ?? course?.code);
}

function appendUnique(target: Record<string, string[]>, courseId: string, prerequisiteId: string) {
    if (!target[courseId]) target[courseId] = [];
    if (!target[courseId].includes(prerequisiteId)) target[courseId].push(prerequisiteId);
}

export class PrerequisiteGraph {
    public hardConstraints: Record<string, string[]> = {};
    public softConstraints: Record<string, string[]> = {};

    constructor(prerequisiteData: any[]) {
        this.buildGraph(prerequisiteData);
    }

    buildGraph(data: any[]) {
        if (!Array.isArray(data)) return;

        data.forEach((item) => {
            const courseId = normalizeCourseId(item?.course_id);
            if (!courseId) return;

            const prerequisiteIds = String(item?.prereq_id ?? '')
                .split(/[,;/\s]+/)
                .map(normalizeCourseId)
                .filter(Boolean);
            const type = String(item?.type ?? '').trim().toUpperCase();
            const target = type === 'PARALLEL' || type === 'RECOMMENDED'
                ? this.softConstraints
                : this.hardConstraints;

            prerequisiteIds.forEach((prerequisiteId) => {
                appendUnique(target, courseId, prerequisiteId);
            });
        });
    }

    findBlockingPrereq(
        rawCourseId: string,
        passedCourses: Set<string>,
        visiting = new Set<string>(),
    ): string | null {
        const courseId = normalizeCourseId(rawCourseId);
        if (!courseId || passedCourses.has(courseId)) return null;
        if (visiting.has(courseId)) return courseId;

        const nextVisiting = new Set(visiting);
        nextVisiting.add(courseId);

        for (const prerequisiteId of this.hardConstraints[courseId] || []) {
            if (!passedCourses.has(prerequisiteId)) {
                return this.findBlockingPrereq(prerequisiteId, passedCourses, nextVisiting)
                    || prerequisiteId;
            }
        }

        return courseId;
    }
}

export class CourseRecommender {
    public studentData: any;
    public openCourses: any[];
    public prereqs: any[];
    public allCoursesMeta: any[];
    public categories: any;
    public recommendationsMap = new Map<string, RecommendationStatus>();
    public coursesMetaMap = new Map<string, any>();
    public registeredCourseIds: Set<string>;

    constructor(
        studentData: any,
        openCourses: any[],
        prereqs: any[],
        allCoursesMeta: any[],
        categories: any,
        registeredCourseIds: Iterable<string> = [],
    ) {
        this.studentData = studentData;
        this.openCourses = openCourses || [];
        this.prereqs = prereqs || [];
        this.allCoursesMeta = allCoursesMeta || [];
        this.categories = categories || {};
        this.registeredCourseIds = new Set(Array.from(registeredCourseIds, normalizeCourseId).filter(Boolean));

        this.allCoursesMeta.forEach((course: any) => {
            const courseId = getCourseId(course);
            if (courseId && !this.coursesMetaMap.has(courseId)) {
                this.coursesMetaMap.set(courseId, course);
            }
        });
    }

    getStudentStatus(): StudentCourseStatus {
        const passed = new Set<string>();
        const studying = new Set<string>();
        const failed = new Set<string>();
        const passedCreditsMap = new Map<string, number>();
        const grades = Array.isArray(this.studentData?.grades)
            ? this.studentData.grades.map((grade: any) => ({
                ...grade,
                id: normalizeCourseId(grade?.id ?? grade?.course_id ?? grade?.code),
            })).filter((grade: any) => grade.id)
            : [];
        const effectiveGrades = AcademicRulesEngine.resolveEffectiveGrades(grades);
        const hasEnglishExemption = AcademicRulesEngine.checkBLMExemption(grades);
        const courseIds = new Set<string>(grades.map((grade: any) => grade.id));

        if (hasEnglishExemption) {
            AcademicRulesEngine.ENGLISH_COURSE_IDS.forEach((courseId) => courseIds.add(courseId));
        }

        courseIds.forEach((courseId) => {
            const status = AcademicRulesEngine.getCourseStatus(courseId, grades, hasEnglishExemption);
            if (status === 'passed') {
                passed.add(courseId);
                const effectiveGrade = effectiveGrades.find((grade: any) => grade.id === courseId);
                const credits = Number(effectiveGrade?.credits ?? this.coursesMetaMap.get(courseId)?.credits) || 0;
                passedCreditsMap.set(courseId, credits);
            } else if (status === 'studying') {
                studying.add(courseId);
            } else if (status === 'failed') {
                failed.add(courseId);
            }
        });

        this.registeredCourseIds.forEach((courseId) => {
            if (passed.has(courseId)) return;
            failed.delete(courseId);
            studying.add(courseId);
        });

        return { passed, failed, studying, passedCreditsMap };
    }

    addRec(rawCourseId: string, status: RecommendationStatus) {
        const courseId = normalizeCourseId(rawCourseId);
        if (!courseId || this.registeredCourseIds.has(courseId)) return;

        const priorities: Record<RecommendationStatus, number> = {
            RETAKE: 4,
            MANDATORY: 3,
            ELECTIVE_REQUIRED: 2,
            SUGGESTED: 1,
        };
        const currentStatus = this.recommendationsMap.get(courseId);

        if (!currentStatus || priorities[status] > priorities[currentStatus]) {
            this.recommendationsMap.set(courseId, status);
        }
    }

    checkGroupRequirement(
        requiredCredits: number,
        courseList: string[],
        passed: Set<string>,
        passedCreditsMap: Map<string, number>,
        studying: Set<string>,
        graph: PrerequisiteGraph,
    ) {
        const uniqueCourseIds = Array.from(new Set((courseList || []).map(normalizeCourseId).filter(Boolean)));
        const currentCredits = uniqueCourseIds.reduce((total, courseId) => {
            if (!passed.has(courseId) && !studying.has(courseId)) return total;
            const credits = Number(passedCreditsMap.get(courseId) ?? this.coursesMetaMap.get(courseId)?.credits) || 0;
            return total + credits;
        }, 0);

        if (currentCredits >= Number(requiredCredits || 0)) return;

        uniqueCourseIds.forEach((courseId) => {
            if (passed.has(courseId) || studying.has(courseId)) return;

            const target = graph.findBlockingPrereq(courseId, passed);
            if (target && !passed.has(target) && !studying.has(target)) {
                this.addRec(target, 'ELECTIVE_REQUIRED');
            }
        });
    }

    traverseCategories(
        obj: any,
        passed: Set<string>,
        passedCreditsMap: Map<string, number>,
        studying: Set<string>,
        graph: PrerequisiteGraph,
    ) {
        if (!obj || typeof obj !== 'object') return;

        if (obj.breakdown) {
            Object.values(obj.breakdown).forEach((child) => {
                this.traverseCategories(child, passed, passedCreditsMap, studying, graph);
            });
            return;
        }

        if (Array.isArray(obj.sub_groups)) {
            obj.sub_groups.forEach((child: any) => {
                this.traverseCategories(child, passed, passedCreditsMap, studying, graph);
            });
            return;
        }

        if (Array.isArray(obj.courses)) {
            const requiredCredits = Number(obj.credits_required ?? obj.credits ?? obj.total_credits_required) || 0;
            if (requiredCredits > 0) {
                this.checkGroupRequirement(
                    requiredCredits,
                    obj.courses,
                    passed,
                    passedCreditsMap,
                    studying,
                    graph,
                );
            }
            return;
        }

        Object.entries(obj).forEach(([key, value]) => {
            if (key !== 'courses' && value && typeof value === 'object') {
                this.traverseCategories(value, passed, passedCreditsMap, studying, graph);
            }
        });
    }

    recommend(): any[] {
        this.recommendationsMap.clear();

        const { passed, failed, studying, passedCreditsMap } = this.getStudentStatus();
        const graph = new PrerequisiteGraph(this.prereqs);
        const openClassesMap = new Map<string, any>();

        this.openCourses.forEach((course: any) => {
            const courseId = getCourseId(course);
            if (courseId && !openClassesMap.has(courseId)) openClassesMap.set(courseId, course);
        });

        failed.forEach((courseId) => {
            const target = graph.findBlockingPrereq(courseId, passed);
            if (target && !passed.has(target) && !studying.has(target)) this.addRec(target, 'RETAKE');
        });

        this.coursesMetaMap.forEach((course, courseId) => {
            if (String(course?.course_type).trim().toUpperCase() !== 'BB') return;
            if (passed.has(courseId) || studying.has(courseId)) return;

            const target = graph.findBlockingPrereq(courseId, passed);
            if (target && !passed.has(target) && !studying.has(target)) this.addRec(target, 'MANDATORY');
        });

        this.traverseCategories(this.categories, passed, passedCreditsMap, studying, graph);

        Array.from(this.recommendationsMap.keys()).forEach((courseId) => {
            (graph.softConstraints[courseId] || []).forEach((softCourseId) => {
                if (passed.has(softCourseId) || studying.has(softCourseId)) return;
                const target = graph.findBlockingPrereq(softCourseId, passed);
                if (target && !passed.has(target) && !studying.has(target)) this.addRec(target, 'SUGGESTED');
            });
        });

        const finalOutput: any[] = [];
        this.recommendationsMap.forEach((statusCode, courseId) => {
            const courseData = openClassesMap.get(courseId);
            if (!courseData || studying.has(courseId) || this.registeredCourseIds.has(courseId)) return;
            finalOutput.push({ ...courseData, recommendationStatus: statusCode });
        });

        return finalOutput;
    }
}
