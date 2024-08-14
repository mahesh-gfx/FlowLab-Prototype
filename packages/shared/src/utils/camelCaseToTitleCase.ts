export const camelCaseToTitleCase = (str: string) => {
  // Split the camelCase string into words based on uppercase letters
  const words = str.replace(/([A-Z])/g, " $1").trim();

  // Capitalize the first letter of each word
  const titleCaseStr = words
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return titleCaseStr;
};

// Example usage:
// const camelCaseStr = "thisIsCamelCase";
// const titleCaseStr = camelCaseToTitleCase(camelCaseStr);
// console.log(titleCaseStr); // Output: "This Is Camel Case"
