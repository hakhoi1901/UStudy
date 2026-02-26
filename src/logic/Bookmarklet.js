(async function () {
    console.clear();

    // === 1. CẤU HÌNH ===
    const CONFIG = {
        URL_DIEM: "/SinhVien.aspx?pid=211",
        URL_LICHTHI: "/SinhVien.aspx?pid=180",
        URL_HOCPHI: "/SinhVien.aspx?pid=331",
        URL_LOPMO: "/SinhVien.aspx?pid=327",
        TARGET_YEAR: "25-26", // Năm học mong muốn
        TARGET_SEM: "1"       // Học kỳ mong muốn
    };

    const URLS = {
        DIEM: "/SinhVien.aspx?pid=211",
        LICHTHI: "/SinhVien.aspx?pid=180",
        HOCPHI: "/SinhVien.aspx?pid=331",
        LOPMO: "/SinhVien.aspx?pid=327"
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
                    
                    <!-- Header -->
                    <div style="background:#004A98;padding:16px 24px;color:white;flex-shrink:0;">
                        <h3 style="margin:0;font-size:18px;font-weight:600;display:flex;align-items:center;gap:8px;">
                            <span>⚙️</span> Cấu hình lấy dữ liệu
                        </h3>
                    </div>
                    
                    <!-- Body (Scrollable) -->
                    <div style="padding:24px;overflow-y:auto;flex:1;">
                        
                        <!-- [THAY ĐỔI]: Cập nhật nội dung Tuyên bố miễn trừ trách nhiệm & Điều khoản -->
                        <div style="margin-bottom: 24px;">
                            <h4 style="margin: 0 0 12px; font-size: 14px; color: #dc2626; text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px;">
                                ⚠️ TUYÊN BỐ MIỄN TRỪ TRÁCH NHIỆM & ĐIỀU KHOẢN SỬ DỤNG
                            </h4>
                            <div style="background: #fffafa; border: 1px solid #fee2e2; border-radius: 8px; padding: 16px; max-height: 180px; overflow-y: auto; font-size: 13px; color: #475569; line-height: 1.6; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);">
                                
                                <p style="margin-top: 0; font-weight: 700; color: #1e293b; margin-bottom: 4px;">1. Minh bạch kỹ thuật (Transparency)</p>
                                <p style="margin-bottom: 12px; margin-top: 0;">Công cụ này hoạt động dựa trên cơ chế <strong>Client-side</strong>. Mọi dữ liệu (điểm, lịch thi...) được xử lý trực tiếp trên trình duyệt và lưu trữ cục bộ (<code>localStorage</code>) tại thiết bị của bạn. Chúng tôi không sở hữu máy chủ lưu trữ và không thu thập dữ liệu về phía nhà phát triển.</p>
                                
                                <p style="margin-top: 0; font-weight: 700; color: #1e293b; margin-bottom: 4px;">2. Tuyên bố miễn trừ trách nhiệm (Disclaimer)</p>
                                <ul style="margin: 0 0 12px 20px; padding: 0; list-style-type: disc;">
                                    <li>Phần mềm được cung cấp theo nguyên trạng <strong>"NHƯ LÀ" (AS-IS)</strong>, không có sự bảo đảm nào.</li>
                                    <li>Nhóm phát triển <strong>KHÔNG</strong> chịu trách nhiệm cho bất kỳ thiệt hại nào (mất dữ liệu, lộ thông tin cá nhân do máy tính bị nhiễm virus, lỗi hiển thị...) phát sinh từ việc sử dụng công cụ.</li>
                                    <li>Chúng tôi không cam kết phần mềm hoạt động không lỗi do các thay đổi khách quan từ phía Portal nhà trường.</li>
                                </ul>

                                <p style="margin-top: 0; font-weight: 700; color: #1e293b; margin-bottom: 4px;">3. Chấp thuận của người dùng (Consent)</p>
                                <p style="margin-bottom: 0; margin-top: 0;">Bằng việc tiếp tục, bạn xác nhận hiểu rõ dữ liệu nằm trên thiết bị của mình, chấp nhận mọi rủi ro tiềm ẩn khi dùng phần mềm thứ ba và đồng ý giải phóng nhóm phát triển khỏi mọi trách nhiệm pháp lý liên quan.</p>
                            </div>
                        </div>
                        <!-- [KẾT THÚC THAY ĐỔI] -->

                        <!-- Config Options -->
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
                        </div>
                    </div>

                    <!-- Footer -->
                    <div style="background:#f8fafc;padding:16px 24px;display:flex;justify-content:flex-end;gap:12px;border-top:1px solid #e2e8f0;flex-shrink:0;">
                        <button id="btn-cancel" style="padding:8px 16px;border:1px solid #cbd5e1;background:white;color:#475569;border-radius:6px;cursor:pointer;font-weight:600;font-size:13px;transition:all 0.2s;">Hủy</button>
                        
                        <!-- [THAY ĐỔI]: Sửa text nút bấm để thể hiện sự đồng thuận pháp lý -->
                        <button id="btn-agree" style="padding:8px 20px;border:none;background:#004A98;color:white;border-radius:6px;cursor:pointer;font-weight:600;font-size:13px;box-shadow:0 2px 4px rgba(0,74,152,0.2);transition:all 0.2s;">Tôi đã hiểu & Đồng ý</button>
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
            // Lấy name từ document ảo hoặc document thật nếu không thấy
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
                let id = "", name = rawSubj;
                if (rawSubj.includes(" - ")) {
                    const parts = rawSubj.split(" - ");
                    id = parts[0].trim();
                    name = parts.slice(1).join(" - ").trim();
                }
                const credits = row.cells[2]?.innerText.trim();
                const classID = row.cells[3]?.innerText.trim();
                const rawScore = row.cells[5]?.innerText.trim();
                let score = !isNaN(parseFloat(rawScore)) ? parseFloat(rawScore) : rawScore;

                if (id) grades.push({ semester, id, name, credits, class: classID, score });
            });
            return { name, grades };
        } catch (e) { console.error("Grade Error", e); return { name: "Error", grades: [] }; }
    }

    // Cào Lịch thi / Học phí (Target: Virtual Document)
    function scrapeBackgroundData(doc, type) {
        try {
            if (type === 'EXAM') {
                const result = {
                    midterm: [], // Giữa kỳ
                    final: []    // Cuối kỳ
                };

                // --- XỬ LÝ GIỮA KỲ (GK) ---
                const tableGK = doc.getElementById('tbLichThiGK');
                if (tableGK) {
                    tableGK.querySelectorAll('tbody tr').forEach(row => {
                        if (row.cells.length > 7) {
                            result.midterm.push({
                                id: row.cells[1]?.innerText.trim(),      // Mã MH
                                name: row.cells[2]?.innerText.trim(),    // Tên MH
                                group: row.cells[3]?.innerText.trim(),   // Lớp
                                date: row.cells[4]?.innerText.trim(),    // Ngày
                                time: row.cells[5]?.innerText.trim(),    // Giờ
                                room: row.cells[6]?.innerText.trim(),    // Phòng
                                place: row.cells[7]?.innerText.trim(),   // Địa điểm
                                type: 'GK'
                            });
                        }
                    });
                }

                // --- XỬ LÝ CUỐI KỲ (CK) ---
                const tableCK = doc.getElementById('tbLichThiCK');
                if (tableCK) {
                    tableCK.querySelectorAll('tbody tr').forEach(row => {
                        if (row.cells.length > 7) {
                            result.final.push({
                                id: row.cells[1]?.innerText.trim(),
                                name: row.cells[2]?.innerText.trim(),
                                group: row.cells[3]?.innerText.trim(),
                                date: row.cells[4]?.innerText.trim(),
                                time: row.cells[5]?.innerText.trim(),
                                room: row.cells[6]?.innerText.trim(),
                                place: row.cells[7]?.innerText.trim(),
                                type: 'CK'
                            });
                        }
                    });
                }
                return result;
            }

            if (type === 'TUITION') {
                const details = [];
                doc.querySelectorAll('.dkhp-table tbody tr').forEach(row => {
                    const c = row.querySelectorAll('td');
                    if (c.length > 9) {
                        let rawName = c[2].innerText.trim();
                        let codeMatch = rawName.match(/\[(.*?)\]/);
                        let code = codeMatch ? codeMatch[1] : "";
                        let name = rawName.replace(/\[.*?\]/g, '').trim();
                        if (rawName) details.push({ code, name, credits: c[3].innerText.trim(), fee: c[9].innerText.trim() });
                    }
                });
                const totalEl = doc.querySelector('th[title="Tổng số phải đóng"]');
                return { total: totalEl ? totalEl.innerText.trim() : "0", details };
            }

        } catch (e) {
            console.error("Lỗi cào dữ liệu background: ", e);
            return type === 'EXAM' ? { midterm: [], final: [] } : { total: "0", details: [] };
        }
        return [];
    }

    // --- PHẦN XỬ LÝ LỚP MỞ ---

    function parseScheduleString(str) {
        if (!str) return [];
        const regex = /T(\d|CN)\((\d+(\.\d+)?)-(\d+(\.\d+)?)\)/g;
        const matches = str.match(regex);
        return matches ? matches : [];
    }

    async function fetchPracticalClasses(lmid) {
        try {
            const url = `Modules/SVDangKyHocPhan/HandlerSVDKHP.ashx?method=LopThucHanh&lmid=${lmid}&dot=1`;
            const res = await fetch(url);
            const json = await res.json();
            return json.LopMoTHs || [];
        } catch (e) { return []; }
    }

    // Hàm cào lớp mở (Nhận vào Doc ảo)
    async function scrapeOpenClassesAsync(doc) {
        const table = doc.getElementById('tbPDTKQ');
        if (!table) return [];

        const rows = Array.from(table.querySelectorAll('tbody tr'));
        const courseMap = {};

        const total = rows.length;

        for (let i = 0; i < rows.length; i++) {
            if (i % 3 === 0) showLoading(`Đang quét lớp thực hành: ${i}/${total}`);

            const row = rows[i];
            const cells = row.cells;
            if (cells.length < 9) continue;

            const subjID = cells[0].innerText.trim();
            const subjName = cells[1].innerText.trim();
            const ltClassID = cells[2].innerText.trim();
            const credits = parseInt(cells[3].innerText.trim()) || 0;
            const ltScheduleStr = cells[7] ? cells[7].innerText.trim() : "";
            const ltSchedule = parseScheduleString(ltScheduleStr);

            if (!subjID) continue;

            if (!courseMap[subjID]) {
                courseMap[subjID] = { id: subjID, name: subjName, credits: credits, classes: [] };
            }

            const thCell = cells[8];
            const thLink = thCell.querySelector('a');

            if (thLink) {
                const onclickText = thLink.getAttribute('onclick');
                const match = onclickText.match(/showFormDKThucHanh\("(\d+)"/);

                if (match && match[1]) {
                    const lmid = match[1];
                    const thClasses = await fetchPracticalClasses(lmid);

                    if (thClasses && thClasses.length > 0) {
                        thClasses.forEach(th => {
                            const thClassID = th.Nhom;
                            const thSchedule = parseScheduleString(th.LichHoc);
                            courseMap[subjID].classes.push({
                                id: thClassID,
                                schedule: [...ltSchedule, ...thSchedule]
                            });
                        });
                    } else {
                        courseMap[subjID].classes.push({ id: ltClassID, schedule: ltSchedule });
                    }
                } else {
                    courseMap[subjID].classes.push({ id: ltClassID, schedule: ltSchedule });
                }
            } else {
                const exists = courseMap[subjID].classes.find(c => c.id === ltClassID);
                if (!exists) {
                    courseMap[subjID].classes.push({ id: ltClassID, schedule: ltSchedule });
                } else {
                    if (ltSchedule.length > 0) {
                        exists.schedule = [...new Set([...exists.schedule, ...ltSchedule])];
                    }
                }
            }
        }
        return Object.values(courseMap);
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
        const config = await showPrivacyAndConfigModal();

        showLoading("Đang khởi tạo & Lấy dữ liệu cơ bản...");

        let gradeData = { name: "Unknown", grades: [] };
        let tuitionData = { total: "0", details: [] };
        let examData = { midterm: [], final: [] };
        let courses = [];

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

        // 3. Xử lý Lịch thi
        if (config.getExam) {
            showLoading(`Đang lấy Lịch thi HK${config.examSem}/${config.examYear}...`);

            let docThi = await fetchVirtualPage(URLS.LICHTHI);

            const examPageIds = {
                year: "ctl00$ContentPlaceHolder1$ctl00$cboNamHoc_gvDKHPLichThi",
                sem: "ctl00$ContentPlaceHolder1$ctl00$cboHocKy_gvDKHPLichThi",
                btn: "ctl00$ContentPlaceHolder1$ctl00$btnXemLichThi",
                btnValue: "Xem Lịch Thi"
            };

            const curExamYear = docThi.getElementById("ctl00_ContentPlaceHolder1_ctl00_cboNamHoc_gvDKHPLichThi_ob_CbocboNamHoc_gvDKHPLichThiTB")?.value
                || docThi.querySelector("input[name$='cboNamHoc_gvDKHPLichThi$ob_CbocboNamHoc_gvDKHPLichThiTB']")?.value;
            const curExamSem = docThi.getElementById("ctl00_ContentPlaceHolder1_ctl00_cboHocKy_gvDKHPLichThi_ob_CbocboHocKy_gvDKHPLichThiTB")?.value
                || docThi.querySelector("input[name$='cboHocKy_gvDKHPLichThi$ob_CbocboHocKy_gvDKHPLichThiTB']")?.value;

            if (curExamYear !== config.examYear || curExamSem !== config.examSem) {
                showLoading(`Đang chuyển Lịch thi sang HK${config.examSem}/${config.examYear}...`);
                docThi = await postToGetSemester(URLS.LICHTHI, docThi, examPageIds, config.examYear, config.examSem);
            }

            examData = scrapeBackgroundData(docThi, 'EXAM');
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

            courses = await scrapeOpenClassesAsync(docLopMo);
        }

        hideLoading();

        if (config.getClass && (!courses || courses.length === 0)) {
            alert("⚠️ Không lấy được danh sách lớp mở. Có thể do lỗi kết nối hoặc Portal bị đổi cấu trúc.");
            return;
        }

        const studentPayload = {
            name: gradeData.name,
            grades: gradeData.grades,
            exams: examData,
            tuition: tuitionData,
            program: []
        };

        const fullDataPacket = {
            student: studentPayload,
            courses: courses
        };

        console.log("🔥 FULL DATA PACKET:", fullDataPacket);

        if (window.opener) {
            window.opener.postMessage({ type: 'IMPORT_FULL_DATA', payload: fullDataPacket }, '*');
            alert(`✅ HOÀN TẤT QUÁ TRÌNH!\n\nĐã gửi gói dữ liệu tổng hợp gồm:\n- Thông tin SV & Điểm thi\n- ${studentPayload.exams.midterm?.length + studentPayload.exams.final?.length} lịch thi\n- ${courses.length} lớp mở\n\nKiểm tra bên tab Tool nhé!`);
        } else {
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