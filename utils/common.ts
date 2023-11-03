import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

export const listToDocsObj = (list: any[], key: string = "_docID") => {
  return list.reduce((acc, item) => {
    acc[item[key]] = item;
    return acc;
  }, {});
};

export const convertToCSV = (objArray: any[]) => {
  // Extract the headers by taking the keys from the first object
  const headers = Object.keys(objArray[0]);

  // Map the headers to a CSV string
  const headerString = headers.join(",");

  // Map the array of objects to a string of CSV values
  const rowStrings = objArray.map((obj) => {
    return headers
      .map((header) => {
        const value = obj[header];
        // Handle undefined and null values as empty strings and wrap all values in quotes
        const escapedValue =
          value === undefined || value === null
            ? ""
            : value.toString().replace(/"/g, '""'); // Escape double quotes
        return `"${escapedValue}"`; // Wrap in double quotes
      })
      .join(",");
  });

  // Combine the header string and the row strings with newlines
  const csvString = [headerString, ...rowStrings].join("\r\n");

  return csvString;
};

export const writeToFile = async (csvString: string, fileName: string) => {
  const fileUri = FileSystem.documentDirectory + fileName;
  await FileSystem.writeAsStringAsync(fileUri, csvString, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  return fileUri;
};

export const shareFile = async (fileUri: string) => {
  await Sharing.shareAsync(fileUri);
};
