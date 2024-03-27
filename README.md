# contracts-angular-wdio

This project implements e2e tests for [contracts-angular](https://github.com/antonborisoff/contracts-angular).

## How to run e2e tests

1. Clone [contracts-angular](https://github.com/antonborisoff/contracts-angular) repo and start it (see its README)
2. Clone the repo
3. Run `npm install` in a new Git Bash terminal
4. Run `npm run wdio` in a new Git Bash terminal to run all e2e tests or `npm run wdio -- --spec ./test/specs/TARGET.spec.ts` to run ***TARGET*** spec
