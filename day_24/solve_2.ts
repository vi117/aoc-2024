import { BitValue, Executer, InputData, readData } from "./solve_1.ts";
import { red, green } from "jsr:@std/fmt/colors";

// export function dependencies(data: InputData): Map<string, Set<string>> {
//     const deps = new Map<string, Set<string>>();
//     for (const gate of data.gates) {
//         // check visited.
//         // if visited, skip
//         if (deps.has(gate.result)) {
//             continue;
//         }
//         const stack = [gate.result];
//         while (stack.length > 0) {
//             const current = stack.pop()!;
//             const node = data.gates.find(x => x.result === current)!;
//             stack.push(node.lhs);
//             stack.push(node.rhs);

//         }
//     }
// }

function swapResult(data: InputData, a: string, b: string) {
    data.gates.forEach(gate => {
        if (gate.result === a) {
            gate.result = b;
        }
        else if (gate.result === b) {
            gate.result = a;
        }
    });
}

function drawMermaidGraph(data: InputData, options: { print?: (str: string) => void } = {
    print: console.log
}) {
    const print = options.print ?? console.log;
    print("graph TD");
    data.inputs.forEach(x => print(`    ${x.name}(${x.name} ${x.value})`));
    data.gates.forEach(gate => {
        print(`    ${gate.lhs} -->|${gate.operation}| ${gate.result}`);
        print(`    ${gate.rhs} -->|${gate.operation}| ${gate.result}`);
    });
}

function renameGates(data: InputData, from: string, to: string) {
    data.gates.forEach(gate => {
        if (gate.lhs === from) {
            gate.lhs = to;
        }
        if (gate.rhs === from) {
            gate.rhs = to;
        }
        if (gate.result === from) {
            gate.result = to;
        }
    });
}

function renameForAddOperation(data: InputData): InputData {
    const newData = {
        inputs: data.inputs,
        gates: data.gates.map(gate => ({ ...gate }))
    };
    const isRenamed = (name: string) => {
        return name.length !== 3;
    }
    const renameGate = (from: string, to: string) => {
        if (isRenamed(from)) {
            return;
        }
        renameGates(newData, from, to);
    }

    for (let i = 0; i < newData.gates.length; i++) {
        const gate = newData.gates[i];
        const lhs = /(x|y)(\d+)/.exec(gate.lhs);
        const rhs = /(x|y)(\d+)/.exec(gate.rhs);
        if (lhs && rhs
            && lhs[1] != rhs[1]
            && lhs[2] === rhs[2]) {
            if (gate.operation === "and") {
                const newName = `CarryHalf${lhs[2]}_${gate.result}`;
                renameGate(gate.result, newName);
            }
            else if (gate.operation === "xor") {
                const newName = `SumHalf${lhs[2]}_${gate.result}`;
                renameGate(gate.result, newName);
            }
        }
    }
    for (let loop = 0; loop < newData.gates.length * 40; loop++) {

        for (let i = 0; i < newData.gates.length; i++) {
            const gate = newData.gates[i];
            const lhs = /(Carry|Sum)/.exec(gate.lhs);
            const rhs = /(Carry|Sum)/.exec(gate.rhs);
            if (lhs && rhs
                && lhs[1] != rhs[1]) {
                if (gate.operation === "and") {
                    // C_in and (A xor B) + A and B = C_out
                    const newName = `ProgressCarryFull_${gate.result}`;
                    renameGate(gate.result, newName);
                }
            }
        }

        for (let i = 0; i < newData.gates.length; i++) {
            const gate = newData.gates[i];
            const lhs = /(ProgressCarryFull|CarryHalf)/.exec(gate.lhs);
            const rhs = /(ProgressCarryFull|CarryHalf)/.exec(gate.rhs);
            if (lhs && rhs
                && lhs[1] != rhs[1]) {
                if (gate.operation === "or") {
                    const newName = `CarryFull_${gate.result}`;
                    renameGate(gate.result, newName);
                }
            }
        }

        for (let i = 0; i < newData.gates.length; i++) {
            const gate = newData.gates[i];
            const lhs = /(CarryFull|SumHalf)/.exec(gate.lhs);
            const rhs = /(CarryFull|SumHalf)/.exec(gate.rhs);
            if (lhs && rhs
                && lhs[1] !== rhs[1]) {
                if (gate.operation === "xor") {
                    const newName = `SumFull_${gate.result}`;
                    renameGate(gate.result, newName);
                }
            }
        }

    }

    return newData;
}

function getXvalue(data: InputData): number {
    return data.inputs.filter(x => x.name.startsWith('x'))
        .toSorted((a, b) => b.name.localeCompare(a.name))
        .map(x => x.value)
        .reduce<number>((acc, val) => acc * 2 + val, 0);
}

function getYvalue(data: InputData): number {
    return data.inputs.filter(x => x.name.startsWith('y'))
        .toSorted((a, b) => b.name.localeCompare(a.name))
        .map(x => {
            return x.value
        })
        .reduce<number>((acc, val) => acc * 2 + val, 0);
}

function setInputs(data: InputData, x: number, y: number) {
    const len = data.inputs.filter(x => x.name.startsWith('x')).length;
    const xBits = x.toString(2).padStart(len, '0').split('').map(x => parseInt(x));
    const yBits = y.toString(2).padStart(len, '0').split('').map(x => parseInt(x));
    data.inputs.forEach(v => {
        const r = /(\w)(\d+)/.exec(v.name);
        if (r && r[1] === 'x') {
            v.value = xBits[len - 1 - parseInt(r[2])] as BitValue;
        }
        if (r && r[1] === 'y') {
            v.value = yBits[len - 1 - parseInt(r[2])] as BitValue;
        }
    });
}

if (import.meta.main) {
    const data = await readData('input.txt');
    
    swapResult(data, 'cmv', 'z17');
    swapResult(data, 'rmj', 'z23');
    swapResult(data, 'rdg', 'z30');
    swapResult(data, 'btb', 'mwp');

    const errorBitIndex = [];
    const len = data.inputs.filter(x => x.name.startsWith('x')).length;
    for (let i = 0; i < len; i++) {
        // 0 1 check add
        // 1 1 check carry
        for (const c of [[0,1],[1,1]]) {
            const x = c[0] * 2 ** i;
            const y = c[1] * 2 ** i;
            setInputs(data, x, y);
            const xVal = getXvalue(data);
            const yVal = getYvalue(data);
            const desiredZvalue = xVal + yVal;
            console.log(xVal, yVal, desiredZvalue);
            const zNames = data.gates.filter(gate => gate.result.startsWith("z"))
                .map(gate => gate.result)
                .toSorted((a, b) => a.localeCompare(b));
            const desiredZvalueBits = desiredZvalue.toString(2).padStart(zNames.length, '0').split('').toReversed().map(x => parseInt(x));
            const executer = new Executer(data);
            const actualZValues = zNames.map(name => executer.execute(name))
            let str = '';
            let diff = false;
            for (let i = zNames.length - 1; i >= 0; i--) {
                const actual = actualZValues[i];
                const desired = desiredZvalueBits[i];
                diff ||= actual !== desired;                
                str += actual === desired ? green(actual.toString()) : red(actual.toString());
            }
            if (diff) {
                errorBitIndex.push(i);
            }
            console.log(i, c);
            console.log("",x.toString(2).padStart(len, '0'));
            console.log("",y.toString(2).padStart(len, '0'));
            console.log(str);
        }
    }
    console.log(errorBitIndex);


    // const xVal = getXvalue(data);
    // const yVal = getYvalue(data);
    // console.log(yVal, yVal.toString(2));
    // const desiredZvalue = xVal + yVal;
    // // console.log(xVal + yVal);
    // // console.log(desiredZvalueBits);
    
    // const zNames = data.gates.filter(gate => gate.result.startsWith("z"))
    // .map(gate => gate.result)
    // .toSorted((a, b) => a.localeCompare(b));
    // const desiredZvalueBits = desiredZvalue.toString(2).padStart(zNames.length, '0').split('');
    // const executer = new Executer(data);
    // const actualZValues = zNames.map(name => executer.execute(name)).toReversed()
    // // console.log(actualZValues);
    
    // console.log("actual\t",actualZValues.join(''));
    // console.log("desired\t",desiredZvalueBits.join(''));
    // // print differences
    // let str = '';
    // for (let i = 0; i < zNames.length; i++) {
    //     const actual = actualZValues[i].toString();
    //     const desired = desiredZvalueBits[i];
    //     str += actual === desired ? green(actual.toString()) : red(actual.toString());
    // }
    // console.log("difference",str);
    
    const file = Deno.openSync('graph.log', { write: true, create: true, truncate: false });
    drawMermaidGraph(data, { print: (str) =>{
        file.writeSync(new TextEncoder().encode(str + '\n'));
    } });
    file.close();
    const renamed = renameForAddOperation(data);
    const file2 = Deno.openSync('graph2.log', { write: true, create: true, truncate: false });
    drawMermaidGraph(renamed, { print: (str) =>{
        file2.writeSync(new TextEncoder().encode(str + '\n'));
    } });
    file2.close();

    const solve = ['cmv', 'z17',
'rmj', 'z23',
'rdg', 'z30',
'btb', 'mwp'].sort();
    console.log(solve.join(","));
}