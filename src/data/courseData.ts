export interface Course {
  id: string;
  code: string;
  name: string;
  nameVi: string;
  credits: number;
  prerequisites: string[];
  isAvailable: boolean;
  needsRetake: boolean;
  description: string;
  descriptionVi: string;
  instructor?: string;
}

// Hardcoded mock data has been removed.
// We now dynamically fetch data utilizing using useCourseData hook.