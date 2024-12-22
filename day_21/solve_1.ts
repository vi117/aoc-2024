export type Pos = [number, number];
export type NumpadRobotState = {
    pos: Pos;
};
export type Command = "^" | "v" | "<" | ">" | "A";

export function getNextPos(pos: Pos, command: Command): Pos {
    const [x, y] = pos;
    switch (command) {
        case "^":
            return [x, y - 1];
        case "v":
            return [x, y + 1];
        case "<":
            return [x - 1, y];
        case ">":
            return [x + 1, y];
        default:
            return pos;
    }
}

const NumbericKeypad = "789\n456\n123\n 0A";
export const NUMPAD_FIRST_POS: Pos = [2, 3];
export function getNumpadNumber([x, y]: Pos): string {
    return NumbericKeypad[y * 4 + x];
}
export function getPosFromNumpadNumber(num: string): Pos {
    const idx = NumbericKeypad.indexOf(num);
    return [idx % 4, Math.floor(idx / 4)];
}

export function getNextNumpadRobotState(
    state: NumpadRobotState,
    command: Command,
): NumpadRobotState {
    const nextPos = getNextPos(state.pos, command);
    const [nx, ny] = nextPos;
    if (
        nx < 0 || nx > 2 || ny < 0 || ny > 3 ||
        getNumpadNumber(nextPos) === " "
    ) {
        throw new Error(
            `Invalid command: ${command} for pos: ${state.pos.join(",")} -> ${
                nextPos.join(",")
            } is out of bound`,
        );
    }
    return { pos: nextPos };
}

const DirectionalKeypad = " ^A\n<v>";
export const DIRPAD_FIRST_POS: Pos = [2, 0];
export type DirKeypadRobotState = {
    pos: Pos;
};
export function getDirpadNumber([x, y]: Pos): string {
    return DirectionalKeypad[y * 4 + x];
}
export function getPosFromDirpadNumber(num: string): Pos {
    const idx = DirectionalKeypad.indexOf(num);
    return [idx % 4, Math.floor(idx / 4)];
}

export function getNextDirpadRobotState(
    state: DirKeypadRobotState,
    command: Command,
): DirKeypadRobotState {
    const nextPos = getNextPos(state.pos, command);
    const [nx, ny] = nextPos;
    if (
        nx < 0 || nx > 2 || ny < 0 || ny > 1 ||
        getDirpadNumber(nextPos) === " "
    ) {
        throw new Error(
            `Invalid command: ${command} for pos: ${state.pos.join(",")} -> ${
                nextPos.join(",")
            } is out of bound`,
        );
    }
    return { pos: nextPos };
}

export function executeCommandsOnNumpadRobot(
    state: NumpadRobotState,
    commands: Command[],
    output: (out: string) => void,
): NumpadRobotState {
    return commands.reduce((state, command) => {
        if (command === "A") {
            output(getNumpadNumber(state.pos));
        }
        return getNextNumpadRobotState(state, command);
    }, state);
}

export function executeCommandsOnDirpadRobot(
    state: DirKeypadRobotState,
    commands: Command[],
    output: (out: string) => void,
): DirKeypadRobotState {
    return commands.reduce((state, command) => {
        if (command === "A") {
            output(getDirpadNumber(state.pos));
        }
        return getNextDirpadRobotState(state, command);
    }, state);
}

export function shortestPathesOnNumpadRobot(
    state: NumpadRobotState,
    targetNum: string,
): Command[][] {
    const targetPos = getPosFromNumpadNumber(targetNum);
    const len = Math.abs(targetPos[0] - state.pos[0]) +
        Math.abs(targetPos[1] - state.pos[1]);
    const queue: [Command[], NumpadRobotState][] = [[[], state]];
    const paths: Command[][] = [];
    while (queue.length > 0) {
        const [path, state] = queue.shift()!;
        if (path.length === len) {
            if (
                state.pos[0] === targetPos[0] && state.pos[1] === targetPos[1]
            ) {
                paths.push(path);
            }
            continue;
        }
        for (const command of ["^", "v", "<", ">"] as Command[]) {
            try {
                const nextState = getNextNumpadRobotState(state, command);
                queue.push([path.concat(command), nextState]);
            } catch (e) {
                // Ignore invalid command
            }
        }
    }
    return paths;
}

export function shortestPathesOnDirpadRobot(
    state: DirKeypadRobotState,
    targetNum: string,
): Command[][] {
    const targetPos = getPosFromDirpadNumber(targetNum);
    const len = Math.abs(targetPos[0] - state.pos[0]) +
        Math.abs(targetPos[1] - state.pos[1]);
    const queue: [Command[], DirKeypadRobotState][] = [[[], state]];
    const paths: Command[][] = [];
    while (queue.length > 0) {
        const [path, state] = queue.shift()!;
        if (path.length === len) {
            if (
                state.pos[0] === targetPos[0] && state.pos[1] === targetPos[1]
            ) {
                paths.push(path);
            }
            continue;
        }
        for (const command of ["^", "v", "<", ">"] as Command[]) {
            try {
                const nextState = getNextDirpadRobotState(state, command);
                queue.push([path.concat(command), nextState]);
            } catch (e) {
                // Ignore invalid command
            }
        }
    }
    return paths.map((p) => p.concat("A"));
}

export function StepShortestPathesOnDirpadRobot(
    state: DirKeypadRobotState,
    targetNums: string[],
) {
    return targetNums.reduce( (acc, targetNum) => {
        const prevPos = acc.prevPos;
        const paths = shortestPathesOnDirpadRobot({ pos: prevPos }, targetNum);
        if (paths.length === 0) {
            throw new Error(`No path found for ${targetNum} from ${prevPos}`);
        }
        return {
            prevPos: getPosFromDirpadNumber(targetNum),
            // product of all
            paths: acc.paths.flatMap((p) => paths.map((np) => p.concat(np))),
        }
    }, {
        prevPos: state.pos,
        paths: [[]] as Command[][],
    }).paths;
}

function filterShortestPathes(paths: Command[][]) {
    let len = Number.MAX_SAFE_INTEGER;
    for (const path of paths) {
        len = Math.min(len, path.length);
    }
    // len = Math.min(...paths.map((p) => p.length)); // this is call stack overflow...
    // because the array is too big, the argument list is too long.
    // so we need to calculate the min value by ourself.
    return paths.filter((p) => p.length === len);
}

export function solve_1(code: string) {
    const numbers = code.split("");
    let start = NUMPAD_FIRST_POS;

    const finalOuts: string[] = [];

    for (const num of numbers) {
        console.log("num", num);
        const numpadPaths = shortestPathesOnNumpadRobot({ pos: start }, num).map((p) => p.concat("A"));
        if (numpadPaths.length === 0) {
            throw new Error(`No path found for ${num} from ${start}`);
        }
        console.log("avail path", numpadPaths.map((p) => p.join("")));
        const pathes1 = filterShortestPathes(numpadPaths.flatMap((numpadPath) => {
            return StepShortestPathesOnDirpadRobot({ pos: DIRPAD_FIRST_POS }, numpadPath);
        }));

        console.log("path1",pathes1.map((p) => p.join("")));
        const pathes2 = filterShortestPathes(pathes1.flatMap((path) => {
            return StepShortestPathesOnDirpadRobot({ pos: DIRPAD_FIRST_POS }, path);
        }));
        console.log("path2",pathes2.map((p) => p.join("")));
        const pathes3 = filterShortestPathes(pathes2.flatMap((path) => {
            return StepShortestPathesOnDirpadRobot({ pos: DIRPAD_FIRST_POS }, path);
        }));
        // console.log("path3",pathes3.map((p) => p.join("")));
        const executePath3 = (path: Command[]) => {
            const outs: string[] = [];
            executeCommandsOnDirpadRobot({ pos: DIRPAD_FIRST_POS }, path, (o) => { outs.push(o); });
            console.log("outs", outs.join(""));
            return outs;
        };
        finalOuts.push(...executePath3(pathes3[0]));
        start = getPosFromNumpadNumber(num);
    }
    console.log("finalOuts", finalOuts.join(""), finalOuts.length);
    return finalOuts.length;
}


if (import.meta.main) {
    const codes = Deno.readTextFileSync("input.txt").replaceAll("\r","").split("\n");
    let total = 0;
    for (const code of codes){
        const len = solve_1(code);
        const n = parseInt(code.slice(0,3));
        console.log("len", len,  n, len * n);
        total += n * len;
    }
    console.log("total", total);
}