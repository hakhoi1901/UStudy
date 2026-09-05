import type { ClassSection, Course } from '../types';

export type CourseIdentity = Pick<Course, 'id' | 'code'>;

export interface CourseSelectionReconciliation {
    selectedCourseIds: Set<string>;
    removedCourseIds: string[];
}

export function normalizeCourseCode(value: unknown): string {
    return String(value ?? '').trim().toUpperCase();
}

function buildCourseAliasMap(courseCatalog: readonly CourseIdentity[]): Map<string, string> {
    const aliases = new Map<string, string>();

    courseCatalog.forEach((course) => {
        const id = normalizeCourseCode(course.id);
        const code = normalizeCourseCode(course.code || course.id);
        if (!code) return;
        if (id) aliases.set(id, code);
        aliases.set(code, code);
    });

    return aliases;
}

function resolveCourseCode(value: unknown, aliases: ReadonlyMap<string, string>): string {
    const normalized = normalizeCourseCode(value);
    return aliases.get(normalized) ?? normalized;
}

export function createCourseCodeSet(values: Iterable<unknown>): Set<string> {
    return new Set(Array.from(values, normalizeCourseCode).filter(Boolean));
}

export function reconcileSelectedCourseIds(
    selectedCourseIds: Iterable<string>,
    registeredCourseCodes: Iterable<string>,
    courseCatalog: readonly CourseIdentity[] = [],
): CourseSelectionReconciliation {
    const aliases = buildCourseAliasMap(courseCatalog);
    const registeredCodes = new Set(
        Array.from(registeredCourseCodes, (value) => resolveCourseCode(value, aliases)).filter(Boolean),
    );
    const selected = new Set<string>();
    const removedCourseIds: string[] = [];

    for (const courseId of selectedCourseIds) {
        const courseCode = resolveCourseCode(courseId, aliases);
        if (courseCode && registeredCodes.has(courseCode)) {
            removedCourseIds.push(courseId);
        } else {
            selected.add(courseId);
        }
    }

    return { selectedCourseIds: selected, removedCourseIds };
}

export function omitRegisteredCourseEntries<T>(
    entries: Record<string, T>,
    registeredCourseCodes: Iterable<string>,
    courseCatalog: readonly CourseIdentity[] = [],
): Record<string, T> {
    const aliases = buildCourseAliasMap(courseCatalog);
    const registeredCodes = new Set(
        Array.from(registeredCourseCodes, (value) => resolveCourseCode(value, aliases)).filter(Boolean),
    );
    let changed = false;
    const nextEntries: Record<string, T> = {};

    Object.entries(entries).forEach(([courseId, value]) => {
        if (registeredCodes.has(resolveCourseCode(courseId, aliases))) {
            changed = true;
            return;
        }
        nextEntries[courseId] = value;
    });

    return changed ? nextEntries : entries;
}

export function excludeRegisteredSections(
    sections: readonly ClassSection[],
    registeredCourseCodes: Iterable<string>,
): ClassSection[] {
    const registeredCodes = createCourseCodeSet(registeredCourseCodes);
    return sections.filter((section) => !registeredCodes.has(normalizeCourseCode(section.courseCode)));
}
