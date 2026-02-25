import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell } from 'recharts';
import { TrendingUp } from 'lucide-react';

export function GPAWidget() {
  const [mounted, setMounted] = useState(false);
  const currentGPA = 3.68;
  const maxGPA = 4.0;
  const percentage = (currentGPA / maxGPA) * 100;

  const data = [
    { name: 'Current', value: percentage },
    { name: 'Remaining', value: 100 - percentage },
  ];

  const COLORS = ['#4CAF50', '#E5E7EB'];

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-900">Current GPA</h3>
        <div className="flex items-center gap-1 text-green-600 text-sm">
          <TrendingUp className="w-4 h-4" />
          <span>+0.15</span>
        </div>
      </div>
      
      <div className="flex items-center justify-center mb-4">
        <div className="relative w-40 h-40">
          {mounted && (
            <PieChart width={160} height={160}>
              <Pie
                data={data}
                cx={80}
                cy={80}
                innerRadius={55}
                outerRadius={70}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
            </PieChart>
          )}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-3xl text-gray-900">{currentGPA}</p>
              <p className="text-gray-500 text-sm">out of {maxGPA}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Semester GPA</span>
          <span className="text-gray-900">3.75</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Class Rank</span>
          <span className="text-gray-900">12/156</span>
        </div>
      </div>
    </div>
  );
}