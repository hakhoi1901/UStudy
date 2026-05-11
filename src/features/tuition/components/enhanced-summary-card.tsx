import {
    TrendingUp,
    TrendingDown,
} from 'lucide-react';
import type { ElementType } from 'react';

interface EnhancedSummaryCardProps {
    icon: ElementType;
    title: string;
    subtitle: string;
    value: string;
    detail: string;
    bgColor: string;
    textColor: string;
    trend?: { direction: 'up' | 'down' | 'neutral'; value: string };
    progress?: number;
}

export function EnhancedSummaryCard({
    icon: Icon,
    title,
    subtitle,
    value,
    detail,
    bgColor,
    textColor,
    trend,
    progress
}: EnhancedSummaryCardProps) {
    return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden group relative">
            {/* Gradient overlay on hover */}
            <div className={`absolute inset-0 ${bgColor} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-lg ${bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-gray-900 font-semibold">{title}</h3>
                        <p className="text-xs text-gray-500">{subtitle}</p>
                    </div>
                </div>

                <p className={`text-2xl font-bold ${textColor} mb-2`}>
                    {value}
                </p>

                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">{detail}</p>
                    {trend && trend.direction !== 'neutral' && (
                        <div className={`flex items-center gap-0.5 text-xs font-medium ${trend.direction === 'up' ? 'text-green-600' : 'text-orange-600'
                            }`}>
                            {trend.direction === 'up' ? (
                                <TrendingUp className="w-3 h-3" />
                            ) : (
                                <TrendingDown className="w-3 h-3" />
                            )}
                            <span>{trend.value}</span>
                        </div>
                    )}
                </div>

                {/* Progress bar */}
                {progress !== undefined && (
                    <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                                className={`h-full ${bgColor} transition-all duration-500 ease-out`}
                                style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{progress.toFixed(1)}%</p>
                    </div>
                )}
            </div>
        </div>
    );
}
