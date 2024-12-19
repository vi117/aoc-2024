import { BinaryHeap } from "jsr:@std/data-structures/binary-heap";

export type Input = {
    fallingBytes: [number, number][];
};

export async function readData(path: string): Promise<Input> {
    const lines = await Deno.readTextFile(path);
    const fallingBytes = lines.split("\n").map((line) => {
        const [a, b] = line.trim().split(",").map((x) => parseInt(x));
        return [a, b] as [number, number];
    });
    return { fallingBytes };
}

export function displayMap(map: string[][]) {
    console.log(map.map(x=>x.join("")).join("\n"));
}

export function solvePart(
    map: string[][],
) {
    const WIDTH = map[0].length;
    const HEIGHT = map.length;

    const queue = new BinaryHeap<{
        pos: [number, number];
        step: number;
        previous: null | { pos: [number, number]; step: number };
    }>((x,y) => x.step - y.step);
    queue.push({ pos: [0, 0], step: 0, previous: null });
    const visited = new Set<string>();
    const path = new Map<string, { pos: [number, number]; step: number;
        previous: null | { pos: [number, number]; step: number }
     }>();

    while (queue.length > 0) {
        const node = queue.pop()!;
        const { pos, step } = node;
        const [x, y] = pos;
        if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT) {
            continue;
        }
        if (map[y][x] === "#") {
            continue;
        }
        if (visited.has(`${x},${y}`)) {
            continue;
        }
        visited.add(`${x},${y}`);
        path.set(`${x},${y}`, node);
        if (x === WIDTH - 1 && y === HEIGHT - 1) {
            console.log(step);
            break;
        }
        queue.push({ pos: [x + 1, y], step: step + 1, previous: { pos, step } });
        queue.push({ pos: [x - 1, y], step: step + 1, previous: { pos, step } });
        queue.push({ pos: [x, y + 1], step: step + 1, previous: { pos, step } });
        queue.push({ pos: [x, y - 1], step: step + 1, previous: { pos, step } });
    }
    if (!path.has(`${WIDTH - 1},${HEIGHT - 1}`)) {
        console.log("No path found");
        return;
    }
    let current = path.get(`${WIDTH - 1},${HEIGHT - 1}`)!;
    while (current.previous !== null) {
        const [x, y] = current.pos;
        map[y][x] = "O";
        current = path.get(`${current.previous.pos[0]},${current.previous.pos[1]}`)!;

    }
    displayMap(map);
}

if (import.meta.main) {
    // const data = await readData("example.txt");
    // const WIDTH = 7;
    // const HEIGHT = 7;
    // const FALLING_BYTES = 12;

    const data = await readData("input.txt");
    const WIDTH = 71;
    const HEIGHT = 71;
    const FALLING_BYTES = 1024;
    const map = new Array(HEIGHT).fill(0).map(() => new Array(WIDTH).fill("."));
    for (const [x, y] of data.fallingBytes.slice(0,FALLING_BYTES)) {
        map[y][x] = "#";
    }
    displayMap(map);
    solvePart(map);
}
