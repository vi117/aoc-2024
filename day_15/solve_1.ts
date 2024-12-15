export type Map = string[][];

export type Move = "^" | "v" | "<" | ">";

export async function readData(path: string): Promise<{
   map: Map,
   moves: Move[] 
}> {
    const text = await Deno.readTextFile(path);
    const [
        map,
        moves
    ] = text.split("\n\n");
    return {
        map: map.split("\n").map((line) => line.split("")),
        moves: moves.split("\n").join("").split("").map((move) => move as Move)
    };
}

export function displayMap(map: Map): string {
    return map.map((line) => line.join("")).join("\n");
}

export function foreachMap(map: Map, callback: (value: string, x: number, y: number) => void): void {
    map.forEach((line, y) => {
        line.forEach((value, x) => {
            callback(value, x, y);
        });
    });
}

export const dirToDelta = {
    "^": [0, -1],
    "v": [0, 1],
    "<": [-1, 0],
    ">": [1, 0]
}

export function stepRobot(map: Map, robot: {x: number, y: number}, move: Move): void {
    const {x, y} = robot;
    const [dx, dy] = dirToDelta[move];
    // Check if the robot can move

    // like socoban, @ is the robot, # is a wall, . is a free space, O is a box
    // multiple boxes can be pushed at the same time
    let nextX = x;
    let nextY = y;
    while (true) {
        nextX += dx;
        nextY += dy;
        const nextValue = map[nextY][nextX];
        if (nextValue === "#") {
            // The robot can't move
            return;
        }
        else if (nextValue === ".") {
            break;
        }
        if (nextValue === "O") {
            continue;
        }
    }
    let prevX = nextX;
    let prevY = nextY;
    // move the boxes
    while (prevX !== x || prevY !== y) {
        map[prevY][prevX] = map[prevY - dy][prevX - dx];
        prevX -= dx;
        prevY -= dy;
    }
    // move the robot
    map[y][x] = ".";
    robot.x = x + dx;
    robot.y = y + dy;
}

if (import.meta.main) {
    const {map, moves} = await readData("input.txt");
    let robot = {
        x: 0,
        y: 0
    }
    foreachMap(map, (value, x, y) => {
        if (value === "@") {
            robot = {
                x,
                y
            }
        }
    });
    console.log("Robot", robot);
    console.log(displayMap(map));
    moves.forEach((move) => {
        // console.log("Move", move, ":");
        stepRobot(map, robot, move);
        // console.log(displayMap(map));
    });
    let sum = 0;
    foreachMap(map, (value, x, y) => {
        if (value === "O") {
            sum += x + y * 100;
        }
    });
    console.log("Sum", sum);
}