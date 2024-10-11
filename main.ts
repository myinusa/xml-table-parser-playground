import * as fs from "node:fs";
import * as xml2js from "xml2js";

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
  Offset: string;
}

interface FlattenedEntry {
  ID: string;
  Description: string;
  // ShowAsSigned: string;
  VariableType: string;
  Address: string;
  Offsets: string; // Array of offsets as a string
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

function hasKey<T>(obj: T, key: keyof T): boolean {
  return key in obj;
}

function flattenEntries(
  entries: CheatEntry[],
  parentID?: string
): FlattenedEntry[] {
  const flattened: FlattenedEntry[] = [];

  for (const entry of entries) {
    const offsets = entry.Offsets
      ? entry.Offsets.map((offset) => offset.Offset).join(", ")
      : "";

    // Create a flattened entry for the current entry
    flattened.push({
      ID: entry.ID,
      Description: entry.Description,
      VariableType: entry.VariableType,
      Address: entry.Address,
      Offsets: offsets,
    });

    // If there are nested CheatEntries, flatten them as well
    if (entry.CheatEntries) {
      //   const nestedEntries = flattenEntries(entry.CheatEntries, entry.ID);
      //   flattened.push(...nestedEntries);
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
        // const parent = entry.Description[0].slice(0, -3) ?? "";
        const cleanedDescription = removeDoubleQuotes(entry.Description[0]);
        const parent = removeArrow(cleanedDescription);
        // console.log(cleanedDescription);
        flattened.push({
          ID: element.ID,
          Description: parent + removeDoubleQuotes(element.Description[0]),
          VariableType: element.VariableType,
          Address: element.Address,
          Offsets: "",
        });
      }
    }
  }

  return flattened;
}
function convertToCSV(data: FlattenedEntry[]): string {
  const header = "ID,Description,VariableType,Address,Offsets\n";
  const rows = data
    .map(
      (entry) =>
        `${entry.ID},${entry.Description},${entry.VariableType},${entry.Address},"${entry.Offsets}"`
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
    const flattenedEntries = flattenEntries(cheatEntries);

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
