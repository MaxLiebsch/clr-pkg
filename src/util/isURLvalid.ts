export function isValidURL(url: string) {
    try {
        // Attempt to create a new URL object
        new URL(url);
        return true; // If no error is thrown, the URL is valid
    } catch (e) {
        return false; // If an error is thrown, the URL is invalid
    }
}