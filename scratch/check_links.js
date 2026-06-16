const fs = require('fs');
const path = require('path');

const baseDir = 'd:\\NEW WEBSITE';

function getAllHtmlFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file === 'node_modules' || file === '.git' || file === 'scratch') continue;
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            getAllHtmlFiles(filePath, fileList);
        } else if (filePath.endsWith('.html')) {
            fileList.push(filePath);
        }
    }
    return fileList;
}

const htmlFiles = getAllHtmlFiles(baseDir);
const linkRegex = /href=["']([^"']+)["']/g;
const imgRegex = /src=["']([^"']+)["']/g;
const links = new Set();
const fileLinks = {};

htmlFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');
    let match;
    while ((match = linkRegex.exec(content)) !== null) {
        let link = match[1];
        if (link.startsWith('http') || link.startsWith('mailto:') || link.startsWith('tel:') || link.startsWith('#')) continue;
        
        let targetPath = link.split('#')[0].split('?')[0];
        if (!targetPath) continue;
        
        if (targetPath.startsWith('/')) {
            targetPath = path.join(baseDir, targetPath);
        } else {
            targetPath = path.join(path.dirname(file), targetPath);
        }
        
        let exists = false;
        if (fs.existsSync(targetPath)) {
            exists = fs.statSync(targetPath).isFile();
        } 
        if (!exists && fs.existsSync(path.join(targetPath, 'index.html'))) {
            exists = true;
        }
        if (!exists && fs.existsSync(targetPath + '.html')) {
            exists = true;
        }
        
        if (!exists) {
            console.log(`Broken link: ${link} in file ${file}`);
        }
    }
});
