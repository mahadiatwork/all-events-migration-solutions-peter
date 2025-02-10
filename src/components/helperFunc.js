// Function to check if a date falls within a specific range
export const isDateInRange = (date, rangeType) => {
    const today = new Date();
    const targetDate = new Date(date);
    let startDate, endDate;

    switch (rangeType) {
        case "Current Week":
            startDate = new Date(today);
            startDate.setDate(today.getDate() - today.getDay()); // Start of the week (Sunday)
            endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6); // End of the week (Saturday)
            break;
        case "Current Month":
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            break;
        case "Last 7 Days":
            startDate = new Date();
            startDate.setDate(today.getDate() - 7);
            endDate = today;
            break;
        case "Last 30 Days":
            startDate = new Date();
            startDate.setDate(today.getDate() - 30);
            endDate = today;
            break;
        case "Last 90 Days":
            startDate = new Date();
            startDate.setDate(today.getDate() - 90);
            endDate = today;
            break;
        case "Next Week":
            startDate = new Date();
            startDate.setDate(today.getDate() + (7 - today.getDay())); // Start of next week
            endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6); // End of next week
            break;
        case "Default":
        default:
            startDate = new Date();
            startDate.setDate(today.getDate() - 14); // Last 14 days
            endDate = today;
            break;
    }

    return targetDate >= startDate && targetDate <= endDate;
};
