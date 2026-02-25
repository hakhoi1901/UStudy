import { useState, useEffect, useMemo } from 'react';
import { readFromStorage } from '../helpers/localStorage/save';
import { CourseRecommender } from '../logic/tkb/Recommender';
import { courses as allCoursesMeta } from '../assets/data/courses';
import { prerequisites } from '../assets/data/prerequisites';
import { categories } from '../assets/data/categories';
import { Course } from '../data/courseData'; // Just for the interface

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
        setIsReady(false);

        // Đọc dữ liệu từ localStorage
        const studentDb = readFromStorage<any>('student_db_full', null);
        const courseDb = readFromStorage<any[]>('course_db_offline', []);

        if (!studentDb || !studentDb.grades || courseDb.length === 0) {
            setHasData(false);
            setIsReady(true);
            return { core: [], major: [], electives: [] };
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
        const { passed, studying, failed } = recommender.getStudentStatus();

        recommender.recommend(); // Chạy để sinh recommendationsMap
        const recMap = recommender.recommendationsMap;

        // Map `allCoursesMeta` (danh sách tĩnh) sang interface `Course` của UI
        const mappedCourses: Course[] = allCoursesMeta.map(meta => {
            // Xác định trạng thái
            const isFailed = failed.has(meta.course_id);
            const isStudying = studying.has(meta.course_id);
            const isPassed = passed.has(meta.course_id);
            const isOpen = courseDb.some(c => c.id === meta.course_id);

            const recStatus = recMap.get(meta.course_id); // 'RETAKE', 'MANDATORY', etc.

            // Map prerequisite từ format mới
            const prereqIds = prerequisites
                .filter(p => p.course_id === meta.course_id)
                .map(p => p.prereq_id);

            return {
                id: meta.course_id,
                code: meta.course_id,
                name: meta.course_name_vi || meta.course_id,
                nameVi: meta.course_name_vi || meta.course_id,
                credits: parseInt(meta.credits as any) || 0,
                prerequisites: prereqIds,
                // UI uses `isAvailable` (Green box) and `needsRetake` (Red box)
                needsRetake: isFailed || recStatus === 'RETAKE',
                isAvailable: !!recStatus && recStatus !== 'RETAKE',
                recommendationStatus: recStatus, // Mở rộng thêm cho UI xử lý chi tiết
                description: meta.description || '',
                descriptionVi: meta.description || '',
                instructor: 'Chưa cập nhật',
                category: meta.category,
                isOpen
            };
        });

        // Phân loại vào 3 nhóm (cho CourseRecommendations.tsx)
        const grouped: CourseGroupState = {
            core: [],
            major: [],
            electives: []
        };

        mappedCourses.forEach(c => {
            if (c.category === 'FOUNDATION') {
                grouped.core.push(c);
            } else if (c.category?.startsWith('MAJOR_')) {
                grouped.major.push(c);
            } else {
                grouped.electives.push(c);
            }
        });

        setIsReady(true);
        return grouped;

    }, [stamp]); // Phụ thuộc vào stamp để reload khi có data mới

    return { ...courseData, isReady, hasData };
}
