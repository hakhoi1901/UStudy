export const categories = {
    GENERAL_EDUCATION: {
        name: 'Giáo dục đại cương',
        total_credits_required: 56,
        note: 'Không kể Ngoại ngữ, Giáo dục thể chất và Giáo dục quốc phòng - an ninh.',
        breakdown: {
            GENERAL_POLITICS: { name: 'Lý luận chính trị - Pháp luật', credits_required: 14, mandatory: true, courses: ['BAA00101', 'BAA00102', 'BAA00103', 'BAA00104', 'BAA00003', 'BAA00004'] },
            GENERAL_SOCIAL: { name: 'Khoa học xã hội - Kinh tế - Kỹ năng', credits_required: 2, mandatory: false, note: 'Chọn 01 học phần (02 TC).', courses: ['BAA00005', 'BAA00006', 'BAA00007'] },
            GENERAL_MATH_SCIENCE: {
                name: 'Toán - Khoa học tự nhiên - Công nghệ - Môi trường',
                credits_required: 36,
                breakdown: {
                    MATH_MANDATORY: { name: 'Toán bắt buộc', credits_required: 24, courses: ['MTH00021', 'MTH00022', 'MTH00035', 'MTH00044', 'MTH00045', 'MTH00050'] },
                    MATH_ELECTIVE: { name: 'Toán tự chọn', credits_required: 4, note: 'Chọn 01 học phần.', courses: ['MTH00051', 'MTH00052', 'MTH00053'] },
                    SCIENCE: { name: 'Khoa học tự nhiên', credits_required: 6, note: 'Chọn 06 TC.', courses: ['CHE00001', 'CHE00002', 'CHE00081', 'CHE00082', 'BIO00001', 'BIO00002', 'BIO00081', 'BIO00082', 'PHY00001', 'PHY00002', 'PHY00081'] },
                    ENVIRONMENT: { name: 'Môi trường', credits_required: 2, note: 'Chọn 01 học phần.', courses: ['GEO00002', 'ENV00001', 'ENV00003'] },
                },
            },
            GENERAL_IT: { name: 'Tin học', credits_required: 4, mandatory: true, courses: ['CSC00004'] },
            GENERAL_ENGLISH: { name: 'Ngoại ngữ', credits_required: 12, note: 'Không tính vào điểm trung bình và tín chỉ tích lũy.', courses: ['ADD00031', 'ADD00032', 'ADD00033', 'ADD00034'] },
            GENERAL_PE: { name: 'Giáo dục thể chất', credits_required: 4, note: 'Không tính vào điểm trung bình, tính vào tín chỉ tích lũy.', courses: ['BAA00021', 'BAA00022'] },
            GENERAL_DEFENSE: { name: 'Giáo dục quốc phòng - an ninh', credits_required: 4, note: 'Không tính vào điểm trung bình, tính vào tín chỉ tích lũy.', courses: ['BAA00030'] },
        },
    },
    FOUNDATION: {
        name: 'Kiến thức cơ sở ngành',
        total_credits_required: 38,
        mandatory: true,
        courses: ['CSC10003', 'CSC10004', 'CSC10006', 'CSC10007', 'CSC10008', 'CSC10009', 'CSC10012', 'CSC10014', 'CSC13002', 'CSC14003'],
    },
    MAJOR: {
        name: 'Kiến thức ngành/chuyên ngành',
        total_credits_required: 34,
        breakdown: {
            MAJOR_MANDATORY: { name: 'Kiến thức bắt buộc ngành/chuyên ngành', credits_required: 16, mandatory: true, courses: ['CSC12002', 'CSC12003', 'CSC12004', 'CSC12005'] },
            MAJOR_ELECTIVE: { name: 'Kiến thức tự chọn ngành/chuyên ngành', credits_required: 8, note: 'Chọn tối thiểu 08 TC.', courses: ['CSC10121', 'CSC10102', 'CSC10103', 'CSC10104', 'CSC10105', 'CSC10106', 'CSC10107', 'CSC10108', 'CSC12001', 'CSC12105', 'CSC12106', 'CSC17101', 'CSC17106'] },
            FREE_ELECTIVES: { name: 'Kiến thức tự chọn tự do', credits_required: 10, note: 'Chọn thêm học phần để tổng khối ngành/chuyên ngành đạt 34 TC.', courses: [] },
        },
    },
    GRADUATION: {
        name: 'Kiến thức tốt nghiệp',
        total_credits_required: 10,
        note: 'Chọn 01 trong 03 phương án tốt nghiệp.',
        options: [
            { type: 'THESIS', name: 'Khóa luận tốt nghiệp', credits: 10, courses: ['CSC10251'] },
            { type: 'INTERNSHIP', name: 'Thực tập tốt nghiệp', credits: 10, courses: ['CSC10252'] },
            { type: 'PROJECT_AND_ELECTIVES', name: 'Thực tập dự án và học phần tốt nghiệp', credits: 10, courses: ['CSC10204', 'CSC12107', 'CSC12108', 'CSC12111'] },
        ],
    },
};
