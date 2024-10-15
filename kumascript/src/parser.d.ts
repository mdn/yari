interface Position {
  offset: number;
  line: number;
  column: number;
}
interface Location {
  start: Position;
  end: Position;
}

interface TextToken {
  type: "TEXT";
  chars: string;
}
interface MacroToken {
  type: "MACRO";
  name: string;
  args: unknown[];
  location: Location;
}

type Token = TextToken | MacroToken;

export const SyntaxError: (
  message: string,
  expected: string | null,
  found: string | null,
  location: Location | null
) => void;
export const parse: (input: string, options?: unknown) => Token[];
