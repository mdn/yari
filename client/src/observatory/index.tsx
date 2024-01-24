import { Route, Routes } from "react-router-dom";
import ObservatoryLanding from "./landing";
import ObservatoryResults from "./results";
import useSWRMutation from "swr/mutation";

import "./index.scss";
import { ObservatoryResult } from "./types";
import useSWRImmutable from "swr/immutable";
import { OBSERVATORY_API_URL } from "../env";

export default function Observatory() {
  return (
    <div className="observatory">
      <Routes>
        <Route path="/" element={<ObservatoryLanding />} />
        <Route path="/:host" element={<ObservatoryResults />} />
      </Routes>
    </div>
  );
}

export function useUpdateResult(host: string) {
  return useSWRMutation(
    host,
    async (key: string, { arg }: { arg: boolean }) => {
      const url = new URL(OBSERVATORY_API_URL + "/api/v2/analyze");
      url.searchParams.set("host", key);
      const formData = new FormData();
      if (arg) formData.set("hidden", String(arg));
      const res = await fetch(url, {
        method: "POST",
        body: formData,
      });
      return await handleResponse(res);
    },
    { populateCache: true, throwOnError: false }
  );
}

export function useResult(host?: string) {
  return useSWRImmutable(host, async (key) => {
    const url = new URL(OBSERVATORY_API_URL + "/api/v2/analyze");
    url.searchParams.set("host", key);
    const res = await fetch(url);
    return await handleResponse(res);
  });
}

async function handleResponse(res: Response): Promise<ObservatoryResult> {
  if (!res.ok && res.status !== 429) {
    let message = `${res.status}: ${res.statusText}`;
    try {
      const data = await res.json();
      if (data.error) {
        message = data.text;
      }
    } finally {
      throw Error(message);
    }
  }
  return await res.json();
}
