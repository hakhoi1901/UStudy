import { DollarSign, AlertCircle, CheckCircle } from 'lucide-react';

export function TuitionWidget() {
  const semesterTuition = 8500000;
  const paidAmount = 8500000;
  const remainingAmount = semesterTuition - paidAmount;
  const isPaid = remainingAmount === 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-900">Estimated Tuition</h3>
        <DollarSign className="w-5 h-5 text-[#004A98]" />
      </div>
      
      <div className="mb-4">
        <p className="text-gray-600 text-sm mb-1">Semester 2 - 2025/2026</p>
        <p className="text-3xl text-gray-900 mb-2">{formatCurrency(semesterTuition)}</p>
        
        {isPaid ? (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-lg">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">Fully Paid</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">Remaining: {formatCurrency(remainingAmount)}</span>
          </div>
        )}
      </div>
      
      <div className="space-y-2 pt-4 border-t border-gray-100">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Base Tuition</span>
          <span className="text-gray-900">{formatCurrency(7500000)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Lab Fees</span>
          <span className="text-gray-900">{formatCurrency(800000)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Other Fees</span>
          <span className="text-gray-900">{formatCurrency(200000)}</span>
        </div>
      </div>
    </div>
  );
}
