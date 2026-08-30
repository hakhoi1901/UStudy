# Dong bo giua thiet bi

Tinh nang nay la mot phien chuyen du lieu mot lan giua hai UStudy. No khong tao tai khoan, khong luu danh sach thiet bi va khong dong bo nen.

## Trien khai signaling

Worker nam trong `ustudy-sync-signaling/`. Sau khi deploy, dat bien moi truong cho web:

```text
VITE_DEVICE_SYNC_SIGNALING_URL=https://ustudy-sync-signaling.hakhoi1901.workers.dev
```

May gui tu sinh ma ket noi 6 ky tu khong mo ho va ket noi truoc vao `wss://<worker-domain>/session/<session-id>?role=sender`; may nhan nhap ma hoac quet QR de vao cung session voi `role=receiver`. Worker chi dung Durable Object lam bo nho tam cho mot phien WebSocket. Khong dung `storage`, D1, KV hay R2. Session cho nhan toi da 5 phut; sau khi du hai peer, thoi gian ket noi toi da la 2 phut. Peer ngat ket noi, phien bi dong va khong co resume.

## Luong du lieu

1. May gui tao session, key ECDH P-256 tam thoi, nonce va ma phong 6 ky tu. QR tuy chon chi chua protocol va session ID.
2. May nhan nhap ma hoac quet QR, tao key tam thoi khac. Hai peer trao doi public key qua signaling va tao AES-GCM session key bang ECDH + HKDF-SHA-256.
3. SDP/ICE di qua Worker. Sau khi DataChannel mo, hai may tu tinh va hien cung ma SAS 6 chu so tu shared secret.
4. Ca hai nguoi dung phai xac nhan SAS giong nhau. Chi sau khi ca hai message `sas-confirmed` da den, protocol moi cho phep truyen du lieu.
5. May gui yeu cau nhap lai PIN de mo Master Data Key trong RAM, gui key nay trong message AES-GCM cua phien, roi xoa buffer raw.
6. May nhan dat PIN rieng. Master key nhan duoc chi duoc wrap lai bang KEK cua PIN moi va chi ghi sau khi package da du chunk, dung hash va dung schema.

Package dong bo dung danh sach key curatred trong `DEVICE_SYNC_STORAGE_KEYS`; khong copy migration journal, PIN metadata cu, tab dang mo hay state UI tam thoi. Du lieu co san tren may nhan chi bi thay the sau khi nguoi dung tich xac nhan.

## Gioi han hien tai

- Chi co STUN cong khai, chua co TURN. Mot so mang NAT chat co the khong ket noi duoc.
- Khong merge hai bo du lieu, khong resume, khong co lich su phien.
- Worker van thay session ID, IP/timestamp, SDP, ICE candidate va public key tam thoi; khong nhan PIN, Master Key raw hay payload du lieu.
