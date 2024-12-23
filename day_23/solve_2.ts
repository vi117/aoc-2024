import { readData, Interconnected } from "./solve_1.ts";

function checkConnected(data: Interconnected, curConnected: Set<string>, target: string): boolean {
    // console.log(curConnected, target);
    if (curConnected.has(target)) return true;
    for (const key of curConnected) {
        // console.log(key, data[key], target);
        if (!data[key].includes(target)) return false;
    }
    return true;
}
function findMaxConnected(data: Interconnected, target: string) {
    const lst = data[target];

    let connectedSet = new Set<string>();

    for (let i = 0; i < lst.length; i++) {
        const connected = new Set<string>();
        connected.add(target);
        connected.add(lst[i]);
        for (let j = i+1; j < lst.length; j++) {
            if (checkConnected(data, connected, lst[j])) {
                connected.add(lst[j]);
            }
        }
        if (connected.size > connectedSet.size) {
            connectedSet = connected;
        }
    }
    return connectedSet;
}

if (import.meta.main) {
    const data = await readData('./input.txt');
    const acc = new Set<string>();
    for (const key in data) {
        // console.log(key, data[key]);
        const connected = findMaxConnected(data, key);
        acc.add([...connected.keys()].toSorted().join("-"));
    }
    console.log(acc);

    const max = [...acc].map(x => {
        const keys = x.split("-");
        return {
            length: keys.length,
            keys,
        }
    }).sort((a, b) => b.length - a.length)[0];
    console.log(max);
    const password = max.keys.join(",");
    console.log(password);
}