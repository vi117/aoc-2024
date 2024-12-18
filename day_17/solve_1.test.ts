import { assertEquals } from "jsr:@std/assert";
import { VM } from "./solve_1.ts";
import { readData } from "./solve_1.ts";

Deno.test("C=9", () => {
    const vm = new VM({
        registers: {
            A: 0,
            B: 0,
            C: 9,
        },
        programs: [
            2, 6
        ]
    });
    vm.run();
    assertEquals(vm.registers["C"], 9);
});

Deno.test("A=10", () => {
    const vm = new VM({
        registers: {
            A: 10,
            B: 0,
            C: 0,
        },
        programs: [
            5,0,5,1,5,4
        ]
    });
    const outputs: number[] = [];
    vm.on("out", (a) => {
        outputs.push(a);
    });
    vm.run();
    assertEquals(outputs, [
        0,1,2
    ]);
});

Deno.test("A=2024", ()=>{
    const vm = new VM({
        registers: {
            A: 2024,
            B: 0,
            C: 0,
        },
        programs: [
            0,1,5,4,3,0
        ]
    });
    const outputs: number[] = [];
    vm.on("out", (a) => {
        outputs.push(a);
    });
    vm.run();
    assertEquals(outputs, [4,2,5,6,7,7,7,7,3,1,0]);
    // leave a 0
    assertEquals(vm.registers["A"], 0);
});

Deno.test("B=29", ()=> {
    const vm = new VM({
        registers: {
            A: 0,
            B: 29,
            C: 0,
        },
        programs: [
            1,7
        ]
    });
    vm.run();
    assertEquals(vm.registers["B"], 26);
});

Deno.test("B=2024, C=43690", ()=>{
    const vm = new VM({
        registers: {
            A: 0,
            B: 2024,
            C: 43690,
        },
        programs: [
            4,0
        ]
    });
    vm.run();
    assertEquals(vm.registers["B"], 44354);
});

Deno.test("B store test", ()=>{
    const vm = new VM({
        registers: {
            A: 0,
            B: 0,
            C: 0,
        },
        programs: [
            2,1
        ]
    });
    vm.run();
    assertEquals(vm.registers["B"], 1);
})

Deno.test("example.txt", async () => {
    const data = await readData(import.meta.dirname + "/example.txt");
    const vm = new VM(data);
    const outputs: number[] = [];
    vm.on("out", (a) => {
        outputs.push(a);
    });
    vm.run();
    assertEquals(outputs, [4,6,3,5,6,3,5,2,1,0]);
});