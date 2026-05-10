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
            <CardContent className="p-6 relative">
                <div className={`absolute inset-0 ${bgColor} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                <div className="flex items-start gap-4 relative z-10">
                    <div className={`p-3 rounded-lg ${bgColor} group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm text-gray-600 mb-1">{title}</p>
                        <p className="text-2xl font-semibold text-gray-900 mb-1">{value}</p>
                        <div className="flex items-center gap-2">
                            <p className="text-xs text-gray-500">{subtitle}</p>
                            {trend && (
                                <div className={`flex items-center gap-0.5 text-xs font-medium ${trend.direction === 'up' ? 'text-green-600' : 'text-orange-600'
                                    }`}>
                                    {trend.direction === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                    <span>{trend.value}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}