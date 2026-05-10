import { useState, useEffect, useMemo } from 'react';
import { readFromStorage } from '../helpers/localStorage/save';
import { CourseRecommender } from '../logic/scheduler/Recommender';
import { STORAGE_KEYS } from '../config';
import { useDepartmentData } from '../context/DepartmentContext';
import { CourseDataMapper, type CourseGroupState } from '../logic/CourseDataMapper';

export { type CourseGroupState };

export function useCourseData() {
    const { data: { courses: allCoursesMeta, prerequisites, categories, tuitionRates } } = useDepartmentData();
    const [stamp, setStamp] = useState(Date.now());
    const [isReady, setIsReady] = useState(false);
    const [hasData, setHasData] = useState(false);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data && (
                event.data.type === 'IMPORT_FULL_DATA' ||
                event.data.type === 'CACHE_POPULATED'
            )) {
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

        const { failed } = recommender.getStudentStatus();
        const recommendedCourses = recommender.recommend();
        const recMap = (recommender as any).recommendationsMap;

        // Delegate mapping & grouping to CourseDataMapper
        const mappedRecommended = CourseDataMapper.mapCourseList(
            recommendedCourses, allCoursesMeta, prerequisites, tuitionRates, failed, recMap, false
        );
        const validOpenCourses = courseDb.filter(c =>
            allCoursesMeta.push(c)
        );

        const mappedAllOpen = CourseDataMapper.mapCourseList(
            validOpenCourses, allCoursesMeta, prerequisites, tuitionRates, failed, recMap, true
        );

        const recommendedGrouped = CourseDataMapper.groupCoursesByCategory(mappedRecommended);
        const allOpenGrouped = CourseDataMapper.groupCoursesByCategory(mappedAllOpen);

        setIsReady(true);
        return {
            recommended: recommendedGrouped,
            all: allOpenGrouped
        };

    }, [stamp, allCoursesMeta, prerequisites, categories, tuitionRates]);

    return {
        core: courseData.recommended?.core || [],
        major: courseData.recommended?.major || [],
        electives: courseData.recommended?.electives || [],
        ...courseData,
        isReady,
        hasData
    };
}
