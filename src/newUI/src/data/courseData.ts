export interface Course {
  id: string;
  code: string;
  name: string;
  nameVi: string;
  credits: number;
  prerequisites: string[];
  isAvailable: boolean;
  needsRetake: boolean;
  description: string;
  descriptionVi: string;
  instructor?: string;
}

export const courses = {
  core: [
    {
      id: "CS101",
      code: "CSC10001",
      name: "Introduction to Programming",
      nameVi: "Nhập môn lập trình",
      credits: 4,
      prerequisites: [],
      isAvailable: true,
      needsRetake: false,
      description:
        "Fundamental programming concepts using Python",
      descriptionVi:
        "Các khái niệm lập trình cơ bản sử dụng Python",
      instructor: "TS. Nguyễn Văn A",
    },
    {
      id: "CS102",
      code: "CSC10002",
      name: "Data Structures & Algorithm",
      nameVi: "Cấu trúc dữ liệu và giải thuật",
      credits: 4,
      prerequisites: ["CS101"],
      isAvailable: true,
      needsRetake: false,
      description:
        "Arrays, linked lists, stacks, queues, trees, graphs",
      descriptionVi:
        "Mảng, danh sách liên kết, ngăn xếp, hàng đợi, cây, đồ thị",
      instructor: "TS. Trần Thị B",
    },
    {
      id: "CS202",
      code: "CSC10004",
      name: "Database Systems",
      nameVi: "Cơ sở dữ liệu",
      credits: 4,
      prerequisites: ["CS102"],
      isAvailable: false,
      needsRetake: true,
      description:
        "Relational databases, SQL, normalization, transactions",
      descriptionVi:
        "Cơ sở dữ liệu quan hệ, SQL, chuẩn hóa, giao dịch",
      instructor: "TS. Phạm Thị D",
    },
    {
      id: "CS203",
      code: "CSC10005",
      name: "Operating Systems",
      nameVi: "Hệ điều hành",
      credits: 4,
      prerequisites: ["CS102"],
      isAvailable: true,
      needsRetake: false,
      description:
        "Process management, memory, file systems, concurrency",
      descriptionVi:
        "Quản lý tiến trình, bộ nhớ, hệ thống tệp, đồng thời",
      instructor: "TS. Hoàng Văn E",
    },
    {
      id: "CS204",
      code: "CSC10006",
      name: "Computer Networks",
      nameVi: "Mạng máy tính",
      credits: 4,
      prerequisites: ["CS101"],
      isAvailable: true,
      needsRetake: false,
      description:
        "Network protocols, TCP/IP, routing, network security",
      descriptionVi:
        "Giao thức mạng, TCP/IP, định tuyến, bảo mật mạng",
      instructor: "TS. Võ Thị F",
    },
  ],
  major: [
    {
      id: "CS301",
      code: "CSC14003",
      name: "Software Engineering",
      nameVi: "Công nghệ phần mềm",
      credits: 4,
      prerequisites: ["CS201", "CS202"],
      isAvailable: false,
      needsRetake: false,
      description:
        "Software development lifecycle, design patterns, testing",
      descriptionVi:
        "Quy trình phát triển phần mềm, mẫu thiết kế, kiểm thử",
      instructor: "TS. Đặng Văn G",
    },
    {
      id: "CS302",
      code: "CSC14004",
      name: "Web Development",
      nameVi: "Phát triển ứng dụng Web",
      credits: 3,
      prerequisites: ["CS202"],
      isAvailable: false,
      needsRetake: false,
      description:
        "Full-stack web development with modern frameworks",
      descriptionVi:
        "Phát triển web full-stack với framework hiện đại",
      instructor: "TS. Bùi Thị H",
    },
    {
      id: "CS303",
      code: "CSC14005",
      name: "Machine Learning",
      nameVi: "Học máy",
      credits: 4,
      prerequisites: ["CS201", "MATH201"],
      isAvailable: true,
      needsRetake: false,
      description:
        "Supervised and unsupervised learning algorithms",
      descriptionVi:
        "Thuật toán học có giám sát và không giám sát",
      instructor: "TS. Ngô Văn I",
    },
    {
      id: "CS304",
      code: "CSC14006",
      name: "Mobile App Development",
      nameVi: "Phát triển ứng dụng di động",
      credits: 3,
      prerequisites: ["CS101"],
      isAvailable: true,
      needsRetake: false,
      description: "iOS and Android development fundamentals",
      descriptionVi: "Cơ bản về phát triển iOS và Android",
      instructor: "TS. Trương Thị J",
    },
    {
      id: "CS305",
      code: "CSC14007",
      name: "Cloud Computing",
      nameVi: "Điện toán đám mây",
      credits: 3,
      prerequisites: ["CS203", "CS204"],
      isAvailable: true,
      needsRetake: false,
      description:
        "AWS, Azure, containerization, microservices",
      descriptionVi: "AWS, Azure, container hóa, microservices",
      instructor: "TS. Lý Văn K",
    },
    {
      id: "CS306",
      code: "CSC14008",
      name: "Cybersecurity",
      nameVi: "An toàn và bảo mật thông tin",
      credits: 4,
      prerequisites: ["CS204"],
      isAvailable: true,
      needsRetake: false,
      description:
        "Security principles, cryptography, ethical hacking",
      descriptionVi:
        "Nguyên lý bảo mật, mật mã, tấn công đạo đức",
      instructor: "TS. Đỗ Thị L",
    },
  ],
  electives: [
    {
      id: "CS401",
      code: "CSC15001",
      name: "Artificial Intelligence",
      nameVi: "Trí tuệ nhân tạo",
      credits: 3,
      prerequisites: ["CS201"],
      isAvailable: true,
      needsRetake: false,
      description:
        "Search algorithms, knowledge representation, AI ethics",
      descriptionVi:
        "Thuật toán tìm kiếm, biểu diễn tri thức, đạo đức AI",
      instructor: "TS. Cao Văn M",
    },
    {
      id: "CS402",
      code: "CSC15002",
      name: "Game Development",
      nameVi: "Phát triển game",
      credits: 3,
      prerequisites: ["CS102"],
      isAvailable: true,
      needsRetake: false,
      description:
        "Game engines, physics, graphics programming",
      descriptionVi: "Game engine, vật lý, lập trình đồ họa",
      instructor: "TS. Phan Thị N",
    },
    {
      id: "CS403",
      code: "CSC15003",
      name: "Blockchain Technology",
      nameVi: "Công nghệ Blockchain",
      credits: 3,
      prerequisites: ["CS202", "CS204"],
      isAvailable: false,
      needsRetake: false,
      description:
        "Distributed ledger, smart contracts, cryptocurrency",
      descriptionVi:
        "Sổ cái phân tán, hợp đồng thông minh, tiền mã hóa",
      instructor: "TS. Hà Văn O",
    },
    {
      id: "CS404",
      code: "CSC15004",
      name: "IoT and Embedded Systems",
      nameVi: "IoT và hệ thống nhúng",
      credits: 3,
      prerequisites: ["CS203"],
      isAvailable: true,
      needsRetake: false,
      description:
        "Sensor networks, embedded programming, IoT protocols",
      descriptionVi:
        "Mạng cảm biến, lập trình nhúng, giao thức IoT",
      instructor: "TS. Đinh Thị P",
    },
  ],
};