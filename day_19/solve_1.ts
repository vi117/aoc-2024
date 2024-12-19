export type Problem = {
    piece: string[],
    words: string[]
};

export async function readData(path: string): Promise<Problem> {
    const text = await Deno.readTextFile(path);
    const [piece, words] = text.replaceAll("\r", "").split("\n\n");
    return {
        piece: piece.split(",").map(x => x.trim()),
        words: words.split("\n").map(x => x.trim())
    }
}

const memo = new Map<string, boolean>();

export function isAvailableWords(pieces: Set<string>, word: string): boolean {
    if (memo.has(word)) {
        return memo.get(word)!;
    }

    if (word.length === 0) {
        return true;
    }
    if (pieces.size === 0) {
        return false;
    }
    
    for (const p of pieces) {
        if (word.startsWith(p)) {
            const newWord = word.slice(p.length);
            const newPieces =  pieces;
            //new Set(pieces);
            // newPieces.delete(p);
            // console.log(`use ${p} for ${word}, new word is ${newWord}, new pieces are ${[...newPieces].join(", ")}`);
            if (isAvailableWords(newPieces, newWord)) {
                memo.set(word, true);
                return true;
            }
        }
    }
    memo.set(word, false);
    return false;
}

if (import.meta.main) {
    const problem = await readData("input.txt");
    console.log(problem);
    const pieces = new Set(problem.piece);
    let count = 0;
    for (const word of problem.words) {
        if (isAvailableWords(pieces, word)) {
            count++;
        }
    }
    console.log(count);
}
