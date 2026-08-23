import { useState, useEffect, useMemo } from 'react';
import { readFromStorage } from '../helpers/localStorage/save';
import { CourseRecommender } from '../logic/scheduler/Recommender';
import { STORAGE_KEYS } from '../config';
import { useDepartmentData } from '../context/DepartmentContext';
import { CourseDataMapper } from '../logic/CourseDataMapper';
import { useRegisteredCourses } from './useRegisteredCourses';

export function useCourseDataK24() {
    const { data: { courses: allCoursesMeta, prerequisites, categories, tuitionRates } } = useDepartmentData();
    const { registeredCourseCodes } = useRegisteredCourses();
    const [stamp, setStamp] = useState(Date.now());
    const [isReady, setIsReady] = useState(false);
    const [hasData, setHasData] = useState(false);
    const [courseDb, setCourseDb] = useState<any[]>([]);

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

    useEffect(() => {
        let isMounted = true;
        fetch('/data/course-db-k24.json')
            .then(res => res.json())
            .then(data => {
                if (isMounted) {
                    setCourseDb(data);
                }
            })
            .catch(err => {
                console.error("Failed to load K24 course data", err);
                if (isMounted) setCourseDb([]);
            });
        return () => { isMounted = false; };
    }, []);

    const courseData = useMemo(() => {
        if (courseDb.length === 0) {
            setIsReady(false);
            const emptyGroup = { core: [], major: [], electives: [] };
            return { recommended: emptyGroup, all: emptyGroup };
        }

        const studentDb = readFromStorage<any>(STORAGE_KEYS.STUDENT_DB, null);
        
        if (!studentDb) {
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
            categories,
            registeredCourseCodes,
        );

        const { failed } = recommender.getStudentStatus();
        const recommendedCourses = recommender.recommend();
        const recMap = recommender.recommendationsMap;

        const mappedRecommended = CourseDataMapper.mapCourseList(
            recommendedCourses, allCoursesMeta, prerequisites, tuitionRates, failed, recMap, false
        );

        const validOpenCourses = Array.from(courseDb.reduce((coursesById, course) => {
            const courseId = String(course?.id ?? course?.course_id ?? '').trim().toUpperCase();
            if (courseId && !coursesById.has(courseId)) coursesById.set(courseId, course);
            return coursesById;
        }, new Map<string, any>()).values());

        const mappedAllOpen = CourseDataMapper.mapCourseList(
            validOpenCourses, allCoursesMeta, prerequisites, tuitionRates, failed, recMap, true
        );

        const recommendedGrouped = CourseDataMapper.groupCoursesByCategory(mappedRecommended, categories);
        const allOpenGrouped = CourseDataMapper.groupCoursesByCategory(mappedAllOpen, categories);

        setIsReady(true);
        return {
            recommended: recommendedGrouped,
            all: allOpenGrouped
        };

    }, [stamp, allCoursesMeta, prerequisites, categories, tuitionRates, courseDb, registeredCourseCodes]);

    return {
        core: courseData.recommended?.core || [],
        major: courseData.recommended?.major || [],
        electives: courseData.recommended?.electives || [],
        ...courseData,
        isReady,
        hasData
    };
}
