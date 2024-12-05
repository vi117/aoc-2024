import { Lexer } from "./lexer.ts";

const txt = await Deno.readTextFile("input.txt");

const lexer = new Lexer(txt);

type Expr = {
    type: "mul";
    left: number;
    right: number;
} | {
    type: "do";
} | {
    type: "don't";
}

function parseMulExpr(
    lexer: Lexer,
): Expr | null {
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

function parseDoExpr(
    lexer: Lexer,
): Expr | null {
    if (!lexer.match("do()")) {
        return null;
    }
    return {
        type: "do",
    };
}

function parseDontExpr(
    lexer: Lexer,
): Expr | null {
    if (!lexer.match("don't()")) {
        return null;
    }
    return {
        type: "don't",
    };
}

function parseExpr(
    lexer: Lexer,
): Expr | null {
    return parseDoExpr(lexer) ?? parseDontExpr(lexer) ?? parseMulExpr(lexer);
}

const exprs: Expr[] = [];
while (lexer.pos < lexer.str.length) {
    const expr = parseExpr(lexer);
    if (expr) {
        exprs.push(expr);
    }
    else {
        lexer.next();
    }
}

let sum = 0;
let enabled = true;
for (const expr of exprs) {
    if (expr.type === "do") {
        enabled = true;
    }
    else if (expr.type === "don't") {
        enabled = false;
    }
    else if (enabled && expr.type === "mul") {
        sum += expr.left * expr.right;
    }
}
console.log(sum);