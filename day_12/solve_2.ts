import { readGardenTypeMapData, toGardenMap, printGardenMap, getAreaById, getPerimeterById, GardenCell } from "./solve_1.ts";

const pattern = {
    "0000": 4,
    "1000": 4,
    "0100": 0,
    "1100": 2,
    "0010": 4,
    "1010": 4,
    "0110": 2,
    "1110": 4,
    "0001": 0,
    "1001": 2,
    "0101": -2,
    "1101": -2,
    "0011": 0,
    "1011": 2,
    "0111": 0,
    "1111": 0,
} as Record<string, number>;

function getSideById(gardenMap: GardenCell[][]) {
    const sideById = new Map<number, number>();
    function addSide(id: number, side: number) {
        const currentSide = sideById.get(id) ?? 0;
        sideById.set(id, currentSide + side);
    }

    for (let i = 0; i < gardenMap.length; i++) {
        for (let j = 0; j < gardenMap[i].length; j++) {
            const cell = gardenMap[i][j];
            const id = cell.id;
            const sides = [
                gardenMap[i - 1]?.[j - 1]?.id ?? -1,
                gardenMap[i - 1]?.[j]?.id ?? -1,
                gardenMap[i - 1]?.[j + 1]?.id ?? -1,
                gardenMap[i]?.[j - 1]?.id ?? -1,
            ];
            const sideKey = sides.map(s => s === id ? 1 : 0).join('');
            const addedSide = pattern[sideKey];
            addSide(id, addedSide!);
        }
    }
    
    return sideById;
}

if (import.meta.main) {
    const path = 'input.txt';
    // const path = "example_1.txt";
    // const path = "example_3.txt";
    // const path = "example_4.txt";
    // const path = "example_5.txt";
    const data = await readGardenTypeMapData(path);
    const {gardenMap, idMap } = toGardenMap(data);
    printGardenMap(gardenMap);
    const areaById = getAreaById(gardenMap);
    const sideById = getSideById(gardenMap);
    // console.log(areaById);
    // console.log(perimeterByType);
    const mixed = Array.from(areaById.keys()).map(id => ({
        id,
        type: idMap.get(id)!,
        area: areaById.get(id)!,
        side: sideById.get(id)!,
    }));
    console.log(mixed);
    const result = mixed.map(({ area, side }) => area * side).reduce((acc, val) => acc + val, 0);
    console.log(result);
}
    