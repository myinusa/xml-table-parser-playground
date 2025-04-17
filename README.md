# XML Cheat Table Parser

A TypeScript utility for parsing, processing, and converting XML cheat tables to CSV format, specifically designed for game memory editing tools like Cheat Engine.

## Overview

This project is designed to parse XML cheat tables (commonly used in game memory editing tools like Cheat Engine), process the entries including nested hierarchies, and convert them to a more accessible CSV format. The tool handles complex memory structures with offsets, calculates hexadecimal values, and ensures unique entries in the output.

## What are Cheat Tables?

Cheat tables are XML files used by memory editing tools like Cheat Engine to locate and modify values in a game's memory. They contain:

- Memory addresses
- Pointer paths (offsets)
- Variable types
- Descriptions
- Hierarchical organization of game elements

This tool helps game developers, modders, and testers analyze and work with these tables in a more accessible format.

## Features

- **XML Parsing**: Robust parsing of complex XML cheat table structures
- **Nested Entry Support**: Handles deeply nested cheat entries up to a configurable depth
- **Offset Processing**: Properly formats and preserves memory offset information
- **Hexadecimal Calculation**: Performs addition and subtraction operations on hexadecimal values
- **Description Cleaning**: Removes unnecessary characters like quotes and arrows from descriptions
- **Duplicate Detection**: Identifies and removes duplicate entries based on ID
- **CSV Export**: Converts the processed data to a clean, readable CSV format
- **Comprehensive Error Handling**: Custom error class with detailed error messages

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd xml-table-parser-playground
   ```

2. Install dependencies:
   ```bash
   npm install
   # or if using pnpm
   pnpm install
   ```

3. Ensure you have the required directory structure:
   ```bash
   mkdir -p data output
   ```

## Usage

1. Place your XML cheat table file in the `data/` directory (default expected file is `data/person-player.xml`)

2. Run the parser:
   ```bash
   npx ts-node main.ts
   ```

3. The processed CSV file will be generated in the `output/` directory as `cheat_table.csv`

4. View the console output for processing statistics and any errors

## Input/Output Example

### Input XML (simplified)
```xml
<CheatTable>
  <CheatEntries>
    <CheatEntry>
      <ID>0</ID>
      <Description>"Player"</Description>
      <VariableType>4 Bytes</VariableType>
      <Address>1A2B3C</Address>
      <Offsets>
        <Offset>10</Offset>
      </Offsets>
      <CheatEntries>
        <CheatEntry>
          <ID>1</ID>
          <Description>"Health"</Description>
          <VariableType>Float</VariableType>
          <Address>1A2B3C+20</Address>
        </CheatEntry>
      </CheatEntries>
    </CheatEntry>
  </CheatEntries>
</CheatTable>
```

### Output CSV
```csv
ID,Description,VariableType,Address,SumAddress,Offsets
0,Player,4 Bytes,1A2B3C,0x1A2B3C,"0x10"
1,PlayerHealth,Float,1A2B3C+20,0x1A2B5C,""
```

## Configuration

You can modify the following parameters in `main.ts`:

- `xmlFilePath`: Path to the input XML file (default: `"data/person-player.xml"`)
- `csvFilePath`: Path for the output CSV file (default: `"output/cheat_table.csv"`)
- `maxDepth`: Maximum depth for nested cheat entries (default: `5`)

## Code Architecture

### Core Components

1. **XML Parsing (`parseXML` function)**
   - Uses the `xml2js` library to convert XML to JavaScript objects
   - Wraps parsing in a Promise for async handling
   - Implements custom error handling

2. **String Processing Functions**
   - `removeDoubleQuotes`: Removes surrounding quotes from descriptions
   - `removeArrow`: Removes arrow symbols (`->`) from descriptions
   - `hasKey`: Type-safe property existence check
   - `mapOffsetsToString`: Converts offset objects to formatted strings

3. **Entry Processing (`flattenEntries` function)**
   - Recursively processes nested cheat entries
   - Handles depth limitation to prevent infinite recursion
   - Skips "Auto Assembler Script" entries
   - Combines parent and child descriptions
   - Calculates hexadecimal values

4. **Duplicate Handling (`checkForDuplicates` function)**
   - Uses a Set to track seen IDs
   - Filters out duplicate entries

5. **CSV Conversion (`convertToCSV` function)**
   - Creates a header row
   - Formats each entry as a CSV row
   - Properly escapes fields with quotes

### Data Structures

#### Input Structure
```typescript
interface CheatEntry {
  ID: string;
  Description: string;
  ShowAsSigned: string;
  VariableType: string;
  Address: string;
  Offsets?: Offset[];
  CheatEntry?: CheatEntry[];
  CheatEntries?: CheatEntry[]; // For nested entries
}

interface Offset {
  Offset: string[];
}
```

#### Output Structure
```typescript
interface FlattenedEntry {
  ID: string;
  Description: string;
  VariableType: string;
  Address: string;
  SumAddress: string; // Calculated hexadecimal value
  Offsets: string;
}
```

## Hexadecimal Calculation

The utility includes a sophisticated function to calculate hexadecimal values from strings containing operations:

```typescript
// Examples:
calculateHexValues("1A2B3C");      // Returns "0x1A2B3C"
calculateHexValues("1A+5B");       // Returns "0x75"
calculateHexValues("100-20");      // Returns "0xE0"
calculateHexValues("1A2B3C+20");   // Returns "0x1A2B5C"
```

The function:
1. Parses the input string and splits it by operations
2. Converts each hexadecimal value to decimal
3. Performs the specified operations
4. Converts the result back to hexadecimal with "0x" prefix

## Error Handling

The application uses a custom error class (`CustomError`) for better error identification and handling:

```typescript
class CustomError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CustomError";
  }
}
```

Specific error cases handled:
- XML parsing errors
- Missing nested CheatEntry elements
- Invalid hexadecimal values
- File system errors

## Processing Flow

1. **Initialization**: Set up file paths and prepare environment
2. **File Loading**: Read the XML file from the specified path
3. **XML Parsing**: Convert XML to JavaScript objects
4. **Entry Processing**: 
   - Extract cheat entries
   - Flatten the nested structure
   - Process descriptions and addresses
5. **Duplicate Removal**: Filter out entries with duplicate IDs
6. **CSV Conversion**: Format the data as CSV
7. **File Output**: Write the CSV data to the output file

## Dependencies

- **Node.js**: v14 or higher recommended
- **TypeScript**: For type safety and modern JavaScript features
- **xml2js**: XML parsing library
- **fs (Node.js built-in)**: File system operations

## Development

### Project Structure

```
xml-table-parser-playground/
├── data/                  # Input XML files
│   └── person-player.xml  # Default input file
├── output/                # Generated CSV files
│   └── cheat_table.csv    # Output file
├── utils/
│   └── hexadecimal.ts     # Utility for hex calculations
├── main.ts                # Main application logic
├── package.json           # Project dependencies
├── pnpm-lock.yaml         # Lock file for dependencies
├── tsconfig.json          # TypeScript configuration
└── README.md              # Project documentation
```

### Building

```bash
npx tsc
```

### Type Checking

```bash
npx tsc --noEmit
```

### Extending the Project

To add new features:

1. **Support for different XML formats**: Modify the `parseXML` function and interfaces
2. **Additional output formats**: Create new converter functions similar to `convertToCSV`
3. **Enhanced filtering**: Add conditions in the `flattenEntries` function
4. **UI interface**: Create a frontend that calls the core processing functions

## Troubleshooting

### Common Issues

1. **"Error: ENOENT: no such file or directory"**
   - Ensure the `data` directory exists and contains your XML file
   - Check that the file path in `xmlFilePath` is correct

2. **"XML Parsing Error"**
   - Verify that your XML file is well-formed
   - Check for missing closing tags or invalid characters

3. **"Error: No CheatEntry found in nested CheatEntries"**
   - The XML structure doesn't match the expected format
   - Ensure CheatEntries elements contain CheatEntry children

4. **"Invalid hexadecimal value"**
   - Check that address values in the XML are valid hexadecimal
   - Look for non-hex characters in address fields

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Acknowledgments

- Cheat Engine community for the XML table format
- xml2js contributors for the excellent XML parsing library
