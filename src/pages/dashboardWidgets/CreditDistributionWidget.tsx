import { useMemo } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartPie } from 'lucide-react';

import { ACADEMIC_RULES } from '../../constants';
import { useDepartmentData } from '../../context/DepartmentContext';
import {
  buildCreditDistribution,
  getDistributionCompletionPercent,
  getDistributionTotal,
  type CreditDistributionItem,
} from './dashboard-insights';

const REMAINING_CREDITS_KEY = '__remaining_credits__';
const REMAINING_CREDITS_COLOR = '#E5E7EB';

function CreditTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: CreditDistributionItem }> }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  const isRemainingCredits = item.key === REMAINING_CREDITS_KEY;

  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-gray-900">{item.name}</p>
      <p className="text-gray-600">
        {item.credits} tín chỉ {isRemainingCredits ? 'chưa học' : 'đã tích lũy'}
      </p>
    </div>
  );
}

export function CreditDistributionWidget() {
  const { data: { categories, courses } } = useDepartmentData();
  const distribution = useMemo(
    () => buildCreditDistribution(categories, courses),
    [categories, courses],
  );
  const totalCredits = getDistributionTotal(distribution);
  const remainingCredits = Math.max(ACADEMIC_RULES.TOTAL_CREDITS - totalCredits, 0);
  const chartDistribution = useMemo(
    () => {
      const completedItems = distribution.filter((item) => item.credits > 0);
      if (remainingCredits <= 0) return completedItems;

      return [
        ...completedItems,
        {
          key: REMAINING_CREDITS_KEY,
          name: 'Chưa học',
          credits: remainingCredits,
          requiredCredits: 0,
          color: REMAINING_CREDITS_COLOR,
        },
      ];
    },
    [distribution, remainingCredits],
  );
  const completionPercent = getDistributionCompletionPercent(distribution);

  return (
    <section className="ustudy-card ustudy-panel-padding">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="ustudy-icon-badge ustudy-icon-primary-soft">
            <ChartPie className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-gray-900 md:text-base">Phân bổ tín chỉ</h3>
            <p className="text-xs text-gray-500">Theo danh mục chương trình đào tạo</p>
          </div>
        </div>
        <div className="ustudy-muted-panel text-right">
          <p className="text-base font-bold text-gray-900">{totalCredits}</p>
          <p className="text-[10px] font-medium uppercase text-gray-500">TC</p>
        </div>
      </div>

      {distribution.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-[220px_1fr] md:items-center">
          <div className="relative h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartDistribution}
                  dataKey="credits"
                  nameKey="name"
                  innerRadius={58}
                  outerRadius={88}
                  paddingAngle={chartDistribution.length > 1 ? 2 : 0}
                  strokeWidth={0}
                >
                  {chartDistribution.map((item) => (
                    <Cell key={item.key} fill={item.color} />
                  ))}
                </Pie>
                <Tooltip content={<CreditTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-gray-900">{completionPercent}%</span>
              <span className="text-[11px] font-medium text-gray-500">tổng CTĐT</span>
            </div>
          </div>

          <div className="space-y-2">
            {distribution.map((item) => (
              <div key={item.key} className="flex items-center gap-3 rounded-lg border border-gray-100 px-3 py-2">
                <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-gray-800">{item.name}</p>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(100, (item.credits / Math.max(item.requiredCredits || item.credits, 1)) * 100)}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
                <span className="shrink-0 text-xs font-bold text-gray-900">
                  {item.credits}{item.requiredCredits ? `/${item.requiredCredits}` : ''} TC
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="ustudy-empty-state">
          Chưa có tín chỉ đã hoàn thành để phân bổ.
        </div>
      )}
    </section>
  );
}
