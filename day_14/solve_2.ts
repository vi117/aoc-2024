import { loadInput, displayRobots, moveRobot, Robot } from "./solve_1.ts";

function calcGrid(robots: Robot[], width: number, height: number) {
    const grid = Array.from(
        { length: height },
        () => Array.from({ length: width }, () => 0),
    );
    for (const robot of robots) {
        const [x, y] = robot.pos;
        grid[y][x]++;
    }
    return grid;
}

const pattern = [
    "  1  ",
    " 111 ",
    "11111",
    " 111 ",
    "  1  ",
]

function findChristmasTree(grid: number[][]) {
    const width = grid[0].length;
    const height = grid.length;
    
    for (let y = 0; y < height - 4; y++) {
        for (let x = 0; x < width - 4; x++) {
            let found = true;
            for (let dy = 0; dy < 5; dy++) {
                for (let dx = 0; dx < 5; dx++) {
                    if (pattern[dy][dx] === "1" && grid[y + dy][x + dx] === 0) {
                        found = false;
                        break;
                    }
                }
            }
            if (found) {
                return [x + 2, y + 2];
            }
        }
    }

    return null;
}

if (import.meta.main) {
    // const { data, width, height } = await loadExample();
    const { data, width, height } = await loadInput();
    data.sort((a, b) => a.pos[0] - b.pos[0] || a.pos[1] - b.pos[1]);
    console.log(displayRobots(data, width, height));
    console.log();
    for (let i = 0;; i++) {
        for (const robot of data) {
            moveRobot(robot, width, height);
        }
        // find chrismas tree
        const grid = calcGrid(data, width, height);
        const tree = findChristmasTree(grid);
        if (tree) {
            console.log(tree);
            console.log(displayRobots(data, width, height));
            console.log(i);
            await Deno.writeTextFile(`output-step-${i+1}.txt`, displayRobots(data, width, height));
            break;
        }

        if (i > 11000) {
            break;
        }
    }
}
