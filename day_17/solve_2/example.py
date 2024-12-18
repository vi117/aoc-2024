import z3

# label0: A = (A >> 3);
# label0: out(A % 8);
# label0: if (A !== 0) goto label0;

# available A 117440: 0b11100101011000000

program = [0,3,5,4,3,0]
# program = [3]

def main():
    solver = z3.Solver()
    # bitvector of length len(program) * 3
    A = z3.BitVec('A', len(program) * 3 + 3)

    i = 0
    loopA = A
    while i < len(program):
        AShift = loopA >> 3
        AMask = AShift & 7
        solver.add(AMask == program[i])
        loopA = AShift
        i += 1
    
    # print(solver.sexpr())

    if solver.check() == z3.sat:
        model = solver.model()
        print(model)
    else:
        print("unsat")


def test():
    solver = z3.Solver()
    A = z3.BitVec('A', 5)  # 3비트 비트벡터로 'A' 선언
    A = A >> 1       # A를 오른쪽으로 1비트 시프트한 결과를 새로운 변수에 저장
    A = A & 7  # 시프트 결과를 7(0b111)로 마스크
    solver.add(A == 3)  # 최종적으로 MaskedA가 3이어야 한다는 제약 추가

    print(solver.sexpr())  # 제약을 SMT-LIB2 형식으로 출력
    print(solver.check())  # SAT 여부 확인
    if solver.check() == z3.sat:
        print(solver.model())  # 모델 출력

if __name__ == "__main__":
    test()
    main()