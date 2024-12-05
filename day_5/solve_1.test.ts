import { assertArrayIncludes, assertEquals } from "jsr:@std/assert";
import { makeTopologySortOrder, readFormat } from "./solve_1.ts";

Deno.test("readFormat", async () => {
    const path = new URL("example.txt", import.meta.url).pathname;
    const actual = await readFormat(path);
    const expected = {
        order: [
            { left: 47, right: 53 },
            { left: 97, right: 13 },
            { left: 97, right: 61 },
            { left: 97, right: 47 },
            { left: 75, right: 29 },
            { left: 61, right: 13 },
            { left: 75, right: 53 },
            { left: 29, right: 13 },
            { left: 97, right: 29 },
            { left: 53, right: 29 },
            { left: 61, right: 53 },
            { left: 97, right: 53 },
            { left: 61, right: 29 },
            { left: 47, right: 13 },
            { left: 75, right: 47 },
            { left: 97, right: 75 },
            { left: 47, right: 61 },
            { left: 75, right: 61 },
            { left: 47, right: 29 },
            { left: 75, right: 13 },
            { left: 53, right: 13 },
        ],
        pageNumbers: [
            [75, 47, 61, 53, 29],
            [97, 61, 53, 29, 13],
            [75, 29, 13],
            [75, 97, 47, 61, 53],
            [61, 13, 29],
            [97, 13, 75, 29, 47],
        ],
    };
    assertEquals(actual, expected);
});

Deno.test("makeTopologySortOrder", () => {
    const orderMap = new Map<number, Set<number>>([
        [1, new Set([2, 3])],
        [2, new Set([4])],
        [3, new Set([4])],
        [4, new Set()],
    ]);
    const actual = makeTopologySortOrder(orderMap);
    const expected = [[4, 2, 3, 1], [4, 3, 2, 1]];
    // 4 -> 2 -> 3 -> 1
    // 4 -> 3 -> 2 -> 1
    // multiple valid topological sort order
    assertArrayIncludes(expected, [actual]);
});

Deno.test("makeTopologySortOrder with cycle", () => {
    const orderMap = new Map<number, Set<number>>([
        [1, new Set([2])],
        [2, new Set([3])],
        [3, new Set([1])],
    ]);
    const actual = makeTopologySortOrder(orderMap);
    const expected = [[3, 2, 1], [2, 1, 3], [1, 3, 2]]; // or any valid topological sort order
    // 3 -> 1 -> 2 -> 3
    // 2 -> 3 -> 1 -> 2
    // 1 -> 2 -> 3 -> 1
    // multiple valid topological sort order

    // The order of the nodes in the cycle is not guaranteed.
    assertArrayIncludes(expected, [actual]);
});

Deno.test("makeTopologySortOrder with disconnected graph", () => {
    const orderMap = new Map<number, Set<number>>([
        [1, new Set([2])],
        [3, new Set([4])],
    ]);
    const actual = makeTopologySortOrder(orderMap);
    const expected = [
        [2, 1, 4, 3],
        [2, 4, 1, 3],
        [2, 4, 3, 1],
        [4, 2, 1, 3],
        [4, 2, 3, 1],
        [4, 3, 2, 1],
    ];
    assertArrayIncludes(expected, [actual]);
});
