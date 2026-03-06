import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from 'recharts';
import { BookOpen } from 'lucide-react';

const data = [
  { semester: 'S1', credits: 18 },
  { semester: 'S2', credits: 21 },
  { semester: 'S3', credits: 19 },
  { semester: 'S4', credits: 20 },
  { semester: 'S5', credits: 22 },
];

export function CreditsWidget() {
  const [mounted, setMounted] = useState(false);
  const totalCredits = data.reduce((sum, item) => sum + item.credits, 0);
  const requiredCredits = 140;
  const percentage = ((totalCredits / requiredCredits) * 100).toFixed(1);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-900">Accumulated Credits</h3>
        <BookOpen className="w-5 h-5 text-[#004A98]" />
      </div>
      
      <div className="mb-4">
        <div className="flex items-baseline gap-2 mb-2">
          <p className="text-3xl text-gray-900">{totalCredits}</p>
          <span className="text-gray-500">/ {requiredCredits}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-[#004A98] to-[#0066CC] h-2 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mt-2">{percentage}% completed</p>
      </div>
      
      <div className="w-full h-32 flex items-center justify-center">
        {mounted && (
          <BarChart width={280} height={128} data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis
              dataKey="semester"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 12 }}
              width={30}
            />
            <Bar dataKey="credits" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={index === data.length - 1 ? '#4CAF50' : '#004A98'}
                />
              ))}
            </Bar>
          </BarChart>
        )}
      </div>
    </div>
  );
}