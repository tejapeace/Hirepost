import fs from "fs";
import path from "path";

const projectRoot = path.resolve("./client/src"); // adjust if your code lives elsewhere

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
const allFiles = getAllFiles(projectRoot).filter(
  (f) => f.endsWith(".jsx") || f.endsWith(".js")
);

allFiles.forEach((file) => {
  const content = fs.readFileSync(file, "utf8");
  const importRegex = /import\s+.*?from\s+['"](.*?)['"]/g;
  let match;
  while ((match = importRegex.exec(content))) {
    const importPath = match[1];

    // skip node_modules & absolute imports
    if (!importPath.startsWith(".")) continue;

    const fullImportPath = path.resolve(path.dirname(file), importPath);
    const dir = path.dirname(fullImportPath);
    const base = path.basename(fullImportPath);

    if (fs.existsSync(dir)) {
      const realFiles = fs.readdirSync(dir);
      const matchFile = realFiles.find((f) =>
        f.toLowerCase().startsWith(base.toLowerCase())
      );
      if (matchFile && matchFile !== base && !base.includes(".")) {
        console.log(
          `⚠️ Case mismatch in ${file}\n   import: ${importPath}\n   actual: ${matchFile}\n`
        );
      }
    }
  }
});