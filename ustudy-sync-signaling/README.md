# UStudy Sync Signaling

Cloudflare signaling backend cho mot phien WebRTC one-shot. Backend chi relay SDP, ICE, public key tam thoi va message dieu phoi; khong nhan PIN, KEK, Master Data Key hay payload dong bo.

## Endpoint

- `GET /health`
- `wss://<worker-domain>/session/<SESSION_ID>?role=sender|receiver`

`SESSION_ID` dung 6 ky tu tu alphabet khong mo ho (`A-H`, `J-N`, `P-Z`, `2-9`). Day la locator, khong phai khoa ma hoa.

## Deploy

```powershell
cd ustudy-sync-signaling
npm install
npx wrangler login
npm run typecheck
npm test
npm run deploy
```

Tren Cloudflare Dashboard, cap nhat bien `ALLOWED_ORIGINS` thanh danh sach origin ngan cach boi dau phay. Vi du preview environment co the them domain preview, nhung khong dua localhost vao production.

`wrangler.jsonc` dung declarative Durable Object export `SyncSession` voi SQLite backend theo yeu cau cua Cloudflare cho namespace moi. Code khong goi Durable Object Storage API, D1, KV hay R2.

## Lifecycle

Session duoc tao ngầm khi peer dau tien ket noi den deterministic Durable Object name. Toi da hai peer voi hai role khac nhau. Hibernation API giu WebSocket qua eviction va attachment chi luu role + thoi diem join cua socket; attachment mat khi socket dong. Timeout duoc kiem tra khi peer ket noi hoac gui signaling; khong dung alarm hay persistent state de resume session.
