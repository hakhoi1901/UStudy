import { useState } from 'react';
import { exportTuitionData } from '../services/export-tuition';
import type { TuitionCourse, TuitionSummary } from '../types';

export function useTuitionActions(currentSummary: TuitionSummary, currentCourses: TuitionCourse[]) {
    const [copiedLink, setCopiedLink] = useState(false);
    const paymentLink = 'https://hocphi.hcmus.edu.vn/';

    const handleCopyLink = () => {
        navigator.clipboard.writeText(paymentLink);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
    };

    const handleOpenLink = () => {
        window.open(paymentLink, '_blank');
    };

    const handleExport = () => {
        exportTuitionData(currentSummary, currentCourses);
    };

    return {
        paymentLink,
        copiedLink,
        handleCopyLink,
        handleOpenLink,
        handleExport
    };
}
