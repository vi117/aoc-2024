const txt = await Deno.readTextFile("input.txt");
const map = txt.split("\n").map((row) => row.trim().split(""));

const dirs = [-1, 0, 1].flatMap((x) => (
    [-1, 0, 1].map((y) => [x, y])
)).filter(([x, y]) => x != 0 || y != 0);

function findXMASInPosDir(
    map: string[][],
    [x, y]: [number, number],
    [dx, dy]: [number, number],
) {
    const w = map[0].length;
    const h = map.length;
    const str = "XMAS";
    for (let i = 0; i < str.length; i++) {
        // out of bounds
        if (x < 0 || x >= w || y < 0 || y >= h) {
            return false;
        }
        if (map[y][x] != str[i]) {
            return false;
        }
        y += dy;
        x += dx;
    }
    return true;
}

function findXMASInPos(map: string[][], [x, y]: [number, number]) {
    let count = 0;
    for (const [dx, dy] of dirs) {
        if (
            findXMASInPosDir(map, [x, y], [dx, dy])
        ) {
            count++;
        }
    }
    return count;
}

function findXMAS(map: string[][]) {
    const w = map[0].length;
    const h = map.length;

    let count = 0;
    for (let i = 0; i < h; i++) {
        for (let j = 0; j < w; j++) {
            if (map[i][j] == "X") {
                count += findXMASInPos(map, [j, i]);
            }
        }
    }
    return count;
}

console.log(findXMAS(map));
