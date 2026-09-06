require("ts-node").register({
  transpileOnly: true,
  compilerOptions: { module: "commonjs", moduleResolution: "node" },
});
require("./timer.test.ts");
require("./prompt.test.ts");
require("./provider-config.test.ts");
require("./interview-turn.test.ts");
require("./sourcing.test.ts");
console.log("All tests: OK");
