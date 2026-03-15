(async function () {
    console.clear();

    // === 1. CẤU HÌNH ===
    const CONFIG = window.__HCMUS_PORTAL_CONFIG__ || {
        URL_DIEM: "/SinhVien.aspx?pid=211",
        URL_LICHTHI: "/SinhVien.aspx?pid=180",
        URL_HOCPHI: "/SinhVien.aspx?pid=331",
        URL_LOPMO: "/SinhVien.aspx?pid=327",
        URL_DKHP: "/SinhVien.aspx?pid=212",
        TARGET_YEAR: "25-26",
        TARGET_SEM: "1"
    };

    //  Kiểm tra hạn sử dụng 30 ngày
    if (CONFIG.EXPIRES_AT && Date.now() > CONFIG.EXPIRES_AT) {
        alert("BẢN CẬP NHẬT MỚI\n\nBookmarklet này đã quá hạn (30 ngày). Để đảm bảo tính chính xác và tương thích, vui lòng quay lại trang HCMUS Portal Tool và kéo lại nút mới nhé!");
        return; // Dừng toàn bộ code
    }

    const URLS = {
        DIEM: "/SinhVien.aspx?pid=211",
        LICHTHI: "/SinhVien.aspx?pid=180",
        HOCPHI: "/SinhVien.aspx?pid=331",
        LOPMO: "/SinhVien.aspx?pid=327",
        DKHP: "/SinhVien.aspx?pid=212"
    };

    // UI: Hiển thị trạng thái loading lên màn hình hiện tại
    const showLoading = (msg) => {
        let el = document.getElementById('hcmus-tool-loading');
        if (!el) {
            el = document.createElement('div');
            el.id = 'hcmus-tool-loading';
            el.style.cssText = "position:fixed;top:10px;right:10px;background:rgba(0,43,90,0.9);color:#fff;padding:15px 20px;z-index:999999;border-radius:8px;font-family:sans-serif;box-shadow:0 4px 12px rgba(0,0,0,0.3);font-size:14px;";
            document.body.appendChild(el);
        }
        el.innerHTML = `<div style="display:flex;align-items:center;gap:10px"><div style="width:16px;height:16px;border:2px solid #fff;border-top-color:transparent;border-radius:50%;animation:spin 1s linear infinite"></div><div>${msg}</div></div><style>@keyframes spin{to{transform:rotate(360deg)}}</style>`;
    };

    const hideLoading = () => {
        const el = document.getElementById('hcmus-tool-loading');
        if (el) el.remove();
    };

    // Helper: Chuyển text HTML thành DOM ảo để query
    const parseHTML = (html) => new DOMParser().parseFromString(html, 'text/html');

    function showPrivacyAndConfigModal() {
        return new Promise((resolve, reject) => {
            // Xóa modal cũ nếu có
            document.getElementById('hcmus-tool-modal')?.remove();

            const modal = document.createElement('div');
            modal.id = 'hcmus-tool-modal';
            modal.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:999999;display:flex;justify-content:center;align-items:center;font-family:'Segoe UI', sans-serif;";

            modal.innerHTML = `
    <div style="background:#fff;width:550px;max-width:95%;border-radius:12px;box-shadow:0 20px 50px rgba(0,0,0,0.3);overflow:hidden;animation:slideDown 0.3s ease-out;display:flex;flex-direction:column;max-height:90vh;">
        
        <div style="background:#004A98;padding:16px 24px;color:white;flex-shrink:0;">
            <h3 style="margin:0;font-size:18px;font-weight:600;display:flex;align-items:center;gap:8px;">
                <span>⚙️</span> Cấu hình lấy dữ liệu
            </h3>
        </div>
        
        <div style="padding:24px;overflow-y:auto;flex:1;">
            
            <div style="margin-bottom: 24px;">
                <h4 style="margin: 0 0 12px; font-size: 14px; color: #004A98; text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px;">
                    📌 LƯU Ý TRƯỚC KHI SỬ DỤNG
                </h4>
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; max-height: 180px; overflow-y: auto; font-size: 13px; color: #475569; line-height: 1.6; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);">
                    
                    <p style="margin-top: 0; font-weight: 700; color: #1e293b; margin-bottom: 4px;">1. Bảo mật & Quyền riêng tư</p>
                    <p style="margin-bottom: 12px; margin-top: 0;">Để đảm bảo an toàn tuyệt đối, mọi dữ liệu học tập của bạn chỉ được xử lý và lưu trữ trực tiếp trên thiết bị cá nhân. Công cụ hoàn toàn không thu thập, gửi đi hay lưu trữ bất kỳ thông tin nào của bạn trên máy chủ.</p>
                    
                    <p style="margin-top: 0; font-weight: 700; color: #1e293b; margin-bottom: 4px;">2. Tính chất của công cụ</p>
                    <p style="margin-bottom: 12px; margin-top: 0;">Đây là tiện ích độc lập nhằm hỗ trợ sinh viên tối ưu hóa việc xếp lịch học, không phải là sản phẩm chính thức của nhà trường. Dữ liệu trích xuất mang tính chất tham khảo và có thể thay đổi phụ thuộc vào portal và các yếu tố khách quan.</p>

                    <p style="margin-top: 0; font-weight: 700; color: #1e293b; margin-bottom: 4px;">3. Cam kết sử dụng</p>
                    <p style="margin-bottom: 0; margin-top: 0;">Bằng việc tiếp tục, bạn đồng ý sử dụng công cụ cho mục đích học tập cá nhân, tự quản lý an toàn thông tin trên máy tính và hiểu rõ giới hạn kỹ thuật của ứng dụng tiện ích này.</p>
                </div>
            </div>
            <div style="display:flex;flex-direction:column;gap:16px;border-top: 1px solid #eee; padding-top: 20px;">
                
                <div style="display:flex;gap:20px;">
                    <label style="display:flex;align-items:center;gap:8px;cursor:not-allowed;font-weight:600;color:#64748b;">
                        <input type="checkbox" id="opt-info" checked disabled style="width:16px;height:16px;accent-color:#004A98;"> Thông tin & Điểm
                    </label>
                    <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-weight:600;color:#334155;">
                        <input type="checkbox" id="opt-tuition" checked style="width:16px;height:16px;accent-color:#004A98;"> Học phí
                    </label>
                </div>

                <div style="background:#f1f5f9; height:1px;"></div>

                <div>
                    <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-weight:600;margin-bottom:10px;color:#004A98;">
                        <input type="checkbox" id="opt-exam" checked onchange="toggleGroup('grp-exam', this.checked)" style="width:16px;height:16px;accent-color:#004A98;"> 
                        Lấy Lịch Thi
                    </label>
                    <div id="grp-exam" style="display:flex;gap:10px;padding-left:28px;">
                        <input type="text" id="exam-year" value="25-26" placeholder="Năm (vd: 25-26)" style="width:110px;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;outline:none;">
                        <select id="exam-sem" style="padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;outline:none;background:white;">
                            <option value="1">Học kỳ 1</option>
                            <option value="2">Học kỳ 2</option>
                            <option value="3">Học kỳ 3</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-weight:600;margin-bottom:10px;color:#004A98;">
                        <input type="checkbox" id="opt-class" checked onchange="toggleGroup('grp-class', this.checked)" style="width:16px;height:16px;accent-color:#004A98;"> 
                        Lấy Danh Sách Lớp Mở
                    </label>
                    <div id="grp-class" style="display:flex;gap:10px;padding-left:28px;">
                        <input type="text" id="class-year" value="25-26" placeholder="Năm (vd: 25-26)" style="width:110px;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;outline:none;">
                        <select id="class-sem" style="padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;outline:none;background:white;">
                            <option value="1">Học kỳ 1</option>
                            <option value="2">Học kỳ 2</option>
                            <option value="3">Học kỳ 3</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-weight:600;margin-bottom:10px;color:#004A98;">
                        <input type="checkbox" id="opt-reg" checked onchange="toggleGroup('grp-reg', this.checked)" style="width:16px;height:16px;accent-color:#004A98;"> 
                        Lấy Kết Quả ĐKHP
                    </label>
                    <div id="grp-reg" style="display:flex;gap:10px;padding-left:28px;">
                        <input type="text" id="reg-year" value="25-26" placeholder="Năm (vd: 25-26)" style="width:110px;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;outline:none;">
                        <select id="reg-sem" style="padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;outline:none;background:white;">
                            <option value="1">Học kỳ 1</option>
                            <option value="2" selected>Học kỳ 2</option>
                            <option value="3">Học kỳ 3</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>

        <div style="background:#f8fafc;padding:16px 24px;display:flex;justify-content:flex-end;gap:12px;border-top:1px solid #e2e8f0;flex-shrink:0;">
            <button id="btn-cancel" style="padding:8px 16px;border:1px solid #cbd5e1;background:white;color:#475569;border-radius:6px;cursor:pointer;font-weight:600;font-size:13px;transition:all 0.2s;">Hủy</button>
            
            <button id="btn-agree" style="padding:8px 20px;border:none;background:#004A98;color:white;border-radius:6px;cursor:pointer;font-weight:600;font-size:13px;box-shadow:0 2px 4px rgba(0,74,152,0.2);transition:all 0.2s;">Đồng ý & Tiếp tục</button>
        </div>
    </div>
    <style>
        @keyframes slideDown{from{opacity:0;transform:translateY(-20px)}to{opacity:1;transform:translateY(0)}}
        #btn-cancel:hover { background: #f1f5f9; }
        #btn-agree:hover { background: #003875; transform: translateY(-1px); box-shadow: 0 4px 6px rgba(0,74,152,0.3); }
    </style>
`;

            document.body.appendChild(modal);

            // Hàm ẩn hiện input
            window.toggleGroup = (id, show) => {
                const el = document.getElementById(id);
                if (el) {
                    el.style.opacity = show ? 1 : 0.5;
                    el.style.pointerEvents = show ? 'auto' : 'none';
                    // Tự động focus vào input nếu enable
                    if (show) {
                        const input = el.querySelector('input');
                        if (input) input.focus();
                    }
                }
            };

            // Xử lý sự kiện nút bấm
            document.getElementById('btn-cancel').onclick = () => {
                modal.remove();
                reject("User cancelled");
            };

            document.getElementById('btn-agree').onclick = () => {
                // Thu thập cấu hình người dùng nhập
                const config = {
                    getTuition: document.getElementById('opt-tuition').checked,
                    getExam: document.getElementById('opt-exam').checked,
                    examYear: document.getElementById('exam-year').value,
                    examSem: document.getElementById('exam-sem').value,
                    getClass: document.getElementById('opt-class').checked,
                    classYear: document.getElementById('class-year').value,
                    classSem: document.getElementById('class-sem').value,
                    getReg: document.getElementById('opt-reg').checked,
                    regYear: document.getElementById('reg-year').value,
                    regSem: document.getElementById('reg-sem').value,
                };
                modal.remove();
                resolve(config);
            };
        });
    }

    // === 2. CÁC HÀM CÀO DỮ LIỆU ===

    // Cào Bảng Điểm (Target: Virtual Document)
    function scrapeGrades(doc) {
        try {
            let name = "Unknown";
            const userEl = doc.getElementById('user_tools') || document.getElementById('user_tools');
            if (userEl) {
                const match = userEl.innerText.match(/Xin chào\s+([^|]+)/i);
                if (match) name = match[1].trim();
            }

            const grades = [];
            doc.querySelectorAll('#tbDiemThiGK tbody tr').forEach(row => {
                if (row.cells.length < 6) return;
                const semester = row.cells[0]?.innerText.trim();
                const rawSubj = row.cells[1]?.innerText.trim();
                let id = "", subjName = rawSubj;
                if (rawSubj.includes(" - ")) {
                    const parts = rawSubj.split(" - ");
                    id = parts[0].trim();
                    subjName = parts.slice(1).join(" - ").trim();
                }
                const credits = row.cells[2]?.innerText.trim();
                const classID = row.cells[3]?.innerText.trim();
                const type = row.cells[4]?.innerText.trim();
                const score = row.cells[5]?.innerText.trim();
                const notes = row.cells[6] ? row.cells[6].innerText.trim() : "";

                if (id) grades.push({ semester, id, name: subjName, credits, class: classID, type, score, notes });
            });
            return { name, grades };
        } catch (e) { console.error("Grade Error", e); return { name: "Error", grades: [] }; }
    }

    // Cào Lịch thi / Học phí (Target: Virtual Document)
    function scrapeBackgroundData(doc, type) {
        try {
            if (type === 'EXAM') {
                const result = {
                    midterm: [],
                    final: []
                };

                const scrapeExamTable = (table, examType) => {
                    if (!table) return [];
                    const rows = [];
                    table.querySelectorAll('tbody tr').forEach(row => {
                        if (row.cells.length > 7) {
                            rows.push({
                                stt: row.cells[0]?.innerText.trim(),
                                id: row.cells[1]?.innerText.trim(),
                                name: row.cells[2]?.innerText.trim(),
                                group: row.cells[3]?.innerText.trim(),
                                date: row.cells[4]?.innerText.trim(),
                                time: row.cells[5]?.innerText.trim(),
                                room: row.cells[6]?.innerText.trim(),
                                place: row.cells[7]?.innerText.trim(),
                                notes: row.cells[8] ? row.cells[8].innerText.trim() : "",
                                type: examType
                            });
                        }
                    });
                    return rows;
                };

                result.midterm = scrapeExamTable(doc.getElementById('tbLichThiGK'), 'GK');
                result.final = scrapeExamTable(doc.getElementById('tbLichThiCK'), 'CK');
                return result;
            }

            if (type === 'TUITION') {
                const details = [];
                doc.querySelectorAll('.dkhp-table tbody tr').forEach((row) => {
                    const c = row.querySelectorAll('td');
                    if (c.length > 9) {
                        const rawSubject = c[2] ? c[2].innerText.trim() : "";
                        if (rawSubject) details.push({
                            stt: c[0]?.innerText.trim(),
                            semester: c[1]?.innerText.trim(),
                            subject: rawSubject,
                            credits: c[3]?.innerText.trim(),
                            periods: c[4]?.innerText.trim(),
                            tuitionCredits: c[5]?.innerText.trim(),
                            originalFee: c[6]?.innerText.trim(),
                            discount: c[7]?.innerText.trim(),
                            support: c[8]?.innerText.trim(),
                            fee: c[9]?.innerText.trim(),
                            cost: c[10] ? c[10].innerText.trim() : "",
                            notes: c[11] ? c[11].innerText.trim() : ""
                        });
                    }
                });

                // Cào footer totals
                const footerRows = doc.querySelectorAll('.dkhp-table tfoot tr');
                let totalCredits = "", totalPeriods = "", totalTuitionCredits = "", totalFee = "", totalActualFee = "", totalDue = "", updatedDate = "";

                footerRows.forEach(row => {
                    const ths = row.querySelectorAll('th');
                    ths.forEach(th => {
                        const title = th.getAttribute('title') || "";
                        const text = th.innerText.trim();
                        if (title === 'Số Tín Chỉ') totalCredits = text;
                        if (title === 'Số Tiết') totalPeriods = text;
                        if (title === 'Số TCHP') totalTuitionCredits = text;
                        if (title === 'Học Phí') totalFee = text;
                        if (title === 'Học Phí Thực Đóng') totalActualFee = text;
                        if (title === 'Tổng số phải đóng') totalDue = text;
                    });
                    // Ngày cập nhật
                    const italic = row.querySelector('i');
                    if (italic) updatedDate = italic.innerText.trim();
                });

                const nhHkInput = doc.getElementById('ctl00_ContentPlaceHolder1_ctl00_cboNamHoc_ctl00_ContentPlaceHolder1_ctl00_cboNamHoc')
                    || doc.querySelector('input[name="ctl00$ContentPlaceHolder1$ctl00$cboNamHoc"]');

                let tuitionYear = "";
                let tuitionSem = "";

                if (nhHkInput && nhHkInput.value) {
                    const parts = nhHkInput.value.split('/');
                    if (parts.length === 2) {
                        tuitionYear = parts[0].trim();
                        tuitionSem = parts[1].trim();
                    }
                }

                return {
                    details: details,
                    totals: {
                        credits: totalCredits,
                        periods: totalPeriods,
                        tuitionCredits: totalTuitionCredits,
                        fee: totalFee,
                        actualFee: totalActualFee,
                        totalDue: totalDue
                    },
                    updatedDate: updatedDate,
                    year: tuitionYear,
                    sem: tuitionSem
                };
            }

        } catch (e) {
            console.error("Lỗi cào dữ liệu background: ", e);
            return type === 'EXAM' ? { midterm: [], final: [] } : { details: [], totals: {}, year: "", sem: "" };
        }
        return [];
    }

    // Cào Kết quả ĐKHP (Target: Virtual Document)
    function scrapeRegisteredCourses(doc) {
        try {
            const table = doc.getElementById('tbSVKQ');
            if (!table) return [];

            const registrations = [];
            table.querySelectorAll('tr').forEach(row => {
                const cells = row.querySelectorAll('td');
                if (cells.length < 7) return;

                const courseId = cells[0]?.textContent.trim();
                const courseName = cells[1]?.textContent.trim();
                const classGroup = cells[2]?.textContent.trim();
                const regType = cells[3]?.textContent.trim();
                const courseType = cells[4]?.textContent.trim();
                const schedule = cells[5]?.textContent.trim();
                const startWeek = cells[6]?.textContent.trim();

                if (courseId && courseId !== "Mã MH") {
                    registrations.push({
                        id: courseId,
                        name: courseName,
                        classGroup,
                        regType,
                        courseType,
                        schedule,
                        startWeek
                    });
                }
            });
            return registrations;
        } catch (e) {
            console.error("Registration Error", e);
            return [];
        }
    }

    async function fetchSubClasses(lmid, type) {
        try {
            // type sẽ là 'LopThucHanh' hoặc 'LopBaiTap'
            const url = `Modules/SVDangKyHocPhan/HandlerSVDKHP.ashx?method=${type}&lmid=${lmid}&dot=1`;
            const res = await fetch(url);
            const json = await res.json();

            // Tùy thuộc vào loại API, nó sẽ trả về mảng nằm ở key khác nhau
            if (type === 'LopThucHanh') return json.LopMoTHs || [];
            if (type === 'LopBaiTap') return json.LopMoBTs || json.LopMoTHs || []; // Fallback

            return [];
        } catch (e) {
            console.error(`Lỗi lấy dữ liệu ${type}:`, e);
            return [];
        }
    }

    // Cào raw rows kèm theo fetch chi tiết TH/BT
    async function scrapeOpenClassesRaw(doc) {
        const table = doc.getElementById('tbPDTKQ');
        if (!table) return [];

        const rows = [];
        // Lấy tất cả thẻ tr (bỏ qua thẻ tr tiêu đề nếu có)
        const trElements = Array.from(table.querySelectorAll('tr'));
        const total = trElements.length;

        // Phải dùng for...of để có thể dùng await bên trong
        for (let i = 0; i < total; i++) {
            // Hiển thị tiến độ cho User đỡ sốt ruột vì fetch API sẽ hơi lâu
            if (i % 3 === 0) showLoading(`Đang quét chi tiết Thực hành/Bài tập: ${i}/${total}`);

            const row = trElements[i];
            const cells = row.querySelectorAll('td');

            // Bỏ qua dòng Header (thường < 9 cột)
            if (cells.length < 9) continue;

            const courseId = cells[0]?.textContent.trim();
            if (!courseId || courseId === "Mã MH") continue;

            let practicalClasses = [];
            let exerciseClasses = [];

            // 1. Kiểm tra và cào danh sách Thực Hành (Nằm ở cột index 8)
            const thLink = cells[8]?.querySelector('a');
            if (thLink) {
                const onclickText = thLink.getAttribute('onclick') || "";
                const matchTH = onclickText.match(/showFormDKThucHanh\("(\d+)"/);
                if (matchTH && matchTH[1]) {
                    practicalClasses = await fetchSubClasses(matchTH[1], 'LopThucHanh');
                }
            }

            // 2. Kiểm tra và cào danh sách Bài Tập (Nằm ở cột index 9)
            const btLink = cells[9]?.querySelector('a');
            if (btLink) {
                const onclickText = btLink.getAttribute('onclick') || "";
                const matchBT = onclickText.match(/showFormDKBaiTap\("(\d+)"/);
                // Một số trường hợp trường code nhầm form Bài tập thành Thực hành, ta cứ fallback tìm số ID
                const matchFallback = onclickText.match(/\("(\d+)"/);
                const finalMatchBT = matchBT || matchFallback;

                if (finalMatchBT && finalMatchBT[1]) {
                    exerciseClasses = await fetchSubClasses(finalMatchBT[1], 'LopBaiTap');
                }
            }

            // 3. Đóng gói dữ liệu (Raw Lý thuyết + Raw Thực Hành + Raw Bài tập)
            rows.push({
                id: courseId,
                name: cells[1]?.textContent.trim(),
                className: cells[2]?.textContent.trim(),
                credits: cells[3]?.textContent.trim(),
                capacity: cells[4]?.textContent.trim(),
                enrolled: cells[5]?.textContent.trim(),
                cohort: cells[6]?.textContent.trim(),
                schedule: cells[7]?.textContent.trim(),
                practicalGroupRaw: cells[8]?.textContent.trim(),
                exerciseGroupRaw: cells[9] ? cells[9].textContent.trim() : "",
                location: cells[10] ? cells[10].textContent.trim() : "",
                // Nhét thẳng mảng kết quả cào được vào đây
                practicalClasses: practicalClasses,
                exerciseClasses: exerciseClasses
            });
        }
        return rows;
    }

    // --- LOGIC FETCH TRANG VÀ POSTBACK (CORE) ---

    // Hàm lấy trang web bất kỳ và trả về DOM ảo
    async function fetchVirtualPage(url) {
        const res = await fetch(url);
        const text = await res.text();
        return parseHTML(text);
    }

    // Hàm giả lập Submit Form để đổi học kỳ
    async function postToGetSemester(url, originalDoc, elementIds, targetYear, targetSem) {
        const viewState = originalDoc.getElementById('__VIEWSTATE')?.value;
        const viewStateGen = originalDoc.getElementById('__VIEWSTATEGENERATOR')?.value;
        const eventValidation = originalDoc.getElementById('__EVENTVALIDATION')?.value;

        if (!viewState) throw new Error("Không lấy được ViewState. Session có thể đã hết hạn.");

        const formData = new URLSearchParams();
        formData.append('__EVENTTARGET', '');
        formData.append('__EVENTARGUMENT', '');
        formData.append('__VIEWSTATE', viewState);
        if (viewStateGen) formData.append('__VIEWSTATEGENERATOR', viewStateGen);
        if (eventValidation) formData.append('__EVENTVALIDATION', eventValidation);

        formData.append(elementIds.year, targetYear);
        formData.append(elementIds.sem, targetSem);
        formData.append(elementIds.btn, elementIds.btnValue || "Xem");

        const res = await fetch(url, {
            method: 'POST',
            body: formData,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const text = await res.text();
        return parseHTML(text);
    }

    // Hàm lấy trang điểm "Tất cả các kỳ"
    async function getFullGradesPage() {
        const url = CONFIG.URL_DIEM;
        let doc = await fetchVirtualPage(url);

        const viewState = doc.getElementById('__VIEWSTATE')?.value;
        const viewStateGen = doc.getElementById('__VIEWSTATEGENERATOR')?.value;
        const eventValidation = doc.getElementById('__EVENTVALIDATION')?.value;

        if (!viewState) return doc;

        const formData = new URLSearchParams();
        formData.append('__EVENTTARGET', '');
        formData.append('__EVENTARGUMENT', '');
        formData.append('__VIEWSTATE', viewState);
        if (viewStateGen) formData.append('__VIEWSTATEGENERATOR', viewStateGen);
        if (eventValidation) formData.append('__EVENTVALIDATION', eventValidation);

        formData.append('ctl00$ContentPlaceHolder1$ctl00$cboNamHoc_gvDKHPLichThi$ob_CbocboNamHoc_gvDKHPLichThiTB', '--Tất cả--');
        formData.append('ctl00$ContentPlaceHolder1$ctl00$cboNamHoc_gvDKHPLichThi', '0');
        formData.append('ctl00$ContentPlaceHolder1$ctl00$cboHocKy_gvDKHPLichThi$ob_CbocboHocKy_gvDKHPLichThiTB', '');
        formData.append('ctl00$ContentPlaceHolder1$ctl00$cboHocKy_gvDKHPLichThi', '0');
        formData.append('ctl00$ContentPlaceHolder1$ctl00$btnXemDiemThi', 'Xem Kết Quả Học Tập');

        const res = await fetch(url, {
            method: 'POST',
            body: formData,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        const text = await res.text();
        return parseHTML(text);
    }

    // === 3. MAIN RUNNER ===
    try {
        if (!window.opener) {
            alert("Vui lòng mở Portal bằng nút \"Đăng nhập\" để công cụ hoạt động.");
            return;
        }
        const config = await showPrivacyAndConfigModal();

        showLoading("Đang khởi tạo & Lấy dữ liệu cơ bản...");

        let gradeData = { name: "Unknown", grades: [] };
        let tuitionData = { details: [], totals: {}, year: "", sem: "" };
        let examData = { midterm: [], final: [] };
        let courses = [];
        let registrations = [];

        // 2. Lấy dữ liệu cơ bản (Điểm - Bắt buộc)
        const docDiemFull = await getFullGradesPage();
        gradeData = scrapeGrades(docDiemFull);

        showLoading("Đang tải Bảng điểm đầy đủ...");
        // Lấy Học phí
        if (config.getTuition) {
            showLoading("Đang tải Học phí...");
            const docHocPhi = await fetchVirtualPage(URLS.HOCPHI);
            tuitionData = scrapeBackgroundData(docHocPhi, 'TUITION');
        }

        // 3. Xử lý Lịch thi (BẢN VÉT LƯỚI TOÀN DIỆN - ĐA TẦNG NĂM-KỲ)
        if (config.getExam) {
            showLoading(`Đang khởi động tiến trình quét Lịch Thi toàn diện...`);
            let docThiBase = await fetchVirtualPage(URLS.LICHTHI);

            // B1: Đào list Năm học
            const yearOptions = [];
            const yearListEl = docThiBase.querySelector('.ob_iCboICBC');
            if (yearListEl) {
                yearListEl.querySelectorAll('li').forEach(li => {
                    const matchObj = li.textContent.match(/\d{2}-\d{2}/);
                    if (matchObj && matchObj[0] && !yearOptions.includes(matchObj[0])) {
                        yearOptions.push(matchObj[0]);
                    }
                });
            }
            if (yearOptions.length === 0) yearOptions.push("25-26", "24-25", "23-24", "22-23");

            const semOptions = ["1", "2", "3"];
            const allExams = {};

            let count = 0;
            const totalScans = yearOptions.length * semOptions.length;

            // B2: Vòng lặp Brute-force
            for (const year of yearOptions) {
                for (const sem of semOptions) {
                    count++;
                    showLoading(`Đang dò tìm Lịch thi [Năm ${year} - HK ${sem}] (${count}/${totalScans})...`);

                    try {
                        // NHỊP 1: Dọn đường (GET request)
                        const targetUrl = `${URLS.LICHTHI}&nh=${year}&hk=${sem}`;
                        const getRes = await fetch(targetUrl);
                        const prefilledDoc = parseHTML(await getRes.text());

                        // Lấy mớ ViewState mới nhất
                        const viewState = prefilledDoc.getElementById('__VIEWSTATE')?.value;
                        const viewStateGen = prefilledDoc.getElementById('__VIEWSTATEGENERATOR')?.value;
                        const eventValidation = prefilledDoc.getElementById('__EVENTVALIDATION')?.value;

                        if (!viewState) continue; // Nếu lỡ đứt mạng thì bỏ qua kỳ này

                        // NHỊP 2: Đóng gói Payload CHUẨN XÁC
                        const formData = new URLSearchParams();

                        // Core ASP.NET
                        formData.append('__EVENTTARGET', '');
                        formData.append('__EVENTARGUMENT', '');
                        formData.append('__VIEWSTATE', viewState);
                        if (viewStateGen) formData.append('__VIEWSTATEGENERATOR', viewStateGen);
                        if (eventValidation) formData.append('__EVENTVALIDATION', eventValidation);

                        // Móc nối toàn bộ các thẻ input râu ria khác (trừ Obout)
                        prefilledDoc.querySelectorAll('input[type="hidden"]').forEach(el => {
                            if (el.name && !el.name.includes('cboNamHoc') && !el.name.includes('cboHocKy') && !el.name.startsWith('__')) {
                                formData.append(el.name, el.value);
                            }
                        });

                        // Ghi đè bằng tay bộ parameter của Obout (Đã kiểm chứng từ Network Tab)
                        formData.append('ctl00$ContentPlaceHolder1$ctl00$cboNamHoc_gvDKHPLichThi$ob_CbocboNamHoc_gvDKHPLichThiTB', year);
                        formData.append('ctl00$ContentPlaceHolder1$ctl00$cboNamHoc_gvDKHPLichThi$ob_CbocboNamHoc_gvDKHPLichThiSIS', '1');
                        formData.append('ctl00$ContentPlaceHolder1$ctl00$cboNamHoc_gvDKHPLichThi', year);

                        formData.append('ctl00$ContentPlaceHolder1$ctl00$cboHocKy_gvDKHPLichThi$ob_CbocboHocKy_gvDKHPLichThiTB', sem);
                        formData.append('ctl00$ContentPlaceHolder1$ctl00$cboHocKy_gvDKHPLichThi$ob_CbocboHocKy_gvDKHPLichThiSIS', '1');
                        formData.append('ctl00$ContentPlaceHolder1$ctl00$cboHocKy_gvDKHPLichThi', sem);

                        formData.append('ctl00$ContentPlaceHolder1$ctl00$btnXemLichThi', 'Xem Lịch Thi');

                        // NHỊP 3: Bắn POST
                        const postRes = await fetch(targetUrl, {
                            method: 'POST',
                            body: formData,
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                        });

                        const finalDoc = parseHTML(await postRes.text());

                        // Bóc tách bảng dữ liệu
                        const partialData = scrapeBackgroundData(finalDoc, 'EXAM');

                        // CHỈ LƯU VÀO DATA NẾU CÓ THỰC SỰ CÓ LỊCH THI
                        if (partialData.midterm.length > 0 || partialData.final.length > 0) {
                            const key = `${year}-${sem}`; // Tạo key đa tầng, vd: "24-25-2"

                            // Gắn nhãn năm/kỳ
                            partialData.midterm.forEach(item => { item.year = year; item.semester = sem; });
                            partialData.final.forEach(item => { item.year = year; item.semester = sem; });

                            allExams[key] = {
                                midterm: partialData.midterm,
                                final: partialData.final
                            };
                        }

                    } catch (err) {
                        console.warn(`Lỗi lịch thi ${year} HK${sem}:`, err);
                    }
                }
            }

            examData = allExams;
        }

        // 4. Xử lý Lớp Mở
        if (config.getClass) {
            showLoading(`Đang truy cập Lớp mở HK${config.classSem}/${config.classYear}...`);

            let docLopMo = await fetchVirtualPage(URLS.LOPMO);

            const openClassPageIds = {
                year: "ctl00$ContentPlaceHolder1$ctl00$cboNamHoc",
                sem: "ctl00$ContentPlaceHolder1$ctl00$cboHocKy",
                btn: "ctl00$ContentPlaceHolder1$ctl00$btnXem",
                btnValue: "Xem"
            };

            const curClassYear = docLopMo.getElementById("ctl00_ContentPlaceHolder1_ctl00_cboNamHoc")?.value;
            const curClassSem = docLopMo.getElementById("ctl00_ContentPlaceHolder1_ctl00_cboHocKy")?.value;

            if (curClassYear !== config.classYear || curClassSem !== config.classSem) {
                showLoading(`Đang chuyển Lớp mở sang HK${config.classSem}/${config.classYear}...`);
                docLopMo = await postToGetSemester(URLS.LOPMO, docLopMo, openClassPageIds, config.classYear, config.classSem);
            }

            showLoading(`Đang cào dữ liệu lớp mở...`);
            courses = await scrapeOpenClassesRaw(docLopMo);
        }

        // 5. Xử lý Kết quả ĐKHP
        if (config.getReg) {
            showLoading(`Đang lấy Kết quả ĐKHP HK${config.regSem}/${config.regYear}...`);

            let docDKHP = await fetchVirtualPage(URLS.DKHP);

            const curRegYear = docDKHP.querySelector('input[name="ctl00$ContentPlaceHolder1$ctl00$cboNamHoc"]')?.value;
            const curRegSem = docDKHP.querySelector('input[name="ctl00$ContentPlaceHolder1$ctl00$cboHocKy"]')?.value;

            if (curRegYear !== config.regYear || curRegSem !== config.regSem) {
                showLoading(`Đang chuyển ĐKHP sang HK${config.regSem}/${config.regYear}...`);

                // FIX 3: Custom Postback dành riêng cho form ĐKHP (phải kèm thuộc tính TB của Obout)
                const viewState = docDKHP.getElementById('__VIEWSTATE')?.value;
                const viewStateGen = docDKHP.getElementById('__VIEWSTATEGENERATOR')?.value;
                const eventValidation = docDKHP.getElementById('__EVENTVALIDATION')?.value;

                const formData = new URLSearchParams();
                formData.append('__EVENTTARGET', '');
                formData.append('__EVENTARGUMENT', '');
                formData.append('__VIEWSTATE', viewState);
                if (viewStateGen) formData.append('__VIEWSTATEGENERATOR', viewStateGen);
                if (eventValidation) formData.append('__EVENTVALIDATION', eventValidation);

                // Ép thêm parameter TB để đánh lừa Obout ComboBox
                formData.append('ctl00$ContentPlaceHolder1$ctl00$cboNamHoc$ob_CbocboNamHocTB', config.regYear);
                formData.append('ctl00$ContentPlaceHolder1$ctl00$cboNamHoc', config.regYear);

                formData.append('ctl00$ContentPlaceHolder1$ctl00$cboHocKy$ob_CbocboHocKyTB', config.regSem);
                formData.append('ctl00$ContentPlaceHolder1$ctl00$cboHocKy', config.regSem);

                formData.append('ctl00$ContentPlaceHolder1$ctl00$btnXem', 'Xem');

                const res = await fetch(URLS.DKHP, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                });

                docDKHP = parseHTML(await res.text());
            }

            registrations = scrapeRegisteredCourses(docDKHP);
        }

        hideLoading();

        if (config.getClass && (!courses || courses.length === 0)) {
            alert("⚠️ Không lấy được danh sách lớp mở. Có thể do lỗi kết nối hoặc Portal bị đổi cấu trúc.");
            return;
        }

        // Raw data — nguyên vẹn từ Portal, không xử lý
        const rawData = {
            name: gradeData.name,
            grades: gradeData.grades,
            exams: examData,
            tuition: tuitionData,
            registrations: registrations,
            courses: courses
        };

        const metaData = {
            scrapedAt: new Date().toISOString(),
            params: {
                tuition: config.getTuition ? { year: tuitionData.year, sem: tuitionData.sem } : null,
                exam: config.getExam ? { year: config.examYear, sem: config.examSem } : null,
                class: config.getClass ? { year: config.classYear, sem: config.classSem } : null,
                registration: config.getReg ? { year: config.regYear, sem: config.regSem } : null,
            }
        };

        const fullDataPacket = {
            raw: rawData,
            meta: metaData
        };

        console.log("🔥 FULL DATA PACKET:", fullDataPacket);

        if (window.opener) {
            window.opener.postMessage({ type: 'IMPORT_FULL_DATA', payload: fullDataPacket }, '*');
            alert(`✅ HOÀN TẤT QUÁ TRÌNH!\n\nĐã gửi gói dữ liệu RAW gồm:\n- ${rawData.grades.length} dòng điểm\n- ${(rawData.exams.midterm?.length || 0) + (rawData.exams.final?.length || 0)} lịch thi\n- ${rawData.tuition.details?.length || 0} dòng học phí\n- ${courses.length} dòng lớp mở\n- ${registrations.length} môn đã đăng ký\n\nKiểm tra bên tab Tool nhé!`);
        } else {
            // giờ cụm này kh hoạt động nma để lại cho HK nha :>
            alert(`Vui lòng mở Portal bằng nút "Đăng nhập" để công cụ hoạt động.`);
            const blob = new Blob([JSON.stringify(fullDataPacket, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `HCMUS_FullData_${gradeData.name}.json`;
            a.click();
            alert(`✅ Đã xong! File dữ liệu đang được tải xuống.`);
        }

    } catch (e) {
        hideLoading();
        if (e === "User cancelled") {
            console.log("Người dùng đã hủy.");
        } else {
            console.error(e);
            alert("❌ Lỗi: " + e.message);
        }
    }

})();