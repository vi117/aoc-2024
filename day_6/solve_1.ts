export async function readMap(path: string) {
    const text = await Deno.readTextFile(path);
    return text.split("\n").map((line) => line.trim().split(""));
}
export function mapForEach(
    map: string[][],
    callback: (x: number, y: number, value: string) => void,
) {
    map.forEach((line, y) => {
        line.forEach((value, x) => {
            callback(x, y, value);
        });
    });
}
export function mapFind(
    map: string[][],
    callback: (x: number, y: number, value: string) => boolean,
) {
    for (let y = 0; y < map.length; y++) {
        const line = map[y];
        for (let x = 0; x < line.length; x++) {
            if (callback(x, y, line[x])) {
                return { x, y, value: line[x] };
            }
        }
    }
    return null;
}
export function displayMap(map: string[][]) {
    map.forEach((line) => {
        console.log(line.join(""));
    });
}

export type Dir = "N" | "E" | "S" | "W";
export type Pos = { x: number; y: number };
export type Guard = { pos: Pos; direction: Dir };

export function step(pos: Pos, direction: Dir) {
    const next = { ...pos };
    switch (direction) {
        case "N":
            next.y -= 1;
            break;
        case "E":
            next.x += 1;
            break;
        case "S":
            next.y += 1;
            break;
        case "W":
            next.x -= 1;
            break;
    }
    return next;
}
export function rotateLeft(direction: Dir) {
    switch (direction) {
        case "N":
            return "W";
        case "E":
            return "N";
        case "S":
            return "E";
        case "W":
            return "S";
    }
}
export function rotateRight(direction: Dir) {
    switch (direction) {
        case "N":
            return "E";
        case "E":
            return "S";
        case "S":
            return "W";
        case "W":
            return "N";
    }
}

export const EMPTY = ".";
export const WALL = "#";
const G = "X";

export function moveGuard(guard: Guard, map: string[][]): Guard | "out" {
    const { direction } = guard;
    const next = step(guard.pos, direction);
    // Check if next position is out of bounds
    if (
        next.y < 0 ||
        next.y >= map.length ||
        next.x < 0 ||
        next.x >= map[next.y].length
    ) {
        // Out of bounds
        return "out";
    }
    // Check if next position is a wall
    if (map[next.y][next.x] === WALL) {
        // Turn right
        const right = rotateRight(direction);
        return { ...guard, direction: right };
    }
    return { ...guard, pos: next };
}



if (import.meta.main) {
    const map = await readMap("input.txt");
    const guardPos = mapFind(map, (_x, _y, value) => value === "^");
    if (!guardPos) {
        throw new Error("Guard not found");
    }
    const { x, y } = guardPos;
    let guard: Guard = {
        pos: { x, y },
        direction: "N",
    };
    map[y][x] = G;

    for (;;) {
        const n = moveGuard(guard, map);
        if (n === "out") {
            break;
        }
        guard = n;
        map[guard.pos.y][guard.pos.x] = G;
    }
    displayMap(map);
    let count = 0;
    mapForEach(map, (_x, _y, value) => {
        if (value === G) {
            count++;
        }
    });
    console.log(count);
}