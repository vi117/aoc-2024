export type HeightMap = number[][];

export async function readMap(path: string): Promise<HeightMap> {
    const text = await Deno.readTextFile(path);
    return text.split("\n").map((row) =>
        row.trim().split("").map((cell) => {
            const ret = parseInt(cell);
            if (isNaN(ret)) {
                return -5;
            }
            return ret;
        })
    );
}

export function displayMap(map: HeightMap) {
    console.log(map.map((row) => row.map(x=> x < 0 ? "." : x).join("")).join("\n"));
}

export type Pos = [number, number];

export function getCell(map: HeightMap, [x, y]: Pos): number {
    return map[y][x];
}

export const TOP_HEIGHT = 9;

export function countReachableTop(pos: Pos, map: HeightMap): number {
    const stack: {
        pos: Pos;
        height: number;
    }[] = [];
    const visited = new Set<string>();
    stack.push({ pos, height: getCell(map, pos) });
    let count = 0;
    while (stack.length > 0) {
        const { pos, height } = stack.pop()!;
        const [x, y] = pos;
        if (getCell(map, pos) === TOP_HEIGHT) {
            if (visited.has(pos.toString())) {
                continue;
            }
            visited.add(pos.toString());
            count++;
            continue;
        }
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const [nx, ny] = [x + dx, y + dy];
            if (nx < 0 || nx >= map[0].length || ny < 0 || ny >= map.length) {
                continue;
            }
            const nheight = getCell(map, [nx, ny]);
            if (nheight == height + 1) {
                stack.push({ pos: [nx, ny], height: nheight });
            }
        }
    }
    return count;
}

if (import.meta.main) {
    const map = await readMap("input.txt");
    displayMap(map);
    const data = map.map((row, y) => {
        return row.map((cell, x) => {
            if (cell === 0) {
                const count = countReachableTop([x, y], map);
                console.log("count reachable top from", [x, y]);
                return count;
            }
            return -5;
        });
    });
    displayMap(data);
    console.log(data.flat().reduce((a, b) => a + (b < 0 ? 0 : b ), 0));
}