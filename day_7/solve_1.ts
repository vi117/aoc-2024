export type Problem = {
    target: number,
    numbers: number[]
}

export async function readData(path: string): Promise<Problem[]> {
    const file = await Deno.readTextFile(path);
    return file.split("\n").map((line) => {
        const [target, numbers] = line.split(":")
        return {
            target: parseInt(target.trim()),
            numbers: numbers.trim().split(" ").map((n) => parseInt(n))
        }
    });
}

function solve(problem: Problem): boolean {
    function solve_inner(target: number, arr: number[]): boolean {
        if (arr.length === 0) {
            return false;
        }
        if (arr.length === 1) {
            return target === arr[0];
        }
        const [head, ...rest] = arr;
        // console.log(target, head, rest);
        if (target % head === 0) {
            const div =  solve_inner(target / head, rest);
            if (div){
                return true;
            }
        }
        return solve_inner(target - head, rest);
    }
    return solve_inner(problem.target, problem.numbers.toReversed());
}

if (import.meta.main) {
    const data = await readData("input.txt");
    let count = 0;
    let sum = 0;
    for (const problem of data) {
        if (solve(problem)){
            count++;
            sum += problem.target;
        }
    }
    console.log(sum);
}