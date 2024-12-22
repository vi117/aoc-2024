export function mix(a: bigint, b: bigint): bigint {
  return a ^ b;
}

export function prune(a: bigint): bigint {
//   return a % 16777216n; // 2^24
    return a & 0xFFFFFFn;
}

export function generate(secret: bigint): bigint {
    let r = secret;
    r = mix(r, r << 6n); // multiply by 64
    r = prune(r);
    r = mix(r, r >> 5n); // shift right 5
    r = prune(r);
    r = mix(r, r << 11n);
    r = prune(r);
    return r;
}

export function advance(secret: bigint, n: number): bigint {
    let r = secret;
    for (let i = 0; i < n; i++) {
        r = generate(r);
    }
    return r;
}

if (import.meta.main) {
    const initialNumbers = (await Deno.readTextFile("input.txt")).replaceAll("\r","").split("\n").map(x => BigInt(parseInt(x)));
    const sum = initialNumbers.map(x => (advance(x, 2000))).reduce((a, b) => a + b, 0n);
    console.log(sum);
}