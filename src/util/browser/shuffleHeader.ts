export function shuffleObject(obj: Record<string, any>) {
    // Extract the keys from the object
    const keys = Object.keys(obj);

    // Function to shuffle an array (Fisher-Yates shuffle algorithm)
    function shuffleArray(array: any[]) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Shuffle the keys
    const shuffledKeys = shuffleArray(keys);

    // Create a new object with the shuffled keys
    const shuffledObj: Record<string, any> = {};
    for (const key of shuffledKeys) {
        shuffledObj[key] = obj[key];
    }

    return shuffledObj;
}
