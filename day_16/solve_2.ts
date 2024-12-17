import { BinaryHeap } from "jsr:@std/data-structures/binary-heap";
import {
    displayMap,
    Face,
    moveForward,
    Position,
    readMap,
    RotateDir,
    rotateFace,
    Solver,
    strToFace,
} from "./solve_1.ts";

function moveBackward([x, y]: Position, face: Face): Position {
    switch (face) {
        case 0:
            return [x - 1, y];
        case 1:
            return [x, y - 1];
        case 2:
            return [x + 1, y];
        case 3:
            return [x, y + 1];
    }
}

class Solver2 extends Solver {
    public getPathBlocks(
        [x, y]: [number, number],
        face: Face,
    ): Position[][] {
        const heap = new BinaryHeap<[Position, Face, number]>(
            ([, , cost1], [, , cost2]) => cost1 - cost2,
        );
        const costMap = new Map<string, number>();
        const visited = new Set<string>();
        heap.push([[x, y], face, 0]);
        let endY = -1, endX = -1, endCost = -1, endFace = -1 as Face;
        while (heap.length > 0) {
            const [[x, y], face, cost] = heap.pop()!;
            const key = `${x},${y},${face}`;
            if (this.map[y][x] === "E") {
                endY = y;
                endX = x;
                endCost = cost;
                endFace = face;
                costMap.set(key, cost);
                visited.add(key);
                break;
            }
            if (this.map[y][x] === "#") {
                continue;
            }
            if (visited.has(key)) {
                continue;
            }
            visited.add(key);
            costMap.set(key, cost);
            for (
                const dir of ["clockwise", "counter-clockwise"] as RotateDir[]
            ) {
                heap.push([[x, y], rotateFace(face, dir), cost + 1000]);
            }
            heap.push([moveForward([x, y], face), face, cost + 1]);
        }
        if (endY === -1) {
            return [];
        }
        // find the path back to the start
        let curX = endX;
        let curY = endY;
        let curFace = endFace;
        let curCost = endCost;
        const getPathes = (pos: Position, face: Face, cost: number) => {
            const key = `${pos[0]},${pos[1]},${face}`;
            if (costMap.get(key) !== cost) {
                return [];
            }
            if (cost < 0) {
                return [];
            }
            if (cost === 0) {
                return [[pos]];
            }
            const pathes: Position[][] = [];
            for (
                const dir of ["clockwise", "counter-clockwise"] as RotateDir[]
            ) {
                const r = getPathes(pos, rotateFace(face, dir), cost - 1000);
                if (r.length > 0) {
                    pathes.push(...r);
                }
            }
            const ba = getPathes(moveBackward(pos, face), face, cost - 1);
            pathes.push(...ba.map((p) => [pos, ...p]));
            return pathes;
        };
        return getPathes([curX, curY], curFace, curCost);
    }
}

if (import.meta.main) {
    const map = await readMap("input.txt");
    displayMap(map);
    const solver = new Solver2(map);
    const start = solver.findStart();
    const pathes = solver.getPathBlocks(start, strToFace("E"));
    for (const path of pathes ?? []) {
        for (const [x, y] of path) {
            map[y][x] = "O";
        }
    }
    displayMap(map);
    let count = 0;
    for (const row of map) {
        for (const cell of row) {
            if (cell === "O") {
                count++;
            }
        }
    }
    console.log(count);
}
