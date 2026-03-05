import { useState, useMemo } from 'react';
import { useDepartmentData } from '../../context/DepartmentContext';
import { ChevronDown, ChevronRight, ArrowDown, Info } from 'lucide-react';

interface TreeNode {
    id: string;
    name: string;
    credits: number;
    category: string;
    children: TreeNode[];
}

type LevelGroup = 'general' | 'foundation' | 'graduation';

const LEVEL_LABELS: Record<LevelGroup, string> = {
    general: 'Đại cương',
    foundation: 'Cơ sở ngành / Chuyên ngành',
    graduation: 'Tốt nghiệp / Tự chọn',
};

const LEVEL_COLORS: Record<LevelGroup, { bg: string; border: string; header: string; badge: string }> = {
    general: { bg: 'bg-amber-50', border: 'border-amber-200', header: 'text-amber-900', badge: 'bg-amber-100 text-amber-700' },
    foundation: { bg: 'bg-blue-50', border: 'border-blue-200', header: 'text-blue-900', badge: 'bg-blue-100 text-blue-700' },
    graduation: { bg: 'bg-emerald-50', border: 'border-emerald-200', header: 'text-emerald-900', badge: 'bg-emerald-100 text-emerald-700' },
};

function getCategoryLevel(category: string): LevelGroup {
    if (
        category.startsWith('GENERAL_') ||
        category === 'OTHER'
    ) return 'general';
    if (
        category === 'FOUNDATION' ||
        category === 'GENERAL_IT' ||
        category.startsWith('SPECIALIZED_') ||
        category.startsWith('MAJOR_')
    ) return 'foundation';
    return 'graduation';
}

// ---- Recursive tree node renderer ----
function TreeNodeCard({ node, depth = 0 }: { node: TreeNode; depth?: number }) {
    const [expanded, setExpanded] = useState(depth < 2);
    const hasChildren = node.children.length > 0;

    return (
        <div className={`${depth > 0 ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''}`}>
            <div
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all cursor-pointer
                    ${depth === 0
                        ? 'bg-white border-gray-300 shadow-sm hover:shadow-md'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                onClick={() => hasChildren && setExpanded(!expanded)}
            >
                {/* Expand/Collapse icon */}
                <div className="w-5 flex-shrink-0">
                    {hasChildren ? (
                        expanded
                            ? <ChevronDown className="w-4 h-4 text-gray-500" />
                            : <ChevronRight className="w-4 h-4 text-gray-500" />
                    ) : (
                        <span className="block w-1.5 h-1.5 rounded-full bg-gray-400 ml-1.5"></span>
                    )}
                </div>

                {/* Course code */}
                <span className="text-sm font-semibold text-gray-900 w-24 flex-shrink-0">{node.id}</span>

                {/* Course name */}
                <span className="text-sm text-gray-700 flex-1 truncate">{node.name}</span>

                {/* Credits badge */}
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded font-medium flex-shrink-0">
                    {node.credits} TC
                </span>

                {/* Children count */}
                {hasChildren && (
                    <span className="px-1.5 py-0.5 bg-[#004A98] text-white text-[10px] rounded-full font-medium flex-shrink-0">
                        {node.children.length}
                    </span>
                )}
            </div>

            {/* Children */}
            {expanded && hasChildren && (
                <div className="mt-1.5 space-y-1.5 relative">
                    {node.children.map(child => (
                        <div key={child.id} className="relative">
                            <div className="absolute -left-4 top-4 w-3 border-t border-gray-200"></div>
                            <TreeNodeCard node={child} depth={depth + 1} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export function PrerequisiteTreeView() {
    const { data: { courses, prerequisites } } = useDepartmentData();
    const [expandedGroups, setExpandedGroups] = useState<Record<LevelGroup, boolean>>({
        general: true,
        foundation: true,
        graduation: true,
    });

    // Build the full prerequisite tree
    const { rootTrees, standaloneByLevel } = useMemo(() => {
        // Map: course_id -> list of courses that depend on it (children)
        const childrenMap = new Map<string, string[]>();
        // Set of courses that ARE prerequisites of other courses (i.e. they have dependents)
        const hasPrereq = new Set<string>();

        for (const p of prerequisites) {
            const prereqId = p.prereq_id;
            const courseId = p.course_id;
            // Skip invalid prereq_ids (contain spaces or are descriptive text)
            if (!prereqId || prereqId.includes(' ')) continue;

            if (!childrenMap.has(prereqId)) childrenMap.set(prereqId, []);
            childrenMap.get(prereqId)!.push(courseId);
            hasPrereq.add(courseId);
        }

        const courseMap = new Map(courses.map(c => [c.course_id, c]));

        // Build tree recursively
        const buildTree = (courseId: string, visited = new Set<string>()): TreeNode | null => {
            if (visited.has(courseId)) return null;
            visited.add(courseId);

            const meta = courseMap.get(courseId);
            const children = (childrenMap.get(courseId) || [])
                .map(cid => buildTree(cid, new Set(visited)))
                .filter(Boolean) as TreeNode[];

            // sort children by id
            children.sort((a, b) => a.id.localeCompare(b.id));

            return {
                id: courseId,
                name: meta?.course_name_vi || courseId,
                credits: meta?.credits || 0,
                category: meta?.category || 'OTHER',
                children,
            };
        };

        // Find root courses: courses that appear as prereq_id but are NOT themselves a prereq of anything
        // i.e. they are at the top of the chain
        // Actually, we want courses that have NO prerequisites (they are root nodes)
        const rootCourseIds = new Set<string>();
        // All courses that have children (are prereqs of other courses)
        for (const [prereqId] of childrenMap) {
            if (!hasPrereq.has(prereqId)) {
                rootCourseIds.add(prereqId);
            }
        }

        const trees: TreeNode[] = [];
        for (const rootId of rootCourseIds) {
            const tree = buildTree(rootId);
            if (tree && tree.children.length > 0) {
                trees.push(tree);
            }
        }

        trees.sort((a, b) => a.id.localeCompare(b.id));

        // Standalone courses: courses NOT in any prerequisite chain (neither as course nor prereq)
        const allInChain = new Set<string>();
        for (const p of prerequisites) {
            if (p.prereq_id && !p.prereq_id.includes(' ')) allInChain.add(p.prereq_id);
            allInChain.add(p.course_id);
        }

        const standalone: Record<LevelGroup, typeof courses> = {
            general: [],
            foundation: [],
            graduation: [],
        };

        for (const c of courses) {
            if (!allInChain.has(c.course_id)) {
                const level = getCategoryLevel(c.category || 'OTHER');
                standalone[level].push(c);
            }
        }

        return { rootTrees: trees, standaloneByLevel: standalone };
    }, [courses, prerequisites]);

    const toggleGroup = (group: LevelGroup) => {
        setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
    };

    return (
        <div>
            {/* Info Banner */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                    <p className="text-sm text-blue-900 font-medium">
                        Sơ đồ cây môn tiên quyết
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                        Hiển thị toàn bộ chuỗi môn học theo quan hệ tiên quyết. Click vào từng môn để mở rộng / thu gọn các môn phụ thuộc.
                    </p>
                </div>
            </div>

            {/* Prerequisite Trees */}
            <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                    <ArrowDown className="w-5 h-5 text-[#004A98]" />
                    Chuỗi môn tiên quyết
                </h3>
                <p className="text-sm text-gray-500 mb-4">Các chuỗi môn học có quan hệ tiên quyết, từ môn gốc đến môn phụ thuộc.</p>
                <div className="space-y-3">
                    {rootTrees.map(tree => (
                        <TreeNodeCard key={tree.id} node={tree} depth={0} />
                    ))}
                </div>
            </div>

            {/* Standalone Courses by Level */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Môn học độc lập (không có môn tiên quyết)</h3>
                <p className="text-sm text-gray-500 mb-4">Các môn không thuộc bất kỳ chuỗi tiên quyết nào.</p>

                {(Object.keys(LEVEL_LABELS) as LevelGroup[]).map(level => {
                    const coursesInLevel = standaloneByLevel[level];
                    if (coursesInLevel.length === 0) return null;
                    const colors = LEVEL_COLORS[level];

                    return (
                        <div key={level} className={`rounded-xl border ${colors.border} overflow-hidden`}>
                            <button
                                className={`w-full flex items-center justify-between px-5 py-3 ${colors.bg} transition-colors`}
                                onClick={() => toggleGroup(level)}
                            >
                                <span className={`font-semibold ${colors.header}`}>
                                    {LEVEL_LABELS[level]}
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${colors.badge}`}>
                                        {coursesInLevel.length} môn
                                    </span>
                                    {expandedGroups[level]
                                        ? <ChevronDown className="w-4 h-4 text-gray-500" />
                                        : <ChevronRight className="w-4 h-4 text-gray-500" />
                                    }
                                </div>
                            </button>
                            {expandedGroups[level] && (
                                <div className="px-5 py-3 space-y-1.5 bg-white">
                                    {coursesInLevel.map(c => (
                                        <div key={c.course_id} className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                                            <span className="text-sm font-semibold text-gray-900 w-24 flex-shrink-0">{c.course_id}</span>
                                            <span className="text-sm text-gray-700 flex-1 truncate">{c.course_name_vi}</span>
                                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded font-medium flex-shrink-0">
                                                {c.credits} TC
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
