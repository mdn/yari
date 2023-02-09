import chalk from "chalk";
import type { Action, ActionParameters } from "types";

export function tryOrExit<T extends ActionParameters>(
  f: ({ options, ...args }: T) => unknown
): Action {
  return async ({ options = {}, ...args }: ActionParameters) => {
    try {
      await f({ options, ...args } as T);
    } catch (e) {
      const error = e as Error;
      if (options.verbose || options.v) {
        console.error(chalk.red(error.stack));
      }
      throw error;
    }
  };
}
