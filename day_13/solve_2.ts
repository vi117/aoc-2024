import { readData, NoSolutionError } from "./solve_1.ts";

/**
 * 
 * @param coefficients 
 * @param constants 
 * @returns 
 */
function solve_linear_equation(
    coefficients: readonly [
        readonly [number, number],
        readonly [number, number],
    ],
    constants: readonly [number, number],
): [number, number] {
    const [[a, b], [c, d]] = coefficients;
    const [e, f] = constants;
    const det = a * d - b * c;
    if (det === 0) {
        throw new NoSolutionError();
    }
    if ((e * d - b * f) % det != 0 || (a * f - e * c) % det != 0) {
        throw new NoSolutionError();
    }
    return [
        (e * d - b * f) / det,
        (a * f - e * c) / det,
    ];
}

if (import.meta.main) {
    const costA = 3;
    const costB = 1;

    const data = await readData("input.txt");
    data.forEach((clawMachineData) => {
        clawMachineData.prize.x += 10000000000000;
        clawMachineData.prize.y += 10000000000000;
    });
    let sum = 0;
    data.forEach((clawMachineData) => {
        // solution space is the intersection of the two solutions
        // find the minimum cost to reach the prize
        // cost = costA * x + costB * y
        console.log("----");
        try {
            const coefficients = [
                [clawMachineData.buttonA.x, clawMachineData.buttonB.x],
                [clawMachineData.buttonA.y, clawMachineData.buttonB.y],
            ] as const;
            const constants = [clawMachineData.prize.x, clawMachineData.prize.y] as const;
            const [x, y] = solve_linear_equation(coefficients, constants);
            if (x < 0 || y < 0) {
                console.log("Negative solution");
                throw new NoSolutionError();
            }
            console.log("Solution:", x, y);
            const cost = costA * x + costB * y;
            console.log("Cost:", cost);
            sum += cost;
        } catch (error) {
            if (error instanceof NoSolutionError) {
                console.log("No solution found");
            }
            else {
                throw error;
            }
        }
        finally {
            console.log("----");
        }
    });
    console.log(sum);
}