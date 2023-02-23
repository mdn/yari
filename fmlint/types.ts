import { ActionParameters } from "@caporal/core";

export interface FMLintArgsAndOptions extends ActionParameters {
  args: {
    files?: string[];
  };
  options: {
    cwd?: string;
    fix?: boolean;
    schemaPath?: string;
  };
}

export interface LinterOptions {
  cwd?: string;
  fix?: boolean;
  schemaPath?: string;
  config?: FMConfig;
  validators?: any;
}

export interface FMConfig {
  lineWidth: number;
  schema: object;
  allowedPageTypes: object;
}

export interface ValidationError {
  message: string;
  context: any;
}
