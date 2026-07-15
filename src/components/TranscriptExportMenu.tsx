import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Download, FileSpreadsheet, FileText } from 'lucide-react';

interface TranscriptCourse {
  code: string;
  name: string;
  credits: number;
  score10: number;
}

interface TranscriptExportMenuProps {
  name: string;
  dob: string;
  studentId: string;
  program: string;
  major: string;
  cohort: string;
  totalCredits: number;
  gpa10: number;
  courses: TranscriptCourse[];
}

type TranscriptExportFormat = 'pdf' | 'docx' | 'xlsx';

interface TranscriptData extends TranscriptExportMenuProps {
  gpa4: string;
  rows: Array<{
    stt: number;
    maMon: string;
    tenMon: string;
    tinChi: number;
    diem10: string;
    diem4: string;
  }>;
}

function toFourPointScale(score: number): string {
  if (score >= 9) return '4.0';
  if (score >= 8) return '3.5';
  if (score >= 7) return '3.0';
  if (score >= 6.5) return '2.5';
  if (score >= 5) return '2.0';
  return '0.0';
}

function buildTranscriptData(props: TranscriptExportMenuProps): TranscriptData {
  return {
    ...props,
    gpa4: toFourPointScale(props.gpa10),
    rows: props.courses.map((course, index) => ({
      stt: index + 1,
      maMon: course.code,
      tenMon: course.name,
      tinChi: course.credits,
      diem10: course.score10.toFixed(1),
      diem4: toFourPointScale(course.score10),
    })),
  };
}

function getSafeFileName(name: string): string {
  const normalized = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .replace(/[^a-z0-9]+/gi, '_')
    .replace(/^_+|_+$/g, '');
  return `Bang_diem_${normalized || 'SinhVien'}`;
}

function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

async function createTranscriptDocx(data: TranscriptData): Promise<Blob> {
  const [PizZipModule, DocxtemplaterModule, response] = await Promise.all([
    import('pizzip'),
    import('docxtemplater'),
    fetch(encodeURI('/templates/Bảng điểm.docx')),
  ]);

  if (!response.ok) throw new Error('Không tìm thấy mẫu Word bảng điểm.');

  const PizZip = PizZipModule.default;
  const Docxtemplater = DocxtemplaterModule.default;
  const zip = new PizZip(await response.arrayBuffer());
  const doc = new Docxtemplater(zip, {
    delimiters: { start: '{{', end: '}}' },
    paragraphLoop: true,
    linebreaks: true,
  });

  doc.render({
    name: data.name,
    nganh: data.major,
    nienKhoa: data.cohort,
    tongTinChi: data.totalCredits,
    gpa10: data.gpa10.toFixed(2),
    gpa4: data.gpa4,
    monHoc: data.rows,
  });

  return doc.getZip().generate({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
}

async function exportTranscriptPdf(data: TranscriptData, fileName: string): Promise<void> {
  const [{ pdf }, { TranscriptPDF }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('./TranscriptPDF'),
  ]);
  const blob = await pdf(
    <TranscriptPDF
      data={{
        studentInfo: {
          fullName: data.name,
          dob: data.dob || '---',
          studentId: data.studentId || '---',
          course: data.cohort || '---',
          program: data.program || '---',
          major: data.major || '---',
        },
        courses: data.rows.map((row) => ({
          no: row.stt,
          id: row.maMon,
          title: row.tenMon,
          credits: row.tinChi,
          score10: row.diem10,
          score4: row.diem4,
        })),
        summary: {
          totalCredits: data.totalCredits,
          gpa10: data.gpa10.toFixed(2),
          gpa4: data.gpa4,
        },
      }}
    />
  ).toBlob();
  downloadBlob(blob, `${fileName}.pdf`);
}

async function exportTranscriptXlsx(data: TranscriptData, fileName: string): Promise<void> {
  const XLSX = await import('xlsx');
  const workbook = XLSX.utils.book_new();
  const infoSheet = XLSX.utils.aoa_to_sheet([
    ['BẢNG ĐIỂM'],
    [],
    ['Họ tên', data.name],
    ['Ngày sinh', data.dob || '---'],
    ['Mã số sinh viên', data.studentId || '---'],
    ['Chương trình', data.program || '---'],
    ['Ngành học', data.major],
    ['Niên khóa', data.cohort],
    ['Tổng số tín chỉ', data.totalCredits],
    ['Điểm trung bình thang 10', data.gpa10.toFixed(2)],
    ['Điểm trung bình thang 4', data.gpa4],
  ]);
  infoSheet['!cols'] = [{ wch: 28 }, { wch: 42 }];

  const gradeRows = [
    ['STT', 'Mã môn', 'Tên môn', 'Tín chỉ', 'Thang 10', 'Thang 4'],
    ...data.rows.map((row) => [row.stt, row.maMon, row.tenMon, row.tinChi, Number(row.diem10), Number(row.diem4)]),
    [],
    ['', '', 'Tổng số tín chỉ', data.totalCredits, '', ''],
    ['', '', 'Điểm trung bình', '', Number(data.gpa10.toFixed(2)), Number(data.gpa4)],
  ];
  const gradesSheet = XLSX.utils.aoa_to_sheet(gradeRows);
  gradesSheet['!cols'] = [{ wch: 7 }, { wch: 14 }, { wch: 44 }, { wch: 10 }, { wch: 12 }, { wch: 10 }];
  gradesSheet['!autofilter'] = { ref: `A1:F${Math.max(1, data.rows.length + 1)}` };

  XLSX.utils.book_append_sheet(workbook, infoSheet, 'Thông tin');
  XLSX.utils.book_append_sheet(workbook, gradesSheet, 'Bảng điểm');
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}

const exportLabels: Record<TranscriptExportFormat, string> = {
  pdf: 'PDF',
  docx: 'Word theo mẫu',
  xlsx: 'Excel',
};

export function TranscriptExportMenu(props: TranscriptExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<TranscriptExportFormat | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleExport = async (format: TranscriptExportFormat) => {
    setIsOpen(false);
    setExportingFormat(format);
    const data = buildTranscriptData(props);
    const fileName = getSafeFileName(props.name);

    try {
      if (format === 'pdf') {
        await exportTranscriptPdf(data, fileName);
      } else if (format === 'xlsx') {
        await exportTranscriptXlsx(data, fileName);
      } else {
        downloadBlob(await createTranscriptDocx(data), `${fileName}.docx`);
      }
    } catch (error) {
      console.error(`[TranscriptExportMenu] Không thể xuất ${format}:`, error);
      window.alert(error instanceof Error ? error.message : `Không thể xuất bảng điểm ${exportLabels[format]}.`);
    } finally {
      setExportingFormat(null);
    }
  };

  return (
    <div ref={menuRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        disabled={exportingFormat !== null}
        className="flex h-10 items-center gap-2 rounded-lg bg-[#004A98] px-4 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#003B7A] disabled:cursor-wait disabled:opacity-70"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <Download className="h-4 w-4" />
        {exportingFormat ? `Đang tạo ${exportLabels[exportingFormat]}...` : 'Xuất bảng điểm'}
        {!exportingFormat && <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
      </button>

      {isOpen && (
        <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-xl">
          <button type="button" role="menuitem" onClick={() => handleExport('pdf')} className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-blue-50">
            <FileText className="h-4 w-4 shrink-0 text-red-600" />
            <span><strong className="block text-sm text-gray-800">PDF</strong><small className="block text-xs text-gray-500">Bản PDF chuẩn như trước</small></span>
          </button>
          <button type="button" role="menuitem" onClick={() => handleExport('docx')} className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-blue-50">
            <FileText className="h-4 w-4 shrink-0 text-[#004A98]" />
            <span><strong className="block text-sm text-gray-800">Word theo mẫu</strong><small className="block text-xs text-gray-500">Tệp DOCX có thể chỉnh sửa</small></span>
          </button>
          <button type="button" role="menuitem" onClick={() => handleExport('xlsx')} className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-blue-50">
            <FileSpreadsheet className="h-4 w-4 shrink-0 text-emerald-600" />
            <span><strong className="block text-sm text-gray-800">Excel</strong><small className="block text-xs text-gray-500">Thông tin và bảng điểm</small></span>
          </button>
        </div>
      )}
    </div>
  );
}
