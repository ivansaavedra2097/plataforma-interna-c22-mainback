export const  secureSixDigitNumber = () => {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    // Scale the result to sit cleanly between 100000 and 999999
    return 100000 + (array[0] % 900000);
}