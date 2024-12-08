import { readMapFile,checkMapRange, displayMap } from "./solve_1.ts";

interface Vec2 {
    x: number;
    y: number;
}

function addVec(a: Vec2, b: Vec2): Vec2 {
    return {x: a.x + b.x, y: a.y + b.y};
}
function subVec(a: Vec2, b: Vec2): Vec2 {
    return {x: a.x - b.x, y: a.y - b.y};
}

if (import.meta.main) {
    const map = await readMapFile('input.txt');
    const antinodeMap = map.map(row => row.map(_ => '.'));
    
    const markAntinode = (vec: Vec2) => {
        if (checkMapRange(antinodeMap, vec.x, vec.y)) {
            antinodeMap[vec.y][vec.x] = "#";
        }
    }

    const antennaKind = new Set(map.flatMap(row => row.filter(cell => cell !== '.')));
    const antennas = map.flatMap((row, y) => row.map((cell, x) => ({x, y, cell})));
    console.log(antennaKind);
    for (const kind of antennaKind) {
        const antenna = antennas.filter(antenna => antenna.cell === kind);
        for (const one of antenna) {
            for (const another of antenna) {
                if (one !== another) {
                    const delta = subVec(one, another);
                    
                    markAntinode(one);
                    let start = {x: one.x, y: one.y};
                    while (checkMapRange(antinodeMap, start.x, start.y)) {
                        markAntinode(start);
                        start = addVec(start, delta);
                    }
                    start = {x: another.x, y: another.y};
                    while (checkMapRange(antinodeMap, start.x, start.y)) {
                        markAntinode(start);
                        start = subVec(start, delta);
                    }
                }
            }
        }
    }
    displayMap(antinodeMap);
    let count = 0;
    for (const row of antinodeMap) {
        for (const cell of row) {
            if (cell === '#') {
                count++;
            }
        }
    }
    console.log(count);
}