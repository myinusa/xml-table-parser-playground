/**
 * Parses a string of hexadecimal values and performs addition and subtraction
 * based on the specified operations. The calculation only occurs if there are
 * more than one hexadecimal values.
 *
 * @param {string} input - A string containing hexadecimal values with "+" and "-" operations.
 * @returns {string} - The resulting hexadecimal string prefixed with "0x" after performing the operations,
 *                     or the hexadecimal string of the single hexadecimal if only one is present.
 * @throws {Error} - Throws an error if the input format is invalid.
 */
export const calculateHexValues = (input?: string): string => {
  if (!input) {
    return "N/A";
  }

  const hexValues = input.split(/(?=[+-])/); // Split while keeping the operators

  // If there's only one hexadecimal value, return its hexadecimal conversion
  if (hexValues.length === 1) {
    const singleHex = hexValues[0].trim();
    if (!/^[+-]?[0-9A-Fa-f]+$/.test(singleHex)) {
      //   throw new Error(`Invalid hexadecimal value: ${singleHex}`);
    //   console.error(`Invalid hexadecimal value: ${singleHex}`);
    }
    return `0x${parseInt(singleHex.replace(/^[+-]/, ""), 16)
      .toString(16)
      .toUpperCase()}`;
  }

  let total = 0;

  for (const value of hexValues) {
    const trimmedValue = value.trim();
    const sign =
      trimmedValue[0] === "+" || trimmedValue[0] === "-"
        ? trimmedValue[0]
        : "+";
    const hexNumber = trimmedValue.slice(1).trim();

    // Validate hexadecimal number
    if (!/^[0-9A-Fa-f]+$/.test(hexNumber)) {
      throw new Error(`Invalid hexadecimal value: ${hexNumber}`);
    }

    const decimalValue = parseInt(hexNumber, 16);
    total += sign === "+" ? decimalValue : -decimalValue;
  }

  return `0x${total.toString(16).toUpperCase()}`; // Return the total as a hexadecimal string
};
