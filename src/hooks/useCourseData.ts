import { useState, useEffect, useMemo } from 'react';
import { readFromStorage } from '../helpers/localStorage/save';
import { CourseRecommender } from '../logic/scheduler/Recommender';
import { STORAGE_KEYS } from '../config';
import { useDepartmentData } from '../context/DepartmentContext';
import type { Course } from '../types';

export interface CourseGroupState {
    core: Course[];
    major: Course[];
    electives: Course[];
}

export function useCourseData() {
    const { data: { courses: allCoursesMeta, prerequisites, categories, tuitionRates } } = useDepartmentData();
    const [stamp, setStamp] = useState(Date.now());
    const [isReady, setIsReady] = useState(false);
    const [hasData, setHasData] = useState(false);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data && event.data.type === 'IMPORT_FULL_DATA') {
                setStamp(Date.now());
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const courseData = useMemo(() => {
        setIsReady(false)

        const studentDb = readFromStorage<any>(STORAGE_KEYS.STUDENT_DB, null)
        const courseDb = readFromStorage<any[]>(STORAGE_KEYS.COURSE_DB_OFFLINE, []);

        if (!studentDb || !studentDb.grades || courseDb.length === 0) {
            setHasData(false);
            setIsReady(true);
            const emptyGroup = { core: [], major: [], electives: [] };
            return { recommended: emptyGroup, all: emptyGroup };
        }

        setHasData(true);

        const recommender = new CourseRecommender(
            studentDb,
            courseDb,
            prerequisites,
            allCoursesMeta,
            categories
        );

        const tuition_rates = tuitionRates;

        const { failed } = recommender.getStudentStatus();

        const recommendedCourses = recommender.recommend();
        const recMap = (recommender as any).recommendationsMap;

        const mapCourseList = (sourceList: any[], isAllView: boolean = false): Course[] => {
            return sourceList.map((sourceCourse: any) => {
                const cid = sourceCourse.id || sourceCourse.course_id;
                const meta = allCoursesMeta.find(m => m.course_id === cid);
                const isFailed = failed.has(cid);
                const recStatus = recMap.get(cid);

                const prereqIds = prerequisites
                    .filter(p => p.course_id === cid)
                    .map(p => p.prereq_id);

                const needsRetake = isFailed || recStatus === 'RETAKE';

                const isAvailable = isAllView
                    ? !needsRetake
                    : !!recStatus && recStatus !== 'RETAKE';

                const _credits = parseInt((meta?.credits || sourceCourse.credits) as any) || 0;

                const theory_hours = parseInt((meta?.theory_hours || sourceCourse.theory_hours) as any) || 0;
                const lab_hours = parseInt((meta?.lab_hours || sourceCourse.lab_hours) as any) || 0;
                const exercise_hours = parseInt((meta?.exercise_hours || sourceCourse.exercise_hours) as any) || 0;
                const totalHours = theory_hours + lab_hours + exercise_hours;

                let pricePerCredit = tuition_rates?.default_price || 0;
                const cidUpperCase = cid.trim().toUpperCase();

                if (tuition_rates?.rates) {
                    const sortedKeys = Object.keys(tuition_rates.rates).sort((a, b) => b.length - a.length);
                    for (const key of sortedKeys) {
                        if (cidUpperCase.startsWith(key)) {
                            pricePerCredit = (tuition_rates.rates as any)[key];
                            break;
                        }
                    }
                }

                let billingCredits = _credits;
                if (totalHours > 0) {
                    billingCredits = totalHours / 15;
                }
                const price = billingCredits * pricePerCredit;

                return {
                    id: cid,
                    code: cid,
                    name: meta?.course_name_vi || sourceCourse.course_name_vi || sourceCourse.name || cid,
                    nameVi: meta?.course_name_vi || sourceCourse.course_name_vi || sourceCourse.name || cid,
                    credits: _credits,
                    theory_hours,
                    lab_hours,
                    exercise_hours,
                    price,
                    prerequisites: prereqIds,
                    needsRetake: needsRetake,
                    isAvailable: isAvailable,
                    recommendationStatus: recStatus,
                    description: meta?.description || sourceCourse.description || '',
                    descriptionVi: meta?.description || sourceCourse.description || '',
                    instructor: 'Chưa cập nhật',
                    category: meta?.category || sourceCourse.category || 'OTHER',
                    isOpen: true
                };
            });
        };

        const mappedRecommended = mapCourseList(recommendedCourses, false);
        // Map ALL open courses (courseDb)
        const mappedAllOpen = mapCourseList(courseDb, true);

        // Grouping function
        const groupCourses = (courseList: Course[]): CourseGroupState => {
            const grouped: CourseGroupState = { core: [], major: [], electives: [] };
            courseList.forEach(c => {
                const cat = c.category || 'OTHER';
                if (cat === 'FOUNDATION' || cat === 'GENERAL_IT') {
                    grouped.core.push(c);
                } else if (cat.startsWith('MAJOR_') || cat === 'GRADUATION' || cat.startsWith('SPECIALIZED_')) {
                    grouped.major.push(c);
                } else {
                    grouped.electives.push(c);
                }
            });
            return grouped;
        };

        const recommendedGrouped = groupCourses(mappedRecommended);
        const allOpenGrouped = groupCourses(mappedAllOpen);

        setIsReady(true);
        return {
            recommended: recommendedGrouped,
            all: allOpenGrouped
        };

    }, [stamp, allCoursesMeta, prerequisites, categories, tuitionRates]); // Phụ thuộc vào stamp + data từ DepartmentContext

    return {
        core: courseData.recommended?.core || [], // Keep backward compatibility for other components if any
        major: courseData.recommended?.major || [],
        electives: courseData.recommended?.electives || [],
        ...courseData,
        isReady,
        hasData
    };
}
