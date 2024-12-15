import { displayMap, foreachMap, Map, Move, readData } from "./solve_1.ts";

const extendingTranslation = {
    "#": "##",
    ".": "..",
    "O": "[]",
    "@": "@.",
};

function extendMap(map: Map) {
    const extendedMap = map.map((row) => {
        return row.map((value) => {
            const v = extendingTranslation[
                value as keyof typeof extendingTranslation
            ];
            if (v) {
                return v;
            }
            throw new Error("Invalid value");
        }).join("").split("");
    });
    return extendedMap;
}

function getHugeBoxPos(map: Map, boxPos: [number, number]): [number, number] {
    const [x, y] = boxPos;
    const anyBracket = map[y][x];
    if (anyBracket === "]") {
        return [x - 1, y];
    }
    if (anyBracket === "[") {
        return [x, y];
    }
    throw new Error("Not a huge box");
}

function IsMovableHugeBox(
    map: Map,
    boxPos: [number, number],
    move: Move,
): boolean {
    const [x, y] = getHugeBoxPos(map, boxPos);
    if (move === "^" || move === "v") {
        const dy = move === "^" ? -1 : 1;
        if (map[y + dy][x] === "#" || map[y + dy][x + 1] === "#") {
            return false;
        }
        if (map[y + dy][x] === "." && map[y + dy][x + 1] === ".") {
            return true;
        }

        if (map[y + dy][x] === "]") {
            const success = IsMovableHugeBox(map, [x, y + dy], move);
            if (!success) {
                return false;
            }
        } else if (map[y + dy][x] === "[") {
            const success = IsMovableHugeBox(map, [x, y + dy], move);
            if (!success) {
                return false;
            }
        }
        if (map[y + dy][x + 1] === "[") {
            const success = IsMovableHugeBox(map, [x + 1, y + dy], move);
            if (!success) {
                return false;
            }
        }
        return true;
    } else {
        const dx = move === "<" ? -1 : 2;
        const [nx, ny] = [x + dx, y];
        if (map[ny][nx] === "#") {
            return false;
        }
        if (map[ny][nx] === ".") {
            return true;
        }
        return IsMovableHugeBox(map, [nx, ny], move);
    }
}

function pushHugeBox(map: Map, boxPos: [number, number], move: Move) {
    const [x, y] = getHugeBoxPos(map, boxPos);
    if (move === "^" || move === "v") {
        const dy = move === "^" ? -1 : 1;
        if (map[y + dy][x] === "]") {
            pushHugeBox(map, [x, y + dy], move);
        } else if (map[y + dy][x] === "[") {
            pushHugeBox(map, [x, y + dy], move);
        }
        if (map[y + dy][x + 1] === "[") {
            pushHugeBox(map, [x + 1, y + dy], move);
        }
        if (map[y + dy][x] === "." && map[y + dy][x + 1] === ".") {
            map[y][x] = ".";
            map[y][x + 1] = ".";
            map[y + dy][x] = "[";
            map[y + dy][x + 1] = "]";
            return;
        } else {
            throw new Error("can't push the box");
        }
    } else {
        if (map[y][x - 1] === "]" && move === "<") {
            pushHugeBox(map, [x - 1, y], move);
        }
        if (map[y][x + 2] === "[" && move === ">") {
            pushHugeBox(map, [x + 2, y], move);
        }
        const dx = move === "<" ? -1 : 1;
        const nx = x + dx;
        if (
            (move === "<" && map[y][nx] === ".") ||
            (move === ">" && map[y][nx + 1] === ".")
        ) {
            map[y][x] = ".";
            map[y][x + 1] = ".";
            map[y][nx] = "[";
            map[y][nx + 1] = "]";
            return;
        } else {
            throw new Error("can't push the box");
        }
    }
}

function stepRobot(map: Map, robot: { x: number; y: number }, move: Move) {
    const { x, y } = robot;
    const dx = move === "<" ? -1 : move === ">" ? 1 : 0;
    const dy = move === "^" ? -1 : move === "v" ? 1 : 0;
    const nx = x + dx;
    const ny = y + dy;
    if (map[ny][nx] === "#") {
        return;
    }
    if (map[ny][nx] === "[" || map[ny][nx] === "]") {
        const [hx, hy] = getHugeBoxPos(map, [nx, ny]);
        if (IsMovableHugeBox(map, [hx, hy], move)) {
            pushHugeBox(map, [hx, hy], move);
        } else {
            return;
        }
    }
    map[y][x] = ".";
    map[ny][nx] = "@";
    robot.x = nx;
    robot.y = ny;
}

if (import.meta.main) {
    let { map, moves } = await readData("input.txt");
    console.log(displayMap(map));
    map = extendMap(map);
    let robot = {
        x: 0,
        y: 0,
    };
    foreachMap(map, (value, x, y) => {
        if (value === "@") {
            robot = {
                x,
                y,
            };
        }
    });
    console.log("Robot", robot);
    console.log(displayMap(map));
    moves.forEach((move) => {
        // console.log("Move", move, ":");
        try {
            stepRobot(map, robot, move);
        } catch (_e) {
            console.log("Move", move, ":");
            console.log(displayMap(map));
        }
        // console.log(displayMap(map));
    });
    let sum = 0;
    foreachMap(map, (value, x, y) => {
        if (value === "[") {
            sum += x + y * 100;
        }
    });
    console.log(displayMap(map));
    console.log("Sum", sum);
}
