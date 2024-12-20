import { opCodeToName, operandToName, readData, VM } from "./solve_1.ts";

class VMCompiler extends VM {
    compileSingleInstruction(pc: number): string {
        const opCode = this.programs[pc];
        const operand = this.programs[pc + 1];
        switch (opCode) {
            case 0:
                return `label${this.pc}: A = (A >> ${operandToName(operand)});`;
            case 1:
                return `label${this.pc}: B = B ^ ${operand};`;
            case 2:
                return `label${this.pc}: B = ${operandToName(operand)} % 8;`;
            case 3:
                return `label${this.pc}: if (A !== 0) goto label${operand};`;
            case 4:
                return `label${this.pc}: B = B ^ C;`;
            case 5:
                return `label${this.pc}: out(${operandToName(operand)} % 8);`;
            case 6:
                return `label${this.pc}: B = (A >> ${operandToName(operand)});`;
            case 7:
                return `label${this.pc}: C = (A >> ${operandToName(operand)});`;
            default:
                throw new Error(`Unknown opCode: ${opCode}`);
        }
    }
    compile(): string {
        let code = "";
        let pc = 0;
        while (pc < this.programs.length) {
            code += this.compileSingleInstruction(pc) + "\n";
            pc += 2;
        }
        return code;
    }
}

if (import.meta.main) {
    const data = await readData(Deno.args[0]);
    console.log(data.registers);
    // data.registers.A = 0b11100101011000000;
    console.log(data.programs.join(","));
    const vm = new VMCompiler(data);
    const text = vm.compile();
    console.log(text);
    const out: number[] = [];
    console.log(out.join(","));
    // vm.registers.A = 3;
    vm.pc = 0;
    const outputs: number[] = [];
    vm.on("out", (value) => {
        outputs.push(value);
    });
    // print code and registers
    while (vm.pc < vm.programs.length) {
        const code = vm.compileSingleInstruction(vm.pc);
        vm.runSingleInstruction();
        console.log(code, vm.registers, vm.registers.C & 7);
    }
    console.log(outputs.join(","));
}


