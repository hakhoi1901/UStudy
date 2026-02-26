import { useState, useEffect, useMemo } from 'react';
import { readFromStorage } from '../helpers/localStorage/save';
import { CourseRecommender } from '../logic/scheduler/Recommender';
import { STORAGE_KEYS } from '../config/storageKeys';
import { courses as allCoursesMeta } from '../assets/data/courses';
import { prerequisites } from '../assets/data/prerequisites';
import { categories } from '../assets/data/categories';
import type { Course } from '../data/courseData'; // Just for the interface

export interface CourseGroupState {
    core: Course[];
    major: Course[];
    electives: Course[];
}

export function useCourseData() {
    const [stamp, setStamp] = useState(Date.now());
    const [isReady, setIsReady] = useState(false);
    const [hasData, setHasData] = useState(false);

    // Lắng nghe sự kiện từ Bookmarklet
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            // Bookmarklet gửi message có type IMPORT_FULL_DATA
            if (event.data && event.data.type === 'IMPORT_FULL_DATA') {
                // Cập nhật stamp để kích hoạt lại useMemo đọc data mới
                setStamp(Date.now());
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    // Tính toán Recommender bên trong useMemo để tránh re-render nhiều lần
    const courseData = useMemo(() => {
        setIsReady(false)

        // Đọc dữ liệu từ localStorage
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

        // Lấy mảng gốc (được filter + gắn trạng thái từ Recommender)
        // Tạm thời comment vì recommend() chỉ trả về các môn có mở lớp. 
        // Nếu UI muốn hiển thị cả môn KHÔNG mở lớp nhưng thiếu điều kiện, cần logic khác.
        // Tạm thời gọi hàm getStudentStatus và tự map để hiện đủ danh sách môn tĩnh.
        const { failed } = recommender.getStudentStatus();

        // Chạy để sinh recommendationsMap và lấy danh sách môn ĐƯỢC GỢI Ý (ĐÃ MỞ LỚP)
        const recommendedCourses = recommender.recommend();
        const recMap = (recommender as any).recommendationsMap;

        // Helper function to map courses
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

                // In "All Open Courses" view, everything is available unless it's a retake.
                // In "Recommended" view, only recommended non-retake courses are available.
                const isAvailable = isAllView
                    ? !needsRetake
                    : !!recStatus && recStatus !== 'RETAKE';

                return {
                    id: cid,
                    code: cid,
                    name: meta?.course_name_vi || sourceCourse.course_name_vi || sourceCourse.name || cid,
                    nameVi: meta?.course_name_vi || sourceCourse.course_name_vi || sourceCourse.name || cid,
                    credits: parseInt((meta?.credits || sourceCourse.credits) as any) || 0,
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

    }, [stamp]); // Phụ thuộc vào stamp để reload khi có data mới

    return {
        core: courseData.recommended?.core || [], // Keep backward compatibility for other components if any
        major: courseData.recommended?.major || [],
        electives: courseData.recommended?.electives || [],
        ...courseData,
        isReady,
        hasData
    };
}
