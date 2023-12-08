## Requirements
- `pnpm`
- `z3`, `cvc5` and `benchexec` in your PATH

## Quickstart
- `pnpm i`
- `pnpm run run`

## Custom benchmarks
Check out the `benchmarks/example` directory, it'll include a `config.ts` file and a `stock` directory.
The config file determines how the lemmas are generated, processed, how the benchmark runs etc.
The stock directory contains two folders - `lia` and `nia`, both of which contain `.smt2` files.

To create a custom benchmark, duplicate the example dir and adjust the config to your liking and copy your stock formulas into the `stock` folder.
Then, import your `config.ts` in `src/setup.ts` and replace the contents of the `configs` array with the imported config.

Only remaining thing is now to run the tool with the command from the Quickstart section.
