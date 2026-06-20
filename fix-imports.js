import fs from "fs";
import path from "path";

const projectRoot = path.resolve("./client/src"); // adjust if needed

// recursive function to list all files
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, fileList);
    } else {
      fileList.push(fullPath);
    }
  });
  return fileList;
}

// get all source files
const allFiles = getAllFiles(projectRoot).filter((f) =>
  f.match(/\.(js|jsx)$/)
);

// map of lowercase → actual filenames
const fileMap = {};
allFiles.forEach((file) => {
  const base = path.basename(file);
  fileMap[base.toLowerCase()] = base;
});

// fix imports
allFiles.forEach((file) => {
  let content = fs.readFileSync(file, "utf-8");
  let changed = false;

  content = content.replace(
    /import\s+[^'"]+['"](.+)['"]/g,
    (match, importPath) => {
      if (importPath.startsWith(".") || importPath.startsWith("/")) {
        const ext = [".js", ".jsx"];
        for (let e of ext) {
          const base = path.basename(importPath + e).toLowerCase();
          if (fileMap[base] && !importPath.endsWith(fileMap[base])) {
            changed = true;
            return match.replace(importPath, importPath.replace(path.basename(importPath), fileMap[base].replace(/\..*$/, "")));
          }
        }
      }
      return match;
    }
  );

  if (changed) {
    fs.writeFileSync(file, content, "utf-8");
    console.log(`✅ Fixed imports in ${file}`);
  }
});