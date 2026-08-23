# Kiem thu va CI cho UStudy

## Muc tieu

Bo kiem thu bao ve cac luong co rui ro cao nhat cua UStudy:

- Ma hoa, PIN, doi PIN va nhap backup.
- GPA, tin chi, diem chua co va du doan theo tung hoc ky.
- Hoc phi, don gia theo prefix va thu tu uu tien nguon du lieu.
- Import tu Bookmarklet/Extension, xem truoc thay doi, chong trung va dong bo xoa.
- Lich dang ky co san, solver ca nhan va solver nhom.
- Khoi dong giao dien tren desktop/mobile va build Android debug.

## Lenh dung tai local

```powershell
npm ci
npm run typecheck:test
npm run test:unit
npm run test:coverage
npm run build
```

Chay browser smoke test lan dau:

```powershell
npx playwright install chromium
npm run test:e2e
```

Chay mot file hoac loc theo ten ca kiem thu:

```powershell
npx vitest run tests/unit/imports/import-preview.test.ts
npx vitest run -t "empty scraped collection"
```

## Cau truc

```text
tests/
  unit/
    security/       Ma hoa va backup
    grades/         GPA, tin chi, diem du kien
    tuition/        Don gia va hoc phi
    imports/        Merge va metadata import
    scheduler/      Dang ky co san va solver
  contracts/
    portal-sync/    Hop dong config/manifest Extension
  e2e/              Smoke test desktop va mobile
  setup/            Web Crypto va storage gia lap
```

## GitHub Actions

- `Web and core tests`: type-check test va cac core module duoc import, unit/contract test, coverage, build web va extension.
- `Browser smoke tests`: build production, mo bang Chromium desktop va mobile.
- `Android debug build`: dong bo Capacitor, chay Android unit test va tao APK debug.

APK, coverage va Playwright report duoc luu thanh artifact trong 14 ngay. Release APK khong chay tren pull request vi can signing key; workflow chi tao debug APK de xac minh kha nang build.

## Quy tac them test

1. Dat test gan domain, khong gan component neu logic da co service thuan.
2. Payload Portal phai duoc rut gon va xoa thong tin sinh vien that.
3. Moi loi du lieu tung xay ra can co mot regression test truoc khi sua.
4. Test solver kiem tra invariant, khong dong cung thu tu ngau nhien cua phuong an.
5. Thay doi storage, config extension hoac schema import phai co test tuong thich nguoc.

## Bao ve branch

Trong GitHub, dat `main` va `HK/deploy` yeu cau cac check sau truoc khi merge:

- `Web and core tests / verify`
- `Browser smoke tests / chromium`
- `Android debug build / debug-apk` khi workflow Android duoc kich hoat

Khong bat buoc Android check cho thay doi chi lien quan tai lieu, vi workflow da co `paths` filter.

`npm run typecheck` van la lenh audit toan bo ung dung. Hien tai lenh nay con bao no TypeScript san co o mot so UI sau cac dot merge, nen chua duoc dung lam required check. Production build va type-check cac domain cot loi van la dieu kien bat buoc; full-app type-check chi nen bat buoc sau khi baseline duoc don sach.
