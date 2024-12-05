const txt = await Deno.readTextFile("input.txt");
const map = txt.split("\n").map((row) => row.trim().split(""));

function isOutOfBounds(map: string[][], [x, y]: [number, number]) {
    const w = map[0].length;
    const h = map.length;
    return x < 0 || x >= w || y < 0 || y >= h;
}

const patterns = [
    ["M", "M", "S", "S"],
    ["M", "S", "M", "S"],
    ["S", "M", "S", "M"],
    ["S", "S", "M", "M"],
];
const patternPositions = [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
];

function findXMasPatternInPos(
    map: string[][],
    [x, y]: [number, number],
) {
    if (isOutOfBounds(map, [x, y])) {
        return 0;
    }
    if (map[y][x] != "A") {
        return 0;
    }
    let count = 0;
    patterns.forEach((pattern) => {
        for (let i = 0; i < pattern.length; i++) {
            const [dx, dy] = patternPositions[i];
            const [nx, ny] = [x + dx, y + dy];
            if (isOutOfBounds(map, [nx, ny]) || map[ny][nx] != pattern[i]) {
                return;
            }
        }
        count++;
    });
    return count;
}

let count = 0;
for (let i = 0; i < map.length; i++) {
    for (let j = 0; j < map[0].length; j++) {
        count += findXMasPatternInPos(map, [j, i]);
    }
}
console.log(count);
