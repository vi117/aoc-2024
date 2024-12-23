export type Interconnected = {
    [key: string]: string[]
}

export async function readData(path: string): Promise<Interconnected> {
    const data = await Deno.readTextFile(path);
    return data.trim().split('\n').reduce((acc, line) => {
        const [key, value] = line.split('-');
        const original = acc[key] ?? [];
        acc[key] = [...original, value];
        // Add the reverse
        const original2 = acc[value] ?? [];
        acc[value] = [...original2, key];

        return acc;
    }, {} as Interconnected);
}

function findConnected3(data: Interconnected, target: string): Set<string> {
    const connected = new Set<string>();
    const lst = data[target].toSorted();

    for (let i = 0; i < lst.length; i++) {
        for (let j = i + 1; j < lst.length; j++) {
            if (data[lst[i]].includes(lst[j])) {
                connected.add([target, lst[i], lst[j]].toSorted().join('-'));
            }
        }
    }
    
    return connected;
}

if (import.meta.main) {
    const data = await readData('./input.txt');
    let acc = new Set<string>();
    for (const key in data) {
        console.log(key, data[key]);
        if (!key.startsWith("t")) continue;
        const connected = findConnected3(data, key);
        acc = acc.union(connected);
    }
    console.log(acc);
}