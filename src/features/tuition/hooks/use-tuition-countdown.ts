import { useState, useEffect } from 'react';

export function calculateDaysUntilDue(dueDate: string | null | undefined): number | null {
    if (!dueDate) return null;

    const due = new Date(`${dueDate}T00:00:00`);
    if (Number.isNaN(due.getTime())) return null;
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

export function useTuitionCountdown(dueDate: string | null | undefined) {
    const [daysUntilDue, setDaysUntilDue] = useState(() => calculateDaysUntilDue(dueDate));

    useEffect(() => {
        setDaysUntilDue(calculateDaysUntilDue(dueDate));

        const interval = setInterval(() => {
            setDaysUntilDue(calculateDaysUntilDue(dueDate));
        }, 3600000); // Update every hour

        return () => clearInterval(interval);
    }, [dueDate]);

    return daysUntilDue;
}
