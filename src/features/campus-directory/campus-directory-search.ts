import type { CampusUnit } from '../../assets/data/campus-directory';

export function normalizeDirectoryText(value: string) {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'd')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
}

function scoreMatch(query: string, value: string, multiplier: number) {
    const normalizedValue = normalizeDirectoryText(value);
    if (!normalizedValue) return 0;
    if (normalizedValue === query) return 120 * multiplier;
    if (normalizedValue.startsWith(query)) return 90 * multiplier;
    if (normalizedValue.includes(query)) return 65 * multiplier;

    const tokens = query.split(' ').filter(Boolean);
    return tokens.every((token) => normalizedValue.includes(token)) ? 35 * multiplier : 0;
}

export function searchCampusUnits(units: CampusUnit[], query: string) {
    const normalizedQuery = normalizeDirectoryText(query);
    if (!normalizedQuery) return units;

    return units
        .map((unit) => ({
            unit,
            score: Math.max(
                scoreMatch(normalizedQuery, unit.name, 3),
                scoreMatch(normalizedQuery, unit.shortName ?? '', 2.5),
                ...[
                    ...(unit.aliases ?? []),
                    ...(unit.services ?? []).flatMap((service) => [
                        service.name,
                        ...service.details.flatMap((detail) => {
                            if (detail.type === 'paragraph') return [detail.text];
                            if (detail.type === 'list') return [detail.title ?? '', ...detail.items];
                            if (detail.type === 'notice') return [detail.title, detail.text];
                            return [detail.label];
                        }),
                    ]),
                ].map((value) => scoreMatch(normalizedQuery, value, 2)),
                scoreMatch(normalizedQuery, unit.summary, 1),
                scoreMatch(normalizedQuery, unit.description ?? '', 1),
            ),
        }))
        .filter(({ score }) => score > 0)
        .sort((left, right) => right.score - left.score || left.unit.name.localeCompare(right.unit.name, 'vi'))
        .map(({ unit }) => unit);
}
