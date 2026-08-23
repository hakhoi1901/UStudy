import { useEffect, useMemo, useState } from 'react';
import { STORAGE_KEYS } from '../config';
import { useDepartmentData } from '../context/DepartmentContext';
import { hasImportedData } from '../helpers/localStorage/data-import-status';
import { readFromStorage } from '../helpers/localStorage/save';
import { CourseDataMapper, type CourseGroupState } from '../logic/CourseDataMapper';
import { CourseRecommender } from '../logic/scheduler/Recommender';
import { useRegisteredCourses } from './useRegisteredCourses';

export { type CourseGroupState };

function uniqueOpenCourses(courseDb: any[]): any[] {
    const coursesById = new Map<string, any>();

    courseDb.forEach((course) => {
        const courseId = String(course?.id ?? course?.course_id ?? '').trim().toUpperCase();
        if (courseId && !coursesById.has(courseId)) coursesById.set(courseId, course);
    });

    return Array.from(coursesById.values());
}

export function useCourseData() {
    const { data: { courses: allCoursesMeta, prerequisites, categories, tuitionRates } } = useDepartmentData();
    const { registeredCourseCodes } = useRegisteredCourses();
    const [stamp, setStamp] = useState(Date.now());

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data && (
                event.data.type === 'IMPORT_FULL_DATA'
                || event.data.type === 'CACHE_POPULATED'
            )) {
                setStamp(Date.now());
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const courseData = useMemo(() => {
        const emptyGroup: CourseGroupState = { core: [], major: [], electives: [] };
        const studentDb = readFromStorage<any>(STORAGE_KEYS.STUDENT_DB, null);
        const courseDb = readFromStorage<any[]>(STORAGE_KEYS.COURSE_DB_OFFLINE, []);

        if (!studentDb) {
            return {
                recommended: emptyGroup,
                all: emptyGroup,
                hasData: hasImportedData(),
            };
        }

        const recommender = new CourseRecommender(
            studentDb,
            courseDb,
            prerequisites,
            allCoursesMeta,
            categories,
            registeredCourseCodes,
        );
        const { failed } = recommender.getStudentStatus();
        const recommendedCourses = recommender.recommend();

        const mappedRecommended = CourseDataMapper.mapCourseList(
            recommendedCourses,
            allCoursesMeta,
            prerequisites,
            tuitionRates,
            failed,
            recommender.recommendationsMap,
            false,
        );
        const mappedAllOpen = CourseDataMapper.mapCourseList(
            uniqueOpenCourses(courseDb),
            allCoursesMeta,
            prerequisites,
            tuitionRates,
            failed,
            recommender.recommendationsMap,
            true,
        );

        return {
            recommended: CourseDataMapper.groupCoursesByCategory(mappedRecommended, categories),
            all: CourseDataMapper.groupCoursesByCategory(mappedAllOpen, categories),
            hasData: true,
        };
    }, [stamp, allCoursesMeta, prerequisites, categories, tuitionRates, registeredCourseCodes]);

    return {
        core: courseData.recommended.core,
        major: courseData.recommended.major,
        electives: courseData.recommended.electives,
        ...courseData,
        isReady: true,
    };
}
