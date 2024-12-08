export async function readMapFile(path: string): Promise<string[][]> {
    const text = await Deno.readTextFile(path);
    const lines = text.split('\n');
    return lines.map(line => line.trim().split(''));
}

export function checkMapRange(map: string[][], x: number, y: number): boolean {
    return x >= 0 && x < map[0].length && y >= 0 && y < map.length;
}

export function displayMap(map: string[][]): void {
    for (const row of map) {
        console.log(row.join(''));
    }
}

if (import.meta.main) {
    const map = await readMapFile('input.txt');
    const antinodeMap = map.map(row => row.map(_ => '.'));
    
    const antennaKind = new Set(map.flatMap(row => row.filter(cell => cell !== '.')));
    const antennas = map.flatMap((row, y) => row.map((cell, x) => ({x, y, cell})));
    console.log(antennaKind);
    for (const kind of antennaKind) {
        const antenna = antennas.filter(antenna => antenna.cell === kind);
        for (const one of antenna) {
            for (const another of antenna) {
                if (one !== another) {
                    const dx = one.x - another.x;
                    const dy = one.y - another.y;
                    if (checkMapRange(antinodeMap, one.x + dx, one.y + dy)) {
                        antinodeMap[one.y + dy][one.x + dx] = "#";
                    }
                    if (checkMapRange(antinodeMap, another.x - dx, another.y - dy)) {
                        antinodeMap[another.y - dy][another.x - dx] = "#";
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