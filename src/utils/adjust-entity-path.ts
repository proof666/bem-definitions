export const adjustEntityPath = (currentEntityPath: string): string => {
  if (
    currentEntityPath.includes(".utils") ||
    currentEntityPath.includes(".hooks")
  ) {
    const parts = currentEntityPath.split("/");
    while (parts.length > 0) {
      const lastPart = parts.pop();
      if (
        lastPart &&
        (lastPart.endsWith(".utils") || lastPart.endsWith(".hooks"))
      ) {
        break;
      }
    }
    currentEntityPath = parts.join("/");
  }

  return currentEntityPath;
};
