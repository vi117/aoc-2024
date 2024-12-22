// fg is shortest available pathes function that returns a path from pos to target.
// type cmd :: enum {
//   up'^', down'v', right'<', left'>', accept'A'

import { getPosFromNumpadNumber, NUMPAD_FIRST_POS, shortestPathesOnNumpadRobot } from "./solve_1.ts";

// }
export type Command = "^" | "v" | "<" | ">" | "A";
export type Pos = [number, number];
// type path = list of cmd;
// type path_set = set of path;
export type PathSet = Path[];

// |--|--|--|
// |  |^ | A|
// |--|--|--|
// |< |v | >|
// |--|--|--|
const lookupCommandPos: Record<Command, Pos> = {
    "^": [1, 0],
    "v": [1, 1],
    "<": [0, 1],
    ">": [2, 1],
    "A": [2, 0],
};
export function commandToPos(command: Command): Pos {
    return lookupCommandPos[command];
}
export function posToCommand(pos: Pos): Command {
    for (const [key, value] of Object.entries(lookupCommandPos)) {
        if (value[0] === pos[0] && value[1] === pos[1]) {
            return key as Command;
        }
    }
    throw new Error(`invalid pos: ${pos}`);
}

export class Path {
    value: string;
    constructor(commands: Command[]) {
        this.value = commands.join("");
    }
    get length() {
        return this.value.length;
    }
    [Symbol.iterator](): IterableIterator<Command> {
        return this.value[Symbol.iterator]() as IterableIterator<Command>;
    }
    first() {
        return this.value[0] as Command;
    }
    rest() {
        const ret = new Path([]);
        ret.value = this.value.slice(1);
        return ret;
    }
    map<T>(fn: (cmd: Command) => T) {
        const result: T[] = [];
        for (const cmd of this.value) {
            result.push(fn(cmd as Command));
        }
        return result;
    }
    flatMap<T>(fn: (cmd: Command) => T[]) {
        const result: T[] = [];
        for (const cmd of this.value) {
            result.push(...fn(cmd as Command));
        }
    }
    reduce<T>(fn: (acc: T, cmd: Command) => T, init: T) {
        let acc = init;
        for (const cmd of this.value) {
            acc = fn(acc, cmd as Command);
        }
        return acc;
    }
    get last() {
        return this.value[this.value.length - 1];
    }
    toString() {
        return this.value;
    }
    toCommands() {
        return this.value.split("") as Command[];
    }
    // ++ is union of two sets.
    // concat :: cmd -> path_set -> path_set
    // concat x [] = [x]
    // concat x (y:ys) = (y:x) ++ (concat x ys)
    concat(command: Command) {
        const ret = new Path([]);
        ret.value = this.value + command;
        return ret;
    }
    concatPath(path: Path) {
        const ret = new Path([]);
        ret.value = this.value + path.value;
        return ret;
    }
    static from(commands: Command[]) {
        return new Path(commands);
    }
    // \product is a function that returns a list of all possible combinations of two lists.
    // \product :: path_set -> path_set -> path_set
    // \product x [] = []
    // \product (x:xs) y = (concat x y) ++ (\product xs y)
    // infix 5 \product // associativity is not important. because it commutative.
    // product :: path_set -> path_set -> path_set
    // product a b = a \product b

    static product(a: PathSet, b: PathSet): PathSet {
        return a.flatMap((x) => b.map((y) => x.concatPath(y)));
    }

    // it's not pure function.
    // only use for test.
    // execute :: (cmd, cmd -> never) -> Option of next_pos
    execute(start: Command, onAccept: (accept: Command) => void): Pos | null {
        let pos = commandToPos(start);
        for (const command of this.toCommands()) {
            if (command === "A") {
                onAccept(posToCommand(pos));
                continue;
            }
            const newPos = moveSingle(pos, command);
            if (newPos === null) {
                return null;
            }
            pos = newPos;
        }
        return pos;
    }

    equals(other: Path) {
        return this.value === other.value;
    }
}

const lookupCommandDelta: Record<Command, Pos> = {
    "^": [0, -1],
    "v": [0, 1],
    "<": [-1, 0],
    ">": [1, 0],
    "A": [0, 0],
};
export function pathToDelta(command: Command): Pos {
    return lookupCommandDelta[command];
}
export function moveSingle(pos: Pos, command: Command): Pos | null {
    const [x, y] = pos;
    const [dx, dy] = pathToDelta(command);
    const newPos: [number, number] = [x + dx, y + dy];
    // out of range
    if (newPos[0] < 0 || newPos[0] > 2 || newPos[1] < 0 || newPos[1] > 1) {
        return null;
    }
    // invalid position
    if (newPos[0] === 0 && newPos[1] === 0) {
        return null;
    }
    return newPos;
}

// type Handler 'T :: start_pos -> ('T, next_pos)
export type Handler<T> = (start: Command) => [T, Command];
export class PathSetHandler {
    private fn: Handler<PathSet>;
    constructor(fn: Handler<PathSet>) {
        this.fn = fn;
    }
    // call :: Handler of start_pos -> (path_set, next_pos)
    // call f = f
    call(command: Command) {
        return this.fn(command);
    }

    // mempty :: Handler of path_set
    // mempty = \s -> ([], s)
    static empty() {
        return new PathSetHandler(
            (s: Command) => [[], s],
        );
    }
    // munit :: Handler of path_set
    // munit = \s -> ([[]], s)
    static unit() {
        return new PathSetHandler(
            (s: Command) => [[Path.from([])], s],
        );
    }
    static fromPathSet(t: PathSet) {
        return new PathSetHandler(
            (s: Command) => [t, s],
        );
    }

    coproduct(f: PathSetHandler) {
        // union of two sets.
        return new PathSetHandler(
            (s: Command) => {
                const [t, s1] = this.fn(s);
                const [a, s2] = f.call(s1);
                // merge two sets t and a.
                const set = new Set([...t, ...a]);
                const result = Array.from(set);
                return [result, s2];
            },
        );
    }
    // mproduct :: Handler of path_set -> Handler of path_set -> Handler of path_set
    // mproduct f g = s ->
    //  let (t, s') = f s in
    //  let (a ,s'') = g s'
    //  in ( (product t a )  , s'')
    // op ; = mproduct
    // infixr 5 ;
    product(f: PathSetHandler) {
        return new PathSetHandler(
            (s: Command) => {
                const [t, s1] = this.fn(s);
                const [a, s2] = f.fn(s1);
                return [Path.product(t, a), s2];
            },
        );
    }

    // available_paths ::  (start_pos, target_pos) -> path_set
}

// type start_pos = cmd
// type target_pos = cmd
// type next_pos = cmd
// available_paths ::  (start_pos, target_pos) -> path_set
export function availableShortestPaths(
    start: Command,
    target: Command,
): PathSet {
    const startPos = commandToPos(start);
    const targetPos = commandToPos(target);
    const paths: Path[] = [];
    const queue: [Path, Pos][] = [[new Path([]), startPos]];
    const deltaSum = Math.abs(targetPos[0] - startPos[0]) +
        Math.abs(targetPos[1] - startPos[1]);
    while (queue.length > 0) {
        const [path, pos] = queue.shift()!;
        if (pos[0] === targetPos[0] && pos[1] === targetPos[1]) {
            paths.push(path);
            continue;
        }
        if (path.length >= deltaSum) {
            continue;
        }
        for (const command of ["^", "v", "<", ">"] as Command[]) {
            const nextPos = moveSingle(pos, command);
            if (nextPos) {
                queue.push([path.concat(command), nextPos]);
            }
        }
    }
    if (paths.length === 0) {
        throw new Error(`no path found from ${start} to ${target}`);
    }
    return paths;
}

// move :: cmd -> Handler of path_set
// move cmd = \s -> (available_paths (s, cmd), cmd)
export const move: (cmd: Command) => PathSetHandler = (command: Command) => {
    return new PathSetHandler((start: Command) => {
        return [availableShortestPaths(start, command), command];
    });
};
export const accept: PathSetHandler = PathSetHandler.fromPathSet([
    Path.from(["A"]),
]);
// inputCommand :: cmd -> Handler of path_set
// inputCommand cmd = (move cmd); accept
export const inputCommand = (command: Command) => move(command).product(accept);
// inputCommands :: list of cmd -> Handler of path_set
// inputCommands xs = foldl (x -> y -> x; y) munit xs
// or
// inputCommands [] = munit
// inputCommands (x:xs) = (inputCommand x) ; (inputCommands xs)
export const inputCommands = (commands: Path) => {
    return commands.reduce((acc, command) => {
        return acc.product(inputCommand(command));
    }, PathSetHandler.unit());
};

// shortest_path_length :: (handler of PathSet) -> handler of Int
// shortest_path_length h = \s -> (h s) |> foldl ((x,y) -> min(len x,len y)) INF
export function shortestPathLength(h: PathSetHandler): Handler<number> {
    return (s: Command) => {
        const [paths, last] = h.call(s);
        return [
            paths.map((x) => x.length).reduce(
                (x, y) => Math.min(x, y),
                Infinity,
            ),
            last,
        ];
    };
}

// shortest_path_length has property of shortest path length.
// shortest_path_length (inputCommands x:xs) s = shortest_path_length (inputCommands [x]) s + shortest_path_length (inputCommands xs) x
/**
 * the following assertion is always true.
 * ```ts
 * for (const s of ["^", "v", "<", ">", "A"] as Command[]) {
 *      // any path
 *     const paths = makeRandomSnapshotOfPath();
 *     const [x, ...xs] = paths;
 *     const s1 = shortestPathLengthRaw(inputCommands(Path.from([x])))(s)[0];
 *     const s2 = shortestPathLengthRaw(inputCommands(Path.from(xs)))(x)[0];
 *     const s3 = shortestPathLengthRaw(inputCommands(paths))(s)[0];
 *     assertEquals(
 *         s1 + s2,
 *         s3,
 *         `s: ${s}, x: ${x}, xs: ${xs}, s1: ${s1}, s2: ${s2}, s3: ${s3}`,
 *    );
 * }
 */

function double(xs: Path) {
    return (s1: Command) => {
        return (s2: Command) => {
            const [pathset] = inputCommands(xs).call(s1);
            return pathset.flatMap((p) => {
                const [pathset2] = inputCommands(p).call(s2);
                return pathset2;
            });
        };
    };
}
// const data = double(Path.from("<A^A>^^AvvvA".split("") as Command[]))("A")("A");
// console.log(data.map((x) => x.toString()));
// double xs = \s1 -> \s2 -> flatMap (\cmd -> fst.inputCommands cmd s2) (fst.inputCommands xs s1)
// = \s1 -> \s2 ->  flatMap ((\cmd -> fst.inputCommands cmd s2) (fst.inputCommands x:xs s1))
// = \s1 -> \s2 ->  flatMap (\cmd -> fst.inputCommands cmd s2) ((fst.inputCommand x; fst.inputCommands xs) s1)
// = \s1 -> \s2 ->  flatMap (\cmd -> fst.inputCommands cmd s2) ((move x; accept; fst.inputCommands xs) s1)
// = \s1 -> \s2 ->  flatMap (\cmd -> fst.inputCommands cmd s2) (
//      let (p,s3) = (move x; accept; s1) in
//      p \product (inputCommands xs s3)
// )
// = \s1 -> \s2 ->  flatMap (\cmd -> fst.inputCommands cmd s2) (
//      let (p,s3) = (concat (move x s1) 'A') in
//      p \product (inputCommands xs s3)
// )
// = \s1 -> \s2 -> (
//      let (p,s3) = (concat (move x s1) 'A') in
//      flatMap (\cmd -> fst.inputCommands cmd s2) p \product flatMap (\cmd -> fst.inputCommands cmd s2) (fst.inputCommands xs s3)
// )
//

// shortest_path_length \s' -> (double xs 'A' s') 'A'
// = shortest_path_length \s' -> (
//      let (p,s3) = (concat (move x 'A') 'A') in
//      flatMap (\cmd -> fst.inputCommands cmd s') p \product flatMap (\cmd -> fst.inputCommands cmd 's) (fst.inputCommands xs s3)
// ) 'A'
// = (
//      let (p,s3) = (concat (move x 'A') 'A') in
//      let paths = flatMap (\cmd -> fst.inputCommands cmd 'A') p \product flatMap (\cmd -> fst.inputCommands cmd 'A') (fst.inputCommands xs s3)
//      in
//      paths |> foldl ((x,y) -> min(len x,len y)) INF
// )
// = (
//      let handler2 = \cmd -> fst.inputCommands cmd 'A' in
//      let (p,s3) = (concat (move x 'A') 'A') in
//      let paths = flatMap handler2 p \product flatMap handler2 (fst.inputCommands xs s3) in
//      paths |> set.min (\x -> len x)
// )
// = (
//     let handler2 = \cmd -> fst.inputCommands cmd 'A' in
//     let (p,s3) = (concat (move x 'A') 'A') in
//     set.min (\x -> len x)
//       (flatMap handler2 p \product flatMap handler2 (fst.inputCommands xs s3))
// = (
//     let handler2 = \cmd -> fst.inputCommands cmd 'A' in
//     let (p,s3) = (concat (move x 'A') 'A') in
//     (set.min (\x -> len x)
//         (flatMap handler2 p)) +
//     (set.min (\x -> len x) (flatMap handler2 (fst.inputCommands xs s3))
// )

function shortL(
    curPos: Command,
    command: Command,
): number {
    const [n] = shortestPathLength(inputCommands(Path.from([command])))(curPos);
    return n;
}

const memo = new Map<string, number>();
function myShortestPathLength(
    depth: number,
    cmds: Path,
): number {
    const key = cmds.toString() + depth;
    if (memo.has(key)) {
        return memo.get(key)!;
    }
    if (depth === 1) {
        const ret = shortestPathLength(inputCommands(cmds))("A")[0];
        memo.set(key, ret);
        return ret;
    }
    const ret = cmds.reduce((acc, cmd) => {
        const handler = inputCommand(cmd);
        const [pathset, last] = handler.call(acc.last);
        const n = pathset.map((x) => myShortestPathLength(depth - 1, x)).reduce(
            (x, y) => Math.min(x, y),
            Infinity,
        );
        return {
            last: last,
            sum: acc.sum + n,
        };
    }, {
        last: "A" as Command,
        sum: 0,
    }).sum;
    memo.set(key, ret);
    return ret;
}

if (import.meta.main) {
    const example = Path.from("<A^A>^^AvvvA".split("") as Command[]);
    console.log(myShortestPathLength(1, example));

    const codes = Deno.readTextFileSync("input.txt").replaceAll("\r", "").split(
        "\n",
    );

    let total = 0;
    for (const code of codes) {
        let start = NUMPAD_FIRST_POS;
        for (const num of code.split("")) {
            console.log("num", num);
            const numpadPaths = shortestPathesOnNumpadRobot({ pos: start }, num)
                .map((p) => p.concat("A"));
            if (numpadPaths.length === 0) {
                throw new Error(`No path found for ${num} from ${start}`);
            }
            console.log("avail path", numpadPaths.map((p) => p.join("")));
            
            let min = Infinity;
            for (const path of numpadPaths) {
                const len = myShortestPathLength(25, Path.from(path));
                min = Math.min(min, len);
            }
            const n = parseInt(code.slice(0, 3));
            console.log("len", min, "n", n);
            total += n * min;

            start = getPosFromNumpadNumber(num);
        }
    }
    console.log("total", total);
}
