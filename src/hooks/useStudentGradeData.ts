import { useState, useEffect, useMemo } from 'react';
import { readFromStorage } from '../helpers/localStorage/save';
import { STORAGE_KEYS, ACADEMIC_RULES } from '../config';
import { AcademicRulesEngine } from '../logic/AcademicRulesEngine';

import { type StudentCourseGrade } from '../types';

export function useStudentGradeData() {
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

    const gradeData = useMemo(() => {
        setIsReady(false);

        const studentDb = readFromStorage<any>(STORAGE_KEYS.STUDENT_DB, null);

        if (!studentDb || !studentDb.grades) {
            setHasData(false);
            setIsReady(true);
            return { gradesHistory: [], currentGPA: 0, accumulatedCredits: 0, totalCredits: ACADEMIC_RULES.TOTAL_CREDITS, estimatedTuition: 0 };
        }

        setHasData(true);

        const gradesHistory: StudentCourseGrade[] = [];
        let accumulatedCredits = 0;
        let totalPoints = 0;
        let totalCreditsForGPA = 0;

        studentDb.grades.forEach((g: any, index: number) => {
            const code = String(g.id).trim();
            const nameVi = AcademicRulesEngine.extractVietnameseCourseName(g.name);
            const credits = parseInt(g.credits) || 0;

            const score = AcademicRulesEngine.parseRawScore(g.score);
            const status = AcademicRulesEngine.evaluateCourseStatus(score);
            const needsRetake = status === 'retake';

            const { pointsForGPA, creditsForGPA, earnedCredits } = AcademicRulesEngine.calculateAccumulationParams(code, credits, score ?? 0, status);

            accumulatedCredits += earnedCredits;
            totalPoints += pointsForGPA;
            totalCreditsForGPA += creditsForGPA;

            gradesHistory.push({
                id: index.toString(),
                code,
                nameVi,
                credits,
                grade: score ?? 0,
                semester: g.semester || 'Không rõ',
                needsRetake,
                status,
            });
        });

        const currentGPA = totalCreditsForGPA > 0 ? (totalPoints / totalCreditsForGPA) : 0;
        const totalCredits = ACADEMIC_RULES.TOTAL_CREDITS; // Hardcoded requirement, can be dynamic if found in future config

        setIsReady(true);
        return {
            gradesHistory,
            currentGPA,
            accumulatedCredits,
            totalCredits,
            estimatedTuition: studentDb.tuition?.total ? parseFloat(studentDb.tuition.total.replace(/,/g, '')) || 0 : 0,
        };

    }, [stamp]);

    return { ...gradeData, isReady, hasData };
}

