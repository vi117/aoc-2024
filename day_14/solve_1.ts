export type Robot = {
    pos: [number, number];
    vel: [number, number];
};

export async function readData(path: string): Promise<Robot[]> {
    const data = await Deno.readTextFile(path);
    return data.split("\n").map((line) => {
        line = line.trim();
        const m = line.match(/p=([-\d]+),(\d+)\s+v=([-\d]+),([-\d]+)/);
        if (!m) {
            throw new Error(`Invalid line: ${line}`);
        }
        return {
            pos: [parseInt(m[1]), parseInt(m[2])],
            vel: [parseInt(m[3]), parseInt(m[4])],
        };
    });
}

export function moveRobot(robot: Robot, width: number, height: number) {
    robot.pos[0] += robot.vel[0];
    robot.pos[1] += robot.vel[1];
    robot.pos[0] = (robot.pos[0] + width) % width;
    robot.pos[1] = (robot.pos[1] + height) % height;
}

export function displayRobots(robots: Robot[], width: number, height: number) {
    const grid = Array.from(
        { length: height },
        () => Array.from({ length: width }, () => 0),
    );
    for (const robot of robots) {
        const [x, y] = robot.pos;
        grid[y][x]++;
    }
    return grid.map((line) =>
        line.map((x) => x === 0 ? "." : x.toString()).join("")
    ).join("\n");
}

export function countRobotsInEachQuadrant(
    robots: Robot[],
    width: number,
    height: number,
): [number, number, number, number] {
    const quadrants = [0, 0, 0, 0];
    const centerWidth = Math.floor(width / 2);
    const centerHeight = Math.floor(height / 2);
    for (const robot of robots) {
        const x = robot.pos[0] < centerWidth ? 0 : 1;
        const y = robot.pos[1] < centerHeight ? 0 : 1;
        if (robot.pos[0] === centerWidth || robot.pos[1] === centerHeight) {
            continue;
        }
        quadrants[x + y * 2]++;
    }
    return quadrants as [number, number, number, number];
}

export async function loadExample() {
    const data = await readData("example.txt");
    const width = 11;
    const height = 7;
    return { data, width, height };
}
export async function loadInput() {
    const data = await readData("input.txt");
    const width = 101;
    const height = 103;
    return { data, width, height };
}

if (import.meta.main) {
    // const { data, width, height } = await loadExample();
    const { data, width, height } = await loadInput();

    console.log(displayRobots(data, width, height));
    console.log();
    for (let i = 0; i < 100; i++) {
        for (const robot of data) {
            moveRobot(robot, width, height);
        }
    }
    console.log(displayRobots(data, width, height));
    const [q1, q2, q3, q4] = countRobotsInEachQuadrant(data, width, height);
    console.log("Quadrants:");
    console.log(q1, q2, q3, q4);
    console.log("Product:");
    console.log(q1 * q2 * q3 * q4);
}
