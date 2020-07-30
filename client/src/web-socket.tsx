import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import Sockette from "sockette";

type MessageHandler = (message: {
  type: string;
  [key: string]: any;
}) => unknown;

type Status = "disconnected" | "connected" | "error";

const WSSContext = createContext<{
  register: (MessageHandler) => void;
  status: Status;
}>({ register() {}, status: "disconnected" });

export default function WSSProvider({ children }) {
  const [status, setStatus] = useState<Status>("disconnected");
  const callbacks = useRef(new Set<MessageHandler>());

  useEffect(() => {
    const wss = new Sockette("ws://localhost:8080", {
      onopen(e) {
        setStatus("connected");
      },
      onmessage(event) {
        let data;
        try {
          data = JSON.parse(event.data);
        } catch (error) {
          console.error("Error while JSON parsing websocket message", error);
          return;
        }
        for (const callback of callbacks.current) {
          callback(data);
        }
      },
      onclose() {
        setStatus("disconnected");
      },
      onerror(error) {
        setStatus("error");
        console.error("WebSocket error", error);
      },
    });

    return () => {
      wss.close();
    };
  }, []);

  return (
    <WSSContext.Provider
      value={{
        register(callback) {
          callbacks.current.add(callback);
          return () => {
            callbacks.current.delete(callback);
          };
        },
        status,
      }}
    >
      {children}
    </WSSContext.Provider>
  );
}

export function useWebSocketMessageHandler(callback: MessageHandler) {
  const { register, status } = useContext(WSSContext);

  useEffect(() => register(callback), [callback, register]);

  return { status };
}
