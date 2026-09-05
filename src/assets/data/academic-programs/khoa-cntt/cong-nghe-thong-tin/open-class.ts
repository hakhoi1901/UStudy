export interface OpenClassCourse {
    course_code: string;
    course_name: string;
    'open-for': readonly number[];
}

export interface OpenClassSemester {
    semester: 1 | 2 | 3;
    'open-class': readonly OpenClassCourse[];
}

export const openClassSemesters: readonly OpenClassSemester[] = [
    {
        "semester": 1,
        "open-class": [
            {
                "course_code": "ADD00031",
                "course_name": "Anh văn 1",
                "open-for": [
                    1
                ]
            },
            {
                "course_code": "ADD00033",
                "course_name": "Anh văn 3",
                "open-for": [
                    2
                ]
            },
            {
                "course_code": "BAA00021",
                "course_name": "Thể dục 1",
                "open-for": [
                    1
                ]
            },
            {
                "course_code": "BAA00030",
                "course_name": "Giáo dục quốc phòng - An ninh",
                "open-for": [
                    1
                ]
            },
            {
                "course_code": "BAA00102",
                "course_name": "Kinh tế chính trị Mác - Lênin",
                "open-for": [
                    3
                ]
            },
            {
                "course_code": "BAA00104",
                "course_name": "Lịch sử Đảng Cộng sản Việt Nam",
                "open-for": [
                    4
                ]
            },
            {
                "course_code": "BIO00002",
                "course_name": "Sinh đại cương 2",
                "open-for": [
                    2
                ]
            },
            {
                "course_code": "BIO00082",
                "course_name": "Thực tập Sinh đại cương 2",
                "open-for": [
                    2
                ]
            },
            {
                "course_code": "CHE00002",
                "course_name": "Hóa đại cương 2",
                "open-for": [
                    2
                ]
            },
            {
                "course_code": "CHE00082",
                "course_name": "Thực hành Hóa đại cương 2",
                "open-for": [
                    2
                ]
            },
            {
                "course_code": "CSC00004",
                "course_name": "Nhập môn công nghệ thông tin",
                "open-for": [
                    1
                ]
            },
            {
                "course_code": "CSC10001",
                "course_name": "Nhập môn lập trình",
                "open-for": [
                    3
                ]
            },
            {
                "course_code": "CSC10002",
                "course_name": "Kỹ thuật lập trình",
                "open-for": [
                    3
                ]
            },
            {
                "course_code": "CSC10003",
                "course_name": "Phương pháp lập trình hướng đối tượng",
                "open-for": [
                    2,
                    3
                ]
            },
            {
                "course_code": "CSC10004",
                "course_name": "Cấu trúc dữ liệu và giải thuật",
                "open-for": [
                    2
                ]
            },
            {
                "course_code": "CSC10006",
                "course_name": "Cơ sở dữ liệu",
                "open-for": [
                    3
                ]
            },
            {
                "course_code": "CSC10007",
                "course_name": "Hệ điều hành",
                "open-for": [
                    3
                ]
            },
            {
                "course_code": "CSC10008",
                "course_name": "Mạng máy tính",
                "open-for": [
                    2
                ]
            },
            {
                "course_code": "CSC10009",
                "course_name": "Hệ thống máy tính",
                "open-for": [
                    3
                ]
            },
            {
                "course_code": "CSC10012",
                "course_name": "Cơ sở lập trình",
                "open-for": [
                    1
                ]
            },
            {
                "course_code": "CSC10102",
                "course_name": "Kiến tập nghề nghiệp",
                "open-for": [
                    4
                ]
            },
            {
                "course_code": "CSC11004",
                "course_name": "Mạng máy tính nâng cao",
                "open-for": [
                    3
                ]
            },
            {
                "course_code": "CSC11112",
                "course_name": "Chuyên đề Hệ thống phân tán",
                "open-for": [
                    4
                ]
            },
            {
                "course_code": "CSC11116",
                "course_name": "DevOps nâng cao",
                "open-for": [
                    4
                ]
            },
            {
                "course_code": "CSC11117",
                "course_name": "Hệ điều hành Linux và ứng dụng",
                "open-for": [
                    3
                ]
            },
            {
                "course_code": "CSC11118",
                "course_name": "Triển khai và vận hành điện toán đám mây",
                "open-for": [
                    4
                ]
            },
            {
                "course_code": "CSC11119",
                "course_name": "Chuyên đề phân tích mạng",
                "open-for": [
                    4
                ]
            },
            {
                "course_code": "CSC12002",
                "course_name": "Cơ sở dữ liệu nâng cao",
                "open-for": [
                    3
                ]
            },
            {
                "course_code": "CSC12003",
                "course_name": "Hệ quản trị cơ sở dữ liệu",
                "open-for": [
                    3
                ]
            },
            {
                "course_code": "CSC12005",
                "course_name": "Phát triển ứng dụng hệ thống thông tin hiện đại",
                "open-for": [
                    4
                ]
            },
            {
                "course_code": "CSC12106",
                "course_name": "Tương tác người – máy",
                "open-for": [
                    4
                ]
            },
            {
                "course_code": "CSC12107",
                "course_name": "Hệ thống thông tin phục vụ trí tuệ kinh doanh",
                "open-for": [
                    4
                ]
            },
            {
                "course_code": "CSC13001",
                "course_name": "Lập trình Windows",
                "open-for": [
                    3
                ]
            },
            {
                "course_code": "CSC13002",
                "course_name": "Nhập môn công nghệ phần mềm",
                "open-for": [
                    3
                ]
            },
            {
                "course_code": "CSC13003",
                "course_name": "Kiểm thử phần mềm",
                "open-for": [
                    4
                ]
            },
            {
                "course_code": "CSC13006",
                "course_name": "Quản lý dự án phần mềm",
                "open-for": [
                    4
                ]
            },
            {
                "course_code": "CSC13007",
                "course_name": "Phát triển game",
                "open-for": [
                    4
                ]
            },
            {
                "course_code": "CSC13008",
                "course_name": "Phát triển ứng dụng web",
                "open-for": [
                    3
                ]
            },
            {
                "course_code": "CSC13009",
                "course_name": "Phát triển phần mềm cho thiết bị di động",
                "open-for": [
                    3
                ]
            },
            {
                "course_code": "CSC13103",
                "course_name": "Nhập môn hệ thống phân tán",
                "open-for": [
                    4
                ]
            },
            {
                "course_code": "CSC13106",
                "course_name": "Kiến trúc phần mềm",
                "open-for": [
                    4
                ]
            },
            {
                "course_code": "CSC13107",
                "course_name": "Mẫu thiết kế hướng đối tượng và ứng dụng",
                "open-for": [
                    4
                ]
            },
            {
                "course_code": "CSC13112",
                "course_name": "Thiết kế giao diện",
                "open-for": [
                    4
                ]
            },
            {
                "course_code": "CSC13114",
                "course_name": "Phát triển ứng dụng web nâng cao",
                "open-for": [
                    4
                ]
            },
            {
                "course_code": "CSC13118",
                "course_name": "Phát triển ứng dụng cho thiết bị di động nâng cao",
                "open-for": [
                    4
                ]
            },
            {
                "course_code": "CSC14002",
                "course_name": "Các hệ cơ sở tri thức",
                "open-for": [
                    4
                ]
            },
            {
                "course_code": "CSC14003",
                "course_name": "Cơ sở trí tuệ nhân tạo",
                "open-for": [
                    3
                ]
            },
            {
                "course_code": "CSC14007",
                "course_name": "Nhập môn phân tích độ phức tạp thuật toán",
                "open-for": [
                    3
                ]
            },
            {
                "course_code": "CSC14111",
                "course_name": "Nhập môn thiết kế và phân tích giải thuật",
                "open-for": [
                    3
                ]
            },
            {
                "course_code": "CSC14112",
                "course_name": "Sinh trắc học",
                "open-for": [
                    4
                ]
            },
            {
                "course_code": "CSC14114",
                "course_name": "Ứng dụng dữ liệu lớn",
                "open-for": [
                    4
                ]
            },
            {
                "course_code": "CSC14117",
                "course_name": "Nhập môn lập trình kết nối vạn vật",
                "open-for": [
                    4
                ]
            },
            {
                "course_code": "CSC14119",
                "course_name": "Nhập môn khoa học dữ liệu",
                "open-for": [
                    3
                ]
            },
            {
                "course_code": "CSC14120",
                "course_name": "Lập trình song song",
                "open-for": [
                    4
                ]
            },
            {
                "course_code": "CSC15001",
                "course_name": "An ninh máy tính",
                "open-for": [
                    4
                ]
            },
            {
                "course_code": "CSC15005",
                "course_name": "Nhập môn mã hóa – mật mã",
                "open-for": [
                    3
                ]
            },
            {
                "course_code": "CSC15006",
                "course_name": "Nhập môn xử lý ngôn ngữ tự nhiên",
                "open-for": [
                    3
                ]
            },
            {
                "course_code": "CSC15009",
                "course_name": "Xử lý tín hiệu số",
                "open-for": [
                    4
                ]
            },
            {
                "course_code": "CSC15010",
                "course_name": "Blockchain và ứng dụng",
                "open-for": [
                    4
                ]
            },
            {
                "course_code": "CSC15011",
                "course_name": "Nhập môn ngôn ngữ học thống kê và ứng dụng",
                "open-for": [
                    4
                ]
            },
            {
                "course_code": "CSC15104",
                "course_name": "An toàn và phục hồi dữ liệu",
                "open-for": [
                    4
                ]
            },
            {
                "course_code": "CSC15106",
                "course_name": "Seminar Công nghệ tri thức",
                "open-for": [
                    4
                ]
            },
            {
                "course_code": "CSC15109",
                "course_name": "Nhập môn tính toán lượng tử",
                "open-for": [
                    3
                ]
            },
            {
                "course_code": "CSC16001",
                "course_name": "Đồ họa máy tính",
                "open-for": [
                    3
                ]
            },
            {
                "course_code": "CSC16002",
                "course_name": "Phương pháp toán trong phân tích dữ liệu thị giác",
                "open-for": [
                    4
                ]
            },
            {
                "course_code": "CSC16005",
                "course_name": "Xử lý ảnh số và video số",
                "open-for": [
                    3
                ]
            },
            {
                "course_code": "CSC16102",
                "course_name": "Kỹ thuật lập trình xử lý ảnh số và video số",
                "open-for": [
                    4
                ]
            },
            {
                "course_code": "CSC16106",
                "course_name": "Nhập môn lập trình điều khiển thiết bị thông minh",
                "open-for": [
                    4
                ]
            },
            {
                "course_code": "CSC16107",
                "course_name": "Ứng dụng thị giác máy tính",
                "open-for": [
                    4
                ]
            },
            {
                "course_code": "CSC16114",
                "course_name": "Học sâu trong thị giác máy tính",
                "open-for": [
                    4
                ]
            },
            {
                "course_code": "CSC17103",
                "course_name": "Khai thác dữ liệu đồ thị",
                "open-for": [
                    4
                ]
            },
            {
                "course_code": "CSC17104",
                "course_name": "Lập trình cho khoa học dữ liệu",
                "open-for": [
                    3
                ]
            },
            {
                "course_code": "CSC17106",
                "course_name": "Xử lý phân tích dữ liệu trực tuyến",
                "open-for": [
                    4
                ]
            },
            {
                "course_code": "CSC17107",
                "course_name": "Ứng dụng phân tích dữ liệu thông minh",
                "open-for": [
                    4
                ]
            },
            {
                "course_code": "MTH00021",
                "course_name": "Vi tích phân 1",
                "open-for": [
                    1
                ]
            },
            {
                "course_code": "MTH00044",
                "course_name": "Xác suất thống kê",
                "open-for": [
                    2
                ]
            },
            {
                "course_code": "MTH00045",
                "course_name": "Toán rời rạc",
                "open-for": [
                    1
                ]
            },
            {
                "course_code": "MTH00050",
                "course_name": "Toán học tổ hợp",
                "open-for": [
                    2
                ]
            },
            {
                "course_code": "PHY00002",
                "course_name": "Vật lý đại cương 2 (Điện từ - Quang)",
                "open-for": [
                    2
                ]
            }
        ]
    },
    {
        "semester": 2,
        "open-class": [
            {
                "course_code": "ADD00032",
                "course_name": "Anh văn 2",
                "open-for": [
                    1
                ]
            },
            {
                "course_code": "ADD00034",
                "course_name": "Anh văn 4",
                "open-for": [
                    2
                ]
            },
            {
                "course_code": "BAA00003",
                "course_name": "Tư tưởng Hồ Chí Minh",
                "open-for": [
                    4
                ]
            },
            {
                "course_code": "BAA00004",
                "course_name": "Pháp luật đại cương",
                "open-for": [
                    1
                ]
            },
            {
                "course_code": "BAA00005",
                "course_name": "Kinh tế đại cương",
                "open-for": [
                    2
                ]
            },
            {
                "course_code": "BAA00006",
                "course_name": "Tâm lý đại cương",
                "open-for": [
                    2
                ]
            },
            {
                "course_code": "BAA00007",
                "course_name": "Phương pháp luận sáng tạo",
                "open-for": [
                    2
                ]
            },
            {
                "course_code": "BAA00022",
                "course_name": "Thể dục 2",
                "open-for": [
                    1
                ]
            },
            {
                "course_code": "BAA00101",
                "course_name": "Triết học Mác - Lênin",
                "open-for": [
                    2
                ]
            },
            {
                "course_code": "BIO00001",
                "course_name": "Sinh đại cương 1",
                "open-for": [
                    1
                ]
            },
            {
                "course_code": "BIO00081",
                "course_name": "Thực tập Sinh đại cương 1",
                "open-for": [
                    1
                ]
            },
            {
                "course_code": "CHE00001",
                "course_name": "Hóa đại cương 1",
                "open-for": [
                    1
                ]
            },
            {
                "course_code": "CHE00081",
                "course_name": "Thực hành Hóa đại cương 1",
                "open-for": [
                    1
                ]
            },
            {
                "course_code": "CSC10003",
                "course_name": "Phương pháp lập trình hướng đối tượng",
                "open-for": [
                    2
                ]
            },
            {
                "course_code": "CSC10004",
                "course_name": "Cấu trúc dữ liệu và giải thuật",
                "open-for": [
                    1
                ]
            },
            {
                "course_code": "CSC10006",
                "course_name": "Cơ sở dữ liệu",
                "open-for": [
                    2
                ]
            },
            {
                "course_code": "CSC10007",
                "course_name": "Hệ điều hành",
                "open-for": [
                    3
                ]
            },
            {
                "course_code": "CSC10008",
                "course_name": "Mạng máy tính",
                "open-for": [
                    2
                ]
            },
            {
                "course_code": "CSC10009",
                "course_name": "Hệ thống máy tính",
                "open-for": [
                    2
                ]
            },
            {
                "course_code": "CSC10012",
                "course_name": "Cơ sở lập trình",
                "open-for": [
                    1
                ]
            },
            {
                "course_code": "CSC10014",
                "course_name": "Tư duy tính toán",
                "open-for": [
                    2
                ]
            },
            {
                "course_code": "CSC10102",
                "course_name": "Kiến tập nghề nghiệp",
                "open-for": [
                    3
                ]
            },
            {
                "course_code": "CSC10108",
                "course_name": "Trực quan hóa dữ liệu",
                "open-for": [
                    3,
                    4
                ]
            },
            {
                "course_code": "CSC11002",
                "course_name": "Hệ thống viễn thông",
                "open-for": [
                    3
                ]
            },
            {
                "course_code": "CSC11003",
                "course_name": "Lập trình mạng",
                "open-for": [
                    3
                ]
            },
            {
                "course_code": "CSC11006",
                "course_name": "Nhập môn điện toán đám mây",
                "open-for": [
                    3
                ]
            },
            {
                "course_code": "CSC11007",
                "course_name": "Nhập môn DevOps",
                "open-for": [
                    3
                ]
            },
            {
                "course_code": "CSC11106",
                "course_name": "Truyền thông không dây",
                "open-for": [
                    4
                ]
            },
            {
                "course_code": "CSC11111",
                "course_name": "Chuyên đề tốt nghiệp Mạng máy tính",
                "open-for": [
                    4
                ]
            },
            {
                "course_code": "CSC11115",
                "course_name": "An ninh mạng",
                "open-for": [
                    3
                ]
            },
            {
                "course_code": "CSC12001",
                "course_name": "An toàn và bảo mật dữ liệu trong hệ thống thông tin",
                "open-for": [
                    3
                ]
            },
            {
                "course_code": "CSC12004",
                "course_name": "Phân tích thiết kế hệ thống thông tin",
                "open-for": [
                    3
                ]
            },
            {
                "course_code": "CSC12105",
                "course_name": "Thương mại điện tử",
                "open-for": [
                    3
                ]
            },
            {
                "course_code": "CSC12108",
                "course_name": "Ứng dụng phân tán",
                "open-for": [
                    4
                ]
            },
            {
                "course_code": "CSC12111",
                "course_name": "Quản trị cơ sở dữ liệu hiện đại",
                "open-for": [
                    4
                ]
            },
            {
                "course_code": "CSC13002",
                "course_name": "Nhập môn công nghệ phần mềm",
                "open-for": [
                    3
                ]
            },
            {
                "course_code": "CSC13005",
                "course_name": "Phân tích và quản lý yêu cầu phần mềm",
                "open-for": [
                    3
                ]
            },
            {
                "course_code": "CSC13010",
                "course_name": "Thiết kế phần mềm",
                "open-for": [
                    3
                ]
            },
            {
                "course_code": "CSC13101",
                "course_name": "Các chủ đề nâng cao trong Công nghệ phần mềm",
                "open-for": [
                    4
                ]
            },
            {
                "course_code": "CSC13102",
                "course_name": "Lập trình ứng dụng Java",
                "open-for": [
                    2
                ]
            },
            {
                "course_code": "CSC13106",
                "course_name": "Kiến trúc phần mềm",
                "open-for": [
                    4
                ]
            },
            {
                "course_code": "CSC13115",
                "course_name": "Các công nghệ mới trong phát triển phần mềm",
                "open-for": [
                    4
                ]
            },
            {
                "course_code": "CSC13116",
                "course_name": "Đồ án Công nghệ phần mềm",
                "open-for": [
                    4
                ]
            },
            {
                "course_code": "CSC14001",
                "course_name": "Automata và ngôn ngữ hình thức",
                "open-for": [
                    3
                ]
            },
            {
                "course_code": "CSC14003",
                "course_name": "Cơ sở trí tuệ nhân tạo",
                "open-for": [
                    3
                ]
            },
            {
                "course_code": "CSC14004",
                "course_name": "Khai thác dữ liệu và ứng dụng",
                "open-for": [
                    3
                ]
            },
            {
                "course_code": "CSC14005",
                "course_name": "Nhập môn học máy",
                "open-for": [
                    3
                ]
            },
            {
                "course_code": "CSC14006",
                "course_name": "Nhận dạng",
                "open-for": [
                    3
                ]
            },
            {
                "course_code": "CSC14008",
                "course_name": "Phương pháp nghiên cứu khoa học",
                "open-for": [
                    3
                ]
            },
            {
                "course_code": "CSC14101",
                "course_name": "Ẩn dữ liệu và chia sẻ thông tin",
                "open-for": [
                    4
                ]
            },
            {
                "course_code": "CSC14105",
                "course_name": "Khoa học về web",
                "open-for": [
                    4
                ]
            },
            {
                "course_code": "CSC14115",
                "course_name": "Khoa học dữ liệu ứng dụng",
                "open-for": [
                    4
                ]
            },
            {
                "course_code": "CSC14116",
                "course_name": "Lập trình song song ứng dụng",
                "open-for": [
                    4
                ]
            },
            {
                "course_code": "CSC14118",
                "course_name": "Nhập môn dữ liệu lớn",
                "open-for": [
                    3
                ]
            },
            {
                "course_code": "CSC15002",
                "course_name": "Bảo mật cơ sở dữ liệu",
                "open-for": [
                    3
                ]
            },
            {
                "course_code": "CSC15003",
                "course_name": "Mã hóa ứng dụng",
                "open-for": [
                    3
                ]
            },
            {
                "course_code": "CSC15004",
                "course_name": "Học thống kê",
                "open-for": [
                    3
                ]
            },
            {
                "course_code": "CSC15007",
                "course_name": "Thống kê máy tính và ứng dụng",
                "open-for": [
                    3
                ]
            },
            {
                "course_code": "CSC15012",
                "course_name": "Ứng dụng xử lý ngôn ngữ tự nhiên trong doanh nghiệp",
                "open-for": [
                    3
                ]
            },
            {
                "course_code": "CSC15105",
                "course_name": "Khai thác dữ liệu văn bản và ứng dụng",
                "open-for": [
                    3
                ]
            },
            {
                "course_code": "CSC15106",
                "course_name": "Seminar Công nghệ tri thức",
                "open-for": [
                    4
                ]
            },
            {
                "course_code": "CSC15108",
                "course_name": "Pháp chứng cho dữ liệu số",
                "open-for": [
                    3
                ]
            },
            {
                "course_code": "CSC15201",
                "course_name": "Đồ án Mã hóa ứng dụng và an ninh thông tin",
                "open-for": [
                    4
                ]
            },
            {
                "course_code": "CSC15202",
                "course_name": "Đồ án tốt nghiệp hướng ứng dụng xử lý ngôn ngữ tự nhiên",
                "open-for": [
                    4
                ]
            },
            {
                "course_code": "CSC16003",
                "course_name": "Phân tích thống kê dữ liệu nhiều biến",
                "open-for": [
                    3
                ]
            },
            {
                "course_code": "CSC16004",
                "course_name": "Thị giác máy tính",
                "open-for": [
                    3
                ]
            },
            {
                "course_code": "CSC16101",
                "course_name": "Đồ họa ứng dụng",
                "open-for": [
                    3
                ]
            },
            {
                "course_code": "CSC16105",
                "course_name": "Truy vấn thông tin thị giác",
                "open-for": [
                    4
                ]
            },
            {
                "course_code": "CSC16109",
                "course_name": "Ứng dụng xử lý ảnh số và video số",
                "open-for": [
                    3
                ]
            },
            {
                "course_code": "CSC16110",
                "course_name": "Chuyên đề Đồ họa máy tính",
                "open-for": [
                    4
                ]
            },
            {
                "course_code": "CSC16111",
                "course_name": "Chuyên đề Thị giác máy tính",
                "open-for": [
                    4
                ]
            },
            {
                "course_code": "CSC16112",
                "course_name": "Chuyên đề Xử lý ảnh số và video số",
                "open-for": [
                    4
                ]
            },
            {
                "course_code": "CSC16113",
                "course_name": "Thị giác máy tính ba chiều",
                "open-for": [
                    4
                ]
            },
            {
                "course_code": "CSC17001",
                "course_name": "Phân tích dữ liệu thông minh",
                "open-for": [
                    3
                ]
            },
            {
                "course_code": "CSC17101",
                "course_name": "Hệ thống tư vấn",
                "open-for": [
                    4
                ]
            },
            {
                "course_code": "MTH00022",
                "course_name": "Vi tích phân 2",
                "open-for": [
                    1
                ]
            },
            {
                "course_code": "MTH00035",
                "course_name": "Đại số tuyến tính",
                "open-for": [
                    1
                ]
            },
            {
                "course_code": "MTH00050",
                "course_name": "Toán học tổ hợp",
                "open-for": [
                    2
                ]
            },
            {
                "course_code": "MTH00051",
                "course_name": "Toán ứng dụng và thống kê",
                "open-for": [
                    2
                ]
            },
            {
                "course_code": "MTH00052",
                "course_name": "Phương pháp tính",
                "open-for": [
                    2
                ]
            },
            {
                "course_code": "MTH00053",
                "course_name": "L ý thuyết số",
                "open-for": [
                    2
                ]
            },
            {
                "course_code": "PHY00001",
                "course_name": "Vật lý đại cương 1 (Cơ - Nhiệt)",
                "open-for": [
                    1
                ]
            },
            {
                "course_code": "PHY00081",
                "course_name": "Thực hành Vật lý đại cương",
                "open-for": [
                    1
                ]
            }
        ]
    }
] as const;
