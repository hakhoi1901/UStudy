import { FileText, CheckCircle, AlertCircle, Award } from 'lucide-react';

const activities = [
  {
    id: 1,
    type: 'assignment',
    title: 'Assignment submitted',
    description: 'Web Development - Project Phase 2',
    time: '2 hours ago',
    icon: FileText,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50',
  },
  {
    id: 2,
    type: 'grade',
    title: 'New grade posted',
    description: 'Database Systems - Midterm Exam: 92/100',
    time: '5 hours ago',
    icon: Award,
    iconColor: 'text-green-600',
    iconBg: 'bg-green-50',
  },
  {
    id: 3,
    type: 'completed',
    title: 'Course completed',
    description: 'Introduction to Machine Learning',
    time: '1 day ago',
    icon: CheckCircle,
    iconColor: 'text-green-600',
    iconBg: 'bg-green-50',
  },
  {
    id: 4,
    type: 'deadline',
    title: 'Upcoming deadline',
    description: 'Computer Networks - Lab Report due in 2 days',
    time: '1 day ago',
    icon: AlertCircle,
    iconColor: 'text-orange-600',
    iconBg: 'bg-orange-50',
  },
];

export function RecentActivity() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-gray-900 mb-4">Recent Activity</h3>
      
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3">
            <div className={`${activity.iconBg} p-2 rounded-lg`}>
              <activity.icon className={`w-5 h-5 ${activity.iconColor}`} />
            </div>
            <div className="flex-1">
              <p className="text-gray-900">{activity.title}</p>
              <p className="text-gray-600 text-sm">{activity.description}</p>
              <p className="text-gray-500 text-sm mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
