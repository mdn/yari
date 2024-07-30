declare namespace Express {
  interface Request {
    startServerTiming: (id: string) => void;
    endServerTiming: (id: string) => void;
  }
}
