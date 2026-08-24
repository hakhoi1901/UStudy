import {
  BookOpenCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  Database,
  GraduationCap,
  Play,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PageHeader } from '../../components/layout/page-header';
import { PageShell } from '../../components/layout/page-shell';
import {
  GUIDE_CATEGORY_LABELS,
  USER_GUIDES,
  getUserGuide,
  useUserGuide,
  type UserGuide,
  type UserGuideId,
} from '../../features/user-guide';
import type { GuideBlock, GuideProgressEntry } from '../../features/user-guide/types';

const GUIDE_ICONS: Record<UserGuideId, typeof CircleHelp> = {
  'data-sync': Database,
  'study-plan': BookOpenCheck,
  gpa: GraduationCap,
  'personal-scheduling': Sparkles,
  'group-scheduling': Users,
  'import-rollback': ShieldCheck,
};

function GuideBlockView({ block }: { block: GuideBlock }) {
  if (block.type === 'paragraph') {
    return <p className="text-sm leading-6 text-gray-600">{block.text}</p>;
  }

  if (block.type === 'list') {
    return (
      <ul className="space-y-2">
        {block.items.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm leading-6 text-gray-600">
            <Check className="mt-1 h-4 w-4 shrink-0 text-[#004A98]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  }

  const toneClass = block.tone === 'warning'
    ? 'border-amber-200 bg-amber-50 text-amber-900'
    : block.tone === 'success'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
      : 'border-blue-200 bg-blue-50 text-blue-900';

  return (
    <div className={`rounded-lg border px-4 py-3 ${toneClass}`}>
      <p className="text-sm font-semibold">{block.title}</p>
      <p className="mt-1 text-sm leading-6 opacity-90">{block.text}</p>
    </div>
  );
}

function getProgressLabel(guide: UserGuide, entry: GuideProgressEntry | null) {
  if (!entry) return { label: 'Chưa xem', className: 'bg-gray-100 text-gray-600' };
  if (entry.guideVersion !== guide.version) return { label: 'Có nội dung mới', className: 'bg-amber-50 text-amber-700' };
  if (entry.status === 'completed') return { label: 'Đã hoàn thành', className: 'bg-emerald-50 text-emerald-700' };
  return { label: 'Đang xem', className: 'bg-blue-50 text-[#004A98]' };
}

function GuideOverview() {
  const { getAvailability, getProgress, startGuide } = useUserGuide();
  const [searchTerm, setSearchTerm] = useState('');
  const normalizedSearch = searchTerm.trim().toLocaleLowerCase('vi-VN');
  const filteredGuides = useMemo(() => USER_GUIDES.filter((guide) => (
    !normalizedSearch
    || guide.title.toLocaleLowerCase('vi-VN').includes(normalizedSearch)
    || guide.description.toLocaleLowerCase('vi-VN').includes(normalizedSearch)
  )), [normalizedSearch]);

  return (
    <PageShell
      contentClassName="space-y-5"
      header={<PageHeader title="Hướng dẫn sử dụng UStudy" description="Tìm hiểu từng quy trình và thực hành trực tiếp trên giao diện thật." />}
    >
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:p-5">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Tìm hướng dẫn, ví dụ: GPA, đồng bộ, xếp lịch..."
            className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm text-gray-800 outline-none transition-colors focus:border-[#004A98] focus:bg-white focus:ring-2 focus:ring-[#004A98]/15"
          />
        </label>
      </div>

      {(['getting-started', 'study', 'data'] as const).map((category) => {
        const guides = filteredGuides.filter((guide) => guide.category === category);
        if (guides.length === 0) return null;

        return (
          <section key={category} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/70 px-4 py-3 md:px-5">
              <h2 className="text-sm font-semibold text-gray-900">{GUIDE_CATEGORY_LABELS[category]}</h2>
              <span className="text-xs text-gray-500">{guides.length} hướng dẫn</span>
            </div>
            <div className="divide-y divide-gray-100">
              {guides.map((guide) => {
                const Icon = GUIDE_ICONS[guide.id];
                const entry = getProgress(guide.id);
                const progressState = getProgressLabel(guide, entry);
                const availability = getAvailability(guide.id);
                const canResume = Boolean(entry?.guideVersion === guide.version && entry.status !== 'completed');

                return (
                  <div key={guide.id} className="flex flex-col gap-3 px-4 py-4 transition-colors hover:bg-gray-50/60 sm:flex-row sm:items-center md:px-5">
                    <Link to={`/guide/${guide.id}`} className="flex min-w-0 flex-1 items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#004A98]">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900">{guide.title}</span>
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${progressState.className}`}>{progressState.label}</span>
                        </span>
                        <span className="mt-1 block text-sm leading-5 text-gray-500">{guide.description}</span>
                        <span className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-400"><Clock3 className="h-3.5 w-3.5" />Khoảng {guide.estimatedMinutes} phút · {guide.steps.length} bước</span>
                      </span>
                    </Link>
                    <div className="flex shrink-0 items-center justify-end gap-2 pl-[52px] sm:pl-0">
                      {!availability.available && <span className="hidden max-w-44 text-right text-xs text-amber-700 lg:block">Cần chuẩn bị dữ liệu</span>}
                      <button
                        type="button"
                        onClick={() => startGuide(guide.id, { resume: canResume, source: 'guide-center' })}
                        className="ustudy-button-outline h-9 px-3 text-xs"
                      >
                        <Play className="h-4 w-4" />{canResume ? 'Tiếp tục' : 'Bắt đầu'}
                      </button>
                      <Link to={`/guide/${guide.id}`} className="ustudy-action-icon h-9 w-9" title="Đọc hướng dẫn chi tiết"><ChevronRight className="h-4 w-4" /></Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {filteredGuides.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white px-5 py-12 text-center shadow-sm">
          <CircleHelp className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-sm font-semibold text-gray-800">Không tìm thấy hướng dẫn phù hợp</p>
          <button type="button" onClick={() => setSearchTerm('')} className="mt-3 text-sm font-semibold text-[#004A98]">Xóa nội dung tìm kiếm</button>
        </div>
      )}
    </PageShell>
  );
}

function GuideDetail({ guide }: { guide: UserGuide }) {
  const { getAvailability, getProgress, resetGuide, startGuide } = useUserGuide();
  const entry = getProgress(guide.id);
  const availability = getAvailability(guide.id);
  const canResume = Boolean(entry?.guideVersion === guide.version && entry.status !== 'completed');
  const progressState = getProgressLabel(guide, entry);
  const Icon = GUIDE_ICONS[guide.id];

  return (
    <PageShell
      contentClassName="space-y-5"
      header={(
        <PageHeader
          title={guide.title}
          description={guide.description}
          actions={(
            <button type="button" onClick={() => startGuide(guide.id, { resume: canResume, source: 'guide-detail' })} className="ustudy-button-primary h-9 px-3 text-sm">
              <Play className="h-4 w-4" />{canResume ? 'Tiếp tục hướng dẫn' : 'Bắt đầu thực hành'}
            </button>
          )}
        />
      )}
    >
      <Link to="/guide" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#004A98] hover:text-[#003A78]"><ChevronLeft className="h-4 w-4" />Tất cả hướng dẫn</Link>

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between md:p-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#004A98] text-white"><Icon className="h-5 w-5" /></span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${progressState.className}`}>{progressState.label}</span><span className="text-xs text-gray-500">Phiên bản {guide.version}</span></div>
              <p className="mt-1 text-sm text-gray-600">Khoảng {guide.estimatedMinutes} phút · {guide.steps.length} bước tương tác</p>
            </div>
          </div>
          {entry && (
            <button type="button" onClick={() => resetGuide(guide.id)} className="inline-flex h-8 items-center gap-1.5 self-start text-xs font-semibold text-gray-500 hover:text-[#004A98] sm:self-auto"><RefreshCw className="h-3.5 w-3.5" />Đặt lại tiến độ</button>
          )}
        </div>

        {!availability.available && (
          <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 md:px-5">
            <span className="font-semibold">Điều kiện để thực hành: </span>{availability.reason}
          </div>
        )}

        <div className="divide-y divide-gray-100">
          {guide.sections.map((section, index) => (
            <section key={section.id} className="grid gap-4 px-4 py-5 md:grid-cols-[180px_minmax(0,1fr)] md:px-5 md:py-6">
              <div>
                <span className="text-xs font-semibold text-[#004A98]">{String(index + 1).padStart(2, '0')}</span>
                <h2 className="mt-1 text-sm font-semibold text-gray-900">{section.title}</h2>
              </div>
              <div className="space-y-3">{section.blocks.map((block, blockIndex) => <GuideBlockView key={`${section.id}-${blockIndex}`} block={block} />)}</div>
            </section>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-4 py-3 md:px-5"><h2 className="text-sm font-semibold text-gray-900">Các bước thực hành</h2><p className="mt-0.5 text-xs text-gray-500">Tour sẽ tự mở đúng trang và làm nổi bật từng vị trí.</p></div>
        <ol className="divide-y divide-gray-100">
          {guide.steps.map((step, index) => (
            <li key={step.id} className="flex gap-3 px-4 py-3 md:px-5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-[#004A98]">{index + 1}</span>
              <div><p className="text-sm font-semibold text-gray-800">{step.title}</p><p className="mt-0.5 text-xs leading-5 text-gray-500">{step.content}</p></div>
            </li>
          ))}
        </ol>
      </section>
    </PageShell>
  );
}

export function GuidePage() {
  const { guideId } = useParams<{ guideId?: string }>();
  const guide = getUserGuide(guideId);

  if (!guideId) return <GuideOverview />;
  if (guide) return <GuideDetail guide={guide} />;

  return (
    <PageShell header={<PageHeader title="Không tìm thấy hướng dẫn" description="Đường dẫn hướng dẫn không tồn tại hoặc đã được thay đổi." />}>
      <Link to="/guide" className="ustudy-button-primary h-10 w-fit px-4 text-sm"><ChevronLeft className="h-4 w-4" />Quay lại trung tâm hướng dẫn</Link>
    </PageShell>
  );
}
