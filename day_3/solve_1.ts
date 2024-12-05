import { Lexer } from "./lexer.ts";

const txt = await Deno.readTextFile("input.txt");


const lexer = new Lexer(txt);

function parseMulExpr(
    lexer: Lexer,
){
    if (!lexer.match("mul(")) {
        return null;
    }
    const left = lexer.matchDigitN(1,3);
    if (!left) {
        return null;
    }
    if (!lexer.match(",")) {
        return null;
    }
    const right = lexer.matchDigitN(1,3);
    if (!right) {
        return null;
    }
    if (!lexer.match(")")) {
        return null;
    }
    return {
        type: "mul",
        left: parseInt(left),
        right: parseInt(right),
    };
}

const exprs: {
    type: string;
    left: number;
    right: number;
}[] = [];
while (lexer.pos < lexer.str.length) {
    const expr = parseMulExpr(lexer);
    if (expr) {
        exprs.push(expr);
    }
    else {
        lexer.next();
    }
}

let sum = 0;
for (const expr of exprs) {
    sum += expr.left * expr.right;
}
console.log(sum);