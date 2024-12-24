export type Operation =
    'and' |
    'or' |
    'xor';

export type BitValue = 0 | 1;

export type InputData = {
    inputs: {
        name: string,
        value: BitValue
    }[],

    gates: {
        lhs: string,
        rhs: string,
        operation: Operation,
        result: string,
    }[]
};

export async function readData(path: string): Promise<InputData> {
    const text = await Deno.readTextFile(path);
    const [
        inputsText,
        gatesText
    ] = text.replaceAll("\r", "").trim().split('\n\n');

    const inputs = inputsText.split('\n').map(x => {
        const [name, value] = x.split(':');
        return {
            name: name.trim(),
            value: value.trim() === '1' ? 1 : 0 as BitValue
        };
    });

    const r = /(\w+) (\w+) (\w+) -> (\w+)/;
    const gates = gatesText.split('\n').map(x => {
        const [_, lhs, operation, rhs, result] = x.match(r)!;
        return {
            lhs,
            operation: operation.toLowerCase() as Operation,
            rhs,
            result
        };
    });

    return {
        inputs,
        gates
    };
}

export function and(lhs: BitValue, rhs: BitValue): BitValue {
    return (lhs & rhs) as BitValue;
}

export function or(lhs: BitValue, rhs: BitValue): BitValue {
    return (lhs | rhs) as BitValue;
}

export function xor(lhs: BitValue, rhs: BitValue): BitValue {
    return (lhs ^ rhs) as BitValue;
}

export function opGate(lhs: BitValue, rhs: BitValue, operation: Operation): BitValue {
    switch (operation) {
        case 'and': return and(lhs, rhs);
        case 'or': return or(lhs, rhs);
        case 'xor': return xor(lhs, rhs);
    }
}

export class Executer {
    private inputs: Map<string, BitValue> = new Map();
    private gates: InputData['gates'];
    private results: Map<string, BitValue> = new Map();


    constructor(data: InputData) {
        this.gates = data.gates;
        for (const input of data.inputs) {
            this.inputs.set(input.name, input.value);
        }
    }

    execute(name: string): BitValue {
        if (this.inputs.has(name)) {
            return this.inputs.get(name)!;
        }
        if (this.results.has(name)) {
            return this.results.get(name)!;
        }
        const gate = this.gates.find(x => x.result === name);
        if (!gate) {
            throw new Error(`Gate ${name} not found`);
        }
        const lhs = this.execute(gate.lhs);
        const rhs = this.execute(gate.rhs);
        const result = opGate(lhs, rhs, gate.operation);
        this.results.set(name, result);
        return result;
    }
}

if (import.meta.main) {
    const data = await readData('input.txt');
    console.log(data);
    const executer = new Executer(data);

    const zs = data.gates.filter(gate => gate.result.startsWith("z"))
        .map(gate => gate.result);
    zs.sort();
    console.log(zs);
    let r = 0n;
    let i = 0;
    for (const z of zs) {
        const result = await executer.execute(z);
        const digit = BigInt(result) << BigInt(i++);
        r = r | digit;
    }
    console.log(r);
}