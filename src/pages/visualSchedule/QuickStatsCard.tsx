// QuickStatsCard.tsx
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';

interface QuickStatsCardProps {
    icon: React.ElementType;
    title: string;
    value: string;
    subtitle: string;
    bgColor: string;
    trend?: { direction: 'up' | 'down'; value: string };
}

export function QuickStatsCard({ icon: Icon, title, value, subtitle, bgColor, trend }: QuickStatsCardProps) {
    return (
        <Card className="border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden group">
            <CardContent className="p-2.5 md:p-6 relative">
                <div className={`absolute inset-0 ${bgColor} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-4 relative z-10">
                    <div className={`p-2 md:p-3 rounded-lg ${bgColor} group-hover:scale-110 transition-transform duration-300 shadow-md self-start`}>
                        <Icon className="w-4 h-4 md:w-6 md:h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] md:text-sm text-gray-600 mb-0.5 md:mb-1 truncate">{title}</p>
                        <p className="text-base md:text-2xl font-semibold text-gray-900 mb-0.5 md:mb-1 leading-tight">{value}</p>
                        <div className="flex items-center gap-1 md:gap-2 flex-wrap">
                            <p className="text-[10px] md:text-xs text-gray-500 truncate">{subtitle}</p>
                            {trend && (
                                <div className={`flex items-center gap-0.5 text-[10px] md:text-xs font-medium ${trend.direction === 'up' ? 'text-green-600' : 'text-orange-600'
                                    }`}>
                                    {trend.direction === 'up' ? <TrendingUp className="w-2.5 h-2.5 md:w-3 md:h-3" /> : <TrendingDown className="w-2.5 h-2.5 md:w-3 md:h-3" />}
                                    <span className="hidden sm:inline">{trend.value}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}