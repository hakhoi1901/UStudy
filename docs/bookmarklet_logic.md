# Bookmarklet Logic

Tai lieu nay mo ta logic hien tai cua bookmarklet trong `src/logic/Bookmarklet.js`, cach nut bookmarklet duoc tao trong app, cach no lay du lieu tu HCMUS Portal, va cach du lieu duoc gui nguoc ve UStudy.

## Muc dich

Bookmarklet la mot doan JavaScript chay truc tiep tren tab HCMUS Portal da dang nhap. No doc HTML/endpoint noi bo cua Portal bang session hien tai cua nguoi dung, dong goi du lieu hoc tap thanh mot payload raw, roi gui payload ve tab UStudy da mo Portal bang `window.opener.postMessage`.

Ung dung khong tu dang nhap, khong luu mat khau Portal, va khong can server trung gian de cao du lieu Portal. Du lieu duoc xu ly trong trinh duyet cua nguoi dung.

## File lien quan

- `src/components/BookmarkletButton.tsx`: tao link `javascript:` de nguoi dung keo len bookmark bar.
- `src/logic/Bookmarklet.js`: ma bookmarklet that su chay tren Portal.
- `src/App.tsx`: lang nghe message `IMPORT_FULL_DATA`, kiem tra version, ma hoa va luu du lieu.
- `src/logic/dataProcessor.ts`: chuyen raw data tu bookmarklet thanh `student_db_full` va `course_db_offline`.
- `src/config/appConfig.ts`: cau hinh nam/hoc ky mac dinh va `BOOKMARKLET_VERSION`.

## Cach bookmarklet duoc tao

`BookmarkletButton.tsx` import source cua `Bookmarklet.js` bang Vite raw import:

```ts
import bookmarkletSource from '../logic/Bookmarklet.js?raw';
```

Sau do component inject object config vao source bang cach thay `window.__HCMUS_PORTAL_CONFIG__` thanh JSON config that:

```ts
{
  URL_DIEM,
  URL_LICHTHI,
  URL_HOCPHI,
  URL_LOPMO,
  URL_DKHP,
  TARGET_YEAR,
  TARGET_SEM,
  CLASS_TARGET_YEAR,
  CLASS_TARGET_SEM,
  REG_TARGET_YEAR,
  REG_TARGET_SEM,
  EXPIRES_AT,
  VERSION
}
```

Source da inject duoc `encodeURIComponent`, sau do gan vao href dang:

```txt
javascript:<encoded source>
```

Vi vay khi sua `Bookmarklet.js` hoac config version, nguoi dung phai xoa bookmark cu va keo lai nut moi. Bookmark cu van giu source cu tai thoi diem duoc keo.

## Dieu kien chay

Bookmarklet chi chay dung khi:

1. Nguoi dung mo Portal tu nut dang nhap cua UStudy.
2. Tab Portal co `window.opener` tro ve tab UStudy.
3. Nguoi dung da dang nhap Portal.
4. Bookmarklet chua qua han `EXPIRES_AT`.

Neu khong co `window.opener`, bookmarklet se bao nguoi dung mo Portal bang nut dang nhap. Nhanh fallback tai file JSON hien khong phai luong chinh.

## Luong tong the

1. Xoa console cu.
2. Doc config da inject.
3. Kiem tra han su dung 30 ngay.
4. Hien modal privacy/config.
5. Nguoi dung chon co lay hoc phi, lich thi, lop mo, ket qua DKHP hay khong.
6. Lay bang diem day du.
7. Neu duoc chon, khoi dong song song cac task hoc phi, lich thi, lop mo, DKHP va cho tat ca hoan tat bang `Promise.all`.
8. Tao `rawData` va `metaData`.
9. Gui ve tab UStudy bang:

```js
window.opener.postMessage({ type: 'IMPORT_FULL_DATA', payload: fullDataPacket }, '*');
```

10. UStudy nhan message trong `App.tsx`, luu raw data, process data, luu secure storage.

## UI trong Portal

Bookmarklet tao 2 UI nho trong DOM Portal:

- Loading badge goc tren phai qua `showLoading(message)`.
- Modal cau hinh qua `showPrivacyAndConfigModal()`.

Modal cho nguoi dung bat/tat cac nhom optional:

- Hoc phi.
- Lich thi.
- Danh sach lop mo.
- Ket qua DKHP.

Bang diem luon duoc lay vi day la du lieu nen cho nhieu tinh nang.

## Concurrency

Bookmarklet co hang doi gioi han concurrency:

```js
const PORTAL_CONCURRENCY = Math.max(1, Math.min(Number(CONFIG.CONCURRENCY || 3), 5));
```

Mac dinh chay 3 tac vu song song, toi da 5. Ham `runWithConcurrency(items, limit, worker, onProgress)` dam bao:

- Khong ban tat ca request cung luc.
- Giu thu tu ket qua theo thu tu input.
- Cap nhat progress sau moi task.
- Tranh gay ap luc qua lon len Portal.

Hien tai concurrency duoc ap dung o 2 lop:

- Cap nhom du lieu: sau khi lay bang diem, cac task optional `hoc phi`, `lich thi`, `lop mo`, `ket qua DKHP` chay song song va duoc gom bang `Promise.all`.
- Cap chi tiet lop mo: phan quet chi tiet TH/BT van dung hang doi `runWithConcurrency` de gioi han so request dong thoi.

Ben trong tung nhom, cac buoc phu thuoc ViewState nhu quet tung ky hoc phi van giu thu tu noi bo cua nhom do.

## Nguon du lieu 1: Bang diem

Ham chinh:

- `getFullGradesPage()`
- `scrapeGrades(doc)`

Luong:

1. GET trang diem `URL_DIEM`.
2. Lay `__VIEWSTATE`, `__VIEWSTATEGENERATOR`, `__EVENTVALIDATION`.
3. POST form voi nam hoc `0` de yeu cau Portal tra ve tat ca ky.
4. Parse table `#tbDiemThiGK`.
5. Tach tung dong thanh:

```ts
{
  semester,
  id,
  name,
  credits,
  class,
  type,
  score,
  notes
}
```

Ten sinh vien duoc doc tu `#user_tools` neu co.

## Nguon du lieu 2: Hoc phi

Ham chinh:

- `fetchVirtualPage(URLS.HOCPHI)`
- `scrapeBackgroundData(doc, 'TUITION')`

Luong:

1. GET trang hoc phi.
2. Doc danh sach ky tu combobox `.ob_iCboICBC`.
3. Neu khong doc duoc danh sach, fallback lay ky hien tai tu input combobox.
4. Voi tung ky, POST form hoc phi bang ViewState hien tai.
5. Parse bang `.dkhp-table`.
6. Parse ca footer de lay tong tin chi, tong hoc phi, so tien phai dong, ngay cap nhat.
7. Luu vao object theo key ky, vi du `25-26/2`.

Phan nay dang chay tuan tu vi code cap nhat `docHocPhiBase = finalTuitionDoc` sau moi POST. Cach nay giu ViewState moi nhat cho lan POST tiep theo.

## Nguon du lieu 3: Lich thi

Ham chinh:

- `fetchVirtualPage(URLS.LICHTHI)`
- `scrapeBackgroundData(doc, 'EXAM')`

Luong:

1. GET trang lich thi.
2. Doc danh sach nam hoc tu combobox `.ob_iCboICBC`.
3. Neu khong doc duoc, fallback cac nam `25-26`, `24-25`, `23-24`, `22-23`.
4. Quet tung cap nam/hoc ky voi hoc ky `1`, `2`, `3`.
5. Voi moi cap:
   - GET URL co query `nh=<year>&hk=<sem>`.
   - Lay ViewState moi tu page vua GET.
   - POST form lich thi voi nam/hoc ky tuong ung.
   - Parse `#tbLichThiGK` va `#tbLichThiCK`.
6. Chi luu ky co lich thi that.
7. Moi item lich thi duoc gan them `year` va `semester`.

Hien phan nay van chay tuan tu. Co the parallel hoa nhe trong tuong lai, nhung can test ky vi no dung POST + ViewState.

## Nguon du lieu 4: Danh sach lop mo

Ham chinh:

- `postToGetSemester(URLS.LOPMO, ...)`
- `scrapeOpenClassesRaw(doc)`
- `fetchSubClasses(lmid, type)`

Luong:

1. GET trang lop mo.
2. Doc nam/hoc ky hien tai tren form.
3. Neu khac config nguoi dung chon, POST form doi sang nam/hoc ky do.
4. Parse table `#tbPDTKQ`.
5. Voi moi dong lop ly thuyet:
   - Lay ma mon, ten mon, nhom lop, tin chi, si so, lich hoc, dia diem.
   - Neu co link thuc hanh, tach `lmid` tu onclick `showFormDKThucHanh("...")`.
   - Neu co link bai tap, tach `lmid` tu onclick `showFormDKBaiTap("...")` hoac fallback regex.
   - Goi endpoint `Modules/SVDangKyHocPhan/HandlerSVDKHP.ashx`.
6. Gom raw ly thuyet + raw thuc hanh + raw bai tap vao mot row.

Phan chi tiet TH/BT da duoc tang toc bang `runWithConcurrency`. Moi dong lop mo la mot task doc lap, va ben trong task co the fetch TH/BT cung luc bang `Promise.all`.

Payload row:

```ts
{
  id,
  name,
  className,
  credits,
  capacity,
  enrolled,
  cohort,
  schedule,
  practicalGroupRaw,
  exerciseGroupRaw,
  location,
  practicalClasses,
  exerciseClasses
}
```

Sau khi UStudy nhan payload, `processOpenClasses(rawData.courses)` se chuyen danh sach nay thanh `course_db_offline`, duoc dung cho xep lich ca nhan va xep lich nhom.

## Nguon du lieu 5: Ket qua DKHP

Ham chinh:

- `fetchVirtualPage(URLS.DKHP)`
- `scrapeRegisteredCourses(doc)`

Luong:

1. GET trang DKHP.
2. Doc nam/hoc ky hien tai.
3. Neu khac config nguoi dung chon, POST form DKHP rieng voi cac field Obout combobox.
4. Parse table `#tbSVKQ`.
5. Tao danh sach mon da dang ky:

```ts
{
  id,
  name,
  classGroup,
  regType,
  courseType,
  schedule,
  startWeek
}
```

Du lieu nay duoc dung cho thoi khoa bieu va cac tinh nang biet mon dang hoc.

## Payload gui ve app

Bookmarklet tao `rawData`:

```ts
{
  name,
  grades,
  exams,
  tuition,
  registrations,
  courses
}
```

Va `metaData`:

```ts
{
  version,
  scrapedAt,
  params: {
    tuition,
    exam,
    class,
    registration
  }
}
```

Sau do dong goi thanh:

```ts
{
  raw,
  meta,
  version
}
```

## App nhan du lieu nhu the nao

`App.tsx` lang nghe `message` event. Neu `event.data.type !== 'IMPORT_FULL_DATA'` thi bo qua.

Khi nhan dung message:

1. Lay `payload`.
2. Kiem tra `payload.version` voi `APP_CONFIG.BOOKMARKLET_VERSION`.
3. Neu version cu, hien canh bao keo lai bookmarklet.
4. Neu chua mo khoa bao mat, luu payload vao `pendingData`.
5. Khi co `cryptoKey`, goi `saveImportedData(raw, meta, key)`.

`saveImportedData` luu:

- `raw_student_db`: raw payload nguyen ven.
- `student_db_full`: du lieu student da process.
- `course_db_offline`: database lop mo da process.
- `import_meta`: metadata lan import.

Tat ca key nhay cam duoc luu qua `saveSecure`.

## Bao mat va gioi han

Bookmarklet chi doc du lieu bang session Portal hien tai cua nguoi dung. No khong can mat khau va khong gui du lieu len server rieng cua UStudy.

Tuy nhien hien tai bookmarklet dang gui message ve opener voi target origin `*`:

```js
window.opener.postMessage(..., '*');
```

Dieu nay tien cho bookmarklet nhung co rui ro neu tab opener bi dieu huong sang origin khac truoc khi message duoc gui. Neu can sieu chat ve bao mat, nen bo sung:

- target origin cu the cua UStudy.
- nonce mot lan do app sinh ra va bookmarklet gui lai.
- khong log full raw payload trong production.

## Khi Portal doi cau truc

Nhung selector de kiem tra truoc:

- Bang diem: `#tbDiemThiGK`.
- Hoc phi: `.dkhp-table`, `.ob_iCboICBC`.
- Lich thi: `#tbLichThiGK`, `#tbLichThiCK`.
- Lop mo: `#tbPDTKQ`.
- DKHP: `#tbSVKQ`.
- ASP.NET hidden fields: `__VIEWSTATE`, `__VIEWSTATEGENERATOR`, `__EVENTVALIDATION`.

Neu mot nguon bi rong:

1. Mo DevTools trong tab Portal.
2. Chay bookmarklet.
3. Kiem tra console warning.
4. Kiem tra Network xem GET/POST tra ve HTML co table mong doi khong.
5. Neu HTML co table nhung parse rong, cap nhat selector.
6. Neu POST sai, so sanh form field moi cua Portal voi field bookmarklet dang append.

## Nguyen tac khi sua bookmarklet

- Tang version trong `APP_CONFIG.BOOKMARKLET_VERSION` khi thay doi logic quan trong.
- Sau khi sua, chay `node --check src/logic/Bookmarklet.js`.
- Build app de dam bao raw import van hoat dong.
- Keo lai bookmarklet moi truoc khi test tren Portal.
- Khong parallel hoa cac flow phu thuoc ViewState neu chua test ky.
- Chi tang `CONFIG.CONCURRENCY` khi Portal on dinh; mac dinh 3 la muc can bang.
