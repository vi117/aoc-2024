import { associateBy } from "jsr:@std/collections/"

export type Map = string[][];

export type Pos = [number, number];

export function parseMap(input: string): Map {
    return input.replaceAll("\r", "").split("\n").map((line) => line.split(""));
}

export async function readMap(filename: string): Promise<Map> {
    return parseMap(await Deno.readTextFile(filename));
}

export function toMapString(map: Map): string {
    return map.map((line) => line.join("")).join("\n");
}

export function* availableNextStep(
    map: Map,
    pos: Pos,
): Generator<Pos> {
    const [width, height] = [map[0].length, map.length];
    const [x, y] = pos;
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) {
            continue;
        }
        if (map[ny][nx] === "#") {
            continue;
        }
        yield [nx, ny] as Pos;
    }
}

export function calculateNeedsSteps(map: Map, startPos: Pos): number[][] {
    const needsSteps = map.map((line) => line.map(() => -1));
    const [x, y] = startPos;
    const queue: Pos[] = [startPos];
    needsSteps[y][x] = 0;
    while (queue.length > 0) {
        const [x, y] = queue.shift()!;
        const steps = needsSteps[y][x];
        for (const [nx, ny] of availableNextStep(map, [x, y])) {
            // already visited and shorter path
            if (needsSteps[ny][nx] >= 0 && needsSteps[ny][nx] <= steps + 1) {
                continue;
            }
            if (steps < 0) {
                throw new Error("steps < 0");
            }
            needsSteps[ny][nx] = steps + 1;
            queue.push([nx, ny]);
        }
    }
    return needsSteps;
}
export function printPrettyMapStep(
    map: Map,
    needsSteps: number[][],
): string {
    const result = map.map((line, y) =>
        line.map((char, x) => {
            if (char === "#") {
                return "#";
            }
            const steps = needsSteps[y][x];
            if (steps === -1) {
                return " ";
            }
            return steps.toString()[steps.toString().length - 1]; // last digit
        }).join("")
    ).join("\n");
    return result;
}

export function findOnMap(
    map: Map,
    condition: (pos: Pos, char: string) => boolean,
): Pos[] {
    const result: Pos[] = [];
    map.forEach((line, y) => {
        line.forEach((char, x) => {
            if (condition([x, y], char)) {
                result.push([x, y]);
            }
        });
    });
    return result;
}

export function solve(map: Map) {
    const [startPos] = findOnMap(map, (_pos, char) => char === "S");
    const [endPos] = findOnMap(map, (_pos, char) => char === "E");
    const needsSteps = calculateNeedsSteps(map, endPos);

    function* jumpAvailPos(
        pos: Pos,
    ) {
        const [x, y] = pos;
        const jumps = [
            [-2, 0],
            [2, 0],
            [0, -2],
            [0, 2],
        ];
        for (const [dx, dy] of jumps) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx < 0 || nx >= map[0].length || ny < 0 || ny >= map.length) {
                continue;
            }
            if (map[ny][nx] === "#") {
                continue;
            }
            yield [nx, ny] as Pos;
        }
    }

    function* availableJump(
        pos: Pos,
        steps: number,
    ): Generator<{
        from: Pos;
        to: Pos;
        savedSteps: number;
    }> {
        const [x, y] = pos;
        for (const [jx, jy] of jumpAvailPos(pos)) {
            const originalSteps = needsSteps[y][x];
            const cheatedSteps = needsSteps[jy][jx] + 2;
            if (cheatedSteps < originalSteps) {
                yield {
                    from: pos,
                    to: [jx, jy],
                    savedSteps: originalSteps - cheatedSteps,
                }
            }
        }
    }

    const queue = [{
        pos: startPos,
        steps: 0,
    }];
    const visited = new Set<string>();
    visited.add(startPos.toString());
    const ret: {
        from: Pos;
        to: Pos;
        savedSteps: number;
    }[] = [];
    while (queue.length > 0) {
        const n = queue.shift()!;
        const {
            pos: [x, y],
            steps,
        } = n;
        if (x === endPos[0] && y === endPos[1]) {
            break;
        }

        // find jump
        for (const jump of availableJump([x, y], steps)) {
            console.log(jump);
            ret.push(jump);
        }

        for (const nextPos of availableNextStep(map, [x, y])) {
            const key = nextPos.toString();
            if (visited.has(key)) {
                continue;
            }
            visited.add(key);
            queue.push({
                pos: nextPos,
                steps: steps + 1,
            });
        }
    }

    const jumpMap = new Map< number, { from: Pos, to: Pos, savedSteps: number }[]>();
    for (const jump of ret) {
        const key = jump.savedSteps;
        if (!jumpMap.has(key)) {
            jumpMap.set(key, []);
        }
        jumpMap.get(key)!.push(jump);
    }
    return jumpMap;
}

if (import.meta.main) {
    const map = await readMap("input.txt");
    console.log(toMapString(map));
    const [endPos] = findOnMap(map, (_pos, char) => char === "E");
    const needsSteps = calculateNeedsSteps(map, endPos);
    console.log(printPrettyMapStep(map, needsSteps));
    const jpm = solve(map);
    const keys = Array.from(jpm.keys()).sort((a, b) => a - b).filter((key) => key >= 100);
    const count = keys.reduce((acc, key) => acc + jpm.get(key)!.length, 0);
    console.log(count);
}
