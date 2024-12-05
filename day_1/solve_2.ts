let txt = await Deno.readTextFile("input.txt");
txt = txt.trim();
const lst = txt.split("\r\n").map((x) =>
    x.split(" ")
        .filter((x) => x.length > 0))
    .map(x => {
        console.log(x);
        return x;
    })
    .map((x) => [parseInt(x[0]), parseInt(x[1])]);

const left = lst.map((x) => x[0]);
const right = lst.map((x) => x[1]);

// Part 2

//Counter class
class Counter {
    private _data: Map<number, number> = new Map<number, number>();
    private _total: number = 0;

    constructor(data: number[]) {
        data.forEach(x => {
            this.set(x);
        });
    }

    get total(): number {
        return this._total;
    }

    get count(): Map<number, number> {
        return this._data;
    }

    get(key: number): number {
        return this._data.get(key) ?? 0;
    }

    set(key: number): void {
        this._total++;
        const count = this._data.get(key) ?? 0;
        this._data.set(key, count + 1);
    }
}

/**
 * get the similarity score between two arrays
 * 
 * @param a 
 * @param b 
 */
function calcSimilarityScore(a: number[], b: number[]): number {
    const counterA = new Counter(a);
    const counterB = new Counter(b);

    let score = 0;
    counterA.count.forEach((v, k) => {
        const bv = counterB.get(k);
        score += bv * v * k;
    });

    return score;
}

const score = calcSimilarityScore(left, right);
console.log(score);