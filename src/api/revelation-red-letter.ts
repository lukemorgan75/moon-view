/**
 * Traditional red-letter verse ranges for the words of Jesus in Revelation (KJV).
 * Inclusive [chapter, fromVerse, toVerse]. Whole-verse marking (not partial quotes).
 */
const RED_LETTER_RANGES: ReadonlyArray<readonly [number, number, number]> = [
  [1, 8, 8],
  [1, 11, 11],
  [1, 17, 20],
  [2, 1, 29],
  [3, 1, 22],
  [4, 1, 1],
  [16, 15, 15],
  [21, 5, 8],
  [22, 7, 7],
  [22, 12, 16],
  [22, 20, 20],
];

const redLetterSet = new Set<string>();
for (const [ch, from, to] of RED_LETTER_RANGES) {
  for (let v = from; v <= to; v++) {
    redLetterSet.add(`${ch}:${v}`);
  }
}

export function isJesusWords(chapter: number, verse: number): boolean {
  return redLetterSet.has(`${chapter}:${verse}`);
}
