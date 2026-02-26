import { useState, useEffect, useMemo } from 'react';
import { readFromStorage } from '../helpers/localStorage/save';

export interface CourseGrade {
    id: string; // The original id from string, e.g. '1'
    code: string; // The course code, e.g. 'CSC10001'
    nameVi: string;
    credits: number;
    grade: number; // Decimal scale 10
    semester: string;
    needsRetake: boolean;
    status: 'passed' | 'retake' | 'ongoing';
}

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

        const studentDb = readFromStorage<any>('student_db_full', null);

        if (!studentDb || !studentDb.grades) {
            setHasData(false);
            setIsReady(true);
            return { gradesHistory: [], currentGPA: 0, accumulatedCredits: 0, totalCredits: 140 };
        }

        setHasData(true);

        const gradesHistory: CourseGrade[] = [];
        let accumulatedCredits = 0;
        let totalPoints = 0;
        let totalCreditsForGPA = 0;

        studentDb.grades.forEach((g: any, index: number) => {
            const code = String(g.id).trim();
            const codeMatch = g.name && g.name.match(/\[(.*?)\]/);
            let nameVi = g.name;

            if (g.name && g.name.includes(" - ")) {
                const parts = g.name.split(" - ");
                nameVi = parts.slice(1).join(" - ").trim();
            } else if (codeMatch) {
                nameVi = g.name.replace(/\[.*?\]/g, '').trim();
            }

            const credits = parseInt(g.credits) || 0;
            const rawScore = g.score;

            let score = 0;
            let status: 'passed' | 'retake' | 'ongoing' = 'ongoing';
            let needsRetake = false;

            // Handle ongoing or empty scores
            if (rawScore === "" || rawScore === "(*)" || rawScore == null || rawScore === undefined) {
                status = 'ongoing';
                score = 0;
            } else {
                const parsedScore = parseFloat(rawScore);
                if (!isNaN(parsedScore)) {
                    score = parsedScore;

                    // IMPORTANT: Physical Education (BAA) and National Defense (ADD) logic
                    const isExcludedFromGPA = code.startsWith('BAA0002') || code.startsWith('ADD0003') || code.startsWith('BAA0003');

                    if (score >= 5.0) { // Assuming 5.0 is pass mark
                        status = 'passed';

                        // Accumulate credits if it's not physical education/national defense
                        if (!isExcludedFromGPA) {
                            accumulatedCredits += credits;
                            totalPoints += score * credits;
                            totalCreditsForGPA += credits;
                        }
                    } else {
                        status = 'retake';
                        needsRetake = true;
                        // Depending on university policy, failed credits might still accrue to total attempted, 
                        // but normally we only count passed ones for current accumulated.
                        // However failed courses might affect GPA calculations, so we add them
                        if (!isExcludedFromGPA) {
                            totalPoints += score * credits;
                            totalCreditsForGPA += credits;
                        }
                    }
                } else {
                    // Letter grades or weird symbols
                    status = 'ongoing';
                    score = 0;
                }
            }

            gradesHistory.push({
                id: index.toString(),
                code,
                nameVi,
                credits,
                grade: score,
                semester: g.semester || 'Không rõ',
                needsRetake,
                status,
            });
        });

        const currentGPA = totalCreditsForGPA > 0 ? (totalPoints / totalCreditsForGPA) : 0;
        const totalCredits = 140; // Hardcoded requirement, can be dynamic if found in future config

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
