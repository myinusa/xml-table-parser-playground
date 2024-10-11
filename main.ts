import * as fs from "node:fs";
import * as xml2js from "xml2js";
import { calculateHexValues } from "./utils/hexadecimal";

class CustomError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CustomError";
  }
}

interface CheatEntry {
  ID: string;
  Description: string;
  ShowAsSigned: string;
  VariableType: string;
  Address: string;
  Offsets?: Offset[];
  CheatEntry?: CheatEntry[];
  CheatEntries?: CheatEntry[]; // Added to handle nested CheatEntries
}

interface Offset {
  Offset: string[];
}

interface FlattenedEntry {
  ID: string;
  Description: string;
  // ShowAsSigned: string;
  VariableType: string;
  Address: string;
  SumAddress: string;
  Offsets: string;
}

const xmlFilePath = "data/person-player.xml";

async function parseXML(xml: string): Promise<any> {
  const parser = new xml2js.Parser();
  return new Promise((resolve, reject) => {
    parser.parseString(xml, (err, result) => {
      if (err) {
        reject(new CustomError(`XML Parsing Error: ${err.message}`));
      } else {
        resolve(result);
      }
    });
  });
}

function removeDoubleQuotes(str: string): string {
  return str.replace(/^"|"$/g, "");
}

function removeArrow(str: string): string {
  return str.replace(/->/g, "");
}

function hasKey<T extends object>(obj: T, key: string): boolean {
  return key in obj;
}

/**
 * Converts an array of Offset objects to a comma-separated string.
 * Appends "0x" at the start of each offset if it isn't already present.
 *
 * @param {Offset[]} offsets - The array of Offset objects.
 * @returns {string} - A comma-separated string of offsets.
 */
const mapOffsetsToString = (offsets?: Offset[]): string => {
  if (!offsets) {
    return "";
  }

  return offsets
    .map((item) =>
      item.Offset.map((offset) =>
        offset.startsWith("0x") ? offset : "0x" + offset
      ).join(", ")
    )
    .join(", ");
};

// Usage in the flattenEntries function

function flattenEntries(
  entries: CheatEntry[],
  depth: number = 0,
  maxDepth: number = 5
): FlattenedEntry[] {
  const flattened: FlattenedEntry[] = [];

  for (const entry of entries) {
    const offsets = mapOffsetsToString(entry.Offsets);
    const rootDescription = removeDoubleQuotes(entry.Description[0]);
    const rootParent = removeArrow(rootDescription);

    // Create a flattened entry for the current entry
    flattened.push({
      ID: entry.ID,
      Description: rootParent,
      VariableType: entry.VariableType ?? "N/A",
      Address: entry.Address ?? "N/A",
      SumAddress: calculateHexValues(entry?.Address?.[0]),
      Offsets: offsets,
    });

    // If there are nested CheatEntries and we haven't reached the max depth, flatten them as well
    if (entry.CheatEntries && depth < maxDepth) {
      const NestedCE = entry.CheatEntries[0].CheatEntry;
      if (!NestedCE) {
        throw new CustomError(
          `Error: No CheatEntry found in nested CheatEntries. Please check the XML file.`
        );
      }
      for (const element of NestedCE) {
        if (
          hasKey(element, "VariableType") &&
          element.VariableType[0] === "Auto Assembler Script"
        ) {
          continue;
        }
        const cleanedDescription = removeDoubleQuotes(entry.Description[0]);
        const parent = removeArrow(cleanedDescription);
        const elementOffsets = mapOffsetsToString(element.Offsets);

        flattened.push({
          ID: element.ID,
          Description: parent + removeDoubleQuotes(element.Description[0]),
          VariableType: element.VariableType ?? "N/A",
          Address: element.Address ?? "N/A",
          SumAddress: calculateHexValues(element?.Address?.[0]),
          Offsets: elementOffsets,
        });
        // Recursively flatten nested entries
        flattened.push(...flattenEntries([element], depth + 1, maxDepth));
      }
    }
  }

  return flattened;
}

function checkForDuplicates(entries: FlattenedEntry[]): FlattenedEntry[] {
  const seen = new Set<string>();
  const uniqueEntries: FlattenedEntry[] = [];

  for (const entry of entries) {
    if (!seen.has(entry.ID)) {
      seen.add(entry.ID);
      uniqueEntries.push(entry);
    } else {
      // console.warn(`Duplicate entry found and removed: ${entry.ID}`);
    }
  }

  return uniqueEntries;
}

function convertToCSV(data: FlattenedEntry[]): string {
  const header = "ID,Description,VariableType,Address,SumAddress,Offsets\n";
  const rows = data
    .map(
      (entry) =>
        `${entry.ID},${entry.Description},${entry.VariableType},${entry.Address},${entry.SumAddress},"${entry.Offsets}"`
    )
    .join("\n");
  return header + rows;
}

async function main() {
  try {
    console.log("Starting the XML processing...");

    // Load XML from file
    console.log(`Loading XML from file: ${xmlFilePath}`);
    const xmlData = fs.readFileSync(xmlFilePath, "utf-8");
    console.log("XML file loaded successfully.");

    // Parse XML
    const result = await parseXML(xmlData);
    console.log("XML parsed successfully.");

    // Flatten entries
    const cheatEntries = result.CheatTable.CheatEntries[0].CheatEntry;
    console.log(`Found ${cheatEntries.length} cheat entries.`);
    let flattenedEntries = flattenEntries(cheatEntries);

    // Check for duplicates
    flattenedEntries = checkForDuplicates(flattenedEntries);
    console.log(
      `After removing duplicates, ${flattenedEntries.length} entries remain.`
    );

    // Convert to CSV
    const csvOutput = convertToCSV(flattenedEntries);
    console.log("CSV conversion completed.");

    // Write to CSV file
    const csvFilePath = "output/cheat_table.csv";
    fs.writeFileSync(csvFilePath, csvOutput);
    console.log(`CSV file has been created successfully at ${csvFilePath}.`);
  } catch (error) {
    if (error instanceof CustomError) {
      console.error("Custom Error:", error.message);
    } else {
      console.error("Unexpected Error:", error);
    }
  }
}

main();
