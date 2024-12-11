export async function readInputData(path: string): Promise<number[]> {
    const data = await Deno.readTextFile(path);
    return data.trim().split(" ").map((x) => parseInt(x));
}

export function step(k: number): [number, number] | number {
    if (k === 0) return 1;
    const str = k.toString();
    if (str.length % 2 === 0) {
        return [
            parseInt(str.slice(0, str.length / 2)),
            parseInt(str.slice(str.length / 2)),
        ];
    }
    return k * 2024;
}

if (import.meta.main) {
    const input = await readInputData("input.txt");
    console.log(input);
    let data = input;
    for (let i = 0; i < 25; i++) {
        data = data.flatMap(step);
    }
    console.log(data.length);
    // let input = [125, 17]
    // for (let i = 0; i < 6; i++) {
    //     input = input.flatMap(step);
    //     console.log(input);
    // }
}
