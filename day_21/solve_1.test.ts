import { assertEquals, assertThrows } from "jsr:@std/assert";
import {
    Command,
    DIRPAD_FIRST_POS,
    executeCommandsOnDirpadRobot,
    executeCommandsOnNumpadRobot,
    getDirpadNumber,
    getNextDirpadRobotState,
    getNextNumpadRobotState,
    getNumpadNumber,
    getPosFromDirpadNumber,
    getPosFromNumpadNumber,
    NUMPAD_FIRST_POS,
    Pos,
    shortestPathesOnDirpadRobot,
    shortestPathesOnNumpadRobot,
    solve_1,
} from "./solve_1.ts";

Deno.test("getNumbericKeypadNumber", () => {
    assertEquals(getNumpadNumber([0, 0]), "7");
    assertEquals(getNumpadNumber([1, 0]), "8");
    assertEquals(getNumpadNumber([2, 0]), "9");
    assertEquals(getNumpadNumber([0, 1]), "4");
    assertEquals(getNumpadNumber([1, 1]), "5");
    assertEquals(getNumpadNumber([2, 1]), "6");
    assertEquals(getNumpadNumber([0, 2]), "1");
    assertEquals(getNumpadNumber([1, 2]), "2");
    assertEquals(getNumpadNumber([2, 2]), "3");
    assertEquals(getNumpadNumber([0, 3]), " ");
    assertEquals(getNumpadNumber([1, 3]), "0");
    assertEquals(getNumpadNumber([2, 3]), "A");
});

Deno.test("getPosFromNumpadNumber", () => {
    assertEquals(getPosFromNumpadNumber("7"), [0, 0]);
    assertEquals(getPosFromNumpadNumber("8"), [1, 0]);
    assertEquals(getPosFromNumpadNumber("9"), [2, 0]);
    assertEquals(getPosFromNumpadNumber("4"), [0, 1]);
    assertEquals(getPosFromNumpadNumber("5"), [1, 1]);
    assertEquals(getPosFromNumpadNumber("6"), [2, 1]);
    assertEquals(getPosFromNumpadNumber("1"), [0, 2]);
    assertEquals(getPosFromNumpadNumber("2"), [1, 2]);
    assertEquals(getPosFromNumpadNumber("3"), [2, 2]);
    assertEquals(getPosFromNumpadNumber("0"), [1, 3]);
    assertEquals(getPosFromNumpadNumber("A"), [2, 3]);
});

Deno.test("getNextKeypadRobotState", () => {
    assertThrows(() => getNextNumpadRobotState({ pos: [0, 0] }, "^"));
    assertEquals(getNextNumpadRobotState({ pos: [0, 0] }, "v"), {
        pos: [0, 1],
    });
    assertThrows(() => getNextNumpadRobotState({ pos: [0, 0] }, "<"));
    assertEquals(getNextNumpadRobotState({ pos: [0, 0] }, ">"), {
        pos: [1, 0],
    });
    assertEquals(getNextNumpadRobotState({ pos: [0, 0] }, "A"), {
        pos: [0, 0],
    });

    assertEquals(getNextNumpadRobotState({ pos: [1, 1] }, "^"), {
        pos: [1, 0],
    });
    assertEquals(getNextNumpadRobotState({ pos: [1, 1] }, "v"), {
        pos: [1, 2],
    });
    assertEquals(getNextNumpadRobotState({ pos: [1, 1] }, "<"), {
        pos: [0, 1],
    });
    assertEquals(getNextNumpadRobotState({ pos: [1, 1] }, ">"), {
        pos: [2, 1],
    });
    assertEquals(getNextNumpadRobotState({ pos: [1, 1] }, "A"), {
        pos: [1, 1],
    });
});

Deno.test("getDirKeypadNumber", () => {
    assertEquals(getDirpadNumber([0, 0]), " ");
    assertEquals(getDirpadNumber([1, 0]), "^");
    assertEquals(getDirpadNumber([2, 0]), "A");
    assertEquals(getDirpadNumber([0, 1]), "<");
    assertEquals(getDirpadNumber([1, 1]), "v");
    assertEquals(getDirpadNumber([2, 1]), ">");
});

Deno.test("getPosFromDirKeypadNumber", () => {
    assertEquals(getPosFromDirpadNumber(" "), [0, 0]);
    assertEquals(getPosFromDirpadNumber("^"), [1, 0]);
    assertEquals(getPosFromDirpadNumber("A"), [2, 0]);
    assertEquals(getPosFromDirpadNumber("<"), [0, 1]);
    assertEquals(getPosFromDirpadNumber("v"), [1, 1]);
    assertEquals(getPosFromDirpadNumber(">"), [2, 1]);
});

Deno.test("getNextDirKeypadRobotState", () => {
    assertEquals(getNextDirpadRobotState({ pos: [1, 1] }, "^"), {
        pos: [1, 0],
    });
    assertThrows(() => getNextDirpadRobotState({ pos: [1, 1] }, "v"));
    assertEquals(getNextDirpadRobotState({ pos: [1, 1] }, "<"), {
        pos: [0, 1],
    });
    assertEquals(getNextDirpadRobotState({ pos: [1, 1] }, ">"), {
        pos: [2, 1],
    });
    assertEquals(getNextDirpadRobotState({ pos: [1, 1] }, "A"), {
        pos: [1, 1],
    });
});

Deno.test("executeCommandsOnNumpadRobot", () => {
    const commands = [
        "<A^A>^^AvvvA".split("") as Command[],
        "<A^A^>^AvvvA".split("") as Command[],
        "<A^A^^>AvvvA".split("") as Command[],
    ];
    for (const command of commands) {
        const out: string[] = [];
        executeCommandsOnNumpadRobot(
            {
                pos: NUMPAD_FIRST_POS,
            },
            command,
            (o) => {
                out.push(o);
            },
        );
        assertEquals(out, ["0", "2", "9", "A"]);
    }
});

Deno.test("executeCommandsOnDirKeypadRobot", () => {
    const input_result = [
        [
            "<vA<AA>>^AvAA<^A>A<v<A>>^AvA^A<vA>^A<v<A>^A>AAvA^A<v<A>A>^AAAvA<^A>A"
                .split("") as Command[],
            "v<<A>>^A<A>AvA<^AA>A<vAAA>^A",
        ],
        ["v<<A>>^A<A>AvA<^AA>A<vAAA>^A".split("") as Command[], "<A^A>^^AvvvA"],
    ] as const;
    for (const [input, result] of input_result) {
        const out: string[] = [];
        executeCommandsOnDirpadRobot(
            {
                pos: DIRPAD_FIRST_POS,
            },
            input,
            (o) => {
                out.push(o);
            },
        );
        assertEquals(out.join(""), result);
    }
});

Deno.test("shortestPathesOnNumpadRobot", () => {
    const testCase: {
        pos: Pos;
        target: string;
        expect: string[][];
        msg: string;
    }[] = [
        {
            pos: NUMPAD_FIRST_POS,
            target: "A",
            expect: [[]],
            msg: "should return empty array when target is same as pos",
        },
        {
            pos: [0, 0],
            target: "7",
            expect: [[]],
            msg: "should return empty array when target is same as pos",
        },
        {
            pos: NUMPAD_FIRST_POS,
            target: "9",
            expect: [["^", "^", "^"]],
            msg: "should return shortest path to target",
        },
        {
            pos: [0, 0],
            target: "5",
            expect: [["v", ">"], [">", "v"]],
            msg: "should return shortest path to target",
        },
        {
            pos: [1, 3],
            target: "1",
            expect: [["^", "<"]],
            msg: "should return shortest path to target",
        },
    ];
    for (const { pos, target, expect, msg } of testCase) {
        assertEquals(shortestPathesOnNumpadRobot({ pos }, target), expect, msg);
    }
});

Deno.test("shortestPathesOnDirpadRobot", () => {
    const testCase: {
        pos: Pos;
        target: string;
        expect: string[][];
        msg: string;
    }[] = [
        {
            pos: DIRPAD_FIRST_POS,
            target: "A",
            expect: [["A"]],
            msg: "should return empty array when target is same as pos",
        },
        {
            pos: [1, 0],
            target: "^",
            expect: [["A"]],
            msg: "should return empty array when target is same as pos",
        },
        {
            pos: DIRPAD_FIRST_POS,
            target: ">",
            expect: [["v", "A"]],
            msg: "should return shortest path to target",
        },
        {
            pos: [1, 0],
            target: ">",
            expect: [["v", ">", "A"], [">", "v", "A"]],
            msg: "should return shortest path to target",
        },
        {
            pos: [0, 1],
            target: "^",
            expect: [[">", "^", "A"]],
            msg: "should return shortest path to target",
        },
    ];
    for (const { pos, target, expect, msg } of testCase) {
        assertEquals(shortestPathesOnDirpadRobot({ pos }, target), expect, msg);
    }
});

Deno.test("example test", () => {
    const testCase: [string, string][] = [
        [
            "029A",
            "<vA<AA>>^AvAA<^A>A<v<A>>^AvA^A<vA>^A<v<A>^A>AAvA^A<v<A>A>^AAAvA<^A>A",
        ],
        [
            "980A",
            "<v<A>>^AAAvA^A<vA<AA>>^AvAA<^A>A<v<A>A>^AAAvA<^A>A<vA>^A<A>A",
        ],
        [
            "179A",
            "<v<A>>^A<vA<A>>^AAvAA<^A>A<v<A>>^AAvA^A<vA>^AA<A>A<v<A>A>^AAAvA<^A>A",
        ],
        [
            "456A",
            "<v<A>>^AA<vA<A>>^AAvAA<^A>A<vA>^A<A>A<vA>^A<A>A<v<A>A>^AAvA<^A>A",
        ],
        [
            "379A",
            "<v<A>>^AvA^A<vA<AA>>^AAvA<^A>AAvA^A<vA>^AA<A>A<v<A>A>^AAAvA<^A>A",
        ],
    ];
    for (const [input, expect] of testCase) {
        assertEquals(solve_1(input), expect.length);
    }
});
