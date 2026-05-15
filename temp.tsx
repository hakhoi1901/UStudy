import { useState, useMemo, useEffect } from 'react';
import { Calendar, Clock, MapPin, AlertCircle, ChevronDown, FileDown, Bell, BookOpen, CheckCircle2, ArrowRight } from 'lucide-react';
import { useStudentDb } from '../../hooks/useStudentDb';
import { useDepartmentData } from '../../context/DepartmentContext';
import { PrivacyFooter } from '../../components/PrivacyFooter';

interface ExamData {
    id: string;
    courseCode: string;
    courseName: string;
    className: string;
    examDate: string;
    examTime: string;
    room: string;
    location: string;
    semester: string;
    examType: 'Giữa kỳ' | 'Cuối kỳ';
    notes: string;
}

export function ExamScheduleVi() {
    const { exams } = useStudentDb();
    const { academicYear, semesterNumber } = useDepartmentData();

    const [selectedType, setSelectedType] = useState<'all' | 'Giữa kỳ' | 'Cuối kỳ'>('all');
    const [selectedLocation, setSelectedLocation] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Default to current global semester
    const currentGlobalSemester = `Học kỳ ${semesterNumber}, ${academicYear}`;
    const [selectedSemester, setSelectedSemester] = useState<string>(currentGlobalSemester);

    const examData: ExamData[] = useMemo(() => {
        if (!exams || typeof exams !== 'object') return [];

        const allMappedExams: ExamData[] = [];

        Object.entries(exams).forEach(([key, semesterExams]: [string, any]) => {
            // key is expected to be "YY-YY-S" e.g., "24-25-2"
            const parts = key.split('-');
            let readableSemester = key;
            if (parts.length === 3) {
                readableSemester = `Học kỳ ${parts[2]}, 20${parts[0]}-20${parts[1]}`;
            }

            const mapExam = (item: any, type: 'Giữa kỳ' | 'Cuối kỳ'): ExamData => {
                let formattedDate = item.date || '';
                if (formattedDate.includes('/')) {
                    const dateParts = formattedDate.split('/');
                    if (dateParts.length === 3) {
                        formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
                    }
                }

                return {
                    id: `${key}-${type}-${item.id || item.stt}`,
                    courseCode: item.id || '',
                    courseName: item.name || '',
                    className: item.group || '',
                    examDate: formattedDate,
                    examTime: item.time || '',
                    room: item.room || '',
                    location: item.place === 'LT' ? 'Linh Trung' : item.place === 'NVC' ? 'Nguyễn Văn Cừ' : (item.place || ''),
                    semester: readableSemester,
                    examType: type,
                    notes: item.notes || ''
                };
            };

            if (semesterExams.midterm) {
                allMappedExams.push(...semesterExams.midterm.map((e: any) => mapExam(e, 'Giữa kỳ')));
            }
            if (semesterExams.final) {
                allMappedExams.push(...semesterExams.final.map((e: any) => mapExam(e, 'Cuối kỳ')));
            }
        });

        return allMappedExams;
    }, [exams]);

    // Unique semesters for the filter dropdown
    const availableSemesters = useMemo(() => {
        const semesters = Array.from(new Set(examData.map(e => e.semester)));
        return semesters.sort((a, b) => {
            // "Học kỳ 2, 2024-2025" or similar format
            const matchA = a.match(/Học kỳ (\d+), (\d+)-/);
            const matchB = b.match(/Học kỳ (\d+), (\d+)-/);

            if (matchA && matchB) {
                const semA = parseInt(matchA[1]);
                const yearA = parseInt(matchA[2]);
                const semB = parseInt(matchB[1]);
                const yearB = parseInt(matchB[2]);

                // Compare Year first (descending)
                if (yearA !== yearB) return yearB - yearA;
                // Then compare Semester (descending)
                return semB - semA;
            }
            return b.localeCompare(a);
        });
    }, [examData]);

    // Sync selectedSemester with available data
    useEffect(() => {
        if (availableSemesters.length > 0) {
            // Default to the latest semester available in data
            setSelectedSemester(availableSemesters[0]);
        }
    }, [availableSemesters]);

    // When "All Semesters" is selected, automatically set exam type to "all" and lock it
    useEffect(() => {
        if (selectedSemester === 'all') {
            setSelectedType('all');
        }
    }, [selectedSemester]);

    // Filter data
    const filteredData = useMemo(() => {
        return examData.filter(exam => {
            const matchesType = selectedType === 'all' || exam.examType === selectedType;
            const matchesLocation = selectedLocation === 'all' || exam.location === selectedLocation;
            const matchesSearch =
                exam.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                exam.courseCode.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesSemester = selectedSemester === 'all' || exam.semester === selectedSemester;

            return matchesType && matchesLocation && matchesSearch && matchesSemester;
        });
    }, [selectedType, selectedLocation, searchQuery, selectedSemester]);

    // Calculate days until exam
    const getDaysUntilExam = (examDate: string) => {
        const today = new Date();
        const exam = new Date(examDate);
        const diffTime = exam.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };


    // Find all upcoming exams (for the new card design)
    const upcomingExams = useMemo(() => {
        return filteredData
            .filter(exam => getDaysUntilExam(exam.examDate) > 0)
            .sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime());
    }, [filteredData]);

    // Count exams
    const totalExams = filteredData.length;
    const midtermExams = filteredData.filter(e => e.examType === 'Giữa kỳ').length;
    const finalExams = filteredData.filter(e => e.examType === 'Cuối kỳ').length;
    const completedExams = filteredData.filter(e => getDaysUntilExam(e.examDate) <= 0).length;
    const remainingExams = totalExams - completedExams;
    const progressPercent = totalExams > 0 ? Math.round((completedExams / totalExams) * 100) : 0;
    const completedMidterms = filteredData.filter(e => e.examType === 'Giữa kỳ' && getDaysUntilExam(e.examDate) <= 0).length;
    const completedFinals = filteredData.filter(e => e.examType === 'Cuối kỳ' && getDaysUntilExam(e.examDate) <= 0).length;

    // Format date for display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    return (
        <div className="max-w-[1600px] mx-auto">
            <h1 className="text-gray-900 mb-2">Lịch thi</h1>
            <p className="text-gray-600 mb-8">Xem và quản lý lịch thi giữa kỳ và cuối kỳ của bạn.</p>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Card: Upcoming Exams (Takes 2 columns) */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                        <div className="w-9 h-9 bg-[#004A98]/10 rounded-lg flex items-center justify-center">
                            <Clock className="w-[18px] h-[18px] text-[#004A98]" />
                        </div>
                        <div>
                            <h3 className="text-sm text-gray-900 font-semibold">Các môn thi sắp tới</h3>
                            <p className="text-xs text-gray-400">{upcomingExams.length} môn cần chuẩn bị</p>
                        </div>
                    </div>

                    {upcomingExams.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                            {/* Featured next exam - highlighted row */}
                            <div className="px-6 py-4 bg-[#004A98]/[0.03]">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-mono font-semibold text-[#004A98]">{upcomingExams[0].courseCode}</span>
                                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${upcomingExams[0].examType === 'Giữa kỳ' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {upcomingExams[0].examType}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-900 font-medium mb-1.5">{upcomingExams[0].courseName}</p>
                                        <div className="flex items-center gap-4 text-xs text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {formatDate(upcomingExams[0].examDate)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                {upcomingExams[0].examTime.split(' - ')[0]}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-3.5 h-3.5" />
                                                {upcomingExams[0].room}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex-shrink-0 ml-4 text-right">
                                        <p className="text-2xl font-bold text-[#004A98]">{getDaysUntilExam(upcomingExams[0].examDate)}</p>
                                        <p className="text-[11px] text-gray-400">ngày nữa</p>
                                    </div>
                                </div>
                            </div>

                            {/* Remaining exams - simple list */}
                            {upcomingExams.slice(1, 5).map((exam) => (
                                <div key={exam.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50/60 transition-colors">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="text-xs font-mono font-semibold text-[#004A98]">{exam.courseCode}</span>
                                            <span className="text-sm text-gray-800">{exam.courseName}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-gray-400">
                                            <span>{formatDate(exam.examDate)}</span>
                                            <span>·</span>
                                            <span>{exam.examTime.split(' - ')[0]}</span>
                                            <span>·</span>
                                            <span>{exam.room}</span>
                                        </div>
                                    </div>
                                    <div className="flex-shrink-0 ml-4 text-right">
                                        <span className="text-sm font-semibold text-gray-600">{getDaysUntilExam(exam.examDate)}</span>
                                        <span className="text-[11px] text-gray-400 ml-1">ngày</span>
                                    </div>
                                </div>
                            ))}

                            {/* +X more link */}
                            {upcomingExams.length > 5 && (
                                <div className="px-6 py-3">
                                    <span className="text-sm text-[#004A98] font-medium cursor-pointer hover:underline">
                                        +{upcomingExams.length - 5} môn khác →
                                    </span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center py-16">
                            <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                                <CheckCircle2 className="w-7 h-7 text-green-400" />
                            </div>
                            <p className="text-sm text-gray-600 font-medium">Không có kỳ thi sắp tới</p>
                            <p className="text-xs text-gray-400 mt-1">Chúc mừng bạn đã hoàn thành tất cả!</p>
                        </div>
                    )}
                </div>

                {/* Card: Exam Progress */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                        <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-[18px] h-[18px] text-emerald-600" />
                        </div>
                        <div>
                            <h3 className="text-sm text-gray-900 font-semibold">Tiến độ kỳ thi</h3>
                            <p className="text-xs text-gray-400">{selectedSemester === 'all' ? 'Tất cả học kỳ' : selectedSemester}</p>
                        </div>
                    </div>

                    <div className="px-6 py-5">
                        {/* Donut Chart - smaller, thinner */}
                        <div className="flex items-center justify-center mb-6">
                            <div className="relative w-28 h-28">
                                <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 112 112">
                                    <circle cx="56" cy="56" r="48" stroke="#F3F4F6" strokeWidth="8" fill="none" />
                                    <circle
                                        cx="56" cy="56" r="48"
                                        stroke="#10B981"
                                        strokeWidth="8"
                                        fill="none"
                                        strokeDasharray={`${2 * Math.PI * 48}`}
                                        strokeDashoffset={`${2 * Math.PI * 48 * (1 - progressPercent / 100)}`}
                                        strokeLinecap="round"
                                        className="transition-all duration-1000 ease-out"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-2xl font-bold text-gray-900">{progressPercent}%</span>
                                    <span className="text-[11px] text-gray-400">hoàn thành</span>
                                </div>
                            </div>
                        </div>

                        {/* Stats - simple rows */}
                        <div className="divide-y divide-gray-100 border-t border-gray-100">
                            <div className="flex items-center justify-between py-2.5">
                                <span className="text-sm text-gray-500">Tổng số môn thi</span>
                                <span className="text-sm font-semibold text-gray-800">{totalExams}</span>
                            </div>
                            <div className="flex items-center justify-between py-2.5">
                                <span className="text-sm text-gray-500">Đã hoàn thành</span>
                                <span className="text-sm font-semibold text-emerald-600">{completedExams}</span>
                            </div>
                            <div className="flex items-center justify-between py-2.5">
                                <span className="text-sm text-gray-500">Còn lại</span>
                                <span className="text-sm font-semibold text-[#004A98]">{remainingExams}</span>
                            </div>
                        </div>

                        {/* Breakdown by type - simple progress */}
                        <div className="mt-4 space-y-3">
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-gray-500">Giữa kỳ</span>
                                    <span className="text-xs text-gray-500">{completedMidterms}/{midtermExams}</span>
                                </div>
                                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-[#004A98] rounded-full transition-all duration-700"
                                        style={{ width: midtermExams > 0 ? `${(completedMidterms / midtermExams) * 100}%` : '100%' }}
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-gray-500">Cuối kỳ</span>
                                    <span className="text-xs text-gray-500">{completedFinals}/{finalExams}</span>
                                </div>
                                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-[#004A98]/60 rounded-full transition-all duration-700"
                                        style={{ width: finalExams > 0 ? `${(completedFinals / finalExams) * 100}%` : '100%' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters & Actions */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                    {/* Left: Filters */}
                    <div className="flex flex-col sm:flex-row gap-4 flex-1">

                        {/* Semester Filter */}
                        <div className="relative">
                            <select
                                value={selectedSemester}
                                onChange={(e) => setSelectedSemester(e.target.value)}
                                className="w-full sm:w-auto pl-4 pr-10 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#004A98] focus:border-transparent bg-white font-medium text-sm appearance-none"
                            >
                                <option value="all">Tất cả học kỳ</option>
                                {availableSemesters.map(sem => (
                                    <option key={sem} value={sem}>{sem}</option>
                                ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>

                        {/* Exam Type Tabs */}
                        <div className="flex bg-gray-50 border border-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setSelectedType('all')}
                                disabled={selectedSemester === 'all'}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${selectedType === 'all'
                                    ? 'bg-white text-[#004A98] shadow-sm'
                                    : 'text-gray-500 hover:text-gray-900'
                                    } ${selectedSemester === 'all' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                                Tất cả
                            </button>
                            <button
                                onClick={() => setSelectedType('Giữa kỳ')}
                                disabled={selectedSemester === 'all'}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${selectedType === 'Giữa kỳ'
                                    ? 'bg-white text-[#004A98] shadow-sm'
                                    : 'text-gray-500 hover:text-gray-900'
                                    } ${selectedSemester === 'all' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                                Giữa kỳ
                            </button>
                            <button
                                onClick={() => setSelectedType('Cuối kỳ')}
                                disabled={selectedSemester === 'all'}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${selectedType === 'Cuối kỳ'
                                    ? 'bg-white text-[#004A98] shadow-sm'
                                    : 'text-gray-500 hover:text-gray-900'
                                    } ${selectedSemester === 'all' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                                Cuối kỳ
                            </button>
                        </div>

                        {/* Search */}
                        <div className="relative flex-1 max-w-md">
                            <input
                                type="text"
                                placeholder="Tìm mã môn hoặc tên môn học..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50/50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#004A98] focus:border-transparent text-sm"
                            />
                            <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Exam Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1100px]">

                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">STT</th>
                                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Môn học</th>
                                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Lịch thi</th>
                                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Địa điểm</th>
                                <th className="px-4 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Loại</th>
                                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ghi chú</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredData.map((exam, index) => {
                                const daysUntil = getDaysUntilExam(exam.examDate);
                                const isUpcoming = daysUntil > 0 && daysUntil <= 7;

                                return (
                                    <tr
                                        key={exam.id}
                                        className={`
                                            hover:bg-gray-50/80 transition-colors
                                            ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}
                                            ${isUpcoming ? 'bg-[#004A98]/[0.03] border-l-4 border-[#004A98]' : ''}
                                        `}
                                    >
                                        {/* STT */}
                                        <td className="px-4 py-4 text-sm text-gray-500 text-center font-medium">{index + 1}</td>

                                        {/* Môn học */}
                                        <td className="px-4 py-4">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-xs font-mono font-bold text-[#004A98]">{exam.courseCode}</span>
                                                <span className="text-sm font-semibold text-gray-900 leading-snug">{exam.courseName}</span>
                                                <span className="text-[11px] text-gray-400 font-medium">Nhóm: {exam.className}</span>
                                            </div>
                                        </td>

                                        {/* Lịch thi */}
                                        <td className="px-4 py-4">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                                                    <Calendar className="w-4 h-4 text-[#004A98]/60" />
                                                    {formatDate(exam.examDate)}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <Clock className="w-4 h-4 text-gray-400" />
                                                    {exam.examTime}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Địa điểm */}
                                        <td className="px-4 py-4">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-2 text-sm text-gray-700 font-semibold">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                                    Phòng: {exam.room}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <MapPin className="w-4 h-4 text-gray-400" />
                                                    {exam.location.replace('Cơ sở ', '')}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Loại */}
                                        <td className="px-4 py-4 text-center">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider ${exam.examType === 'Giữa kỳ'
                                                    ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                                    : 'bg-rose-50 text-rose-700 border border-rose-100'
                                                    }`}
                                            >
                                                {exam.examType === 'Giữa kỳ' ? 'Giữa kỳ' : 'Cuối kỳ'}
                                            </span>
                                        </td>

                                        {/* Ghi chú */}
                                        <td className="px-4 py-4">
                                            {exam.notes ? (
                                                <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 px-2 py-1.5 rounded-lg border border-orange-100">
                                                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                                                    <span className="line-clamp-2">{exam.notes}</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-300 text-xs">-</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Empty State */}
                {filteredData.length === 0 && (
                    <div className="text-center py-12">
                        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">Không tìm thấy lịch thi nào</p>
                        <p className="text-gray-400 text-sm mt-2">Thử thay đổi bộ lọc hoặc tìm kiếm</p>
                    </div>
                )}
            </div>

            {/* Info Footer */}
            <div className="mt-8 p-5 bg-[#004A98]/[0.03] border border-[#004A98]/10 rounded-xl mb-8">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-white rounded-lg shadow-sm border border-gray-100 flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-5 h-5 text-[#004A98]" />
                    </div>
                    <div className="text-sm">
                        <p className="font-bold text-gray-900 mb-2">Lưu ý quan trọng cho sinh viên:</p>
                        <ul className="grid grid-cols-1 md:grid-cols-3 gap-3 text-gray-600">
                            <li className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-[#004A98]"></div>
                                Có mặt trước giờ thi 15 phút
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-[#004A98]"></div>
                                Mang theo thẻ sinh viên/CCCD
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-[#004A98]"></div>
                                Kiểm tra kỹ phòng & địa điểm
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            {/* Footer */}
            <PrivacyFooter />
        </div>
    );
}