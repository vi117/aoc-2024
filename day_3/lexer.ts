export class Lexer {
    str: string;
    pos: number;
    
    constructor(str: string) {
        this.str = str;
        this.pos = 0;
    }

    next(): string {
        return this.str[this.pos++];
    }
    peek(): string {
        return this.str[this.pos];
    }
    match(str: string): boolean {
        if (this.str.slice(this.pos, this.pos + str.length) === str) {
            this.pos += str.length;
            return true;
        }
        return false;
    }
    matchDigit(): string {
        if (/\d/.test(this.peek())) {
            return this.next();
        }
        return "";
    }
    skipN(n: number) {
        this.pos += n;
    }
    matchDigitN(min: number, max: number) {
        const originalPos = this.pos;
        let digits = "";
        for (let i = 0; i < min; i++) {
            if (!/\d/.test(this.peek())) {
                this.pos = originalPos;
                return false;
            }
            digits += this.next();
        }
        for (let i = 0; i < max - min; i++) {
            if (!/\d/.test(this.peek())) {
                break;
            }
            digits += this.next();
        }
        return digits;
    }
}