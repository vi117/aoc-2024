import type { Map, Pos } from "./solve_1.ts";
import {
    availableNextStep,
    calculateNeedsSteps,
    findOnMap,
    printPrettyMapStep,
    readMap,
    toMapString,
} from "./solve_1.ts";

function solve(map: Map) {
    const [startPos] = findOnMap(map, (_pos, char) => char === "S");
    const [endPos] = findOnMap(map, (_pos, char) => char === "E");
    const needsSteps = calculateNeedsSteps(map, endPos);
    function* jumpAvailPos(
        pos: Pos,
    ) {
        const [x, y] = pos;
        for (let dx = -20; dx <= 20; dx += 1) {
            const maxDy = 20 - Math.abs(dx);
            for (let dy = -maxDy; dy <= maxDy; dy += 1) {
                const nx = x + dx;
                const ny = y + dy;
                if (
                    nx < 0 || nx >= map[0].length || ny < 0 || ny >= map.length
                ) {
                    continue;
                }
                if (map[ny][nx] === "#") {
                    continue;
                }
                const jumpLength = Math.abs(dx) + Math.abs(dy);
                yield [nx, ny, jumpLength] as [number, number, number];
            }
        }
    }

    function* availableJump(
        pos: Pos,
    ): Generator<{
        from: Pos;
        to: Pos;
        savedSteps: number;
    }> {
        const [x, y] = pos;
        for (const [jx, jy, steps] of jumpAvailPos(pos)) {
            const originalSteps = needsSteps[y][x];
            const cheatedSteps = needsSteps[jy][jx] + steps;
            if (cheatedSteps < originalSteps) {
                yield {
                    from: pos,
                    to: [jx, jy],
                    savedSteps: originalSteps - cheatedSteps,
                };
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
        for (const jump of availableJump([x, y])) {
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

    const jumpMap = new Map<
        number,
        { from: Pos; to: Pos; savedSteps: number }[]
    >();
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
    const keys = Array.from(jpm.keys()).sort((a, b) => a - b).filter((key) =>
        key >= 100
    );
    for (const key of keys) {
        console.log(`key: ${key} (${jpm.get(key)!.length})`);
    }
    const count = keys.reduce((acc, key) => acc + jpm.get(key)!.length, 0);
    console.log(count);
}
