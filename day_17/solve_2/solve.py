import z3

# function l(A: number,B: number, C: number, out: (o: number)=> void) {
#     do {
#     B = A & 7
#     B = B ^ 1
#     C = (A >> B) & 7
#     B = B ^ 5;
#     B = B ^ C;
#     out(B)
#     A = A >> 3;
#     }
#     while (A !== 0);
# }

def models(formula, max=10):
    solver = z3.Solver()
    solver.add(formula)
    for i in range(max):
        if solver.check() == z3.sat:
            model = solver.model()
            yield model
            solver.add(z3.Not(z3.And([d() == model[d] for d in model.decls()])))
        else:
            break

program = [2,4,1,1,7,5,1,5,0,3,4,4,5,5,3,0]

def main():
    solver = z3.Solver()
    # bitvector of length len(program) * 3
    orgA = z3.BitVec('A', len(program) * 3 + 2)

    A = orgA
    i = 0
    while i < len(program):
        B = A & 7
        B = B ^ 1
        C = (A >> B) & 7
        B = B ^ 5
        B = B ^ C
        A = A >> 3
        solver.add(B == program[i])
        i += 1
    
    # print(solver.sexpr())

    if solver.check() == z3.sat:
        lst = []
        for model in models(solver.assertions(), max=999):
            lst.append(model[orgA].as_long())
        lst.sort()
        print(lst)
    else:
        print("unsat")

if __name__ == "__main__":
    main()
