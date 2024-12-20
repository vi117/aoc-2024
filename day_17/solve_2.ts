import { readData } from "./solve_1.ts";

function dfs(
    a: bigint,
    output: bigint[],
): bigint[] {
    const [first, ...rest] = output;
    if (output.length === 0) {
        return [a];
    }
    const candidates = new Array<bigint>(8)
        .fill(0n)
        .map((_, i) => BigInt(i));
    return candidates.filter(cand => {
        const na = ((a << 3n) | cand);
        if (na < 0) {
            console.log("na < 0", na, a, cand);
        }
        let b = na & 7n; // b == cand
        b = b ^ 1n;
        const c = (na >> b);
        b = b ^ 5n;
        b = b ^ c;
        b = b & 7n;
        return b === first;
    }).map(cand => {
        const na = (a << 3n) | cand;
        return na;
    }).flatMap(na => {
        return dfs(na, rest);
    });
}


if (import.meta.main) {
    const data = await readData("input.txt");
    console.log(data.registers);
    const outputs = data.programs.toReversed().map(x => BigInt(x));
    // const outputs = [5,0,3,5,7,6,1,5,4].toReversed().map(x => BigInt(x));
    const solutions = dfs(0n, outputs);
    console.log(solutions.sort((a, b) => Number(a - b)));
}
