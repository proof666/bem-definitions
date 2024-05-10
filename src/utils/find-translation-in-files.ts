import * as fs from "fs";
import * as path from "path";
import { Location } from "../types/location";

export function findTranslationInFiles(
  directory: string,
  searchString: string
): Location[] {
  const stringLocations: Location[] = [];

  function traverseDirectory(currentPath: string) {
    const files = fs.readdirSync(currentPath);

    files.forEach((file) => {
      const filePath = path.join(currentPath, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory()) {
        traverseDirectory(filePath);
      } else if (stats.isFile() && file.endsWith(".json")) {
        const fileContent = fs.readFileSync(filePath, "utf-8");
        const lines = fileContent.split("\n");

        lines.forEach((line, index) => {
          const startIndex = line.indexOf(searchString);
          if (startIndex !== -1) {
            const endIndex = startIndex + searchString.length;
            stringLocations.push({
              file: filePath,
              start: { line: index, character: startIndex + 1 },
              end: { line: index, character: endIndex },
            });
          }
        });
      }
    });
  }

  traverseDirectory(directory);
  return stringLocations;
}
