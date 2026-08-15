// Sinh tu CTDT PDF 2025. Cac nhom chuyen nganh con se duoc bo sung khi co bang mapping ro rang.
export const categories = {
  GENERAL_EDUCATION: {
    name: 'Giáo dục đại cương',
    total_credits_required: 56,
    note: 'Không kể Ngoại ngữ, Giáo dục thể chất và Giáo dục quốc phòng - an ninh.',
    breakdown: {
      GENERAL_POLITICS: { name: 'Lý luận chính trị - Pháp luật', credits_required: 14, courses: ['BAA00101', 'BAA00102', 'BAA00103', 'BAA00104', 'BAA00003', 'BAA00004'] },
      GENERAL_SOCIAL: { name: 'Khoa học xã hội - Kinh tế - Kỹ năng', credits_required: 2, note: 'Chọn 01 học phần.', courses: ['BAA00005', 'BAA00006', 'BAA00007'] },
      GENERAL_MATH_SCIENCE: { name: 'Toán - Khoa học tự nhiên - Công nghệ - Môi trường', credits_required: 36, courses: ['MTH00021', 'MTH00022', 'MTH00035', 'MTH00044', 'MTH00045', 'MTH00050', 'MTH00051', 'MTH00052', 'MTH00053', 'CHE00001', 'CHE00002', 'CHE00081', 'CHE00082', 'BIO00001', 'BIO00002', 'BIO00081', 'BIO00082', 'PHY00001', 'PHY00002', 'PHY00081', 'GEO00002', 'ENV00001', 'ENV00003'] },
      GENERAL_IT: { name: 'Tin học', credits_required: 4, courses: ['CSC00004'] },
      GENERAL_ENGLISH: { name: 'Ngoại ngữ', credits_required: 12, note: 'Không tính vào điểm trung bình và tín chỉ tích lũy.', courses: ['ADD00031', 'ADD00032', 'ADD00033', 'ADD00034'] },
      GENERAL_PE: { name: 'Giáo dục thể chất', credits_required: 4, note: 'Không tính vào điểm trung bình.', courses: ['BAA00021', 'BAA00022'] },
      GENERAL_DEFENSE: { name: 'Giáo dục quốc phòng - an ninh', credits_required: 4, note: 'Không tính vào điểm trung bình.', courses: ['BAA00030'] },
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
      PROGRAM_COURSES: { name: 'Học phần ngành/chuyên ngành từ CTĐT 2025', credits_required: 34, courses: ['CSC10102', 'CSC10104', 'CSC10105', 'CSC10106', 'CSC10107', 'CSC10121', 'CSC11002', 'CSC11003', 'CSC11004', 'CSC11006', 'CSC11007', 'CSC11106', 'CSC11111', 'CSC11112', 'CSC11115', 'CSC11116', 'CSC11117', 'CSC11118', 'CSC11119', 'CSC11120', 'CSC12001', 'CSC12002', 'CSC12003', 'CSC12004', 'CSC12005', 'CSC12106', 'CSC12112', 'CSC13003', 'CSC13005', 'CSC13006', 'CSC13007', 'CSC13008', 'CSC13009', 'CSC13010', 'CSC13101', 'CSC13102', 'CSC13103', 'CSC13106', 'CSC13107', 'CSC13112', 'CSC13117', 'CSC13119', 'CSC13120', 'CSC13121', 'CSC13122', 'CSC13123', 'CSC14001', 'CSC14002', 'CSC14004', 'CSC14005', 'CSC14006', 'CSC14007', 'CSC14008', 'CSC14101', 'CSC14105', 'CSC14111', 'CSC14117', 'CSC14118', 'CSC14119', 'CSC14120', 'CSC15001', 'CSC15002', 'CSC15003', 'CSC15004', 'CSC15005', 'CSC15006', 'CSC15007', 'CSC15009', 'CSC15010', 'CSC15011', 'CSC15012', 'CSC15102', 'CSC15105', 'CSC15106', 'CSC15107', 'CSC15108', 'CSC15109', 'CSC16001', 'CSC16002', 'CSC16003', 'CSC16004', 'CSC16005', 'CSC16106', 'CSC16107', 'CSC16109', 'CSC16111', 'CSC16113', 'CSC16114', 'CSC17001', 'CSC17103', 'CSC17104', 'CSC17106', 'CSC17107', 'CSC18001', 'CSC18002', 'CSC18101', 'CSC18102', 'CSC18103', 'CSC18104', 'CSC18106', 'CSC18107'] },
    },
  },
  GRADUATION: {
    name: 'Kiến thức tốt nghiệp',
    total_credits_required: 10,
    note: 'Chọn phương án tốt nghiệp theo CTĐT.',
    courses: ['CSC10251', 'CSC10252', 'CSC10204'],
  },
};
