const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'frontend/src');
const oldStr = 'http://localhost:5000';
const newStr = 'https://blogging-platform-h7ur.onrender.com';

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes(oldStr)) {
        content = content.split(oldStr).join(newStr);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated:', filePath);
    }
}

function traverse(dirPath) {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            traverse(fullPath);
        } else if (fullPath.endsWith('.jsx')) {
            replaceInFile(fullPath);
        }
    }
}

traverse(dir);
