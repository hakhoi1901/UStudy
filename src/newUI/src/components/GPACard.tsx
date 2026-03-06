import { useState } from 'react';
import { TrendingUp, RotateCcw } from 'lucide-react';

interface GPACardProps {
  currentGPA: number;
  maxGPA: number;
}

export function GPACard({ currentGPA, maxGPA }: GPACardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  // Calculate GPA on 4.0 scale
  const gpa4Scale = (currentGPA / 10) * 4;
  const max4Scale = 4.0;

  // Calculate percentages
  const gpaPercentage10 = (currentGPA / maxGPA) * 100;
  const gpaPercentage4 = (gpa4Scale / max4Scale) * 100;

  // Get classification based on GPA 10 scale
  const getClassification = (gpa: number) => {
    if (gpa >= 9.0) return 'Xuất sắc';
    if (gpa >= 8.0) return 'Giỏi';
    if (gpa >= 7.0) return 'Khá';
    if (gpa >= 6.5) return 'Trung bình khá';
    return 'Trung bình';
  };

  // Get classification color
  const getClassificationColor = (gpa: number) => {
    if (gpa >= 9.0) return 'text-green-600';
    if (gpa >= 8.0) return 'text-blue-600';
    if (gpa >= 7.0) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const CircularProgress = ({ percentage, value, maxValue, scale }: { 
    percentage: number; 
    value: number; 
    maxValue: number;
    scale: string;
  }) => (
    <div className="relative w-40 h-40">
      <svg className="w-full h-full transform -rotate-90">
        {/* Background circle */}
        <circle
          cx="80"
          cy="80"
          r="70"
          stroke="#E5E7EB"
          strokeWidth="12"
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx="80"
          cy="80"
          r="70"
          stroke="#004A98"
          strokeWidth="12"
          fill="none"
          strokeDasharray={`${2 * Math.PI * 70}`}
          strokeDashoffset={`${2 * Math.PI * 70 * (1 - percentage / 100)}`}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-[#004A98]">{value.toFixed(scale === '10' ? 1 : 2)}</span>
        <span className="text-sm text-gray-500">/ {maxValue.toFixed(1)}</span>
      </div>
    </div>
  );

  return (
    <div 
      className="relative h-[320px]"
      style={{ perspective: '1000px' }}
    >
      <div 
        className={`relative w-full h-full transition-all duration-700 cursor-pointer`}
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* FRONT SIDE - GPA Hệ 10 */}
        <div 
          className="absolute inset-0 bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#004A98] flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-gray-900">GPA hiện tại</h3>
              <p className="text-gray-600 text-sm">Thang điểm 10</p>
            </div>
            <RotateCcw className="w-4 h-4 text-gray-400" />
          </div>

          <div className="flex items-center justify-center mb-4">
            <CircularProgress 
              percentage={gpaPercentage10} 
              value={currentGPA} 
              maxValue={maxGPA}
              scale="10"
            />
          </div>

          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Xếp loại</span>
              <span className={`font-semibold ${getClassificationColor(currentGPA)}`}>
                {getClassification(currentGPA)}
              </span>
            </div>
          </div>
        </div>

        {/* BACK SIDE - GPA Hệ 4 */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-[#004A98] to-[#0066CC] rounded-xl p-6 shadow-sm border border-blue-300"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold">GPA hiện tại</h3>
              <p className="text-blue-100 text-sm">Thang điểm 4.0</p>
            </div>
            <RotateCcw className="w-4 h-4 text-white/70" />
          </div>

          <div className="flex items-center justify-center mb-4">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full transform -rotate-90">
                {/* Background circle */}
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="rgba(255, 255, 255, 0.2)"
                  strokeWidth="12"
                  fill="none"
                />
                {/* Progress circle */}
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="white"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 70}`}
                  strokeDashoffset={`${2 * Math.PI * 70 * (1 - gpaPercentage4 / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-white">{gpa4Scale.toFixed(2)}</span>
                <span className="text-sm text-blue-100">/ {max4Scale.toFixed(1)}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/20">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-100">Tương đương</span>
              <span className="text-white font-semibold">
                {gpa4Scale >= 3.6 ? 'A (Xuất sắc)' :
                 gpa4Scale >= 3.2 ? 'B+ (Giỏi)' :
                 gpa4Scale >= 2.8 ? 'B (Khá)' :
                 gpa4Scale >= 2.5 ? 'C+ (TB Khá)' : 'C (Trung bình)'}
              </span>
            </div>
          </div>

          {/* Conversion formula hint */}
          <div className="mt-4 text-center">
            <p className="text-xs text-blue-100/80">
              GPA 4.0 = (GPA 10 ÷ 10) × 4
            </p>
          </div>
        </div>
      </div>

      {/* Click hint */}
      <div className="absolute -bottom-6 left-0 right-0 text-center">
        <p className="text-xs text-gray-400">
          👆 Click để {isFlipped ? 'quay lại' : 'xem thang 4.0'}
        </p>
      </div>
    </div>
  );
}
