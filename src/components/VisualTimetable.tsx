import { useState } from 'react';
import { Clock, MapPin, User, Info } from 'lucide-react';

interface TimeSlot {
  id: string;
  day: string;
  time: string;
  startHour: number;
  duration: number;
  subject: string;
  code: string;
  instructor: string;
  room: string;
  color: string;
}

interface AvailableSlot {
  id: string;
  day: string;
  time: string;
  startHour: number;
  duration: number;
  room: string;
  instructor: string;
  color: string;
}

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const timeSlots = [
  { time: '7:00 AM', hour: 7 },
  { time: '8:00 AM', hour: 8 },
  { time: '9:00 AM', hour: 9 },
  { time: '10:00 AM', hour: 10 },
  { time: '11:00 AM', hour: 11 },
  { time: '12:00 PM', hour: 12 },
  { time: '1:00 PM', hour: 13 },
  { time: '2:00 PM', hour: 14 },
  { time: '3:00 PM', hour: 15 },
  { time: '4:00 PM', hour: 16 },
  { time: '5:00 PM', hour: 17 },
];

const scheduledClasses: TimeSlot[] = [
  {
    id: '1',
    day: 'Monday',
    time: '8:00 AM',
    startHour: 8,
    duration: 2,
    subject: 'Software Engineering',
    code: 'CS301',
    instructor: 'Dr. Nguyen Van A',
    room: 'A203',
    color: '#004A98',
  },
  {
    id: '2',
    day: 'Tuesday',
    time: '10:00 AM',
    startHour: 10,
    duration: 2,
    subject: 'Web Development',
    code: 'CS302',
    instructor: 'Dr. Tran Thi B',
    room: 'B105',
    color: '#0066CC',
  },
  {
    id: '3',
    day: 'Wednesday',
    time: '1:00 PM',
    startHour: 13,
    duration: 3,
    subject: 'Machine Learning',
    code: 'CS303',
    instructor: 'Dr. Le Van C',
    room: 'C301',
    color: '#4CAF50',
  },
  {
    id: '4',
    day: 'Thursday',
    time: '8:00 AM',
    startHour: 8,
    duration: 2,
    subject: 'Mobile App Development',
    code: 'CS304',
    instructor: 'Dr. Pham Thi D',
    room: 'D102',
    color: '#FF9800',
  },
  {
    id: '5',
    day: 'Friday',
    time: '2:00 PM',
    startHour: 14,
    duration: 2,
    subject: 'Cloud Computing',
    code: 'CS305',
    instructor: 'Dr. Hoang Van E',
    room: 'E204',
    color: '#9C27B0',
  },
];

const availableSubjects = [
  {
    name: 'Physical Education',
    code: 'PE101',
    slots: [
      { id: 'pe1', day: 'Monday', time: '7:00 AM', startHour: 7, duration: 2, room: 'Gym A', instructor: 'Coach Nguyen', color: '#E91E63' },
      { id: 'pe2', day: 'Wednesday', time: '7:00 AM', startHour: 7, duration: 2, room: 'Gym B', instructor: 'Coach Tran', color: '#E91E63' },
      { id: 'pe3', day: 'Friday', time: '7:00 AM', startHour: 7, duration: 2, room: 'Gym A', instructor: 'Coach Le', color: '#E91E63' },
      { id: 'pe4', day: 'Saturday', time: '8:00 AM', startHour: 8, duration: 2, room: 'Field', instructor: 'Coach Pham', color: '#E91E63' },
    ],
  },
  {
    name: 'Database Systems',
    code: 'CS202',
    slots: [
      { id: 'db1', day: 'Tuesday', time: '1:00 PM', startHour: 13, duration: 3, room: 'Lab 201', instructor: 'Dr. Vo Thi F', color: '#00BCD4' },
      { id: 'db2', day: 'Thursday', time: '2:00 PM', startHour: 14, duration: 3, room: 'Lab 202', instructor: 'Dr. Do Van G', color: '#00BCD4' },
      { id: 'db3', day: 'Saturday', time: '1:00 PM', startHour: 13, duration: 3, room: 'Lab 203', instructor: 'Dr. Bui Thi H', color: '#00BCD4' },
    ],
  },
  {
    name: 'Artificial Intelligence',
    code: 'CS401',
    slots: [
      { id: 'ai1', day: 'Monday', time: '1:00 PM', startHour: 13, duration: 2, room: 'F301', instructor: 'Dr. Cao Van I', color: '#FF5722' },
      { id: 'ai2', day: 'Wednesday', time: '3:00 PM', startHour: 15, duration: 2, room: 'F302', instructor: 'Dr. Dinh Thi J', color: '#FF5722' },
      { id: 'ai3', day: 'Friday', time: '9:00 AM', startHour: 9, duration: 2, room: 'F303', instructor: 'Dr. Ha Van K', color: '#FF5722' },
    ],
  },
];

export function VisualTimetable() {
  const [selectedSubject, setSelectedSubject] = useState<typeof availableSubjects[0] | null>(null);
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);

  const isSlotOccupied = (day: string, hour: number) => {
    return scheduledClasses.some(
      cls => cls.day === day && hour >= cls.startHour && hour < cls.startHour + cls.duration
    );
  };

  const getScheduledClass = (day: string, hour: number) => {
    return scheduledClasses.find(
      cls => cls.day === day && hour === cls.startHour
    );
  };

  const getAvailableSlot = (day: string, hour: number) => {
    if (!selectedSubject) return null;
    return selectedSubject.slots.find(
      slot => slot.day === day && hour === slot.startHour
    );
  };

  const isPartOfClass = (day: string, hour: number, cls: TimeSlot) => {
    return cls.day === day && hour > cls.startHour && hour < cls.startHour + cls.duration;
  };

  return (
    <div className="space-y-6">
      {/* Subject Selector */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <Info className="w-5 h-5 text-[#004A98]" />
          <div>
            <h3 className="text-gray-900">Subject Selection</h3>
            <p className="text-gray-600 text-sm">Select a subject to view available time slots on the timetable</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {availableSubjects.map((subject) => (
            <button
              key={subject.code}
              onClick={() => setSelectedSubject(selectedSubject?.code === subject.code ? null : subject)}
              className={`px-4 py-2.5 rounded-lg border-2 transition-all ${
                selectedSubject?.code === subject.code
                  ? 'border-[#004A98] bg-[#004A98] text-white'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              <p className="text-sm">{subject.name}</p>
              <p className="text-xs opacity-80">{subject.code} • {subject.slots.length} slots available</p>
            </button>
          ))}
          {selectedSubject && (
            <button
              onClick={() => setSelectedSubject(null)}
              className="px-4 py-2.5 rounded-lg border-2 border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Clear Selection
            </button>
          )}
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-gray-900">Weekly Schedule</h3>
          <p className="text-gray-600 text-sm mt-1">
            {selectedSubject 
              ? `Available time slots for ${selectedSubject.name} are highlighted`
              : 'Your current class schedule for the semester'
            }
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-4 text-left text-xs text-gray-600 uppercase tracking-wider border-r border-gray-200 sticky left-0 bg-gray-50 z-10">
                  Time
                </th>
                {days.map((day) => (
                  <th key={day} className="p-4 text-center text-xs text-gray-600 uppercase tracking-wider border-r border-gray-200 min-w-[150px]">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((slot) => (
                <tr key={slot.hour} className="border-t border-gray-200">
                  <td className="p-3 text-sm text-gray-600 border-r border-gray-200 bg-gray-50 sticky left-0 z-10">
                    {slot.time}
                  </td>
                  {days.map((day) => {
                    const scheduledClass = getScheduledClass(day, slot.hour);
                    const availableSlot = getAvailableSlot(day, slot.hour);
                    const isOccupied = isSlotOccupied(day, slot.hour);
                    const partOfClass = scheduledClasses.find(cls => isPartOfClass(day, slot.hour, cls));

                    if (partOfClass) {
                      return <td key={day} className="border-r border-gray-200"></td>;
                    }

                    if (scheduledClass) {
                      return (
                        <td
                          key={day}
                          rowSpan={scheduledClass.duration}
                          className="p-3 border-r border-gray-200 relative"
                          style={{ backgroundColor: `${scheduledClass.color}15` }}
                        >
                          <div
                            className="rounded-lg p-3 border-l-4 transition-all cursor-pointer hover:shadow-md"
                            style={{ 
                              borderLeftColor: scheduledClass.color,
                              backgroundColor: 'white'
                            }}
                          >
                            <p className="text-sm text-gray-900 mb-1">{scheduledClass.subject}</p>
                            <p className="text-xs text-gray-600 mb-2">{scheduledClass.code}</p>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Clock className="w-3 h-3" />
                                <span>{scheduledClass.duration}h</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <MapPin className="w-3 h-3" />
                                <span>{scheduledClass.room}</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <User className="w-3 h-3" />
                                <span className="truncate">{scheduledClass.instructor}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                      );
                    }

                    if (availableSlot && selectedSubject) {
                      return (
                        <td
                          key={day}
                          rowSpan={availableSlot.duration}
                          className="p-3 border-r border-gray-200 relative"
                          style={{ backgroundColor: `${availableSlot.color}10` }}
                          onMouseEnter={() => setHoveredSlot(availableSlot.id)}
                          onMouseLeave={() => setHoveredSlot(null)}
                        >
                          <div
                            className={`rounded-lg p-3 border-2 border-dashed transition-all cursor-pointer ${
                              hoveredSlot === availableSlot.id ? 'shadow-lg scale-105' : ''
                            }`}
                            style={{ 
                              borderColor: availableSlot.color,
                              backgroundColor: hoveredSlot === availableSlot.id ? `${availableSlot.color}20` : 'white'
                            }}
                          >
                            <p className="text-sm mb-1" style={{ color: availableSlot.color }}>
                              {selectedSubject.name}
                            </p>
                            <p className="text-xs text-gray-600 mb-2">{selectedSubject.code}</p>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Clock className="w-3 h-3" />
                                <span>{availableSlot.duration}h</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <MapPin className="w-3 h-3" />
                                <span>{availableSlot.room}</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <User className="w-3 h-3" />
                                <span className="truncate">{availableSlot.instructor}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                      );
                    }

                    if (!isOccupied) {
                      return (
                        <td
                          key={day}
                          className="p-3 bg-gray-50 border-r border-gray-200 h-24"
                        >
                        </td>
                      );
                    }

                    return null;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h4 className="text-gray-900 mb-3">Legend</h4>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded border-l-4 border-[#004A98] bg-white"></div>
            <span className="text-sm text-gray-700">Scheduled Classes</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded border-2 border-dashed border-[#E91E63] bg-white"></div>
            <span className="text-sm text-gray-700">Available Slots (when selected)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gray-50"></div>
            <span className="text-sm text-gray-700">Free Time</span>
          </div>
        </div>
      </div>
    </div>
  );
}
