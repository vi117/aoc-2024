import { Problem, readData } from "./solve_1.ts";

function solve(problem: Problem): boolean {
    function solve_inner(target: number, arr: number[]): boolean {
        if (arr.length === 0) {
            return false;
        }
        if (arr.length === 1) {
            return target === arr[0];
        }
        const [head, ...rest] = arr;
        
        
        if (target % head === 0) {
            const div =  solve_inner(target / head, rest);
            if (div){
                return true;
            }
        }
        const sub = solve_inner(target - head, rest);
        if (sub){
            return true;
        }
        const str = target.toString();
        const head_str = head.toString();
        if (str.endsWith(head_str)) {
            const new_target = parseInt(str.slice(0, str.length - head_str.length));
            return solve_inner(new_target, rest);
        }

        return false;
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