function parseExcelDate(dateValue) {
    if (!dateValue) return null; // Handle empty or undefined values

    // Handle string dates in 'dd/mm/yyyy' format
    if (typeof dateValue === "string") {
        const [day, month, year] = dateValue.split("/").map(Number);
        if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
            return new Date(year, month - 1, day); // Use JavaScript's Date constructor
        } else {
            throw new Error("Invalid date format. Use 'dd/mm/yyyy'.");
        }
    }

    // Handle Excel serial numbers
    if (typeof dateValue === "number") {
        const baseDate = new Date(1899, 11, 30); // Excel's base date
        return new Date(baseDate.getTime() + dateValue * 86400000); // Convert to JavaScript Date
    }

    throw new Error("Invalid date format. Expected 'dd/mm/yyyy' or an Excel serial number.");
}

module.exports = parseExcelDate;
