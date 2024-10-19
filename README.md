# Cheat Table Parser

## Description

A Node.js module for parsing cheat table XML files, flattening entries, and converting them to CSV.

> This is a conceptual project for a cheat table parser. It is not intended for production use.

## Usage

1. Install the module using npm or yarn: `npm install`
2. Create a new JSON file with your cheat table data.
3. Run the script using Node.js: `node index.js`

Example XML file structure:

```xml
<root>
  <CheatTable>
    <CheatEntries>
      <!-- Your cheat entries here -->
    </CheatEntries>
  </CheatTable>
</root>
```

## FAQ

Q: What is the purpose of this module?
A: To parse cheat table XML files, flatten entries, and convert them to CSV.

Q: Can I customize the output format?
A: Yes, you can modify the `convertToCSV` function to suit your needs.

Q: How do I add a new entry to the cheat table?
A: Create a new JSON file with your entry data and run the script using Node.js.

## Resources

* [Node.js Documentation](https://nodejs.org/en/docs/)
* [xml2js Documentation](https://www.npmjs.com/package/xml2js)
* [csv-parser Documentation](https://github.com/ricmoo/csv-parser)

## Configuration

To customize the output CSV file, modify the `output.csv` variable in the `index.js` script.

## Features

* Parse cheat table XML files
* Flatten entries
* Convert to CSV
* Check for duplicate entries
* Customize output format using the `convertToCSV` function

## Topics

* Cheat Table Parsing
* XML Processing
* CSV Generation
* Duplicate Entry Detection

## Considerations

* The module assumes a specific XML file structure. If your file has a different structure, you may need to modify the script accordingly.
* The module uses Node.js built-in modules for file I/O and XML parsing
