export type VmInitalStateData = {
    registers: {
        A: number;
        B: number;
        C: number;
    };
    programs: number[];
};

export async function readData(path: string): Promise<VmInitalStateData> {
    const data = await Deno.readTextFile(path);
    const lines = data.split("\n").map((x) => x.trim());
    const registerRegex = /Register ([ABC]): (\d+)/;
    const programRegex = /Program: ((?:\d)(?:,\d)*)/;
    const registers: Record<string, number> = {};
    const programs: number[] = [];
    // Parse registers
    for (let i = 0; i < 3; i++) {
        const match = lines[i].match(registerRegex);
        if (match) {
            registers[match[1]] = parseInt(match[2]);
        }
    }
    // Parse programs
    const match = lines[4].match(programRegex);
    if (match) {
        programs.push(...match[1].split(",").map((x) => parseInt(x)));
    }
    return {
        registers: {
            A: registers["A"],
            B: registers["B"],
            C: registers["C"],
        },
        programs,
    };
}

const opCodeNameList = [
    "adv",
    "bxl",
    "bst",
    "jnz",
    "bxc",
    "out",
    "bdv",
    "cdv",
];
const operandNameList = [
    "0",
    "1",
    "2",
    "3",
    "A",
    "B",
    "C",
    "Invalid",
];
export function opCodeToName(opCode: number): string {
    return opCodeNameList[opCode];
}
export function operandToName(operand: number): string {
    return operandNameList[operand];
}

function dv(a: number, b: number): number {
    // const denom = Math.pow(2, b);
    // return Math.floor(a / denom);
    return a >> b;
}

export class VM {
    pc: number;
    registers: {
        A: number;
        B: number;
        C: number;
    };
    programs: number[];

    #outHandlers: ((a: number) => void)[] = [];

    constructor(data: VmInitalStateData) {
        this.pc = 0;
        this.registers = data.registers;
        this.programs = data.programs;
    }

    comboOperand(operand: number): number {
        if (operand < 4) {
            return operand;
        }
        switch (operand) {
            case 4:
                return this.registers["A"];
            case 5:
                return this.registers["B"];
            case 6:
                return this.registers["C"];
            default:
                throw new Error("Invalid operand");
        }
    }

    on(name: "out", cb: (a: number) => void): void {
        if (name === "out") {
            this.#outHandlers.push(cb);
        }
    }
    off(name: "out", cb: (a: number) => void): void {
        if (name === "out") {
            this.#outHandlers = this.#outHandlers.filter((x) => x !== cb);
        }
    }

    runSingleInstruction(): void {
        const opCode = this.programs[this.pc];
        const operand = this.programs[this.pc + 1];
        switch (opCode) {
            case 0: // adv : a register division
                {
                    const comboOperand = this.comboOperand(operand);
                    this.registers["A"] = dv(this.registers["A"], comboOperand);
                    this.pc += 2;
                }
                break;
            case 1: { // bxl : bitwise xor literal
                this.registers["B"] = this.registers["B"] ^ operand;
                this.pc += 2;
            }
            break;
            case 2: // bst : b register store
            {
                const comboOperand = this.comboOperand(operand);               
                this.registers["B"] = comboOperand % 8; // keep only 3 bits
                this.pc += 2;
            }
            break;
            case 3: // jnz : jump if not zero
            {
                if (this.registers["A"] !== 0) {
                    this.pc = operand;
                } else {
                    this.pc += 2;
                }
            }
            break;
            case 4: // bxc : bitwise xor register
            {
                // for legacy reasons, operand is ignored
                this.registers["B"] = this.registers["B"] ^ this.registers["C"];
                this.pc += 2;
            }
            break;
            case 5: // out : output
            {
                const comboOperand = this.comboOperand(operand) % 8;
                this.#outHandlers.forEach((cb) => cb(comboOperand));
                this.pc += 2;
            }
            break;
            case 6: // bdv : b register division
            {
                const comboOperand = this.comboOperand(operand);
                this.registers["B"] = dv(this.registers["A"], comboOperand);
                this.pc += 2;
            }
            break;
            case 7: // cdv : c register division
            {
                const comboOperand = this.comboOperand(operand);
                this.registers["C"] = dv(this.registers["A"], comboOperand);
                this.pc += 2;
            }
        }
    }
    run(): void {
        while (this.pc < this.programs.length) {
            this.runSingleInstruction();
        }
    }
}

if (import.meta.main) {
    const data = await readData("input.txt");
    console.log(data.registers);
    for (let i = 0; i < data.programs.length; i += 2) {
        const opCode = data.programs[i];
        const operand = data.programs[i + 1];
        console.log(opCodeToName(opCode), operandToName(operand));
    }
    const vm = new VM(data);
    const outputs: number[] = [];
    vm.on("out", (a) => {
        outputs.push(a);
    });
    vm.run();
    console.log(outputs.join(","));
}
