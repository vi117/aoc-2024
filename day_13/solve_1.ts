/**
 * Calculate the greatest common divisor of two numbers using the Euclidean algorithm
 * @param a
 * @param b
 * @returns gcd of a and b and the coefficients s and t such that gcd(a, b) = s*a + t*b
 */

export function extended_euclidean_algorithm(a: number, b: number) {
    let [old_r, r] = [a, b];
    let [old_s, s] = [1, 0];
    let [old_t, t] = [0, 1];

    while (r !== 0) {
        const q = Math.floor(old_r / r);
        [old_r, r] = [r, old_r - q * r];
        [old_s, s] = [s, old_s - q * s];
        [old_t, t] = [t, old_t - q * t];
    }

    return { gcd: old_r, s: old_s, t: old_t };
}

/**
 * solve ax + by = c
 * if solution exists, return {x, y, d} where d = gcd(a, b)
 * if no solution exists, return null
 * @param {number} a
 * @param {number} b
 * @param {number} c
 */
export function diopantos_solve(
    a: number,
    b: number,
    c: number,
) {
    const { gcd, s, t } = extended_euclidean_algorithm(a, b);

    if (c % gcd !== 0) {
        return null;
    }

    const x = s * (c / gcd);
    const y = t * (c / gcd);

    return { x, y, d: gcd };
}

export type Vector2 = {
    x: number;
    y: number;
};

export type ClawMachineData = {
    buttonA: Vector2;
    buttonB: Vector2;
    prize: Vector2;
};

/**
 * parse input data:
 *      Button A: X+94, Y+34
 *      Button B: X+22, Y+67
 *      Prize: X=8400, Y=5400
 */
export async function readData(path: string): Promise<ClawMachineData[]> {
    const text = await Deno.readTextFile(path);
    // TODO: support windows line endings
    const objects = text.split("\n\n"); // split by empty line.
    return objects.map((object) => {
        const lines = object.split("\n");
        const buttonA = lines[0].match(/X\+(\d+), Y\+(\d+)/);
        const buttonB = lines[1].match(/X\+(\d+), Y\+(\d+)/);
        const prize = lines[2].match(/X=(\d+), Y=(\d+)/);

        if (!buttonA || !buttonB || !prize) {
            throw new Error("Invalid input format");
        }

        return {
            buttonA: { x: parseInt(buttonA[1]), y: parseInt(buttonA[2]) },
            buttonB: { x: parseInt(buttonB[1]), y: parseInt(buttonB[2]) },
            prize: { x: parseInt(prize[1]), y: parseInt(prize[2]) },
        };
    });
}

/**
 * Solution space for the diophantine equation ax + by = c
 */
export type SolutionSpace = {
    /**
     * solution space origin
     */
    origin: Vector2;
    /**
     * difference between two solutions
     * you can get other solutions by adding this vector to the origin
     */
    dir: Vector2;
};

export class NoSolutionError extends Error {
    constructor() {
        super("No solution found");
    }
}

/**
 * find the solution space for the diophantine equation ax + by = c
 * @param a
 * @param b
 * @param c
 * @returns solution space
 */
export function find_solution_space(
    a: number,
    b: number,
    c: number,
): SolutionSpace {
    const result = diopantos_solve(a, b, c);
    if (!result) {
        throw new NoSolutionError();
    }
    const { x, y, d } = result;
    const k = Math.ceil(-x / (b / d));
    return {
        origin: { x: x + k * (b / d), y: y - k * (a / d) },
        dir: { x: b / d, y: -a / d },
    };
}

export function make_other_solution(
    space: SolutionSpace,
    k: number,
): { x: number; y: number } {
    return {
        x: space.origin.x + k * space.dir.x,
        y: space.origin.y + k * space.dir.y,
    }
}

export function make_all_positive_solution(
    space: SolutionSpace,
): { x: number; y: number }[] {
    const solutions = [];
    const k_begin = Math.floor(space.origin.x / space.dir.x);
    const k_end = Math.floor(-space.origin.y / space.dir.y);
    for (let k = k_begin; k <= k_end; k++) {
        const solution = make_other_solution(space, k);
        if (solution.x >= 0 && solution.y >= 0) {
            solutions.push(solution);
        }
    }

    return solutions;
}

export function check_solution(data: ClawMachineData, x: number, y: number) {
    return data.buttonA.x * x + data.buttonB.x * y === data.prize.x &&
        data.buttonA.y * x + data.buttonB.y * y === data.prize.y;
}

if (import.meta.main) {
    const costA = 3;
    const costB = 1;

    const data = await readData("input.txt");
    let sum = 0;
    data.forEach((clawMachineData) => {
        // solution space is the intersection of the two solutions
        // find the minimum cost to reach the prize
        // cost = costA * x + costB * y
        try {
            const space = find_solution_space(
                clawMachineData.buttonA.x,
                clawMachineData.buttonB.x,
                clawMachineData.prize.x,
            );
            const space2 = find_solution_space(
                clawMachineData.buttonA.y,
                clawMachineData.buttonB.y,
                clawMachineData.prize.y,
            );
            const solutions = make_all_positive_solution(space);
            const solutions2 = make_all_positive_solution(space2);

            const intersection = solutions.filter((solution) => {
                return solutions2.some((solution2) => {
                    return solution.x === solution2.x &&
                        solution.y === solution2.y;
                });
            });
            console.log(intersection);
            if (intersection.length === 0) {
                throw new NoSolutionError();
            }
            const minCost = Math.min(...intersection.map((solution) => {
                return costA * solution.x + costB * solution.y;
            }));
            console.log(minCost);
            sum += minCost;
        } catch (error) {
            if (error instanceof NoSolutionError) {
                console.log("No solution found");
            } else {
                throw error;
            }
        }
    });
    console.log(sum);
}
