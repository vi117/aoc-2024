import { BinaryHeap } from "jsr:@std/data-structures/binary-heap";

export type Map = string[][];

export async function readMap(path: string): Promise<Map> {
    const text = await Deno.readTextFile(path);
    return text.trim().split("\n").map((line) => line.trim().split(""));
}

export function displayMap(map: Map): void {
    console.log(map.map((line) => line.join("")).join("\n"));
}

export type Position = [number, number];
export type Face = 0 | 1 | 2 | 3;
export type RotateDir = "clockwise" | "counter-clockwise";
export function rotateFace(face: Face, dir: RotateDir): Face {
    if (dir === "clockwise") {
        return ((face + 1) % 4) as Face;
    } else {
        return ((face + 3) % 4) as Face;
    }
}
export function faceToStr(face: Face): string {
    return ["E", "S", "W", "N"][face];
}
export function strToFace(str: string): Face {
    const face = ["E", "S", "W", "N"].indexOf(str);
    if (face === -1) {
        throw new Error(`Invalid face: ${str}`);
    }
    return face as Face;
}
export function moveForward([x, y]: Position, face: Face): Position {
    switch (face) {
        case 0: return [x + 1, y];
        case 1: return [x, y + 1];
        case 2: return [x - 1, y];
        case 3: return [x, y - 1];
    }
}

// S is start
// E is end
// # is wall
// first face the east

export class Solver {
    readonly map: Map;

    constructor(map: Map) {
        this.map = map;
    }

    public minCost([x,y]: [number, number], face: Face): number {
        const heap = new BinaryHeap<[Position, Face, number]>(
            ([, , cost1], [, , cost2]) => cost1 - cost2
        );
        const visited = new Set<string>();
        heap.push([[x, y], face, 0]);
        while (heap.length > 0) {
            const [[x, y], face, cost] = heap.pop()!;
            if (this.map[y][x] === "E") {
                return cost;
            }
            if (this.map[y][x] === "#") {
                continue;
            }
            const key = `${x},${y},${face}`;
            if (visited.has(key)) {
                continue;
            }
            visited.add(key);
            for (const dir of ["clockwise", "counter-clockwise"] as RotateDir[]) {
                heap.push([[x, y], rotateFace(face, dir), cost + 1000]);
            }
            heap.push([moveForward([x, y], face), face, cost + 1]);
        }
        return -1;
    }

    findStart(): Position {
        for (let y = 0; y < this.map.length; y++) {
            for (let x = 0; x < this.map[y].length; x++) {
                if (this.map[y][x] === "S") {
                    return [x, y];
                }
            }
        }
        throw new Error("No start found");
    }
}

if (import.meta.main) {
    const map = await readMap("input.txt");
    displayMap(map);
    const solver = new Solver(map);
    const start = solver.findStart();
    console.log(solver.minCost(start, strToFace("E")));
}