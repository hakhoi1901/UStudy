import { Clock, MapPin } from 'lucide-react';

const upcomingClasses = [
  {
    id: 1,
    course: 'Data Structures & Algorithms',
    code: 'CS202',
    time: 'Today, 9:00 AM - 11:00 AM',
    location: 'Room A203',
    instructor: 'Dr. Nguyen Van A',
    color: '#004A98',
  },
  {
    id: 2,
    course: 'Database Management Systems',
    code: 'CS301',
    time: 'Today, 1:00 PM - 3:00 PM',
    location: 'Room B105',
    instructor: 'Dr. Tran Thi B',
    color: '#4CAF50',
  },
  {
    id: 3,
    course: 'Computer Networks',
    code: 'CS305',
    time: 'Tomorrow, 9:00 AM - 11:00 AM',
    location: 'Room C301',
    instructor: 'Dr. Le Van C',
    color: '#0066CC',
  },
];

export function UpcomingClasses() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-gray-900 mb-4">Upcoming Classes</h3>
      
      <div className="space-y-3">
        {upcomingClasses.map((classItem) => (
          <div
            key={classItem.id}
            className="p-4 border border-gray-200 rounded-lg hover:border-[#004A98] transition-colors cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <div
                className="w-1 h-16 rounded-full"
                style={{ backgroundColor: classItem.color }}
              ></div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-gray-900">{classItem.course}</p>
                    <p className="text-gray-500 text-sm">{classItem.code}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{classItem.time}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{classItem.location}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
