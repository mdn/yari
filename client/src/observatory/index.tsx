import { Route, Routes } from "react-router-dom";
import useSWRMutation from "swr/mutation";
import useSWRImmutable from "swr/immutable";

import { OBSERVATORY_API_URL } from "../env";
import { PageNotFound } from "../page-not-found";

import ObservatoryLanding from "./landing";
import ObservatoryResults from "./results";
import { ObservatoryResult } from "./types";
import ObservatoryDocs from "./docs";

import "./index.scss";

export default function Observatory({ ...props }) {
  return (
    <div className="observatory">
      <Routes>
        <Route path="/" element={<ObservatoryLanding />} />
        <Route path="/analyze" element={<ObservatoryResults />} />
        <Route path="/docs/*" element={<ObservatoryDocs {...props} />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </div>
  );
}

export function useUpdateResult(host: string) {
  return useSWRMutation(
    host,
    async (key: string) => {
      const url = new URL(OBSERVATORY_API_URL + "/api/v2/analyze");
      url.searchParams.set("host", key);
      const res = await fetch(url, {
        method: "POST",
      });
      return await handleJsonResponse<ObservatoryResult>(res);
    },
    { populateCache: true, throwOnError: false }
  );
}

export function useResult(host?: string) {
  return useSWRImmutable(host, async (key) => {
    const url = new URL(OBSERVATORY_API_URL + "/api/v2/analyze");
    url.searchParams.set("host", key);
    const res = await fetch(url);
    return await handleJsonResponse<ObservatoryResult>(res);
  });
}

export async function handleJsonResponse<T>(res: Response): Promise<T> {
  if (!res.ok && res.status !== 429) {
    let message = `${res.status}: ${res.statusText}`;
    try {
      const data = await res.json();
      if (data.error) {
        message = data.message;
      }
    } finally {
      throw Error(message);
    }
  }
  return await res.json();
}
