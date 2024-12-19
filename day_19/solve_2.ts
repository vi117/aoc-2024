import { readData } from "./solve_1.ts";

const memo = new Map<string, number>();

export function countAvailableWords(pieces: Set<string>, word: string): number {
    if (memo.has(word)) {
        return memo.get(word)!;
    }

    if (word.length === 0) {
        return 1;
    }
    if (pieces.size === 0) {
        return 0;
    }
    
    let count = 0;
    for (const p of pieces) {
        if (word.startsWith(p)) {
            const newWord = word.slice(p.length);
            const newPieces =  pieces;
            const c = countAvailableWords(newPieces, newWord);
            count += c;
        }
    }
    memo.set(word, count);
    return count;
}

if (import.meta.main) {
    const problem = await readData("input.txt");
    console.log(problem);
    const pieces = new Set(problem.piece);
    let count = 0;
    for (const word of problem.words) {
        const c = countAvailableWords(pieces, word);
        console.log(`word: ${word}, count: ${c}`);
        count += c;
    }
    console.log(count);
}
