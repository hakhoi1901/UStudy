// import { useState } from 'react';
// import { DollarSign, RefreshCw, Clock, Database, Shield, AlertCircle, CheckCircle } from 'lucide-react';

// import { TUITION_CONSTANTS } from '../constants/tuition';
// import { mockRegisteredCourses as registeredCourses } from '../data/mockTuition';

// export function TuitionDataManagement() {
//   const [lastSync, setLastSync] = useState<Date>(new Date(Date.now() - 2 * 60 * 60 * 1000)); // 2 hours ago
//   const [isSyncing, setIsSyncing] = useState(false);
//   const [syncSuccess, setSyncSuccess] = useState<boolean | null>(null);

//   const handleSync = () => {
//     setIsSyncing(true);
//     setSyncSuccess(null);

//     // Simulate sync operation
//     setTimeout(() => {
//       setLastSync(new Date());
//       setIsSyncing(false);
//       setSyncSuccess(true);

//       // Clear success message after 3 seconds
//       setTimeout(() => {
//         setSyncSuccess(null);
//       }, 3000);
//     }, 2000);
//   };

//   const calculateTuition = () => {
//     const totalCredits = registeredCourses.reduce((sum, course) => sum + course.credits, 0);
//     const creditFee = totalCredits * TUITION_CONSTANTS.UNIT_PRICE_PER_CREDIT;
//     const labFee = registeredCourses.filter(c => c.hasLab).length * TUITION_CONSTANTS.LAB_FEE;
//     const totalFee = creditFee + labFee + TUITION_CONSTANTS.INSURANCE_FEE + TUITION_CONSTANTS.STUDENT_ACTIVITY_FEE;

//     return {
//       totalCredits,
//       creditFee,
//       labFee,
//       totalFee,
//     };
//   };

//   const tuition = calculateTuition();

//   const formatCurrency = (amount: number) => {
//     return new Intl.NumberFormat('vi-VN', {
//       style: 'currency',
//       currency: 'VND',
//     }).format(amount);
//   };

//   const formatDateTime = (date: Date) => {
//     return new Intl.DateTimeFormat('vi-VN', {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit',
//     }).format(date);
//   };

//   const getTimeSince = (date: Date) => {
//     const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

//     if (seconds < 60) return `${seconds} seconds ago`;
//     if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
//     if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
//     return `${Math.floor(seconds / 86400)} days ago`;
//   };

//   return (
//     <div className="h-full overflow-y-auto">
//       <div className="max-w-7xl mx-auto">
//         <div className="mb-6">
//           <h1 className="text-gray-900 mb-2">Tuition & Data Management</h1>
//           <p className="text-gray-600">View your fee breakdown and manage your academic data synchronization.</p>
//         </div>

//         {/* Data Sync Status */}
//         <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
//           <div className="flex items-start justify-between mb-4">
//             <div className="flex items-start gap-3">
//               <div className="w-10 h-10 rounded-lg bg-[#004A98] flex items-center justify-center">
//                 <Database className="w-5 h-5 text-white" />
//               </div>
//               <div>
//                 <h3 className="text-gray-900">Data Synchronization Status</h3>
//                 <p className="text-gray-600 text-sm mt-1">Keep your academic data up-to-date with the university portal</p>
//               </div>
//             </div>
//             <button
//               onClick={handleSync}
//               disabled={isSyncing}
//               className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all ${isSyncing
//                 ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
//                 : 'bg-[#004A98] text-white hover:bg-[#003A78] shadow-sm hover:shadow-md'
//                 }`}
//             >
//               <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
//               <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
//             </button>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div className="bg-gray-50 rounded-lg p-4">
//               <div className="flex items-center gap-2 mb-2">
//                 <Clock className="w-4 h-4 text-gray-600" />
//                 <p className="text-sm text-gray-600">Last Synchronized</p>
//               </div>
//               <p className="text-gray-900">{formatDateTime(lastSync)}</p>
//               <p className="text-sm text-gray-500 mt-1">{getTimeSince(lastSync)}</p>
//             </div>

//             <div className="bg-gray-50 rounded-lg p-4">
//               <div className="flex items-center gap-2 mb-2">
//                 <Database className="w-4 h-4 text-gray-600" />
//                 <p className="text-sm text-gray-600">Data Status</p>
//               </div>
//               <div className="flex items-center gap-2">
//                 <div className={`w-2 h-2 rounded-full ${syncSuccess === true ? 'bg-green-500' :
//                   syncSuccess === false ? 'bg-red-500' :
//                     'bg-blue-500'
//                   }`}></div>
//                 <p className="text-gray-900">
//                   {syncSuccess === true ? 'Successfully synced' :
//                     syncSuccess === false ? 'Sync failed' :
//                       'Connected'}
//                 </p>
//               </div>
//             </div>
//           </div>

//           {syncSuccess === true && (
//             <div className="mt-4 flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
//               <CheckCircle className="w-5 h-5 text-green-600" />
//               <p className="text-sm text-green-800">Data synchronized successfully with university portal</p>
//             </div>
//           )}
//         </div>

//         {/* Privacy Notice */}
//         <div className="bg-blue-50 border-l-4 border-[#004A98] rounded-lg p-6 mb-6">
//           <div className="flex items-start gap-3">
//             <Shield className="w-6 h-6 text-[#004A98] flex-shrink-0 mt-0.5" />
//             <div>
//               <h4 className="text-gray-900 mb-2">Privacy & Data Storage Notice</h4>
//               <p className="text-gray-700 leading-relaxed">
//                 All academic data is stored in <strong>Local Storage</strong> on your device for your convenience.
//                 Your data remains private and secure on your browser. All stored information will be{' '}
//                 <strong>permanently deleted</strong> when you click the <strong>Log Out</strong> button in the header.
//               </p>
//               <div className="mt-3 flex items-start gap-2 text-sm text-gray-600">
//                 <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
//                 <p>Make sure to sync your data before logging out to ensure all changes are saved to the university portal.</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Fee Summary Card */}
//         <div className="bg-gradient-to-br from-[#004A98] to-[#0066CC] rounded-xl p-6 shadow-lg mb-6">
//           <div className="flex items-center gap-3 mb-4">
//             <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center">
//               <DollarSign className="w-6 h-6 text-white" />
//             </div>
//             <div>
//               <p className="text-blue-100 text-sm">Total Semester Tuition</p>
//               <p className="text-3xl text-white">{formatCurrency(tuition.totalFee)}</p>
//             </div>
//           </div>
//           <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/20">
//             <div>
//               <p className="text-blue-100 text-sm">Total Credits</p>
//               <p className="text-xl text-white">{tuition.totalCredits}</p>
//             </div>
//             <div>
//               <p className="text-blue-100 text-sm">Courses Registered</p>
//               <p className="text-xl text-white">{registeredCourses.length}</p>
//             </div>
//           </div>
//         </div>

//         {/* Detailed Fee Breakdown */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
//           <div className="p-6 border-b border-gray-200">
//             <h3 className="text-gray-900">Fee Breakdown</h3>
//             <p className="text-gray-600 text-sm mt-1">Detailed calculation based on registered courses and university rates</p>
//           </div>

//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
//                     Course Code
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
//                     Course Name
//                   </th>
//                   <th className="px-6 py-3 text-center text-xs text-gray-600 uppercase tracking-wider">
//                     Credits
//                   </th>
//                   <th className="px-6 py-3 text-center text-xs text-gray-600 uppercase tracking-wider">
//                     Unit Price
//                   </th>
//                   <th className="px-6 py-3 text-center text-xs text-gray-600 uppercase tracking-wider">
//                     Lab Fee
//                   </th>
//                   <th className="px-6 py-3 text-right text-xs text-gray-600 uppercase tracking-wider">
//                     Subtotal
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200">
//                 {registeredCourses.map((course) => {
//                   const creditFee = course.credits * TUITION_CONSTANTS.UNIT_PRICE_PER_CREDIT;
//                   const labFee = course.hasLab ? TUITION_CONSTANTS.LAB_FEE : 0;
//                   const subtotal = creditFee + labFee;

//                   return (
//                     <tr key={course.id} className="hover:bg-gray-50">
//                       <td className="px-6 py-4 text-sm text-gray-900">
//                         {course.code}
//                       </td>
//                       <td className="px-6 py-4">
//                         <p className="text-sm text-gray-900">{course.name}</p>
//                         <p className="text-xs text-gray-500">{course.instructor}</p>
//                       </td>
//                       <td className="px-6 py-4 text-sm text-gray-900 text-center">
//                         {course.credits}
//                       </td>
//                       <td className="px-6 py-4 text-sm text-gray-900 text-center">
//                         {formatCurrency(TUITION_CONSTANTS.UNIT_PRICE_PER_CREDIT)}
//                       </td>
//                       <td className="px-6 py-4 text-center">
//                         {course.hasLab ? (
//                           <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
//                             {formatCurrency(TUITION_CONSTANTS.LAB_FEE)}
//                           </span>
//                         ) : (
//                           <span className="text-sm text-gray-400">—</span>
//                         )}
//                       </td>
//                       <td className="px-6 py-4 text-sm text-gray-900 text-right">
//                         {formatCurrency(subtotal)}
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//               <tfoot className="bg-gray-50">
//                 <tr>
//                   <td colSpan={2} className="px-6 py-4 text-sm text-gray-900">
//                     <strong>Course Fees Subtotal</strong>
//                   </td>
//                   <td className="px-6 py-4 text-sm text-center text-gray-900">
//                     <strong>{tuition.totalCredits}</strong>
//                   </td>
//                   <td colSpan={2}></td>
//                   <td className="px-6 py-4 text-sm text-right text-gray-900">
//                     <strong>{formatCurrency(tuition.creditFee + tuition.labFee)}</strong>
//                   </td>
//                 </tr>
//               </tfoot>
//             </table>
//           </div>
//         </div>

//         {/* Additional Fees */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
//           <div className="p-6 border-b border-gray-200">
//             <h3 className="text-gray-900">Additional Fees</h3>
//             <p className="text-gray-600 text-sm mt-1">Semester-based charges and university fees</p>
//           </div>

//           <div className="p-6 space-y-4">
//             <div className="flex items-center justify-between py-3 border-b border-gray-100">
//               <div>
//                 <p className="text-sm text-gray-900">Student Health Insurance</p>
//                 <p className="text-xs text-gray-500">Required for all students</p>
//               </div>
//               <p className="text-sm text-gray-900">{formatCurrency(TUITION_CONSTANTS.INSURANCE_FEE)}</p>
//             </div>

//             <div className="flex items-center justify-between py-3 border-b border-gray-100">
//               <div>
//                 <p className="text-sm text-gray-900">Student Activity Fee</p>
//                 <p className="text-xs text-gray-500">Supports campus events and clubs</p>
//               </div>
//               <p className="text-sm text-gray-900">{formatCurrency(TUITION_CONSTANTS.STUDENT_ACTIVITY_FEE)}</p>
//             </div>

//             <div className="flex items-center justify-between py-4 pt-6 border-t-2 border-gray-200">
//               <div>
//                 <p className="text-gray-900">Additional Fees Subtotal</p>
//               </div>
//               <p className="text-gray-900">{formatCurrency(TUITION_CONSTANTS.INSURANCE_FEE + TUITION_CONSTANTS.STUDENT_ACTIVITY_FEE)}</p>
//             </div>
//           </div>
//         </div>

//         {/* Grand Total */}
//         <div className="bg-white rounded-xl shadow-sm border-2 border-[#004A98] overflow-hidden">
//           <div className="p-6 bg-[#004A98] bg-opacity-5">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-gray-600 text-sm">Grand Total</p>
//                 <p className="text-2xl text-[#004A98]">{formatCurrency(tuition.totalFee)}</p>
//               </div>
//               <div className="text-right">
//                 <p className="text-gray-600 text-sm">Payment Deadline</p>
//                 <p className="text-gray-900">March 15, 2026</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
