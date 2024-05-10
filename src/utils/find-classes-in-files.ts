import * as fs from "fs";
import * as path from "path";
import { Location } from "../types/location";

export function findClassesInFiles(
  directory: string,
  classNames: string[]
): Location[] {
  const classLocations: Location[] = [];

  function traverseDirectory(currentPath: string) {
    const files = fs.readdirSync(currentPath);

    files.forEach((file) => {
      const filePath = path.join(currentPath, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory()) {
        traverseDirectory(filePath);
      } else if (stats.isFile() && file.endsWith(".css")) {
        const fileContent = fs.readFileSync(filePath, "utf-8");
        const lines = fileContent.split("\n");

        lines.forEach((line, index) => {
          classNames.forEach((className) => {
            const regex = new RegExp(`\\.${className}\\b`, "g");
            let match;
            while ((match = regex.exec(line)) !== null) {
              classLocations.push({
                file: filePath,
                start: {
                  line: index,
                  character: match.index + 1,
                },
                end: {
                  line: index,
                  character: match.index + className.length + 1,
                },
              });
            }
          });
        });
      }
    });
  }

  traverseDirectory(directory);
  return classLocations;
}
