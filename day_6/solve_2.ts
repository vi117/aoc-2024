import { readMap, mapFind, Guard, moveGuard, displayMap, mapForEach, Dir, EMPTY, Pos } from "./solve_1.ts";

function getMDir(
    dir: Dir,
    mapValue: string
){
    if (mapValue === "+") {
        return mapValue;
    }
    if (dir === mapValue || mapValue === EMPTY){
        return dir;
    }
    return "+";
}

function loopDetect(
    obstaclePos: Pos,
    guard: Guard,
    map: string[][]
){
    map[obstaclePos.y][obstaclePos.x] = "#";
    try {
        let doubleMoveGaurd: Guard | "out" = guard;
        for(;;){
            const n = moveGuard(guard, map);
            if (n === "out"){
                return false;
            }
            guard = n;
            doubleMoveGaurd = moveGuard(doubleMoveGaurd, map);
            if (doubleMoveGaurd === "out"){
                return false;
            }
            doubleMoveGaurd = moveGuard(doubleMoveGaurd, map);
            if (doubleMoveGaurd === "out"){
                return false;
            }
            if (guard.pos.x === doubleMoveGaurd.pos.x && guard.pos.y === doubleMoveGaurd.pos.y
                && guard.direction === doubleMoveGaurd.direction
            ){
                return true;
            }
        }
    }
    finally {
        map[obstaclePos.y][obstaclePos.x] = ".";
    }
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
    map[y][x] = "|"

    let count = 0;
    for (;;) {
        const n = moveGuard(guard, map);
        if (n === "out") {
            break;
        }
        if (map[n.pos.y][n.pos.x] === EMPTY){
            if (loopDetect(n.pos, guard, map)){
                console.log(n.pos);
                count++;
            }
        }
        guard = n;
        const v = map[guard.pos.y][guard.pos.x];
        map[guard.pos.y][guard.pos.x] = getMDir(guard.direction, v);
    }
    displayMap(map);
    console.log(count);
}