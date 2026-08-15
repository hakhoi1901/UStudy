const fs = require('fs');
const path = require('path');

const INPUT_FILE = './src/assets/data/khoa-cntt/courses.ts';
const OUTPUT_FILE = './src/assets/data/khoa-cntt/courses_unique.ts';

function processDeduplication() {
    // 1. Đọc và bóc tách dữ liệu từ file
    let content = fs.readFileSync(INPUT_FILE, 'utf-8');
    content = content.replace(/export\s+const\s+\w+\s*=\s*/, '').trim();
    if (content.endsWith(';')) content = content.slice(0, -1);

    let courses = [];
    try {
        courses = new Function('return ' + content)();
    } catch (err) {
        console.error("Lỗi cú pháp khi đọc file nguồn:", err);
        return;
    }

    // 2. Thuật toán cốt lõi: Lọc trùng lặp giữ lại description dài nhất
    const uniqueCoursesMap = new Map();

    for (const currentCourse of courses) {
        const id = currentCourse.course_id;

        // Đảm bảo an toàn dữ liệu: Nếu description là null/undefined, quy về chuỗi rỗng
        const currentDescLength = (currentCourse.description || "").length;

        if (!uniqueCoursesMap.has(id)) {
            // Nếu mã môn học chưa tồn tại trong Map, thêm mới vào
            uniqueCoursesMap.set(id, currentCourse);
        } else {
            // Nếu đã tồn tại, tiến hành so sánh chiều dài description
            const existingCourse = uniqueCoursesMap.get(id);
            const existingDescLength = (existingCourse.description || "").length;

            if (currentDescLength > existingDescLength) {
                // Ghi đè nếu môn học hiện tại có mô tả dài hơn
                uniqueCoursesMap.set(id, currentCourse);
            }
        }
    }

    // Chuyển Map trở lại thành Array
    const finalCourses = Array.from(uniqueCoursesMap.values());

    // 3. Xuất file kết quả
    const outputContent = `export const courses = ${JSON.stringify(finalCourses, null, 4)};\n`;
    fs.writeFileSync(OUTPUT_FILE, outputContent, 'utf-8');

    console.log(`Đã xử lý xong! Dữ liệu gốc: ${courses.length} môn. Dữ liệu sau khi lọc: ${finalCourses.length} môn.`);
}

processDeduplication();