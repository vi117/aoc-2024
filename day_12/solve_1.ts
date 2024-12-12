import { rgb8 } from "jsr:@std/fmt/colors" 

export async function readGardenTypeMapData(path: string): Promise<string[][]> {
    const txt = await Deno.readTextFile(path);
    const lines = txt.split('\n');
    return lines.map(line => line.trim().split(''));
}

export type GardenCell = {
    type: string;
    id: number;
}

export function toGardenMap(map: string[][]) {
    const gardenMap: GardenCell[][] = [];
    for (let i = 0; i < map.length; i++) {
        gardenMap.push([]);
        const row = map[i];
        for (let j = 0; j < row.length; j++) {
            gardenMap[i].push({ type: row[j], id: 0 });
        }
    }
    let idGenerator = 1;
    const typeMap = new Map<string, number>();
    const idMap = new Map<number, string>();
    
    function colorArea(x: number, y: number, type: string){
        const stack = [{x, y}];
        while (stack.length > 0) {
            const {x, y} = stack.pop()!;
            if (x < 0 || x >= gardenMap.length || y < 0 || y >= gardenMap[x].length) {
                continue;
            }
            const cell = gardenMap[x][y];
            if (cell.type !== type || cell.id !== 0) {
                continue;
            }
            cell.id = idGenerator;
            stack.push({x: x - 1, y});
            stack.push({x: x + 1, y});
            stack.push({x, y: y - 1});
            stack.push({x, y: y + 1});
        }
    }

    for (let i = 0; i < gardenMap.length; i++) {
        const row = gardenMap[i];
        for (let j = 0; j < row.length; j++) {
            const cell = row[j];
            if (cell.id === 0) {
                colorArea(i, j, cell.type);
                typeMap.set(cell.type, idGenerator);
                idMap.set(idGenerator, cell.type);
                idGenerator++;
            }
        }
    }

    return {
        gardenMap,
        typeMap,
        idMap,
    }
} 

export function printGardenMap(map: GardenCell[][]) {
    for (let i = 0; i < map.length; i++) {
        const row = map[i];
        console.log( row.map(cell => rgb8(cell.type, cell.id % 256)).join(''));
    }
}

export function countGardenAreas(map: GardenCell[][]) {
    const areas = new Map<number, number>();
    for (let i = 0; i < map.length; i++) {
        const row = map[i];
        for (let j = 0; j < row.length; j++) {
            const cell = row[j];
            const currentArea = areas.get(cell.id) ?? 0;
            areas.set(cell.id, currentArea + 1);
        }
    }
    return areas;
}

export function getAreaById(map: GardenCell[][]) {
    const areaById = new Map<number, number>();
    for (let i = 0; i < map.length; i++) {
        const row = map[i];
        for (let j = 0; j < row.length; j++) {
            const cell = row[j];
            const currentArea = areaById.get(cell.id) ?? 0;
            areaById.set(cell.id, currentArea + 1);
        }
    }
    return areaById;
}

export function getPerimeterById(map: GardenCell[][]) {
    const perimeterByType = new Map<number, number>();
    for (let i = 0; i < map.length; i++) {
        const row = map[i];
        for (let j = 0; j < row.length; j++) {
            const cell = row[j];
            let currentPerimeter = perimeterByType.get(cell.id) ?? 0;
            if (i === 0 || map[i - 1][j].type !== cell.type) {
                currentPerimeter += 2;
            }
            if (j === 0 || map[i][j - 1].type !== cell.type) {
                currentPerimeter += 2;
            }
            perimeterByType.set(cell.id, currentPerimeter);
        }
    }
    return perimeterByType;
}

if (import.meta.main) {
    const path = 'input.txt';
    // const path = "example_1.txt";
    // const path = "example_2.txt";
    // const path = "example_3.txt";
    const data = await readGardenTypeMapData(path);
    const {gardenMap, idMap } = toGardenMap(data);
    printGardenMap(gardenMap);
    const areaById = getAreaById(gardenMap);
    const perimeterById = getPerimeterById(gardenMap);
    // console.log(areaById);
    // console.log(perimeterByType);
    const mixed = Array.from(areaById.keys()).map(id => ({
        id,
        type: idMap.get(id)!,
        area: areaById.get(id)!,
        perimeter: perimeterById.get(id)!,
    }));
    console.log(mixed);
    const result = mixed.map(({ area, perimeter }) => area * perimeter).reduce((acc, val) => acc + val, 0);
    console.log(result);
}
    