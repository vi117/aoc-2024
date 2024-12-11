import { readInputData, step as stepNext } from "./solve_1.ts";

let memo: Map<string, number> = new Map();
function countStone(start: number, step: number): number {
    if (step === 0) return 1;
    const key = `${start},${step}`;
    const memoized = memo.get(key);
    if (memoized) return memoized;
    const next = stepNext(start);
    if (typeof next === "number") {
        const count = countStone(next, step - 1);
        memo.set(key, count);
        return count;
    }
    const [a, b] = next;
    const count = countStone(a, step - 1) + countStone(b, step - 1);
    memo.set(key, count);
    return count;
}

if (import.meta.main) {
    const input = await readInputData("input.txt");
    const data = input;
    console.log(data.reduce((a, b) => a + countStone(b, 75), 0));
    // let input = [125, 17]
    // for (let i = 0; i < 6; i++) {
    //     input = input.flatMap(step);
    //     console.log(input);
    // }
}
