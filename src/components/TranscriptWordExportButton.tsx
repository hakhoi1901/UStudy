import { FileDown } from 'lucide-react';
import { useState } from 'react';

interface TranscriptCourse {
  code: string;
  name: string;
  credits: number;
  score10: number;
}

interface TranscriptWordExportButtonProps {
  name: string;
  major: string;
  cohort: string;
  totalCredits: number;
  gpa10: number;
  courses: TranscriptCourse[];
}

function toFourPointScale(score: number): string {
  if (score >= 9) return '4.0';
  if (score >= 8) return '3.5';
  if (score >= 7) return '3.0';
  if (score >= 6.5) return '2.5';
  if (score >= 5) return '2.0';
  return '0.0';
}

export function TranscriptWordExportButton({ name, major, cohort, totalCredits, gpa10, courses }: TranscriptWordExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const [PizZipModule, DocxtemplaterModule, response] = await Promise.all([
        import('pizzip'),
        import('docxtemplater'),
        fetch(encodeURI('/templates/Bảng điểm.docx')),
      ]);

      if (!response.ok) throw new Error('Không tìm thấy mẫu Word.');

      const PizZip = PizZipModule.default;
      const Docxtemplater = DocxtemplaterModule.default;
      const zip = new PizZip(await response.arrayBuffer());
      const doc = new Docxtemplater(zip, {
        delimiters: { start: '{{', end: '}}' },
        paragraphLoop: true,
        linebreaks: true,
      });

      doc.render({
        name,
        nganh: major,
        nienKhoa: cohort,
        tongTinChi: totalCredits,
        gpa10: gpa10.toFixed(2),
        gpa4: toFourPointScale(gpa10),
        monHoc: courses.map((course, index) => ({
          stt: index + 1,
          maMon: course.code,
          tenMon: course.name,
          tinChi: course.credits,
          diem10: course.score10.toFixed(1),
          diem4: toFourPointScale(course.score10),
        })),
      });

      const blob = doc.getZip().generate({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Bang_diem_${name || 'SinhVien'}.docx`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('[TranscriptWordExportButton] Không thể xuất Word:', error);
      window.alert(error instanceof Error ? error.message : 'Không thể xuất bảng điểm Word.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={isExporting}
      className="flex items-center gap-2 rounded-lg bg-[#004A98] px-4 py-2 text-white shadow-sm transition-colors hover:bg-[#003B7A] disabled:opacity-50"
    >
      <FileDown className="h-4 w-4" />
      {isExporting ? 'Đang chuẩn bị...' : 'Xuất bảng điểm Word'}
    </button>
  );
}
