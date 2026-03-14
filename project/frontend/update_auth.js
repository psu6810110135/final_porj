const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(fullPath));
        } else {
            if (file.endsWith('.ts') || file.endsWith('.tsx')) {
                results.push(fullPath);
            }
        }
    });
    return results;
}

const dir = 'd:\\final_porj\\project\\frontend\\src';
console.log(`Scanning files in ${dir}...`);
const files = walk(dir);

let updatedCount = 0;

files.forEach(file => {
    // Skip loginpage.tsx as it is already updated for setting the token
    if (file.toLowerCase().includes('loginpage.tsx')) return;

    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Replace getItem("jwt_token") or getItem('jwt_token')
    content = content.replace(/localStorage\.getItem\(['"]jwt_token['"]\)/g, "(localStorage.getItem('jwt_token') || sessionStorage.getItem('jwt_token'))");
    
    // Replace removeItem("jwt_token") or removeItem('jwt_token')
    content = content.replace(/localStorage\.removeItem\(['"]jwt_token['"]\)/g, "(localStorage.removeItem('jwt_token'), sessionStorage.removeItem('jwt_token'))");

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated: ${file}`);
        updatedCount++;
    }
});

console.log(`Finished. Updated ${updatedCount} files.`);
