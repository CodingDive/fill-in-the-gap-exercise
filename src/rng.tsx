/**
 * Generates a random number between 0 and the given max number
 */
export const generateRandomNumber = (smallerThan = 4) =>
  Math.floor(Math.random() * smallerThan);
