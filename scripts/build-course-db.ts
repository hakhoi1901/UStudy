import * as xlsx from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import { processOpenClasses, type RawOpenClass, type RawSubClass } from '../src/logic/dataProcessor';

const inputPath = path.join(process.cwd(), 'src/assets/data/open-classes/2026-2027-HK1.xlsx');
const outputPath = path.join(process.cwd(), 'public/data/course-db.json');

console.log('Loading Excel from:', inputPath);
const workbook = xlsx.readFile(inputPath);
const sheet = workbook.Sheets['TKB dự kiến'];

if (!sheet) {
    console.error('Sheet "TKB dự kiến" not found');
    process.exit(1);
}

const data = xlsx.utils.sheet_to_json<any[]>(sheet, { header: 1 }).slice(1);

const lts = data.filter(r => r[3] === 'LT');
const others = data.filter(r => r[3] !== 'LT');

const rawOpenClasses: RawOpenClass[] = lts.map(r => ({
    id: String(r[4] || '').trim(),
    name: String(r[5] || '').trim(),
    className: String(r[6] || '').trim(),
    credits: String(r[10] || 0), // Excel doesn't have "Số TC", maybe 'Số tiết' if LT? This will be parsed as float, it's fine for schedule purposes
    capacity: String(r[20] || ""), // Placeholder if missing
    enrolled: "",
    cohort: String(r[2] || ''),
    schedule: `T${r[8]}(${r[9]}-${Number(r[9]) + Number(r[10]) - 1})`,
    practicalGroupRaw: "",
    exerciseGroupRaw: "",
    location: String(r[7] || ''),
    practicalClasses: [],
    exerciseClasses: []
}));

for (const row of others) {
    const subj = String(row[4] || '').trim();
    const cls = String(row[6] || '').trim();
    const type = String(row[3] || '').trim();
    
    if (!subj || !cls) continue;

    const rawSubClass: RawSubClass = {
        Nhom: cls,
        LichHoc: `T${row[8]}(${row[9]}-${Number(row[9]) + Number(row[10]) - 1})`,
        DiaDiem: String(row[7] || '')
    };

    // Find a matching LT row where the LT's className is a prefix of this sub-class
    const matchingLt = rawOpenClasses.find(lt => lt.id === subj && cls.startsWith(lt.className));
    if (matchingLt) {
        if (type.includes('TH')) matchingLt.practicalClasses.push(rawSubClass);
        else if (type.includes('BT')) matchingLt.exerciseClasses.push(rawSubClass);
    } else {
        // Orphan row, make it a standalone class
        rawOpenClasses.push({
            id: subj,
            name: String(row[5] || '').trim(),
            className: cls,
            credits: "0",
            capacity: "",
            enrolled: "",
            cohort: String(row[2] || ''),
            schedule: rawSubClass.LichHoc!,
            practicalGroupRaw: "",
            exerciseGroupRaw: "",
            location: rawSubClass.DiaDiem || "",
            practicalClasses: [],
            exerciseClasses: []
        });
    }
}

console.log(`Processing ${rawOpenClasses.length} distinct class groups...`);
const processed = processOpenClasses(rawOpenClasses);

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(processed, null, 2), 'utf-8');
console.log(`Successfully generated ${outputPath} with ${processed.length} combined courses.`);
