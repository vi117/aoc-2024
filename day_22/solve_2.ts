import { generate } from "./solve_1.ts";
/// 2000 개 이전 값에서 가장 많은 바나나를 얻을 수 있는 패턴 한개 찾기.
/// 초기 4개 값은 버려짐.

export type Pattern = [number, number, number, number];

export function patternToKey(p: Pattern): string {
    return p.join(",");
}

function getPatternMap(
    secret: bigint,
    n: number
): Map<string, number> {
    let r = secret;
    const patternMap = new Map<string, number>();
    let p = [Infinity, Infinity, Infinity, Number(r) % 10];
    for (let i = 0; i < n; i++) {
        r = generate(r);
        const newValue = Number(r) % 10;
        const diff = [
            (p[1] - p[0] ),
            (p[2] - p[1] ),
            (p[3] - p[2] ),
            (newValue - p[3] ),
        ] as Pattern;
        // if NaN or Infinity, skip
        if (diff.some(x => !Number.isFinite(x))) {
            p = [p[1], p[2], p[3], newValue];
            continue;
        }
        const key = patternToKey(diff);
        if (!patternMap.has(key)) {
            patternMap.set(patternToKey(diff), newValue);
        }
        p = [p[1], p[2], p[3], newValue];
    }
    return patternMap;
}



if (import.meta.main) {
    const initialNumbers = (await Deno.readTextFile("input.txt")).replaceAll("\r","").split("\n").map(x => BigInt(parseInt(x)));
    const resultMap = new Map<string, number>();
    const mapArr = initialNumbers.map(x => {
        const map = getPatternMap(x, 2000);
        return map;
    });
    mapArr.forEach(map => {
        map.forEach((v, k) => {
            const x = resultMap.get(k) ?? 0;
            resultMap.set(k, x + v);
        });
    });
    const reversedMap = new Map<number, string[]>();
    resultMap.forEach((v, k) => {
        const x = reversedMap.get(v) ?? [];
        x.push(k);
        reversedMap.set(v,x)
    });

    const keys = [...reversedMap.keys()];
    keys.sort((a,b)=> b-a);
    const maximum = keys[0];
    console.log("max:", maximum);
    const p = reversedMap.get(maximum)!;
    const pk = p[0]
    console.log("pattern:", p);
    // mapArr.forEach(mp => {
    //     const p = mp.get(pk);
    //     console.log(p);
    // })

}