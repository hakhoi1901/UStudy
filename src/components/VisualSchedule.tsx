// import { useState } from 'react';
// import { Clock, Users, MapPin, Plus, CheckCircle2, AlertTriangle } from 'lucide-react';

// import { type AvailableSubject } from '../types';
// import { VISUAL_SCHEDULE_CONSTANTS } from '../constants';
// import {
//   mockScheduledClasses as scheduledClasses,
//   mockAvailableSubjects as availableSubjects
// } from '../data/mockVisualSchedule';

// export function VisualSchedule() {
//   const [selectedSubject, setSelectedSubject] = useState<AvailableSubject | null>(null);
//   const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);
//   const [viewMode, setViewMode] = useState<'current' | 'suggested'>('current');
//   const [lastSync] = useState(new Date());

//   const totalCredits = 18;
//   const totalClasses = scheduledClasses.length;

//   const isSlotOccupied = (day: string, hour: number) => {
//     return scheduledClasses.some(
//       cls => cls.day === day && hour >= cls.startHour && hour < cls.startHour + cls.duration
//     );
//   };

//   const getScheduledClass = (day: string, hour: number) => {
//     return scheduledClasses.find(
//       cls => cls.day === day && hour === cls.startHour
//     );
//   };

//   const getSuggestedSlot = (day: string, hour: number) => {
//     if (!selectedSubject || viewMode !== 'suggested') return null;
//     return selectedSubject.options.find(
//       slot => slot.day === day && hour === slot.startHour
//     );
//   };

//   const hasConflict = (day: string, startHour: number, duration: number) => {
//     return scheduledClasses.some(
//       cls => cls.day === day &&
//         ((startHour >= cls.startHour && startHour < cls.startHour + cls.duration) ||
//           (startHour + duration > cls.startHour && startHour < cls.startHour + cls.duration))
//     );
//   };

//   const formatTime = (hour: number) => {
//     if (hour === 12) return '12:00';
//     if (hour > 12) return `${hour - 12}:00`;
//     return `${hour}:00`;
//   };

//   const formatPeriod = (hour: number) => {
//     return `P${hour - 6}`;
//   };

//   const formatDateTime = (date: Date) => {
//     return new Intl.DateTimeFormat('en-US', {
//       month: 'short',
//       day: 'numeric',
//       year: 'numeric',
//     }).format(date);
//   };

//   return (
//     <div className="h-full flex flex-col overflow-y-auto">
//       {/* Header Section */}
//       <div className="mb-6 flex items-start justify-between flex-shrink-0">
//         <div>
//           <h1 className="text-gray-900 mb-2">Visual Schedule</h1>
//           <p className="text-gray-600">Plan your weekly timetable and compare available class options</p>
//         </div>
//         <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg shadow-sm">
//           <CheckCircle2 className="w-4 h-4 text-green-600" />
//           <div className="text-sm">
//             <span className="text-green-800 font-medium">Synced with Portal Data</span>
//             <div className="text-green-600 text-xs">Updated: {formatDateTime(lastSync)}</div>
//           </div>
//         </div>
//       </div>

//       {/* View Mode Toggle and Subject Selector */}
//       <div className="mb-6 flex items-center gap-4 flex-shrink-0">
//         <div className="flex items-center bg-gray-100 rounded-lg p-1">
//           <button
//             onClick={() => {
//               setViewMode('current');
//               setSelectedSubject(null);
//             }}
//             className={`px-4 py-2 rounded-md text-sm transition-all font-medium ${viewMode === 'current'
//               ? 'bg-white text-[#004A98] shadow-sm'
//               : 'text-gray-600 hover:text-gray-900'
//               }`}
//           >
//             Current Schedule
//           </button>
//           <button
//             onClick={() => setViewMode('suggested')}
//             className={`px-4 py-2 rounded-md text-sm transition-all font-medium ${viewMode === 'suggested'
//               ? 'bg-white text-[#004A98] shadow-sm'
//               : 'text-gray-600 hover:text-gray-900'
//               }`}
//           >
//             <span className="flex items-center gap-2">
//               <Plus className="w-4 h-4" />
//               Add Classes
//             </span>
//           </button>
//         </div>

//         {viewMode === 'suggested' && (
//           <div className="flex-1 flex items-center gap-3">
//             <span className="text-sm text-gray-600 font-medium">Select subject:</span>
//             <div className="flex flex-wrap gap-2">
//               {availableSubjects.map((subject) => (
//                 <button
//                   key={subject.code}
//                   onClick={() => setSelectedSubject(selectedSubject?.code === subject.code ? null : subject)}
//                   className={`px-3 py-1.5 rounded-lg border-2 transition-all text-sm font-medium ${selectedSubject?.code === subject.code
//                     ? 'border-[#004A98] bg-[#004A98] text-white shadow-md'
//                     : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
//                     }`}
//                 >
//                   {subject.name}
//                 </button>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Weekly Calendar Grid - Full Page */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 flex-shrink-0">
//         {/* Grid Header */}
//         <div className="grid grid-cols-7 bg-[#004A98] text-white rounded-t-xl overflow-hidden">
//           <div className="p-3 border-r border-white/20 flex items-center justify-center">
//             <Clock className="w-4 h-4" />
//           </div>
//           {VISUAL_SCHEDULE_CONSTANTS.DAYS.map((day) => (
//             <div
//               key={day}
//               className="p-3 border-r border-white/20 last:border-r-0 text-center"
//             >
//               <div className="font-semibold text-sm">{day}</div>
//             </div>
//           ))}
//         </div>

//         {/* Grid Body */}
//         <div className="grid grid-cols-7">
//           {/* Time Column */}
//           <div className="border-r border-gray-200 bg-gray-50">
//             {VISUAL_SCHEDULE_CONSTANTS.TIME_SLOTS.map((hour) => (
//               <div
//                 key={hour}
//                 className="border-b border-gray-200 p-1.5 h-12 flex flex-col items-center justify-center"
//               >
//                 <div className="text-xs font-semibold text-gray-900">{formatTime(hour)}</div>
//                 <div className="text-[10px] text-gray-500">{formatPeriod(hour)}</div>
//               </div>
//             ))}
//           </div>

//           {/* Day Columns */}
//           {VISUAL_SCHEDULE_CONSTANTS.DAYS.map((day) => (
//             <div key={day} className="border-r border-gray-200 last:border-r-0">
//               {VISUAL_SCHEDULE_CONSTANTS.TIME_SLOTS.map((hour) => {
//                 const scheduledClass = getScheduledClass(day, hour);
//                 const suggestedSlot = getSuggestedSlot(day, hour);
//                 const isOccupied = isSlotOccupied(day, hour);

//                 if (scheduledClass) {
//                   return (
//                     <div
//                       key={hour}
//                       className="border-b border-gray-200 p-1 h-12"
//                       style={{
//                         height: `${scheduledClass.duration * 48}px`,
//                         backgroundColor: `${scheduledClass.color}08`
//                       }}
//                     >
//                       <div
//                         className="rounded-md p-1.5 h-full border-l-[3px] bg-white shadow-sm hover:shadow-md transition-all cursor-pointer"
//                         style={{
//                           borderLeftColor: scheduledClass.color,
//                         }}
//                       >
//                         <div className="flex items-start justify-between mb-0.5">
//                           <p className="text-xs font-bold text-gray-900 leading-tight">{scheduledClass.courseCode}</p>
//                           {scheduledClass.type === 'lab' && (
//                             <span className="px-1 py-0.5 bg-blue-100 text-blue-700 text-[9px] rounded font-medium">Lab</span>
//                           )}
//                         </div>
//                         <p className="text-[9px] text-gray-600 mb-0.5 line-clamp-1 leading-tight">{scheduledClass.courseName}</p>
//                         <div className="space-y-0.5">
//                           <div className="flex items-center gap-0.5 text-[9px] text-gray-500">
//                             <MapPin className="w-2.5 h-2.5" />
//                             <span>{scheduledClass.room}</span>
//                           </div>
//                           <div className="flex items-center gap-0.5 text-[9px] text-gray-500">
//                             <Users className="w-2.5 h-2.5" />
//                             <span className="line-clamp-1">{scheduledClass.instructor}</span>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 }

//                 if (suggestedSlot && selectedSubject) {
//                   const conflict = hasConflict(day, suggestedSlot.startHour, suggestedSlot.duration);
//                   return (
//                     <div
//                       key={hour}
//                       className="border-b border-gray-200 p-1 h-12"
//                       style={{
//                         height: `${suggestedSlot.duration * 48}px`,
//                         backgroundColor: conflict ? '#FEE2E2' : `${selectedSubject.color}06`
//                       }}
//                       onMouseEnter={() => setHoveredSlot(suggestedSlot.id)}
//                       onMouseLeave={() => setHoveredSlot(null)}
//                     >
//                       <div
//                         className={`rounded-md p-1.5 h-full border-2 border-dashed bg-white transition-all cursor-pointer ${conflict ? 'opacity-60' : hoveredSlot === suggestedSlot.id ? 'shadow-lg' : 'shadow-sm'
//                           }`}
//                         style={{
//                           borderColor: conflict ? '#EF4444' : selectedSubject.color,
//                         }}
//                       >
//                         {conflict && (
//                           <div className="flex items-center gap-0.5 mb-0.5">
//                             <AlertTriangle className="w-2.5 h-2.5 text-red-600" />
//                             <span className="text-[9px] text-red-700 font-semibold">Conflict</span>
//                           </div>
//                         )}
//                         <div className="flex items-start justify-between mb-0.5">
//                           <p className="text-xs font-bold leading-tight" style={{ color: selectedSubject.color }}>
//                             {selectedSubject.code}
//                           </p>
//                           <span className="px-1 py-0.5 bg-gray-100 text-gray-600 text-[9px] rounded font-medium">
//                             {suggestedSlot.section}
//                           </span>
//                         </div>
//                         <p className="text-[9px] text-gray-600 mb-0.5 line-clamp-1 leading-tight">{selectedSubject.name}</p>
//                         <div className="space-y-0.5">
//                           <div className="flex items-center gap-0.5 text-[9px] text-gray-500">
//                             <MapPin className="w-2.5 h-2.5" />
//                             <span>{suggestedSlot.room}</span>
//                           </div>
//                           <div className="flex items-center gap-0.5 text-[9px] text-gray-500">
//                             <Users className="w-2.5 h-2.5" />
//                             <span className="line-clamp-1">{suggestedSlot.instructor}</span>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 }

//                 if (!isOccupied) {
//                   return (
//                     <div
//                       key={hour}
//                       className="border-b border-gray-200 bg-gray-50 h-12"
//                     ></div>
//                   );
//                 }

//                 return null;
//               })}
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Summary Footer - Floating at Bottom */}
//       <div className="bg-white rounded-xl shadow-md border-2 border-gray-300 p-4 flex-shrink-0 mb-6">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-6">
//             <div className="flex items-center gap-2">
//               <span className="text-sm font-semibold text-gray-700">Total Credits:</span>
//               <span className="text-2xl font-bold text-[#004A98]">{totalCredits}</span>
//             </div>
//             <div className="h-8 w-px bg-gray-300"></div>
//             <div className="flex items-center gap-2">
//               <span className="text-sm font-semibold text-gray-700">Number of Classes:</span>
//               <span className="text-2xl font-bold text-[#004A98]">{totalClasses}</span>
//             </div>
//           </div>

//           {/* Legend */}
//           <div className="flex items-center gap-5">
//             <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Legend:</span>
//             <div className="flex items-center gap-1.5">
//               <div className="w-4 h-4 rounded border-l-[3px] border-[#4A90E2] bg-white shadow-sm"></div>
//               <span className="text-xs text-gray-600">Scheduled</span>
//             </div>
//             <div className="flex items-center gap-1.5">
//               <div className="w-4 h-4 rounded border-2 border-dashed border-[#9C27B0] bg-white"></div>
//               <span className="text-xs text-gray-600">Available</span>
//             </div>
//             <div className="flex items-center gap-1.5">
//               <div className="w-4 h-4 rounded border-2 border-dashed border-red-500 bg-red-50"></div>
//               <span className="text-xs text-gray-600">Conflict</span>
//             </div>
//             <div className="flex items-center gap-1.5">
//               <div className="w-4 h-4 rounded bg-gray-50 border border-gray-200"></div>
//               <span className="text-xs text-gray-600">Free Time</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }