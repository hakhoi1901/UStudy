import { TrendingUp, BarChart2, BookOpen, Award } from 'lucide-react';
import type { GPAInformationProps } from '../types';

export function GPAInformation({
    currentGPA,
    projectedGPA,
    majorGPA,
    majorSpecializedGPA
}: GPAInformationProps) {
    const cards = [
        {
            title: 'GPA Hiện tại',
            value: currentGPA.toFixed(2),
            icon: TrendingUp,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            borderColor: 'border-blue-100'
        },
        {
            title: 'GPA Dự kiến',
            value: projectedGPA.toFixed(2),
            icon: BarChart2,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50',
            borderColor: 'border-indigo-100'
        },
        {
            title: 'GPA Cơ sở ngành',
            value: majorGPA.toFixed(2),
            icon: BookOpen,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            borderColor: 'border-emerald-100'
        },
        {
            title: 'GPA Chuyên ngành',
            value: majorSpecializedGPA.toFixed(2),
            icon: Award,
            color: 'text-orange-600',
            bg: 'bg-orange-50',
            borderColor: 'border-orange-100'
        }
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {cards.map((card) => (
                <div
                    key={card.title}
                    className={`p-4 rounded-2xl bg-white border ${card.borderColor} shadow-sm hover:shadow-md transition-shadow`}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg ${card.bg}`}>
                            <card.icon className={`w-4 h-4 ${card.color}`} />
                        </div>
                        <span className="text-xs font-medium text-gray-500">{card.title}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className={`text-xl font-bold ${card.color}`}>
                            {card.value}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium">/ 10</span>
                    </div>
                </div>
            ))}
        </div>
    );
}
