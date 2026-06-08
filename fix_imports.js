const fs = require('fs');
const path = require('path');

const filesToFix = [
    { dir: 'src/features/integratedStudyRoadmap/components', oldBase: 'src/pages/integratedStudyRoadmap' },
    { dir: 'src/features/setting/components', oldBase: 'src/pages/setting' }
];

function processFiles() {
    for (const group of filesToFix) {
        const dirPath = path.resolve(group.dir);
        const oldBasePath = path.resolve(group.oldBase);

        if (!fs.existsSync(dirPath)) continue;

        const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));

        for (const file of files) {
            const filePath = path.join(dirPath, file);
            let content = fs.readFileSync(filePath, 'utf8');
            let modified = false;

            // ES6 import regex
            const regex = /from\s+['"](\.[^'"]+)['"]/g;

            content = content.replace(regex, (match, p1) => {
                // If it's importing a sibling that also moved, let's say './note.tsx',
                // oldAbsPath will be src/pages/integratedStudyRoadmap/note.tsx
                // Is this file now in the same directory? Yes, they all moved together.
                // So if p1 starts with './', and the target file moved, we can leave it as './'.
                // But let's be mathematically correct:
                
                // What was the old absolute path of the imported module?
                const oldAbsPath = path.resolve(oldBasePath, p1);
                
                // Does this imported module still exist at oldAbsPath?
                // Probably not, if it moved. Let's check if the filename exists in our CURRENT dirPath
                // If it exists in dirPath, then it's a sibling now!
                const fileName = path.basename(oldAbsPath);
                
                // We'll check if the oldAbsPath is outside the oldBasePath.
                if (p1.startsWith('../')) {
                    // It points outside. So it didn't move. It is still at oldAbsPath!
                    // Let's create a relative path from the NEW dirPath to oldAbsPath.
                    let newRelPath = path.relative(dirPath, oldAbsPath).replace(/\\/g, '/');
                    if (!newRelPath.startsWith('.')) {
                        newRelPath = './' + newRelPath;
                    }
                    modified = true;
                    return match.replace(p1, newRelPath);
                }
                
                return match;
            });
            
            if (modified) {
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`Updated imports in ${file}`);
            }
        }
    }
}
processFiles();
