import Module from "module";

const originalRequire = Module.prototype.require;

Module.prototype.require = function (fileName, ...args) {
  if (["scss", "css"].some((extension) => fileName.endsWith(extension))) {
    return;
  }
  return originalRequire.apply(this, [fileName, ...args]);
};
