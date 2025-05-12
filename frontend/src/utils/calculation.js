// utils/calculations.js
export const calculateAge = (dob) => {
    if (!dob) return 0;
    return Math.floor((new Date() - new Date(dob)) / 31557600000);
};