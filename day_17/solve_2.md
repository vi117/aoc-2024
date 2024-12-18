```js
function l(A: number,B: number, C: number, out: (o: number)=> void) {
    do {
    B = A % 8
    B = B ^ 1
    C = Math.floor(A / Math.pow(2,B))
    B = B ^ 5;
    A = Math.floor(A / 8);
    B = B ^ C;
    out(B % 8)
    }
    while (A !== 0);
}
```
프로그램은 이렇다.
바꿔보자.
```js
function l(A: number, out: (o: number)=> void) {
    do {
    out(((((A & 7) ^ 1) ^ 5) ^ (A >> ((A & 7) ^ 1))) & 7);
    A = A >> 3;
    }
    while (A !== 0);
}
```
0b001
0b101

0b100

(((A & 7) ^ 4) ^ (A >> ((A & 7) ^ 1) )) & 7

((A ^ 4) & 7) ^ ((A >> ((A & 7) ^ 1)) & 7) = k

```js
function l(A: number,B: number, C: number, out: (o: number)=> void) {
    do {
    B = A & 7
    B = B ^ 1
    C = A >> B
    B = B ^ 5;
    B = B ^ C;
    out(B & 7)
    A = A >> 3;
    }
    while (A !== 0);
}
```

B: 0..7 as
A: 3bit array

```js
function l(A: number[], out: (o:number) => void) {
    let i = 0;
    do {
        B = A[i + 2] * 4 + A[i+1] * 2 + A[i]
        B ^= 1
        C = A[i + B + 2] * 4 + A[i + B + 1] * 2 + A[i + B]
        B = B ^ 5;
        B ^= C;
        out(B);
        i += 3;
    }
}
```
