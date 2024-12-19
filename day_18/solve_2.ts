import { BinaryHeap } from "jsr:@std/data-structures/binary-heap";
import { displayMap, readData } from "./solve_1.ts";
import { solvePart as solvePart1 } from "./solve_1.ts";
import { rgb8 } from "jsr:@std/fmt/colors";

function searchPath(
    map: string[][],
) {
    const WIDTH = map[0].length;
    const HEIGHT = map.length;

    const queue = new BinaryHeap<{
        pos: [number, number];
        step: number;
        previous: null | { pos: [number, number]; step: number };
    }>((x, y) => x.step - y.step);
    queue.push({ pos: [0, 0], step: 0, previous: null });
    const path = new Map<
        string,
        {
            pos: [number, number];
            step: number;
            previous: null | { pos: [number, number]; step: number };
        }
    >();

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
        if (path.has(`${x},${y}`)) {
            continue;
        }
        path.set(`${x},${y}`, node);
        if (x === WIDTH - 1 && y === HEIGHT - 1) {
            return step;
        }
        queue.push({
            pos: [x + 1, y],
            step: step + 1,
            previous: { pos, step },
        });
        queue.push({
            pos: [x - 1, y],
            step: step + 1,
            previous: { pos, step },
        });
        queue.push({
            pos: [x, y + 1],
            step: step + 1,
            previous: { pos, step },
        });
        queue.push({
            pos: [x, y - 1],
            step: step + 1,
            previous: { pos, step },
        });
    }
    return -1;
    // displayMap(map);
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
    for (const [x, y] of data.fallingBytes.slice(0, FALLING_BYTES)) {
        map[y][x] = "#";
    }
    // search for the falling bytes that will not allow the destination to be reached
    let low = FALLING_BYTES;
    let high = data.fallingBytes.length;
    // binary search
    while (low < high) {
        const mid = (low + high) >>> 1;
        const copy = map.map((row) => row.slice());
        for (const [x, y] of data.fallingBytes.slice(FALLING_BYTES, mid)) {
            copy[y][x] = "#";
        }
        const step = searchPath(copy);
        if (step === -1) {
            high = mid;
        } else {
            low = mid + 1;
        }
    }
    console.log("step",low - 1);
    // lastest successful path
    const copy = map.map((row) => row.slice());
    for (const [x, y] of data.fallingBytes.slice(0, low-1)) {
        copy[y][x] = "#";
    }
    solvePart1(copy);
    console.log("step",low);
    const copy2 = map.map((row) => row.slice());
    for (const [x, y] of data.fallingBytes.slice(1024, low)) {
        copy2[y][x] = "#";
    }
    solvePart1(copy2);
    displayMap(copy2);
    console.log(data.fallingBytes[low - 1]);
    const [sx, sy] = data.fallingBytes[low - 1];
    // print map and the falling bytes with different colors
    console.log(
        copy.map((row, y) => {
            return row
                .map((cell, x) => {
                    if (cell === "#") {
                        return rgb8(cell, 1);
                    }
                    if (x === sx && y === sy) {
                        console.log("found", x, y);
                        return rgb8("A", 2);
                    }
                    return cell;
                })
                .join("");
        }).join("\n")
    )
}
