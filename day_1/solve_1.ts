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

// Part 1

const sl = left.toSorted();
const sr = right.toSorted();

console.log(sr.filter(x => isNaN(x)));

const sum = sl.map((x, i) => Math.abs(x - sr[i])).reduce((a, b) => a + b, 0);

console.log(sum);