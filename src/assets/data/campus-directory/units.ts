import { text } from 'stream/consumers';
import type { CampusUnit } from './types';

/** Directory data owns organization, contact, and service information. */
// export const CAMPUS_UNITS: CampusUnit[] = [
//     {
//         id: 'phong-dao-tao',
//         type: 'office',
//         name: 'Phòng Đào tạo',
//         shortName: 'PĐT',
//         aliases: ['pdt', 'phong dao tao', 'bảng điểm', 'bang diem', 'đăng ký học phần', 'dkhp'],
//         summary: 'Tiếp nhận và hỗ trợ các thủ tục liên quan đến đào tạo.',
//         services: [
//             { id: 'course-registration', name: 'Đăng ký học phần', description: 'Hỗ trợ các vấn đề liên quan đến đăng ký, điều chỉnh và kết quả đăng ký học phần.' },
//             { id: 'transcript', name: 'Bảng điểm', description: 'Tiếp nhận hoặc hướng dẫn các thủ tục liên quan đến kết quả học tập và bảng điểm.' },
//             { id: 'academic-procedures', name: 'Thủ tục đào tạo', description: 'Giải đáp các thủ tục học vụ thuộc phạm vi Phòng Đào tạo.' },
//         ],
//         emails: ['pdt_khtn@hcmus.edu.vn'],
//         websites: ['https://hcmus.edu.vn/phong-dao-tao/'],
//         openingHours: 'Thứ Hai - Thứ Sáu, 08:00 - 16:30',
//         locations: [{ buildingId: 'NDH', floor: 2, roomCode: 'PĐT', note: 'Phòng 2.4' }],
//         verificationStatus: 'partial',
//     },
//     {
//         id: 'phong-cong-tac-sinh-vien',
//         type: 'student-service',
//         name: 'Phòng Công tác Sinh viên',
//         shortName: 'PCTSV',
//         aliases: ['pctsv', 'phong cong tac sinh vien', 'điểm rèn luyện', 'diem ren luyen', 'xác nhận sinh viên', 'xac nhan sinh vien'],
//         summary: 'Hỗ trợ các nội dung công tác và đời sống sinh viên.',
//         services: [
//             { id: 'conduct-score', name: 'Điểm rèn luyện', description: 'Hỗ trợ các nội dung liên quan đến điểm rèn luyện của sinh viên.' },
//             { id: 'student-confirmation', name: 'Xác nhận sinh viên', description: 'Hướng dẫn thủ tục xác nhận đang là sinh viên và các giấy tờ liên quan.' },
//         ],
//         locations: [{ buildingId: 'NDH', floor: 2, roomCode: 'PCTSV', note: 'Phòng 2.8' }],
//         verificationStatus: 'partial',
//     },
//     {
//         id: 'hoi-quan-khoa-hoc',
//         type: 'student-service',
//         name: 'Hội quán Khoa học',
//         shortName: 'HQKH',
//         aliases: ['hoi quan sinh vien', 'hqkh'],
//         summary: 'Không gian tại hầm Nhà Điều hành.',
//         locations: [{ buildingId: 'NDH', floor: 1, roomCode: 'NQKH', note: 'Hầm Nhà Điều hành' }],
//         verificationStatus: 'pending',
//     },
// ];

/**
 * Danh bạ công khai của Trường Đại học Khoa học tự nhiên, ĐHQG-HCM.
 *
 * Cập nhật nguồn: 2026-08-15.
 * - `verified`: tên đơn vị và thông tin liên hệ chính đã được đối chiếu trên website chính thức.
 * - `partial`: có ít nhất một trường (thường là phòng, giờ làm việc hoặc địa điểm cơ sở 2)
 *   chỉ được xác nhận từ cẩm nang/trang thông báo chính thức, hoặc chưa có đủ dữ liệu hiện hành.
 * - `pending`: chưa tìm thấy trang công khai đủ để xác minh.
 *
 * Lưu ý tích hợp Campus Map: các `buildingId` ngoài `NDH` là mã quy ước cho cơ sở
 * Nguyễn Văn Cừ. Hãy ánh xạ chúng với `campus-data.ts` trước khi bật deep link bản đồ.
 */
export const CAMPUS_UNITS: CampusUnit[] = [
    {
        id: 'phong-dao-tao',
        type: 'office',
        name: 'Phòng Đào tạo',
        shortName: 'PĐT',
        aliases: [
            'pdt',
            'phong dao tao',
            'học vụ',
            'hoc vu',
            'đăng ký học phần',
            'dkhp',
            'bảng điểm',
            'bang diem',
            'tốt nghiệp',
            'tot nghiep',
        ],
        summary: 'Quản lý đào tạo đại học và tiếp nhận các thủ tục học vụ của sinh viên.',
        description:
            'Đầu mối về kế hoạch đào tạo, đăng ký học phần, kết quả học tập, tạm dừng học, xét hoàn tất chương trình và tốt nghiệp hệ đại học.',
        services: [
            {
                id: 'academic-transcript',
                name: 'Cấp bảng điểm',
                details: [
                    {
                        type: 'paragraph',
                        text: 'Cấp bảng điểm cho sinh viên có nhu cầu',
                    },
                    {
                        type: 'notice',
                        tone: 'info',
                        title: 'Hình thức đăng ký',
                        text: 'Chỉ nhận đăng ký trực tiếp tại phòng đào tạo cả 2 cơ sở',
                    },
                    {
                        type: 'list',
                        title: 'Quy trình',
                        items: [
                            'Đến trực tiếp phòng đào tạo và điền biểu mẫu đăng ký cấp bảng điểm (Có sẵn tại phòng)',
                            'Nộp phiếu đăng ký, nhận giấy hẹn và đóng lệ phí cấp bảng điểm',
                            'Chờ đến ngày được ghi trong giấy hẹn mang theo thẻ sinh viên/cccd/cmnd đến phòng đào tạo để nhận bảng điểm'
                        ]
                    }
                ]
            },
            {
                id: 'course-registration',
                name: 'Đăng ký và điều chỉnh học phần',
                details: [
                    {
                        type: 'paragraph',
                        text: 'Hỗ trợ các vấn đề phát sinh trong đăng ký, hủy, điều chỉnh lớp học phần và kiểm tra kết quả đăng ký.',
                    },
                    {
                        type: 'list',
                        title: 'Nên chuẩn bị',
                        items: [
                            'Mã số sinh viên và học kỳ cần xử lý',
                            'Mã học phần, nhóm lớp và mô tả lỗi trên Portal',
                            'Ảnh chụp màn hình hoặc minh chứng đăng ký nếu có',
                        ],
                    },
                    {
                        type: 'notice',
                        tone: 'warning',
                        title: 'Lưu ý',
                        text: 'Thực hiện trong thời hạn đăng ký/điều chỉnh do Trường công bố; yêu cầu gửi sau hạn có thể không được xem xét.',
                    },
                    {
                        type: 'link',
                        label: 'Mở Portal sinh viên',
                        href: 'https://portal.hcmus.edu.vn/',
                    },
                ],
            },
            {
                id: 'temporary-leave-and-exam-deferral',
                name: 'Nghỉ học, tạm dừng học và hoãn thi',
                details: [
                    {
                        type: 'paragraph',
                        text: 'Nhóm biểu mẫu dành cho sinh viên xin nghỉ buổi học, nghỉ một hoặc nhiều học kỳ, tạm nghỉ để thực hiện nghĩa vụ quân sự hoặc xin hoãn thi.',
                    },
                    {
                        type: 'list',
                        title: 'Biểu mẫu',
                        items: [
                            'BM01-ĐT.13 - Đơn xin nghỉ học',
                            'D02 - Đơn hoãn thi',
                            'D05 - Đơn xin nghỉ học 1 học kỳ',
                            'D06 - Đơn xin nghỉ học từ 2 học kỳ',
                            'D06A - Đơn xin nghỉ học để thực hiện nghĩa vụ quân sự',
                        ],
                    },
                    {
                        type: 'link',
                        label: 'Tải BM01-ĐT.13 - Đơn xin nghỉ học',
                        href: 'https://hcmus.edu.vn/wp-content/uploads/2024/01/BM01-DT.13_DON-XIN-NGHI-HOC.docx',
                    },
                    {
                        type: 'link',
                        label: 'Tải D02 - Đơn hoãn thi',
                        href: 'https://hcmus.edu.vn/wp-content/uploads/2024/01/D02_DON-HOAN-THI-2.docx',
                    },
                    {
                        type: 'link',
                        label: 'Tải D05 - Nghỉ học 1 học kỳ',
                        href: 'https://hcmus.edu.vn/wp-content/uploads/2024/01/D05_DON-XIN-NGHI-HOC-1-HOC-KY-1.docx',
                    },
                    {
                        type: 'link',
                        label: 'Tải D06 - Nghỉ học từ 2 học kỳ',
                        href: 'https://hcmus.edu.vn/wp-content/uploads/2024/01/D06_DON-XIN-NGHI-HOC-TU-2-HOC-KY-1.docx',
                    },
                    {
                        type: 'link',
                        label: 'Tải D06A - Nghỉ học để thực hiện NVQS',
                        href: 'https://hcmus.edu.vn/wp-content/uploads/2024/01/D06A_DON-XIN-NGHI-HOC-DE-THUC-HIEN-NVQS.docx',
                    },
                ],
            },
            {
                id: 'course-exemption-and-retake',
                name: 'Miễn học phần, học lại và hủy môn tự chọn',
                details: [
                    {
                        type: 'list',
                        title: 'Biểu mẫu',
                        items: [
                            'D03 - Đơn xin miễn học phần',
                            'D07 - Đơn xin học lại',
                            'D16 - Đơn xin hủy môn tự chọn',
                            'D20 - Đơn xin học lại do bị trừ bài thực hành/CTĐA',
                        ],
                    },
                    {
                        type: 'link',
                        label: 'Tải D03 - Đơn xin miễn học phần',
                        href: 'https://hcmus.edu.vn/wp-content/uploads/2024/01/D03_DON-XIN-MIEN-HOC-PHAN-2.docx',
                    },
                    {
                        type: 'link',
                        label: 'Tải D07 - Đơn xin học lại',
                        href: 'https://hcmus.edu.vn/wp-content/uploads/2024/01/D07_DON-XIN-HOC-LAI-1.docx',
                    },
                    {
                        type: 'link',
                        label: 'Tải D16 - Đơn xin hủy môn tự chọn',
                        href: 'https://hcmus.edu.vn/wp-content/uploads/2024/01/D16_DON-XIN-HUY-MON-TU-CHON-1.docx',
                    },
                    {
                        type: 'link',
                        label: 'Tải D20 - Học lại BTH/CTĐA',
                        href: 'https://hcmus.edu.vn/wp-content/uploads/2024/01/D20_DON-XIN-HOC-LAI-BTH_CTDA.docx',
                    },
                    {
                        type: 'link',
                        label: 'Tải D20 - Học lại do BTHọc',
                        href: 'https://hcmus.edu.vn/wp-content/uploads/2024/01/D20_DON-XIN-HOC-LAI-DO-BTHoc.docx',
                    },
                ],
            },
            {
                id: 'language-outcome-standard',
                name: 'Xét đạt chuẩn ngoại ngữ đầu ra',
                details: [
                    {
                        type: 'paragraph',
                        text: 'Tiếp nhận hồ sơ đề nghị công nhận chuẩn ngoại ngữ đầu ra theo quy định áp dụng cho chương trình và khóa học của sinh viên.',
                    },
                    {
                        type: 'notice',
                        tone: 'info',
                        title: 'Kiểm tra trước khi nộp',
                        text: 'Đối chiếu loại chứng chỉ, mức điểm, thời hạn hiệu lực và đợt nhận hồ sơ trong thông báo hiện hành của Trường.',
                    },
                    {
                        type: 'link',
                        label: 'Tải D15 - Đơn xét đạt chuẩn ngoại ngữ đầu ra',
                        href: 'https://hcmus.edu.vn/wp-content/uploads/2024/01/D15_DON-XET-DAT-CHUAN-NGOAI-NGU-DAU-RA-2.docx',
                    },
                ],
            },
            {
                id: 'program-completion-and-graduation',
                name: 'Hoàn tất chương trình và xét tốt nghiệp',
                details: [
                    {
                        type: 'paragraph',
                        text: 'Hướng dẫn sinh viên nộp hồ sơ hoàn tất chương trình, xét tốt nghiệp, nhận bằng và tra cứu thông tin văn bằng.',
                    },
                    {
                        type: 'list',
                        title: 'Nội dung thường cần kiểm tra',
                        items: [
                            'Tín chỉ tích lũy và các học phần bắt buộc',
                            'Chuẩn ngoại ngữ, tin học và các chuẩn đầu ra liên quan',
                            'Nghĩa vụ học phí, hồ sơ và thời hạn của đợt xét',
                        ],
                    },
                    {
                        type: 'link',
                        label: 'Tải hướng dẫn nộp hồ sơ hoàn tất chương trình',
                        href: 'https://hcmus.edu.vn/wp-content/uploads/2024/01/HUONG-DAN-NOP-HO-SO-XET-HOAN-TAT-CHUONG-TRINH.docx',
                    },
                    {
                        type: 'link',
                        label: 'Tải hướng dẫn xét tốt nghiệp và nhận bằng',
                        href: 'https://hcmus.edu.vn/wp-content/uploads/2024/01/HUONG-DAN-NOP-HO-SO-XET-TOT-NGHIEP-VA-NHAN-BANG-TOT-NGHIEP.docx',
                    },
                    {
                        type: 'link',
                        label: 'Tra cứu thông tin văn bằng',
                        href: 'https://pdt.hcmus.edu.vn/dstn',
                    },
                ],
            },
            {
                id: 'degree-copy-and-withdrawal',
                name: 'Bản sao bằng tốt nghiệp và thôi học',
                details: [
                    {
                        type: 'link',
                        label: 'Tải D17 - Đề nghị cấp bản sao bằng tốt nghiệp',
                        href: 'https://hcmus.edu.vn/wp-content/uploads/2024/01/D17_DON-DE-NGHI-CAP-BAN-SAO-BANG-TN-1.docx',
                    },
                    {
                        type: 'link',
                        label: 'Tải D08 - Đơn xin thôi học',
                        href: 'https://hcmus.edu.vn/wp-content/uploads/2024/01/D08_DON-XIN-THOI-HOC-1.docx',
                    },
                ],
            },
            {
                id: 'national-defense-education',
                name: 'Giấy giới thiệu Giáo dục Quốc phòng',
                details: [
                    {
                        type: 'paragraph',
                        text: 'Biểu mẫu đề nghị cấp giấy giới thiệu phục vụ thủ tục học Giáo dục Quốc phòng và An ninh.',
                    },
                    {
                        type: 'link',
                        label: 'Tải D23 - Đơn cấp giấy giới thiệu GDQP',
                        href: 'https://hcmus.edu.vn/wp-content/uploads/2024/01/D23_DON-CAP-GIAY-GIOI-THIEU-GDQP.docx',
                    },
                ],
            },
            {
                id: 'all-undergraduate-forms',
                name: 'Toàn bộ biểu mẫu Phòng Đào tạo',
                details: [
                    {
                        type: 'notice',
                        tone: 'info',
                        title: 'Nguồn chính thức',
                        text: 'Ưu tiên kiểm tra trang biểu mẫu trước khi nộp vì mẫu và quy trình có thể được cập nhật.',
                    },
                    {
                        type: 'link',
                        label: 'Mở trang biểu mẫu Phòng Đào tạo',
                        href: 'https://hcmus.edu.vn/bieu-mau-phong-dao-tao/',
                    },
                ],
            },
        ],
        phones: ['(028) 6288 4499, máy lẻ 1200/1201'],
        emails: ['pdt_khtn@hcmus.edu.vn'],
        websites: ['https://hcmus.edu.vn/phong-dao-tao/', 'https://hcmus.edu.vn/bieu-mau-phong-dao-tao/'],
        locations: [
            { buildingId: 'NVC-B', roomCode: 'B.02', note: 'Cơ sở Nguyễn Văn Cừ - phòng B.02' },
            { buildingId: 'NDH', floor: 2, roomCode: 'PĐT', note: 'Cơ sở Linh Trung - Nhà Điều hành, phòng 2.4' },
        ],
        sourceUrl: 'https://hcmus.edu.vn/phong-dao-tao/',
        lastVerifiedAt: '2026-08-15',
        verificationStatus: 'verified',
    },
    {
        id: 'phong-cong-tac-sinh-vien',
        type: 'office',
        name: 'Phòng Công tác Sinh viên',
        shortName: 'PCTSV',
        aliases: [
            'pctsv',
            'ctsv',
            'phong cong tac sinh vien',
            'xác nhận sinh viên',
            'xac nhan sinh vien',
            'điểm rèn luyện',
            'diem ren luyen',
            'học bổng',
            'hoc bong',
            'bảo hiểm y tế',
            'bhyt',
            'ký túc xá',
            'ky tuc xa',
        ],
        summary: 'Hỗ trợ thủ tục hành chính, quyền lợi, chính sách và hoạt động dành cho sinh viên.',
        description:
            'Đầu mối về giấy xác nhận, điểm rèn luyện, học bổng, bảo hiểm y tế, miễn giảm học phí, trợ cấp xã hội, ký túc xá và các nội dung công tác sinh viên. Từ 11/08/2026, Phòng triển khai thử nghiệm website mới tại ctsv.hcmus.edu.vn (dự kiến chạy thử đến tháng 9/2026).',
        services: [
            {
                id: 'student-certificates',
                name: 'Giấy xác nhận sinh viên và giấy tờ hành chính',
                details: [
                    {
                        type: 'paragraph',
                        text: 'Sinh viên đăng ký trực tuyến, chọn loại giấy cần cấp và theo dõi email sinh viên để nhận kết quả điện tử hoặc thông báo nhận bản giấy.',
                    },
                    {
                        type: 'link',
                        label: 'Đăng ký in Chứng nhận sinh viên (Microsoft Forms)',
                        href: 'https://forms.office.com/r/LGZXGns8ru',
                    },
                    {
                        type: 'list',
                        title: 'Cách đăng ký',
                        items: [
                            'Cách 1 - Trực tuyến: vào hcmus.edu.vn/phong-cong-tac-sinh-vien/ rồi chọn mục "Đăng ký in chứng nhận sinh viên"',
                            'Cách 2: quét mã QR đăng ký giấy chứng nhận trong hướng dẫn của Phòng CTSV',
                            'Bắt buộc đăng nhập bằng email @student.hcmus.edu.vn',
                        ],
                    },
                    {
                        type: 'list',
                        title: 'Thời gian nhận kết quả',
                        items: [
                            'Bản điện tử: khoảng 5 ngày làm việc, nhận qua email sinh viên',
                            'Bản giấy: sau khi nhận được mail của phòng ctsv, mang Thẻ SV đến Phòng CTSV để nhận',
                        ],
                    },
                    {
                        type: 'notice',
                        tone: 'warning',
                        title: 'Nhận thay',
                        text: 'Nếu nhờ người khác nhận, sinh viên cần gửi email ủy quyền đến Phòng CTSV; người nhận mang giấy tờ tùy thân.',
                    },
                    {
                        type: 'link',
                        label: 'Mở trang đăng ký giấy tờ',
                        href: 'https://hcmus.edu.vn/phong-cong-tac-sinh-vien/',
                    },
                    {
                        type: 'link',
                        label: 'Xem hướng dẫn đăng ký giấy tờ hành chính 2026',
                        href: 'https://hcmus.edu.vn/wp-content/uploads/2026/04/Huong-dan-dang-ky-giay-to-hanh-chinh-2026.pdf',
                    },
                    {
                        type: 'link',
                        label: 'Tra cứu dữ liệu giấy chứng nhận sinh viên',
                        href: 'https://tinyurl.com/tracuuGCNSVKHTN',
                    },
                ],
            },
            {
                id: 'conduct-score',
                name: 'Điểm rèn luyện',
                details: [
                    {
                        type: 'paragraph',
                        text: 'Hướng dẫn đánh giá, tra cứu và đăng ký cấp bảng điểm rèn luyện của sinh viên.',
                    },
                    {
                        type: 'link',
                        label: 'Đăng ký in Bảng điểm rèn luyện (Microsoft Forms)',
                        href: 'https://forms.office.com/Pages/ResponsePage.aspx?id=1HwSQPNFo0mwXTFaQ6nwM35NluEoXbZIssP2uQG4klxUMjE2ME00M0I3RzlMRDJFWUlOQlNFNVpIRC4u',
                    },
                    {
                        type: 'list',
                        title: 'Có thể hỗ trợ',
                        items: [
                            'Hướng dẫn quy trình tự đánh giá và xác nhận điểm rèn luyện',
                            'Tra cứu kết quả theo học kỳ/năm học',
                            'Đăng ký cấp bảng điểm rèn luyện phục vụ hồ sơ (quét mã QR hoặc form trực tuyến ở trên)',
                        ],
                    },
                    {
                        type: 'notice',
                        tone: 'info',
                        title: 'Tài khoản đăng ký',
                        text: 'Dùng email sinh viên @student.hcmus.edu.vn để đăng ký; xem thêm Quy chế Đánh giá kết quả rèn luyện sinh viên hệ chính quy trên trang Phòng CTSV.',
                    },
                    {
                        type: 'link',
                        label: 'Mở cổng Công tác Sinh viên',
                        href: 'https://ctsv.hcmus.edu.vn/',
                    },
                ],
            },
            {
                id: 'student-loan-and-internship-letter',
                name: 'Xác nhận vay vốn và giấy giới thiệu thực tập',
                details: [
                    {
                        type: 'list',
                        title: 'Nội dung',
                        items: [
                            'Xác nhận sinh viên để hoàn thiện hồ sơ vay vốn học tập',
                            'Giấy giới thiệu thực tập theo nhu cầu của đơn vị tiếp nhận',
                            'Sinh viên Khoa Sinh học – Công nghệ Sinh học đăng ký giấy giới thiệu tại văn phòng khoa trước khi nhận tại Phòng CTSV',
                        ],
                    },
                    {
                        type: 'notice',
                        tone: 'info',
                        title: 'Kiểm tra yêu cầu nơi nhận',
                        text: 'Ghi đúng tên cơ quan, mục đích sử dụng và số lượng bản để tránh phải đăng ký lại.',
                    },
                ],
            },
            {
                id: 'scholarships',
                name: 'Học bổng',
                details: [
                    {
                        type: 'paragraph',
                        text: 'Công bố và tiếp nhận hồ sơ học bổng khuyến khích học tập, học bổng tài trợ và các chương trình hỗ trợ sinh viên.',
                    },
                    {
                        type: 'list',
                        title: 'Nên theo dõi',
                        items: [
                            'Điều kiện học lực và điểm rèn luyện',
                            'Đối tượng, hồ sơ minh chứng và thời hạn nộp',
                            'Danh sách dự kiến, kết quả và lịch nhận học bổng',
                        ],
                    },
                    {
                        type: 'link',
                        label: 'Xem thông báo học bổng',
                        href: 'https://ctsv.hcmus.edu.vn/',
                    },
                ],
            },
            {
                id: 'health-insurance',
                name: 'Bảo hiểm y tế sinh viên',
                details: [
                    {
                        type: 'paragraph',
                        text: 'Hướng dẫn đăng ký, gia hạn, kiểm tra thông tin và xử lý các vấn đề về bảo hiểm y tế bắt buộc của sinh viên.',
                    },
                    {
                        type: 'notice',
                        tone: 'warning',
                        title: 'Dữ liệu cá nhân',
                        text: 'Kiểm tra họ tên, ngày sinh, mã số BHXH và nơi đăng ký khám chữa bệnh ban đầu theo thông báo từng đợt.',
                    },
                    {
                        type: 'link',
                        label: 'Xem thông báo BHYT',
                        href: 'https://ctsv.hcmus.edu.vn/',
                    },
                ],
            },
            {
                id: 'tuition-support',
                name: 'Miễn, giảm học phí và hỗ trợ chi phí học tập',
                details: [
                    {
                        type: 'list',
                        title: 'Biểu mẫu',
                        items: [
                            'Đơn đề nghị hỗ trợ chi phí học tập',
                            'Đơn đề nghị miễn, giảm học phí',
                            'Giấy cam kết dành cho hồ sơ miễn, giảm học phí',
                        ],
                    },
                    {
                        type: 'notice',
                        tone: 'warning',
                        title: 'Hồ sơ minh chứng',
                        text: 'Đối tượng và giấy tờ chứng minh thay đổi theo chính sách và thông báo từng học kỳ; không chỉ nộp biểu mẫu đơn.',
                    },
                    {
                        type: 'link',
                        label: 'Tải đơn hỗ trợ chi phí học tập',
                        href: 'https://hcmus.edu.vn/wp-content/uploads/2023/12/Mau-don-ho-tro-chi-phi-hoc-tap.docx',
                    },
                    {
                        type: 'link',
                        label: 'Tải đơn miễn, giảm học phí',
                        href: 'https://hcmus.edu.vn/wp-content/uploads/2021/10/2021-Mau-don-Phu-luc-V.docx',
                    },
                    {
                        type: 'link',
                        label: 'Tải giấy cam kết miễn, giảm học phí',
                        href: 'https://hcmus.edu.vn/wp-content/uploads/2021/10/2021-giay_cam_ket.doc',
                    },
                ],
            },
            {
                id: 'social-assistance',
                name: 'Trợ cấp xã hội và chính sách sinh viên',
                details: [
                    {
                        type: 'list',
                        title: 'Nhóm hồ sơ',
                        items: [
                            'Đơn đề nghị trợ cấp xã hội',
                            'Tờ khai xét duyệt trợ cấp xã hội đối với người khuyết tật',
                            'Hồ sơ chính sách dành cho sinh viên dân tộc thiểu số rất ít người',
                        ],
                    },
                    {
                        type: 'link',
                        label: 'Tải đơn trợ cấp xã hội',
                        href: 'https://hcmus.edu.vn/wp-content/uploads/2023/12/Mau-don-TCXH-HK2-2.doc',
                    },
                    {
                        type: 'link',
                        label: 'Tải tờ khai trợ cấp xã hội cho người khuyết tật',
                        href: 'https://hcmus.edu.vn/wp-content/uploads/2023/12/Mau-xet-duyet-TCXH-nguoi-khuyet-tat.doc',
                    },
                    {
                        type: 'link',
                        label: 'Tải mẫu chính sách sinh viên dân tộc thiểu số rất ít người',
                        href: 'https://hcmus.edu.vn/wp-content/uploads/2023/12/mau-02-DT-rat-it-nguoi.doc',
                    },
                ],
            },
            {
                id: 'dormitory',
                name: 'Ký túc xá Trường',
                details: [
                    {
                        type: 'paragraph',
                        text: 'Phòng CTSV thông báo đợt đăng ký, tiếp nhận hồ sơ nội trú tại Ký túc xá riêng của Trường (135B Trần Hưng Đạo).',
                    },
                    {
                        type: 'notice',
                        tone: 'info',
                        title: 'Khác với KTX ĐHQG-HCM',
                        text: 'Sinh viên học tại cơ sở Linh Trung có nhu cầu ở KTX khu đô thị ĐHQG-HCM đăng ký riêng tại ktxhcm.edu.vn, không qua Phòng CTSV.',
                    },
                    { type: 'link', label: 'Xem thông báo Ký túc xá Trường', href: 'https://hcmus.edu.vn/tag/ky-tuc-xa/' },
                ],
            },
            {
                id: 'all-student-affairs-forms',
                name: 'Toàn bộ biểu mẫu Công tác Sinh viên',
                details: [
                    {
                        type: 'link',
                        label: 'Mở trang biểu mẫu Phòng Công tác Sinh viên',
                        href: 'https://hcmus.edu.vn/bieu-mau-phong-cong-tac-sinh-vien/',
                    },
                ],
            },
        ],
        phones: ['(028) 6288 4499, máy lẻ 1500/1502', '0968 918 018, chọn phím 1'],
        emails: ['congtacsinhvien@hcmus.edu.vn'],
        websites: ['https://ctsv.hcmus.edu.vn/', 'https://hcmus.edu.vn/phong-cong-tac-sinh-vien/'],
        locations: [
            { buildingId: 'NVC-A', roomCode: 'A.02', note: 'Cơ sở Nguyễn Văn Cừ - phòng A.02' },
            { buildingId: 'NDH', floor: 2, roomCode: 'PCTSV', note: 'Cơ sở Linh Trung - Nhà Điều hành, phòng 2.8' },
        ],
        sourceUrl: 'https://hcmus.edu.vn/phong-cong-tac-sinh-vien/',
        lastVerifiedAt: '2026-08-15',
        verificationStatus: 'verified',
    },
    {
        id: 'phong-dao-tao-sau-dai-hoc',
        type: 'office',
        name: 'Phòng Đào tạo Sau đại học',
        shortName: 'PĐTSĐH',
        aliases: ['phong dao tao sau dai hoc', 'sau đại học', 'sdh', 'thạc sĩ', 'thac si', 'tiến sĩ', 'tien si'],
        summary: 'Quản lý tuyển sinh và đào tạo các chương trình thạc sĩ, tiến sĩ.',
        description:
            'Đầu mối về tuyển sinh sau đại học, học vụ cao học và nghiên cứu sinh, đề cương, luận văn, luận án và các biểu mẫu liên quan.',
        services: [
            {
                id: 'postgraduate-admissions',
                name: 'Tuyển sinh sau đại học',
                details: [
                    { type: 'paragraph', text: 'Cung cấp thông tin tuyển sinh thạc sĩ, tiến sĩ và các thông báo bổ sung hồ sơ.' },
                    {
                        type: 'list',
                        title: 'Nội dung thường gặp',
                        items: ['Điều kiện dự tuyển', 'Danh mục ngành và chỉ tiêu', 'Hồ sơ, lệ phí và lịch tuyển sinh', 'Kết quả và thủ tục nhập học'],
                    },
                    { type: 'link', label: 'Mở cổng Sau đại học', href: 'https://sdh.hcmus.edu.vn/' },
                ],
            },
            {
                id: 'postgraduate-academic-affairs',
                name: 'Học vụ thạc sĩ và tiến sĩ',
                details: [
                    {
                        type: 'list',
                        title: 'Có thể hỗ trợ',
                        items: [
                            'Đăng ký học phần và kế hoạch học tập',
                            'Công nhận/chuyển đổi học phần theo quy định',
                            'Tạm dừng, gia hạn hoặc điều chỉnh tiến độ học tập',
                            'Xác nhận học viên và nghiên cứu sinh',
                        ],
                    },
                    {
                        type: 'notice',
                        tone: 'info',
                        title: 'Theo chương trình',
                        text: 'Quy trình và biểu mẫu có thể khác giữa bậc thạc sĩ, tiến sĩ và từng khóa tuyển sinh.',
                    },
                ],
            },
            {
                id: 'thesis-and-dissertation',
                name: 'Luận văn, luận án và bảo vệ',
                details: [
                    {
                        type: 'list',
                        title: 'Nội dung',
                        items: [
                            'Đăng ký đề tài và người hướng dẫn',
                            'Gia hạn hoặc điều chỉnh đề tài',
                            'Hồ sơ thành lập hội đồng và bảo vệ',
                            'Hoàn thiện luận văn/luận án sau bảo vệ',
                        ],
                    },
                    { type: 'link', label: 'Xem quy chế và biểu mẫu Sau đại học', href: 'https://sdh.hcmus.edu.vn/quy-che-bieu-mau/' },
                ],
            },
        ],
        phones: ['(028) 3835 0097', '(028) 6288 4499, máy lẻ 1300'],
        emails: ['dtsaudaihoc@hcmus.edu.vn'],
        websites: ['https://sdh.hcmus.edu.vn/', 'https://sdh.hcmus.edu.vn/quy-che-bieu-mau/'],
        locations: [{ buildingId: 'NVC-B', roomCode: 'B.08', note: 'Cơ sở Nguyễn Văn Cừ - phòng B.08' }],
        sourceUrl: 'https://sdh.hcmus.edu.vn/lien-he/',
        lastVerifiedAt: '2026-08-15',
        verificationStatus: 'verified',
    },
    {
        id: 'thu-vien',
        type: 'library',
        name: 'Thư viện Trường Đại học Khoa học tự nhiên',
        shortName: 'Thư viện HCMUS',
        aliases: ['thu vien', 'library', 'glib', 'mượn sách', 'muon sach', 'cơ sở dữ liệu', 'csdl'],
        summary: 'Cung cấp tài nguyên học tập, cơ sở dữ liệu, không gian học và dịch vụ thư viện.',
        services: [
            {
                id: 'borrowing-and-reading',
                name: 'Mượn, trả và sử dụng tài liệu',
                details: [
                    {
                        type: 'list',
                        title: 'Dịch vụ',
                        items: ['Tra cứu tài liệu', 'Mượn, gia hạn và trả tài liệu', 'Đọc tại chỗ', 'Hỗ trợ tài khoản và quyền sử dụng thư viện'],
                    },
                    { type: 'link', label: 'Mở website Thư viện', href: 'https://glib.hcmus.edu.vn/' },
                ],
            },
            {
                id: 'digital-resources',
                name: 'Tài nguyên số và cơ sở dữ liệu',
                details: [
                    { type: 'paragraph', text: 'Hỗ trợ truy cập tài liệu điện tử, cơ sở dữ liệu học thuật và nguồn tin theo quyền truy cập của Trường.' },
                    {
                        type: 'notice',
                        tone: 'info',
                        title: 'Truy cập từ xa',
                        text: 'Một số nguồn yêu cầu tài khoản hoặc mạng của Trường; xem hướng dẫn hiện hành trên website Thư viện.',
                    },
                ],
            },
            {
                id: 'research-support',
                name: 'Hỗ trợ học tập và nghiên cứu',
                details: [
                    {
                        type: 'list',
                        title: 'Có thể hỗ trợ',
                        items: ['Tìm kiếm tài liệu', 'Sử dụng nguồn tin học thuật', 'Trích dẫn và quản lý tài liệu tham khảo', 'Không gian tự học/trao đổi theo quy định'],
                    },
                ],
            },
        ],
        phones: ['0838 397 722', '(028) 6288 4499, máy lẻ 3200'],
        emails: ['thuvien@hcmus.edu.vn'],
        websites: ['https://glib.hcmus.edu.vn/'],
        locations: [
            { buildingId: 'NVC', note: 'Cơ sở Nguyễn Văn Cừ - tầng 9 và tầng 10' },
            { buildingId: 'LT-C', note: 'Cơ sở Linh Trung - dãy C' },
        ],
        sourceUrl: 'https://glib.hcmus.edu.vn/',
        lastVerifiedAt: '2026-08-15',
        verificationStatus: 'partial',
    },
    {
        id: 'tram-y-te',
        type: 'student-service',
        name: 'Trạm Y tế',
        aliases: ['tram y te', 'y tế', 'y te', 'sức khỏe', 'suc khoe', 'sơ cứu', 'so cuu'],
        summary: 'Đầu mối chăm sóc sức khỏe ban đầu và hỗ trợ y tế trong khuôn viên Trường.',
        services: [
            {
                id: 'first-aid',
                name: 'Sơ cứu và chăm sóc sức khỏe ban đầu',
                details: [
                    { type: 'paragraph', text: 'Tiếp nhận các tình huống sức khỏe thông thường và sơ cứu ban đầu trong phạm vi năng lực của Trạm.' },
                    {
                        type: 'notice',
                        tone: 'warning',
                        title: 'Trường hợp khẩn cấp',
                        text: 'Gọi 115 hoặc liên hệ lực lượng bảo vệ gần nhất; không chờ phản hồi qua email/danh bạ.',
                    },
                ],
            },
            {
                id: 'student-health',
                name: 'Hỗ trợ sức khỏe sinh viên',
                details: [
                    {
                        type: 'list',
                        title: 'Nội dung',
                        items: ['Tư vấn ban đầu', 'Hướng dẫn xử lý và chuyển tuyến khi cần', 'Phối hợp hoạt động sức khỏe học đường', 'Thông tin y tế trong khuôn viên'],
                    },
                ],
            },
        ],
        phones: ['(028) 6288 4499, máy lẻ 1103'],
        locations: [
            { buildingId: 'NVC-E', roomCode: 'E.001', note: 'Cơ sở Nguyễn Văn Cừ - phòng E.001' },
            { buildingId: 'LT-E', floor: 1, roomCode: 'E.103', note: 'Cơ sở Linh Trung - phòng E.103' },
        ],
        sourceUrl: 'https://hcmus.edu.vn/danh-ba-dien-thoai-noi-bo/',
        lastVerifiedAt: '2026-08-15',
        verificationStatus: 'verified',
    },
    {
        id: 'hoi-quan-khoa-hoc',
        type: 'student-service',
        name: 'Hội quán Khoa học',
        shortName: 'HQKH',
        aliases: ['hoi quan khoa hoc', 'hoi quan sinh vien', 'hqkh', 'không gian sinh viên'],
        summary: 'Không gian sinh hoạt và kết nối dành cho cộng đồng sinh viên tại cơ sở Linh Trung.',
        services: [
            {
                id: 'student-space',
                name: 'Không gian sinh viên',
                details: [
                    { type: 'paragraph', text: 'Thông tin vận hành, lịch sử dụng và đơn vị phụ trách đang được cập nhật.' },
                    { type: 'notice', tone: 'info', title: 'Trạng thái dữ liệu', text: 'Chưa tìm thấy trang công khai chính thức đủ để xác minh dịch vụ và giờ mở cửa.' },
                ],
            },
        ],
        locations: [{ buildingId: 'NDH', floor: 1, roomCode: 'HQKH', note: 'Tầng hầm Nhà Điều hành, cơ sở Linh Trung' }],
        lastVerifiedAt: '2026-08-15',
        verificationStatus: 'pending',
    },
    {
        id: 'khoa-toan-tin-hoc',
        type: 'faculty',
        name: 'Khoa Toán – Tin học',
        shortName: 'Khoa Toán',
        aliases: ['khoa toan tin hoc', 'khoa toán', 'toán tin', 'math', 'fmcs'],
        summary: 'Đào tạo và nghiên cứu trong các lĩnh vực toán học, toán ứng dụng và tin học.',
        services: [
            {
                id: 'faculty-academic-affairs',
                name: 'Học vụ khoa',
                details: [
                    {
                        type: 'list',
                        title: 'Nội dung thường được hỗ trợ',
                        items: ['Tư vấn chương trình và kế hoạch học tập', 'Thông báo học vụ thuộc phạm vi khoa', 'Đăng ký đề tài, khóa luận và seminar', 'Xác nhận/đề xuất có ý kiến của khoa'],
                    },
                    { type: 'link', label: 'Mở website Khoa Toán – Tin học', href: 'https://www.math.hcmus.edu.vn/' },
                ],
            },
            {
                id: 'research-and-seminars',
                name: 'Nghiên cứu và seminar',
                details: [
                    { type: 'paragraph', text: 'Thông tin nhóm nghiên cứu, seminar, hội thảo và cơ hội học thuật của Khoa.' },
                ],
            },
        ],
        phones: ['(028) 6288 4499, máy lẻ 4300', '0969 693 911'],
        emails: ['math@hcmus.edu.vn'],
        websites: ['https://www.math.hcmus.edu.vn/'],
        locations: [{ buildingId: 'NDH', floor: 8, roomCode: 'KTOAN', note: 'Cơ sở Linh Trung - Nhà Điều hành, phòng 8.5' }],
        sourceUrl: 'https://www.math.hcmus.edu.vn/',
        lastVerifiedAt: '2026-08-15',
        verificationStatus: 'verified',
    },
    {
        id: 'khoa-cong-nghe-thong-tin',
        type: 'faculty',
        name: 'Khoa Công nghệ Thông tin',
        shortName: 'CNTT',
        aliases: ['khoa cntt', 'cntt', 'fit', 'công nghệ thông tin', 'cong nghe thong tin', 'it'],
        summary: 'Đào tạo và nghiên cứu các ngành thuộc lĩnh vực công nghệ thông tin.',
        services: [
            {
                id: 'faculty-academic-affairs',
                name: 'Học vụ khoa',
                details: [
                    {
                        type: 'list',
                        title: 'Có thể hỗ trợ',
                        items: ['Tư vấn chương trình và chuyên ngành', 'Thông báo học vụ của Khoa', 'Khóa luận, thực tập và đồ án', 'Các xác nhận cần ý kiến của Khoa'],
                    },
                    { type: 'link', label: 'Mở website Khoa CNTT', href: 'https://www.fit.hcmus.edu.vn/' },
                ],
            },
            {
                id: 'internship-and-thesis',
                name: 'Thực tập, đồ án và khóa luận',
                details: [
                    {
                        type: 'list',
                        title: 'Nội dung',
                        items: ['Thông báo đăng ký', 'Điều kiện và mốc thời gian', 'Phân công/hướng dẫn', 'Nộp báo cáo và đánh giá theo quy định từng chương trình'],
                    },
                ],
            },
        ],
        phones: ['(028) 6288 4499, máy lẻ 4000', '0942 127 247'],
        emails: ['info@fit.hcmus.edu.vn'],
        websites: ['https://www.fit.hcmus.edu.vn/'],
        locations: [
            { buildingId: 'NVC-I', floor: 5, roomCode: 'I.53', note: 'Cơ sở Nguyễn Văn Cừ - phòng I.53, tòa I' },
            { buildingId: 'NDH', floor: 8, roomCode: 'KCNTT', note: 'Cơ sở Linh Trung - Nhà Điều hành, phòng 8.2' },
        ],
        sourceUrl: 'https://www.fit.hcmus.edu.vn/vn/Default.aspx?tabid=217',
        lastVerifiedAt: '2026-08-15',
        verificationStatus: 'verified',
    },
    {
        id: 'khoa-vat-ly-vat-ly-ky-thuat',
        type: 'faculty',
        name: 'Khoa Vật lý – Vật lý Kỹ thuật',
        shortName: 'Vật lý',
        aliases: ['khoa vat ly', 'vật lý kỹ thuật', 'vat ly ky thuat', 'physics', 'phys'],
        summary: 'Đào tạo và nghiên cứu vật lý, vật lý kỹ thuật và các hướng ứng dụng liên quan.',
        services: [
            {
                id: 'faculty-academic-affairs',
                name: 'Giáo vụ và tư vấn học tập',
                details: [
                    {
                        type: 'list',
                        title: 'Kênh liên hệ',
                        items: ['Giáo vụ chương trình chuẩn: giaovu.phys@hcmus.edu.vn', 'Giáo vụ chương trình tiên tiến: giaovutcta.phys@hcmus.edu.vn'],
                    },
                    { type: 'link', label: 'Mở website Khoa Vật lý – Vật lý Kỹ thuật', href: 'https://phys.hcmus.edu.vn/' },
                ],
            },
            {
                id: 'laboratories-and-research',
                name: 'Phòng thí nghiệm và nghiên cứu',
                details: [
                    { type: 'paragraph', text: 'Thông tin các bộ môn, nhóm nghiên cứu, phòng thí nghiệm, seminar và hoạt động khoa học của Khoa.' },
                ],
            },
        ],
        phones: ['(028) 6288 4499, máy lẻ 4400'],
        emails: ['khoavatly@hcmus.edu.vn', 'giaovu.phys@hcmus.edu.vn', 'giaovutcta.phys@hcmus.edu.vn'],
        websites: ['https://phys.hcmus.edu.vn/'],
        locations: [],
        sourceUrl: 'https://phys.hcmus.edu.vn/',
        lastVerifiedAt: '2026-08-15',
        verificationStatus: 'partial',
    },
    {
        id: 'khoa-hoa-hoc',
        type: 'faculty',
        name: 'Khoa Hóa học',
        shortName: 'Khoa Hóa',
        aliases: ['khoa hoa hoc', 'khoa hóa', 'hoa hoc', 'chemistry', 'chem'],
        summary: 'Đào tạo và nghiên cứu hóa học, công nghệ hóa học và các lĩnh vực liên quan.',
        services: [
            {
                id: 'faculty-academic-affairs',
                name: 'Học vụ và hỗ trợ sinh viên',
                details: [
                    {
                        type: 'list',
                        title: 'Nội dung',
                        items: ['Tư vấn chương trình và học vụ', 'Thực tập, khóa luận và đề tài', 'Thông báo học thuật', 'Tiếp nhận phản hồi sinh viên qua hộp thư của Khoa'],
                    },
                    { type: 'link', label: 'Mở website Khoa Hóa học', href: 'https://chemistry.hcmus.edu.vn/' },
                ],
            },
            {
                id: 'laboratories-and-safety',
                name: 'Phòng thí nghiệm và an toàn',
                details: [
                    { type: 'paragraph', text: 'Thông tin học phần thực hành, phòng thí nghiệm, nghiên cứu và yêu cầu an toàn do Khoa công bố theo từng đơn vị.' },
                ],
            },
        ],
        phones: ['(028) 6288 4499, máy lẻ 4100'],
        emails: ['chemoffice@hcmus.edu.vn', 'hopthusvkhoahoa@hcmus.edu.vn'],
        websites: ['https://chemistry.hcmus.edu.vn/'],
        locations: [{ buildingId: 'NDH', floor: 8, roomCode: 'KHOA', note: 'Cơ sở Linh Trung - Nhà Điều hành, phòng 8.4' }],
        sourceUrl: 'https://chemistry.hcmus.edu.vn/',
        lastVerifiedAt: '2026-08-15',
        verificationStatus: 'verified',
    },
    {
        id: 'khoa-sinh-hoc-cong-nghe-sinh-hoc',
        type: 'faculty',
        name: 'Khoa Sinh học – Công nghệ Sinh học',
        shortName: 'SH-CNSH',
        aliases: ['khoa sinh hoc', 'công nghệ sinh học', 'cong nghe sinh hoc', 'biotechnology', 'fbb'],
        summary: 'Đào tạo và nghiên cứu sinh học, công nghệ sinh học và khoa học sự sống.',
        services: [
            {
                id: 'faculty-academic-affairs',
                name: 'Học vụ khoa',
                details: [
                    {
                        type: 'list',
                        title: 'Có thể hỗ trợ',
                        items: ['Tư vấn chương trình', 'Thông báo học vụ', 'Thực tập và giấy giới thiệu thực tập', 'Khóa luận, đề tài và hoạt động nghiên cứu'],
                    },
                    {
                        type: 'notice',
                        tone: 'info',
                        title: 'Giấy giới thiệu thực tập',
                        text: 'Theo hướng dẫn CTSV, sinh viên của Khoa đăng ký tại văn phòng Khoa trước khi nhận giấy tại Phòng Công tác Sinh viên.',
                    },
                    { type: 'link', label: 'Mở website Khoa Sinh học – CNSH', href: 'https://fbb.hcmus.edu.vn/' },
                ],
            },
            {
                id: 'research-and-laboratories',
                name: 'Nghiên cứu và phòng thí nghiệm',
                details: [
                    { type: 'paragraph', text: 'Thông tin bộ môn, phòng thí nghiệm, nhóm nghiên cứu và seminar khoa học sự sống.' },
                ],
            },
        ],
        phones: ['(028) 6288 4499, máy lẻ 4200'],
        emails: ['fbb@hcmus.edu.vn'],
        websites: ['https://fbb.hcmus.edu.vn/'],
        locations: [
            { buildingId: 'NVC', note: 'Cơ sở Nguyễn Văn Cừ' },
            { buildingId: 'LT', note: 'Cơ sở Linh Trung' },
        ],
        sourceUrl: 'https://fbb.hcmus.edu.vn/',
        lastVerifiedAt: '2026-08-15',
        verificationStatus: 'partial',
    },
    {
        id: 'phong-ke-hoach-tai-chinh',
        type: 'office',
        name: 'Phòng Kế hoạch – Tài chính',
        shortName: 'PKHTC',
        aliases: ['pkhtc', 'khtc', 'phong ke hoach tai chinh', 'tài vụ', 'tai vu', 'học phí', 'hoc phi', 'biên lai'],
        summary: 'Phụ trách kế hoạch tài chính, học phí, thanh toán và chứng từ tài chính.',
        services: [
            {
                id: 'tuition-and-fees',
                name: 'Học phí và các khoản thu',
                details: [
                    {
                        type: 'list',
                        title: 'Có thể hỗ trợ',
                        items: ['Tra cứu nghĩa vụ học phí', 'Xác nhận hoặc đối soát khoản đã nộp', 'Hướng dẫn kênh và thời hạn thanh toán', 'Xử lý sai thông tin giao dịch'],
                    },
                    {
                        type: 'notice',
                        tone: 'warning',
                        title: 'Khi cần đối soát',
                        text: 'Chuẩn bị mã số sinh viên, thời điểm giao dịch, số tiền và chứng từ/ảnh chụp giao dịch.',
                    },
                ],
            },
            {
                id: 'financial-documents',
                name: 'Biên lai, hóa đơn và xác nhận thanh toán',
                details: [
                    { type: 'paragraph', text: 'Hướng dẫn cấp hoặc điều chỉnh chứng từ thu, xác nhận học phí và hồ sơ tài chính thuộc phạm vi Trường.' },
                    { type: 'link', label: 'Mở trang biểu mẫu Kế hoạch – Tài chính', href: 'https://hcmus.edu.vn/bieu-mau-phong-ke-hoach-tai-chinh/' },
                ],
            },
            {
                id: 'internal-payments',
                name: 'Thanh toán và quyết toán nội bộ',
                details: [
                    {
                        type: 'list',
                        title: 'Đối tượng chính',
                        items: ['Đơn vị trực thuộc', 'Cán bộ, viên chức và người lao động', 'Chủ nhiệm đề tài/dự án theo hồ sơ tài chính được duyệt'],
                    },
                ],
            },
        ],
        phones: ['(028) 3835 5275', '(028) 3896 7366', '(028) 6288 4499, máy lẻ 1600'],
        emails: ['khtc-tn@hcmus.edu.vn', 'ph-khtc@hcmus.edu.vn'],
        websites: ['https://hcmus.edu.vn/phong-ke-hoach-tai-chinh/', 'https://hcmus.edu.vn/bieu-mau-phong-ke-hoach-tai-chinh/'],
        locations: [
            { buildingId: 'NVC-B', roomCode: 'B.01', note: 'Cơ sở Nguyễn Văn Cừ - phòng B.01' },
            { buildingId: 'NDH', floor: 2, roomCode: 'PKHTC', note: 'Cơ sở Linh Trung - Nhà Điều hành, phòng 2.7' },
        ],
        sourceUrl: 'https://hcmus.edu.vn/phong-ke-hoach-tai-chinh/',
        lastVerifiedAt: '2026-08-15',
        verificationStatus: 'partial',
    },
    {
        id: 'phong-khao-thi-dam-bao-chat-luong',
        type: 'office',
        name: 'Phòng Khảo thí và Đảm bảo Chất lượng',
        shortName: 'PKT&ĐBCL',
        aliases: ['ktdbcl', 'khao thi', 'đảm bảo chất lượng', 'dam bao chat luong', 'phúc khảo', 'phuc khao', 'lịch thi'],
        summary: 'Tổ chức khảo thí, phúc khảo và hoạt động bảo đảm chất lượng giáo dục.',
        services: [
            {
                id: 'examination',
                name: 'Khảo thí và lịch thi',
                details: [
                    {
                        type: 'list',
                        title: 'Nội dung',
                        items: ['Kế hoạch và lịch thi tập trung', 'Phối hợp tổ chức thi', 'Quản lý dữ liệu khảo thí', 'Thông báo liên quan đến kỳ thi'],
                    },
                    { type: 'link', label: 'Mở website Khảo thí & ĐBCL', href: 'https://ktdbcl.hcmus.edu.vn/' },
                ],
            },
            {
                id: 'exam-review',
                name: 'Phúc khảo và phản hồi kết quả thi',
                details: [
                    { type: 'paragraph', text: 'Tiếp nhận theo đợt và thời hạn công bố; quy trình cụ thể phụ thuộc học kỳ và loại kỳ thi.' },
                    {
                        type: 'notice',
                        tone: 'warning',
                        title: 'Thời hạn',
                        text: 'Chỉ gửi yêu cầu trong thời gian nhận phúc khảo của thông báo tương ứng và lưu lại biên nhận/minh chứng.',
                    },
                ],
            },
            {
                id: 'quality-assurance',
                name: 'Đảm bảo chất lượng và khảo sát',
                details: [
                    {
                        type: 'list',
                        title: 'Nội dung',
                        items: ['Khảo sát người học và các bên liên quan', 'Tự đánh giá và kiểm định chương trình', 'Theo dõi cải tiến chất lượng', 'Công khai thông tin bảo đảm chất lượng'],
                    },
                ],
            },
        ],
        phones: ['(028) 6288 4499, máy lẻ 3370/3371 (Khảo thí), 3377 (ĐBCL)', '(028) 3897 5300'],
        emails: ['khaothi@hcmus.edu.vn'],
        websites: ['https://ktdbcl.hcmus.edu.vn/'],
        openingHours:
            'Cơ sở Nguyễn Văn Cừ: Thứ Hai - Thứ Sáu, 07:30 - 11:30 và 13:30 - 17:00. Cơ sở Linh Trung: theo lịch thi/phúc khảo và sáng Thứ Ba.',
        locations: [
            { buildingId: 'NVC-B', roomCode: 'B.04', note: 'Cơ sở Nguyễn Văn Cừ - phòng B.04' },
            { buildingId: 'NDH', floor: 2, roomCode: 'PKTDBCL', note: 'Cơ sở Linh Trung - Nhà Điều hành, phòng 2.5' },
        ],
        sourceUrl: 'https://ktdbcl.hcmus.edu.vn/index.php/gi-i-thi-u/gi-i-thi-u-chung',
        lastVerifiedAt: '2026-08-15',
        verificationStatus: 'verified',
    },
    {
        id: 'phong-khoa-hoc-cong-nghe',
        type: 'office',
        name: 'Phòng Khoa học – Công nghệ',
        shortName: 'PKHCN',
        aliases: ['pkhcn', 'khcn', 'phong khoa hoc cong nghe', 'nghiên cứu khoa học', 'nckh', 'đề tài'],
        summary: 'Quản lý hoạt động nghiên cứu khoa học, đề tài, sở hữu trí tuệ và chuyển giao công nghệ.',
        services: [
            {
                id: 'research-projects',
                name: 'Đề tài và nhiệm vụ khoa học công nghệ',
                details: [
                    {
                        type: 'list',
                        title: 'Có thể hỗ trợ',
                        items: ['Đăng ký và thuyết minh nhiệm vụ', 'Theo dõi tiến độ và thay đổi nội dung', 'Nghiệm thu, thanh lý và báo cáo', 'Quản lý sản phẩm khoa học'],
                    },
                ],
            },
            {
                id: 'student-research',
                name: 'Nghiên cứu khoa học sinh viên',
                details: [
                    { type: 'paragraph', text: 'Thông tin về hoạt động, giải thưởng và hồ sơ nghiên cứu khoa học dành cho sinh viên.' },
                ],
            },
            {
                id: 'intellectual-property',
                name: 'Sở hữu trí tuệ và chuyển giao công nghệ',
                details: [
                    {
                        type: 'list',
                        title: 'Nội dung',
                        items: ['Hồ sơ tài sản trí tuệ', 'Công bố và sản phẩm khoa học', 'Kết nối chuyển giao/công nghệ', 'Biểu mẫu quản lý khoa học'],
                    },
                    { type: 'link', label: 'Mở trang biểu mẫu Khoa học – Công nghệ', href: 'https://hcmus.edu.vn/bieu-mau-phong-khoa-hoc-cong-nghe/' },
                ],
            },
        ],
        phones: ['(028) 6288 4499, máy lẻ 1400/1401', '(028) 6288 4499, máy lẻ 1402 (Phòng tạp chí)'],
        emails: ['khoahoccongnghe@hcmus.edu.vn'],
        websites: ['https://hcmus.edu.vn/phong-khoa-hoc-cong-nghe/', 'https://hcmus.edu.vn/bieu-mau-phong-khoa-hoc-cong-nghe/'],
        locations: [{ buildingId: 'NVC-F', roomCode: 'F.07', note: 'Cơ sở Nguyễn Văn Cừ - phòng F.07' }],
        sourceUrl: 'https://hcmus.edu.vn/phong-khoa-hoc-cong-nghe/',
        lastVerifiedAt: '2026-08-15',
        verificationStatus: 'verified',
    },
    {
        id: 'phong-quan-he-doi-ngoai',
        type: 'office',
        name: 'Phòng Quan hệ Đối ngoại',
        shortName: 'PQHĐN',
        aliases: ['pqhdn', 'qhdn', 'phong quan he doi ngoai', 'international relations', 'trao đổi sinh viên', 'exchange'],
        summary: 'Phụ trách hợp tác quốc tế, đoàn ra/đoàn vào và chương trình trao đổi.',
        services: [
            {
                id: 'student-exchange',
                name: 'Trao đổi sinh viên và cơ hội quốc tế',
                details: [
                    {
                        type: 'list',
                        title: 'Nội dung',
                        items: ['Thông báo chương trình trao đổi', 'Điều kiện và hồ sơ ứng tuyển', 'Thư giới thiệu/xác nhận thuộc phạm vi chương trình', 'Học bổng và cơ hội quốc tế'],
                    },
                ],
            },
            {
                id: 'international-cooperation',
                name: 'Hợp tác quốc tế',
                details: [
                    { type: 'paragraph', text: 'Hỗ trợ thủ tục hợp tác, ký kết, tiếp đoàn và hoạt động với đối tác nước ngoài theo quy định.' },
                    { type: 'link', label: 'Mở trang biểu mẫu Quan hệ Đối ngoại', href: 'https://hcmus.edu.vn/bieu-mau-phong-quan-he-doi-ngoai/' },
                ],
            },
        ],
        phones: ['(028) 6288 4499, máy lẻ 1900', '(028) 3830 8557'],
        emails: ['internationalrelations@hcmus.edu.vn'],
        websites: ['https://hcmus.edu.vn/phong-quan-he-doi-ngoai/', 'https://hcmus.edu.vn/bieu-mau-phong-quan-he-doi-ngoai/'],
        locations: [
            { buildingId: 'NVC-F', roomCode: 'F.101', note: 'Cơ sở Nguyễn Văn Cừ - phòng F.101' },
            { buildingId: 'NVC-F', roomCode: 'F.105', note: 'Cơ sở Nguyễn Văn Cừ - phòng F.105' },
        ],
        sourceUrl: 'https://hcmus.edu.vn/phong-quan-he-doi-ngoai/',
        lastVerifiedAt: '2026-08-15',
        verificationStatus: 'verified',
    },
    {
        id: 'phong-quan-tri-thiet-bi',
        type: 'office',
        name: 'Phòng Quản trị Thiết bị',
        shortName: 'PQTTB',
        aliases: ['pqttb', 'qttb', 'phong quan tri thiet bi', 'cơ sở vật chất', 'co so vat chat', 'sửa chữa', 'sua chua'],
        summary: 'Quản lý cơ sở vật chất, thiết bị, phòng học và yêu cầu sửa chữa.',
        services: [
            {
                id: 'facility-requests',
                name: 'Cơ sở vật chất và sửa chữa',
                details: [
                    {
                        type: 'list',
                        title: 'Có thể hỗ trợ',
                        items: ['Tiếp nhận yêu cầu sửa chữa cơ sở vật chất', 'Theo dõi hư hỏng thiết bị dùng chung', 'Điện, nước và điều kiện phòng học', 'Bàn giao hoặc điều chuyển tài sản theo quy trình'],
                    },
                    { type: 'link', label: 'Mở trang biểu mẫu Quản trị Thiết bị', href: 'https://hcmus.edu.vn/qttb-bieumau/' },
                ],
            },
            {
                id: 'room-and-equipment',
                name: 'Phòng học và thiết bị',
                details: [
                    { type: 'paragraph', text: 'Phối hợp quản lý, bố trí và khai thác phòng học, hội trường, trang thiết bị thuộc phạm vi phụ trách.' },
                ],
            },
        ],
        phones: ['(028) 3830 4094', '(028) 6288 4499, máy lẻ 1700/1701'],
        emails: ['ph-quantrithietbi@hcmus.edu.vn'],
        websites: ['https://hcmus.edu.vn/qttb/', 'https://hcmus.edu.vn/qttb-bieumau/'],
        locations: [{ buildingId: 'NVC-A', roomCode: 'A.04', note: 'Cơ sở Nguyễn Văn Cừ - phòng A.04' }],
        sourceUrl: 'https://hcmus.edu.vn/qttb/',
        lastVerifiedAt: '2026-08-15',
        verificationStatus: 'verified',
    },
    {
        id: 'phong-thanh-tra-phap-che',
        type: 'office',
        name: 'Phòng Thanh tra – Pháp chế',
        shortName: 'PTT-PC',
        aliases: ['ttpc', 'thanh tra', 'pháp chế', 'phap che', 'khiếu nại', 'khieu nai', 'tố cáo', 'to cao'],
        summary: 'Thực hiện công tác thanh tra, pháp chế, tiếp công dân và xử lý phản ánh theo thẩm quyền.',
        services: [
            {
                id: 'inspection-and-complaints',
                name: 'Thanh tra, phản ánh, khiếu nại và tố cáo',
                details: [
                    {
                        type: 'list',
                        title: 'Phạm vi',
                        items: ['Tiếp nhận phản ánh theo thẩm quyền', 'Hướng dẫn quy trình khiếu nại/tố cáo', 'Tiếp công dân', 'Theo dõi kết luận và kiến nghị thanh tra'],
                    },
                    {
                        type: 'notice',
                        tone: 'warning',
                        title: 'Thông tin nhạy cảm',
                        text: 'Không gửi công khai dữ liệu cá nhân hoặc hồ sơ nhạy cảm; liên hệ trực tiếp để được hướng dẫn kênh nộp phù hợp.',
                    },
                ],
            },
            {
                id: 'legal-affairs',
                name: 'Pháp chế và văn bản',
                details: [
                    { type: 'paragraph', text: 'Rà soát pháp lý, theo dõi văn bản và phổ biến quy định thuộc phạm vi quản lý của Trường.' },
                ],
            },
        ],
        phones: ['0986 760 439', '(028) 6288 4499, máy lẻ 1800'],
        emails: ['ttpc@hcmus.edu.vn'],
        websites: ['https://ttpc.hcmus.edu.vn/', 'https://hcmus.edu.vn/phong-thanh-tra-phap-che/'],
        locations: [
            { buildingId: 'NVC-F', roomCode: 'F.107', note: 'Cơ sở Nguyễn Văn Cừ - phòng F.107' },
            { buildingId: 'NDH', floor: 5, roomCode: 'PTTPC', note: 'Cơ sở Linh Trung - Nhà Điều hành, phòng 5.1' },
        ],
        sourceUrl: 'https://ttpc.hcmus.edu.vn/',
        lastVerifiedAt: '2026-08-15',
        verificationStatus: 'verified',
    },
    {
        id: 'phong-thong-tin-truyen-thong',
        type: 'office',
        name: 'Phòng Thông tin – Truyền thông',
        shortName: 'PTT-TT',
        aliases: ['tttt', 'phong thong tin truyen thong', 'truyền thông', 'truyen thong', 'website', 'tin bài'],
        summary: 'Phụ trách thông tin, truyền thông, hình ảnh và các kênh thông tin chính thức của Trường.',
        services: [
            {
                id: 'communications',
                name: 'Tin bài và truyền thông sự kiện',
                details: [
                    {
                        type: 'list',
                        title: 'Nội dung',
                        items: ['Tiếp nhận đề nghị đăng tin', 'Phối hợp truyền thông sự kiện', 'Hỗ trợ thông tin báo chí theo phân công', 'Quản lý hình ảnh và nhận diện truyền thông'],
                    },
                ],
            },
            {
                id: 'official-channels',
                name: 'Kênh thông tin chính thức',
                details: [
                    { type: 'paragraph', text: 'Quản trị hoặc phối hợp cập nhật website, tin tức và các kênh truyền thông chính thức của Trường.' },
                ],
            },
        ],
        phones: ['(028) 6288 4499, máy lẻ 3355', '(028) 6288 4499, máy lẻ 3333 (BP Hạ tầng Thông tin)'],
        emails: ['thongtintruyenthong@hcmus.edu.vn'],
        websites: ['https://hcmus.edu.vn/phong-thong-tin-truyen-thong/'],
        locations: [{ buildingId: 'NVC-F', roomCode: 'F.02', note: 'Cơ sở Nguyễn Văn Cừ - phòng F.02' }],
        sourceUrl: 'https://hcmus.edu.vn/phong-thong-tin-truyen-thong/',
        lastVerifiedAt: '2026-08-15',
        verificationStatus: 'partial',
    },
    {
        id: 'phong-to-chuc-hanh-chinh',
        type: 'office',
        name: 'Phòng Tổ chức – Hành chính',
        shortName: 'PTC-HC',
        aliases: ['tchc', 'phong to chuc hanh chinh', 'tổ chức cán bộ', 'hanh chinh', 'giấy giới thiệu', 'con dấu'],
        summary: 'Phụ trách tổ chức nhân sự, hành chính, văn thư và công tác chung của Trường.',
        services: [
            {
                id: 'personnel',
                name: 'Tổ chức và nhân sự',
                details: [
                    {
                        type: 'list',
                        title: 'Nội dung',
                        items: ['Hồ sơ viên chức/người lao động', 'Tuyển dụng, điều động và thôi việc', 'Thi đua, khen thưởng', 'Chế độ và xác nhận thuộc phạm vi nhân sự'],
                    },
                ],
            },
            {
                id: 'administrative-services',
                name: 'Hành chính, văn thư và giấy giới thiệu',
                details: [
                    {
                        type: 'list',
                        title: 'Biểu mẫu công khai',
                        items: ['Đăng ký làm việc ngoài giờ/qua đêm/ngày nghỉ', 'Đề nghị sử dụng xe', 'Đơn xin thôi việc', 'Đăng ký đi nước ngoài', 'Đề nghị cấp giấy giới thiệu'],
                    },
                    { type: 'link', label: 'Mở trang biểu mẫu Tổ chức – Hành chính', href: 'https://hcmus.edu.vn/bieu-mau-phong-to-chuc-hanh-chinh/' },
                ],
            },
        ],
        phones: ['(028) 6288 4499, máy lẻ 1111'],
        emails: ['ph-tochuc-hc@hcmus.edu.vn'],
        websites: ['https://hcmus.edu.vn/phong-to-chuc-hanh-chinh/', 'https://hcmus.edu.vn/bieu-mau-phong-to-chuc-hanh-chinh/'],
        locations: [],
        sourceUrl: 'https://hcmus.edu.vn/phong-to-chuc-hanh-chinh/',
        lastVerifiedAt: '2026-08-15',
        verificationStatus: 'verified',
    },
    {
        id: 'khoa-moi-truong',
        type: 'faculty',
        name: 'Khoa Môi trường',
        aliases: ['khoa moi truong', 'môi trường', 'moi truong', 'environment', 'khoa học môi trường'],
        summary: 'Đào tạo và nghiên cứu khoa học môi trường, quản lý môi trường và công nghệ môi trường.',
        services: [
            {
                id: 'faculty-academic-affairs',
                name: 'Học vụ và tư vấn học tập',
                details: [
                    {
                        type: 'list',
                        title: 'Có thể hỗ trợ',
                        items: ['Tư vấn chương trình và chuyên ngành', 'Thông báo học vụ của Khoa', 'Thực tập, đồ án và khóa luận', 'Hoạt động học thuật và nghiên cứu'],
                    },
                    { type: 'link', label: 'Mở website Khoa Môi trường', href: 'https://environment.hcmus.edu.vn/' },
                ],
            },
            {
                id: 'environmental-research',
                name: 'Nghiên cứu và hợp tác môi trường',
                details: [
                    { type: 'paragraph', text: 'Thông tin nhóm nghiên cứu, phòng thí nghiệm, đề tài và hoạt động hợp tác của Khoa.' },
                ],
            },
        ],
        phones: ['(028) 3830 4379', '(028) 6288 4499, máy lẻ 4700'],
        emails: ['environment-hcmus-vnu@hcmus.edu.vn'],
        websites: ['https://environment.hcmus.edu.vn/'],
        locations: [{ buildingId: 'NVC-C', roomCode: 'C.11', note: 'Cơ sở Nguyễn Văn Cừ - phòng C.11' }],
        sourceUrl: 'https://environment.hcmus.edu.vn/',
        lastVerifiedAt: '2026-08-15',
        verificationStatus: 'verified',
    },
    {
        id: 'khoa-dia-chat',
        type: 'faculty',
        name: 'Khoa Địa chất',
        aliases: ['khoa dia chat', 'địa chất', 'dia chat', 'geology', 'địa chất học'],
        summary: 'Đào tạo và nghiên cứu địa chất học, tài nguyên, địa chất môi trường và các hướng ứng dụng.',
        services: [
            {
                id: 'faculty-academic-affairs',
                name: 'Học vụ khoa',
                details: [
                    {
                        type: 'list',
                        title: 'Nội dung',
                        items: ['Tư vấn chương trình', 'Học vụ và biểu mẫu của Khoa', 'Thực tập thực địa', 'Khóa luận và đề tài nghiên cứu'],
                    },
                    { type: 'link', label: 'Mở trang biểu mẫu Khoa Địa chất', href: 'https://geology.hcmus.edu.vn/bieu-mau' },
                ],
            },
            {
                id: 'fieldwork-and-research',
                name: 'Thực địa và nghiên cứu địa chất',
                details: [
                    { type: 'paragraph', text: 'Thông báo và hướng dẫn thực tập thực địa, phòng thí nghiệm, seminar và đề tài của Khoa.' },
                    { type: 'link', label: 'Mở website Khoa Địa chất', href: 'https://geology.hcmus.edu.vn/' },
                ],
            },
        ],
        phones: ['(028) 3835 5271', '(028) 6288 4499, máy lẻ 4600'],
        emails: ['khoadiachat@hcmus.edu.vn'],
        websites: ['https://geology.hcmus.edu.vn/', 'https://geology.hcmus.edu.vn/bieu-mau'],
        locations: [{ buildingId: 'NVC-C', roomCode: 'C.12A', note: 'Cơ sở Nguyễn Văn Cừ - phòng C.12A' }],
        sourceUrl: 'https://geology.hcmus.edu.vn/',
        lastVerifiedAt: '2026-08-15',
        verificationStatus: 'verified',
    },
    {
        id: 'khoa-khoa-hoc-cong-nghe-vat-lieu',
        type: 'faculty',
        name: 'Khoa Khoa học và Công nghệ Vật liệu',
        shortName: 'KHCN Vật liệu',
        aliases: ['khoa hoc cong nghe vat lieu', 'khoa vật liệu', 'vat lieu', 'materials science', 'mst'],
        summary: 'Đào tạo và nghiên cứu khoa học vật liệu, công nghệ vật liệu và các ứng dụng liên quan.',
        services: [
            {
                id: 'faculty-academic-affairs',
                name: 'Học vụ khoa',
                details: [
                    {
                        type: 'list',
                        title: 'Nội dung',
                        items: ['Tư vấn chương trình', 'Thông báo học vụ', 'Thực tập và khóa luận', 'Đăng ký đề tài và hoạt động nghiên cứu'],
                    },
                    { type: 'link', label: 'Mở website Khoa KHCN Vật liệu', href: 'https://mst.hcmus.edu.vn/' },
                ],
            },
            {
                id: 'materials-laboratories',
                name: 'Phòng thí nghiệm và nghiên cứu vật liệu',
                details: [
                    { type: 'paragraph', text: 'Thông tin cơ sở nghiên cứu, phòng thí nghiệm, nhóm chuyên môn và hoạt động khoa học của Khoa.' },
                ],
            },
        ],
        phones: ['(028) 3835 0831', '(028) 6288 4499, máy lẻ 4800'],
        emails: ['mst.hcmus@gmail.com'],
        websites: ['https://mst.hcmus.edu.vn/'],
        locations: [
            { buildingId: 'NVC-F', roomCode: 'F.113', note: 'Cơ sở Nguyễn Văn Cừ - phòng F.113' },
            { buildingId: 'NDH', floor: 8, roomCode: 'KMST', note: 'Cơ sở Linh Trung - Nhà Điều hành, phòng 8.15' },
        ],
        sourceUrl: 'https://mst.hcmus.edu.vn/',
        lastVerifiedAt: '2026-08-15',
        verificationStatus: 'verified',
    },
    {
        id: 'khoa-dien-tu-vien-thong',
        type: 'faculty',
        name: 'Khoa Điện tử – Viễn thông',
        shortName: 'ĐTVT',
        aliases: ['khoa dien tu vien thong', 'điện tử viễn thông', 'dien tu vien thong', 'fetel', 'electronics', 'telecommunications'],
        summary: 'Đào tạo và nghiên cứu điện tử, viễn thông, máy tính và các hệ thống thông minh.',
        services: [
            {
                id: 'faculty-academic-affairs',
                name: 'Giáo vụ khoa',
                details: [
                    {
                        type: 'list',
                        title: 'Kênh liên hệ học vụ',
                        items: ['Chương trình chuẩn: giaovu_fetel@hcmus.edu.vn', 'Chương trình chất lượng cao: giaovu_clc_fetel@hcmus.edu.vn'],
                    },
                    { type: 'link', label: 'Mở website Khoa Điện tử – Viễn thông', href: 'https://fetel.hcmus.edu.vn/' },
                ],
            },
            {
                id: 'projects-internship-thesis',
                name: 'Đồ án, thực tập và khóa luận',
                details: [
                    {
                        type: 'list',
                        title: 'Nội dung',
                        items: ['Thông báo đăng ký đồ án', 'Thực tập doanh nghiệp', 'Khóa luận tốt nghiệp', 'Nghiên cứu và phòng thí nghiệm'],
                    },
                ],
            },
        ],
        phones: ['(028) 3835 6464', '0961 714 239', '(028) 6288 4499, máy lẻ 4500'],
        emails: ['bod_fetel@hcmus.edu.vn', 'giaovu_fetel@hcmus.edu.vn', 'giaovu_clc_fetel@hcmus.edu.vn'],
        websites: ['https://fetel.hcmus.edu.vn/'],
        locations: [
            { buildingId: 'NVC', note: 'Cơ sở Nguyễn Văn Cừ' },
            { buildingId: 'LT', note: 'Cơ sở Linh Trung' },
        ],
        sourceUrl: 'https://fetel.hcmus.edu.vn/',
        lastVerifiedAt: '2026-08-15',
        verificationStatus: 'partial',
    },
    {
        id: 'khoa-khoa-hoc-lien-nganh',
        type: 'faculty',
        name: 'Khoa Khoa học Liên ngành',
        shortName: 'KHLN',
        aliases: ['khoa khoa hoc lien nganh', 'khoa học liên ngành', 'khoa lien nganh', 'fis', 'interdisciplinary science'],
        summary: 'Phát triển đào tạo và nghiên cứu theo hướng liên ngành giữa khoa học tự nhiên, công nghệ và các lĩnh vực mới.',
        services: [
            {
                id: 'faculty-academic-affairs',
                name: 'Học vụ và tư vấn chương trình',
                details: [
                    {
                        type: 'list',
                        title: 'Có thể hỗ trợ',
                        items: ['Thông tin chương trình liên ngành', 'Tư vấn học vụ', 'Hoạt động học thuật', 'Kết nối nghiên cứu và hợp tác liên ngành'],
                    },
                    { type: 'link', label: 'Mở website Khoa Khoa học Liên ngành', href: 'https://fis.hcmus.edu.vn/' },
                ],
            },
        ],
        emails: ['khoakhoahocliennganh@hcmus.edu.vn'],
        websites: ['https://fis.hcmus.edu.vn/'],
        locations: [],
        sourceUrl: 'https://fis.hcmus.edu.vn/',
        lastVerifiedAt: '2026-08-15',
        verificationStatus: 'partial',
    },
    {
        id: 'vien-te-bao-goc',
        type: 'other',
        name: 'Viện Tế bào gốc',
        shortName: 'SCI',
        aliases: ['vien te bao goc', 'tế bào gốc', 'te bao goc', 'stem cell institute', 'sci'],
        summary: 'Nghiên cứu, đào tạo, chuyển giao công nghệ và cung cấp dịch vụ khoa học về tế bào gốc.',
        services: [
            {
                id: 'stem-cell-research',
                name: 'Nghiên cứu và chuyển giao công nghệ',
                details: [
                    {
                        type: 'list',
                        title: 'Lĩnh vực hoạt động',
                        items: ['Nghiên cứu tế bào gốc và y sinh', 'Phát triển quy trình/công nghệ', 'Hợp tác nghiên cứu', 'Đào tạo và chuyển giao'],
                    },
                    { type: 'link', label: 'Mở website Viện Tế bào gốc', href: 'https://sci.edu.vn/' },
                ],
            },
            {
                id: 'scientific-services',
                name: 'Dịch vụ khoa học và tham quan',
                details: [
                    {
                        type: 'list',
                        title: 'Nội dung công khai',
                        items: ['Dịch vụ khoa học/chuyên môn theo công bố của Viện', 'Đào tạo ngắn hạn', 'Stem Cell Tour và hoạt động phổ biến khoa học'],
                    },
                    {
                        type: 'notice',
                        tone: 'info',
                        title: 'Liên hệ trước',
                        text: 'Các dịch vụ chuyên môn và lịch tham quan cần được xác nhận trực tiếp với Viện.',
                    },
                ],
            },
        ],
        phones: ['(+84) 28 3636 1206'],
        emails: ['contact@sci.edu.vn'],
        websites: ['https://sci.edu.vn/'],
        openingHours: 'Thứ Hai - Thứ Sáu, 08:00 - 17:00',
        locations: [{ buildingId: 'LT-B2-3', roomCode: 'B2-3', note: 'Tòa B2-3, cơ sở Linh Trung' }],
        sourceUrl: 'https://sci.edu.vn/contact/',
        lastVerifiedAt: '2026-08-15',
        verificationStatus: 'verified',
    },
    {
        id: 'doan-thanh-nien',
        type: 'student-service',
        name: 'Đoàn TNCS Hồ Chí Minh Trường Đại học Khoa học Tự nhiên',
        shortName: 'Đoàn trường',
        aliases: [
            'doan truong',
            'doan thanh nien',
            'van phong doan',
            'doan tn',
            'doan hoi',
            'nghi khoa hoc song tu nhien',
        ],
        summary: 'Tổ chức Đoàn Thanh niên của Trường - phong trào tình nguyện, học thuật NCKH, kỹ năng - khởi nghiệp, hỗ trợ sinh viên.',
        description:
            'Đoàn trường ĐH KHTN, ĐHQG-HCM ("Nghĩ khoa học - Sống tự nhiên") là đầu mối các hoạt động Đoàn: học tập và làm theo lời Bác, tuổi trẻ xung kích, học thuật - NCKH (Hội nghị Khoa học Trẻ, Eureka), kỹ năng - khởi nghiệp - hội nhập, tình nguyện hè (Mùa hè xanh), và quản lý Không gian truyền thống HSSV 4.0. Mỗi Khoa đều có Đoàn Khoa/Liên chi Đoàn trực thuộc.',
        services: [
            {
                id: 'dang-ky-tham-quan-khong-gian-hssv',
                name: 'Đăng ký tham quan Không gian truyền thống HSSV 4.0',
                details: [
                    {
                        type: 'paragraph',
                        text: 'Không gian trưng bày truyền thống học sinh - sinh viên của Trường, mở cửa cho đoàn tham quan trong và ngoài trường đăng ký trước.',
                    },
                    {
                        type: 'link',
                        label: 'Đăng ký tham quan (tiếng Việt)',
                        href: 'https://docs.google.com/forms/d/e/1FAIpQLSf7JMbYz1mDjycxHBfi2sloupVSX6LE9rHtDZ1DndGXlePzYg/viewform?usp=sharing&ouid=104771396097466345983',
                    },
                    {
                        type: 'link',
                        label: 'Register to visit (English)',
                        href: 'https://forms.gle/6HRh3qTjCLP8HAaG8',
                    },
                ],
            },
            {
                id: 'dang-ky-phong-sinh-hoat-doan',
                name: 'Đăng ký phòng sinh hoạt Đoàn - Hội',
                details: [
                    {
                        type: 'list',
                        title: 'Theo cơ sở',
                        items: [
                            'Cơ sở Nguyễn Văn Cừ: đăng ký qua link rút gọn tinyurl.com/dangkyphongNVC',
                            'Cơ sở Linh Trung (Khu đô thị ĐHQG-HCM): đăng ký qua link rút gọn tinyurl.com/dangkyphongLT',
                        ],
                    },
                    { type: 'link', label: 'Đăng ký phòng - cơ sở Nguyễn Văn Cừ', href: 'http://tinyurl.com/dangkyphongNVC' },
                    { type: 'link', label: 'Đăng ký phòng - cơ sở Linh Trung', href: 'http://tinyurl.com/dangkyphongLT' },
                ],
            },
            {
                id: 'rut-ho-so-doan',
                name: 'Rút hồ sơ Đoàn (khi tốt nghiệp/chuyển sinh hoạt)',
                details: [
                    {
                        type: 'paragraph',
                        text: 'Thủ tục rút hồ sơ đoàn viên dành cho sinh viên đã tốt nghiệp hoặc chuyển sinh hoạt Đoàn về địa phương/đơn vị mới.',
                    },
                    { type: 'link', label: 'Đăng ký rút hồ sơ Đoàn', href: 'http://tinyurl.com/ruthosodoan' },
                ],
            },
            {
                id: 'bieu-mau-doan',
                name: 'Biểu mẫu, văn bản Đoàn - Hội',
                details: [
                    { type: 'link', label: 'Mở trang Biểu mẫu Đoàn trường', href: 'https://doantn.hcmus.edu.vn/?cat=22' },
                    { type: 'link', label: 'Văn bản - thông tin Đoàn trường', href: 'https://doantn.hcmus.edu.vn/van-ban-thong-tin/' },
                    { type: 'link', label: 'Văn phòng điện tử (nội bộ cán bộ Đoàn - Hội)', href: 'http://bit.ly/vpdtkhtn' },
                ],
            },
            {
                id: 'hoat-dong-doan',
                name: 'Chương trình - phong trào Đoàn',
                details: [
                    {
                        type: 'list',
                        title: 'Các mảng hoạt động chính',
                        items: [
                            'Học tập - Nghiên cứu khoa học (Hội nghị Khoa học Trẻ, giải thưởng Eureka)',
                            'Kỹ năng - Khởi nghiệp - Hội nhập (Startup Wheel, tập huấn kỹ năng mềm)',
                            'Tình nguyện hè (Mùa hè xanh, đội hình mùa hè quốc tế)',
                            'Hỗ trợ sinh viên (Ngày hội SV - Doanh nghiệp, học bổng, tuyên dương gương sáng)',
                        ],
                    },
                    { type: 'link', label: 'Xem tin mới cập nhật của Đoàn trường', href: 'https://doantn.hcmus.edu.vn/' },
                ],
            },
        ],
        phones: ['(028) 3835 4008 (Cơ sở Nguyễn Văn Cừ - phòng F108)', '(028) 3896 1092 (Cơ sở Linh Trung - phòng 2.9 NĐH)'],
        emails: ['doantn@hcmus.edu.vn'],
        websites: ['https://doantn.hcmus.edu.vn/'],
        locations: [
            { buildingId: 'NVC-F', roomCode: 'F108', note: 'Cơ sở Nguyễn Văn Cừ - phòng F108' },
            { buildingId: 'NDH', floor: 2, roomCode: '2.9', note: 'Cơ sở Linh Trung - Nhà Điều hành, phòng 2.9' },
        ],
        sourceUrl: 'https://doantn.hcmus.edu.vn/',
        lastVerifiedAt: '2026-08-15',
        verificationStatus: 'verified',
    },
    {
        id: 'hoi-sinh-vien',
        type: 'student-service',
        name: 'Hội Sinh viên Việt Nam Trường Đại học Khoa học Tự nhiên',
        shortName: 'Hội Sinh viên',
        aliases: ['hoi sinh vien', 'hsv', 'hsv khtn', 'sinh vien 5 tot'],
        summary: 'Tổ chức Hội Sinh viên Việt Nam tại Trường, đồng hành cùng Đoàn Thanh niên trong công tác phong trào và chăm lo sinh viên.',
        description:
            'Hội Sinh viên Trường hoạt động cùng văn phòng với Đoàn Thanh niên (chung địa điểm, chung một số kênh đăng ký như phòng sinh hoạt, rút hồ sơ), nhưng có kênh liên hệ và trang mạng xã hội riêng. Là đầu mối phong trào "Sinh viên 5 tốt", các câu lạc bộ/đội nhóm và hoạt động đại diện quyền lợi sinh viên.',
        services: [
            {
                id: 'lien-he-hoi-sinh-vien',
                name: 'Liên hệ Hội Sinh viên trường',
                details: [
                    {
                        type: 'paragraph',
                        text: 'Các thắc mắc, đề xuất liên quan Hội Sinh viên gửi trực tiếp qua email hoặc fanpage chính thức.',
                    },
                    { type: 'link', label: 'Fanpage Hội Sinh viên trường', href: 'https://www.facebook.com/hsvkhtn/' },
                ],
            },
            {
                id: 'danh-hieu-sinh-vien-5-tot',
                name: 'Danh hiệu "Sinh viên 5 tốt"',
                details: [
                    {
                        type: 'paragraph',
                        text: 'Phong trào thi đua toàn diện dành cho sinh viên (đạo đức, học tập, thể lực, tình nguyện, hội nhập). Tiêu chuẩn và đợt xét chọn hằng năm được Hội Sinh viên trường thông báo cụ thể theo từng năm học.',
                    },
                    {
                        type: 'notice',
                        tone: 'info',
                        title: 'Theo dõi thông báo hằng năm',
                        text: 'Tiêu chuẩn xét chọn có thể thay đổi theo từng nhiệm kỳ/năm học; sinh viên nên theo dõi thông báo chính thức trên website và fanpage Đoàn - Hội thay vì áp dụng tiêu chuẩn của năm cũ.',
                    },
                ],
            },
            {
                id: 'phong-sinh-hoat-va-ho-so-chung',
                name: 'Đăng ký phòng sinh hoạt / rút hồ sơ',
                details: [
                    {
                        type: 'paragraph',
                        text: 'Dùng chung biểu mẫu với Đoàn Thanh niên do cùng văn phòng quản lý.',
                    },
                    { type: 'link', label: 'Đăng ký phòng sinh hoạt - cơ sở Nguyễn Văn Cừ', href: 'http://tinyurl.com/dangkyphongNVC' },
                    { type: 'link', label: 'Đăng ký phòng sinh hoạt - cơ sở Linh Trung', href: 'http://tinyurl.com/dangkyphongLT' },
                ],
            },
        ],
        phones: ['(028) 3835 4008 (Cơ sở Nguyễn Văn Cừ - phòng F108)', '(028) 3896 1092 (Cơ sở Linh Trung - phòng 2.9 NĐH)'],
        emails: ['hoisinhvien@hcmus.edu.vn'],
        websites: ['https://doantn.hcmus.edu.vn/hoi-sinh-vien-viet-nam-truong-dai-hoc-khoa-hoc-tu-nhien-d0hqg-hcm/', 'https://www.facebook.com/hsvkhtn/'],
        locations: [
            { buildingId: 'NVC-F', roomCode: 'F108', note: 'Cơ sở Nguyễn Văn Cừ - phòng F108 (chung văn phòng với Đoàn trường)' },
            { buildingId: 'NDH', floor: 2, roomCode: '2.9', note: 'Cơ sở Linh Trung - Nhà Điều hành, phòng 2.9' },
        ],
        sourceUrl: 'https://doantn.hcmus.edu.vn/hoi-sinh-vien-viet-nam-truong-dai-hoc-khoa-hoc-tu-nhien-d0hqg-hcm/',
        lastVerifiedAt: '2026-08-15',
        verificationStatus: 'verified',
    },
];