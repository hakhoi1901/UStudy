# Group Room Sync

Tinh nang xep lich nhom dung endpoint `/api/group-room`.

## Local dev

Khi chay `npm run dev`, Vite middleware se dung Supabase neu `.env.local` co `SUPABASE_URL` va `SUPABASE_SERVICE_ROLE_KEY` hoac `SUPABASE_ANON_KEY`.

Neu chua cau hinh Supabase, middleware moi fallback ve memory. Cach memory chi du de test nhieu tab/trinh duyet tren cung dev server, du lieu mat khi restart va khong co record trong Supabase.

## Production voi Supabase

Tao bang:

```sql
create table if not exists public.group_rooms (
  room_id text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);
```

### Cach 1: dung service role key tren server

Set env tren server hoac `.env.local` khi chay dev:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_GROUP_ROOMS_TABLE=group_rooms
```

Luu y: `SUPABASE_SERVICE_ROLE_KEY` phai la key co JWT role `service_role`. Neu copy nham anon key vao bien nay, Supabase se bi RLS chan khi insert/update.

### Cach 2: dung anon key voi RLS policy

Neu chi co anon key, dung bien rieng:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_GROUP_ROOMS_TABLE=group_rooms
```

Sau do bat RLS va tao policy cho endpoint public:

```sql
alter table public.group_rooms enable row level security;

create policy "group rooms can be read publicly"
on public.group_rooms
for select
to anon
using (true);

create policy "group rooms can be created publicly"
on public.group_rooms
for insert
to anon
with check (true);

create policy "group rooms can be updated publicly"
on public.group_rooms
for update
to anon
using (true)
with check (true);
```

Policy nay phu hop cho ban test tinh nang phong nhom. Neu can chat hon ve bao mat, hay them token rieng cho phong va chi cho update khi payload co token hop le.

## Data Model

Moi thanh vien gui mot `member package` rieng vao room:

```ts
{
  memberId: string;
  nickname?: string;
  personalCourses: string[];
  busyMask: number[];
  preferredClasses?: Record<string, unknown>;
  personalConfig?: unknown;
  coursePackages: Array<{
    courseId: string;
    courseName?: string;
    credits?: number;
    classes: Array<{
      id: string;
      schedule?: string | string[];
      mask?: number[];
    }>;
  }>;
}
```

Solver dung du lieu lop trong package cua tung thanh vien. Neu nhieu nguoi cung dang ky mot mon, solver uu tien lop chung nam trong giao diem lop kha dung cua cac thanh vien; neu khong co nghiem, solver fallback sang tach lop.
