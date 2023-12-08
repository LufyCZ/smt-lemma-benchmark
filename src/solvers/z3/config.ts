import { Solver } from "z3-solver";

export const z3configs = {
  def: {},
  lia1: { "smt.arith.solver": 2, "smt.auto_config": false },
  lia2: {
    solve_eqs_max_occs: 4,
    "smt.arith.solver": 2,
    "smt.auto_config": false,
  },
  eq1: { solve_eqs_max_occs: 4 },
  eq2: {
    solve_eqs_max_occs: 4,
    context_solve: true,
  },
  arith1: { "smt.arith.solver": 6, "smt.auto_config": false },
  arith2: {
    "smt.arith.solver": 6,
    "smt.auto_config": false,
    solve_eqs_max_occs: 4,
  },
} as const;

export type Z3Config = keyof typeof z3configs;

export const setZ3Config = (solver: Solver, config: Z3Config) => {
  Object.entries(z3configs[config]).map(([key, value]) => {
    solver.set(key, value);
  });
};
