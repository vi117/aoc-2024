import { assertEquals } from "jsr:@std/assert/equals";
import {
    availableShortestPaths,
    Command,
    inputCommand,
    inputCommands,
    Path,
    PathSetHandler,
    shortestPathLength,
} from "./solve_2.ts";

Deno.test("availableShortestPaths - blocked", () => {
    const paths = availableShortestPaths("<", "^");
    assertEquals(paths.map((x) => x.toString()), [">^"]);
});

Deno.test("availableShortestPaths - common", () => {
    const paths = availableShortestPaths(">", "^");
    assertEquals(paths.map((x) => x.toString()).sort(), ["<^", "^<"].sort());
});

Deno.test("Path - length", () => {
    const path = new Path(["^", "v", "<", ">", "A"]);
    assertEquals(path.length, 5);
});

Deno.test("Path - execute", () => {
    const path = new Path(["<", "v", "A", ">", "A"]);
    const ret: Command[] = [];
    path.execute("A", (c) => {
        ret.push(c);
    });
    assertEquals(ret.join(""), "v>");
});

Deno.test("Path - concat", () => {
    const path = new Path(["<", "v", "A", ">", "A"]);
    assertEquals(path.concat("^").toString(), "<vA>A^");
});

Deno.test("PathHandler - coproduct", () => {
    const lhs = PathSetHandler.fromPathSet([Path.from(["A"])]);
    const rhs = PathSetHandler.fromPathSet([Path.from(["v"])]);
    const set = lhs.coproduct(rhs);
    const [m, _] = set.call(">");
    assertEquals(
        m.map((x) => x.toString()).sort(),
        [
            "A",
            "v",
        ].sort(),
    );
});
Deno.test("PathHandler - product", () => {
    const lhs = PathSetHandler.fromPathSet([Path.from(["A"])]);
    const rhs = PathSetHandler.fromPathSet([Path.from(["v"])]);
    const set = lhs.product(rhs);
    const [m, _] = set.call(">");
    assertEquals(
        m.map((x) => x.toString()).sort(),
        [
            "Av",
        ].sort(),
    );
});

Deno.test("inputCommand", () => {
    const handler = inputCommand("^");
    const [m, a] = handler.call(">");
    assertEquals(
        m.map((x) => x.toString()).sort(),
        [
            "<^A",
            "^<A",
        ].sort(),
    );
});

Deno.test("inputCommands", () => {
    const handler = inputCommands(Path.from([">", "A"]));
    const [m, a] = handler.call(">");
    assertEquals(
        m.map((x) => x.toString()).sort(),
        [
            "A^A",
        ].sort(),
    );
});

Deno.test("shortestPathLength", () => {
    const inputcmdsShort = (start: Command,
        cmds: Command[]) => shortestPathLength(inputCommands(Path.from(cmds)))(start)[0];
    
    assertEquals(inputcmdsShort("A", (["A"])), 1);
    assertEquals(inputcmdsShort("A", (["A", ">"])), 3);
    assertEquals(inputcmdsShort("A", (["A", ">", "^"])), 6);

    assertEquals(inputcmdsShort("A", (["<"])), 4);
    assertEquals(inputcmdsShort("A", (["<", "A"])), 8);
});

Deno.test("shortestPathLength - property", () => {
    // random path list
    const pathes = [
        Path.from(["^", "v", "<", ">", "A"]),
        Path.from(["^", "v", "<", ">", "A", "v"]),
        Path.from(["^", "v", "<", ">", "A", "v", "<"]),
        Path.from(["^", "v", "<", ">", "A", "v", "<", ">"]),
        Path.from(["A", "v", "v", ">", ">", "v", ">", "v"]),
    ];
    for (const paths of pathes) {
        for (const s of ["^", "v", "<", ">", "A"] as Command[]) {
            const [x, ...xs] = paths;
            const s1 = shortestPathLength(inputCommands(Path.from([x])))(s)[0];
            const s2 = shortestPathLength(inputCommands(Path.from(xs)))(x)[0];
            const s3 = shortestPathLength(inputCommands(paths))(s)[0];
            assertEquals(
                s1 + s2,
                s3,
                `s: ${s}, x: ${x}, xs: ${xs}, s1: ${s1}, s2: ${s2}, s3: ${s3}`,
            );
        }
    }
});
