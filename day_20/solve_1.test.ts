import { assertEquals } from "jsr:@std/assert";
import { parseMap, toMapString } from "./solve_1.ts";
import { printPrettyMapStep } from "./solve_1.ts";
import { calculateNeedsSteps } from "./solve_1.ts";

Deno.test("parseMap", () => {
    const input = `..#\n#..`;
    const expected = [[".", ".", "#"], ["#", ".", "."]];
    assertEquals(parseMap(input), expected);
});

Deno.test("toMapString", () => {
    const input = [[".", ".", "#"], ["#", ".", "."]];
    const expected = `..#\n#..`;
    assertEquals(toMapString(input), expected);
});

const ExampleMap = `###############
#...#...#.....#
#.#.#.#.#.###.#
#S#...#.#.#...#
#######.#.#.###
#######.#.#...#
#######.#.###.#
###..E#...#...#
###.#######.###
#...###...#...#
#.#####.#.###.#
#.#...#.#.#...#
#.#.#.#.#.#.###
#...#...#...###
###############`;

Deno.test("printPrettyMapStep", ()=>{
    const map = parseMap(`...\n...\n...`);
    const actual = printPrettyMapStep(map, [
        [1,2,3],
        [4,5,6],
        [7,8,9]
    ]);
    const expected = `123
456
789`;
    assertEquals(actual, expected);
})

Deno.test("calculateNeedsSteps", () => {
    const map = parseMap(ExampleMap);
    const needsSteps = calculateNeedsSteps(map, [5, 7]);
    const expected = `###############
#210#432#87654#
#3#9#5#1#9###3#
#4#876#0#0#012#
#######9#1#9###
#######8#2#876#
#######7#3###5#
###210#654#234#
###3#######1###
#654###456#098#
#7#####3#7###7#
#8#456#2#8#456#
#9#3#7#1#9#3###
#012#890#012###
###############`;
    assertEquals(printPrettyMapStep(map, needsSteps), expected);
})