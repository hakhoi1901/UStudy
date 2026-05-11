import { useState, useEffect } from 'react';

export function calculateDaysUntilDue(dueDate: string): number {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

export function useTuitionCountdown(dueDate: string) {
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
