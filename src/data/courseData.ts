export interface Course {
  id: string; // mã môn học
  code: string; // mã môn học
  name: string; // tên môn học
  nameVi: string; // tên môn học tiếng việt
  credits: number; // số tín chỉ
  prerequisites: string[]; // môn tiên quyết
  isAvailable: boolean; // môn có sẵn
  needsRetake?: boolean; // môn cần học lại
  description: string; // mô tả môn học
  descriptionVi: string; // mô tả môn học tiếng việt
  instructor?: string; // giảng viên
  price?: number; // giá môn học
  category?: string; // danh mục môn học
  projectedGrade?: number; // điểm dự kiến
}