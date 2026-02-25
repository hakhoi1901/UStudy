import { useState } from 'react';
import { GPASimulator } from './GPASimulator';
import { VisualTimetable } from './VisualTimetable';
import { Calculator, CalendarDays } from 'lucide-react';

export function AcademicPlanning() {
  const [activeTab, setActiveTab] = useState<'gpa' | 'timetable'>('gpa');

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-gray-900 mb-2">Academic Planning</h1>
          <p className="text-gray-600">Plan your semester with GPA simulation and visual timetable tools.</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('gpa')}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
              activeTab === 'gpa'
                ? 'border-[#004A98] text-[#004A98]'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Calculator className="w-5 h-5" />
            <span>GPA Simulator</span>
          </button>
          <button
            onClick={() => setActiveTab('timetable')}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
              activeTab === 'timetable'
                ? 'border-[#004A98] text-[#004A98]'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <CalendarDays className="w-5 h-5" />
            <span>Visual Timetable</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'gpa' && <GPASimulator />}
        {activeTab === 'timetable' && <VisualTimetable />}
      </div>
    </div>
  );
}
