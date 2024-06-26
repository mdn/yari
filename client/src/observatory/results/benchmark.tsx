import useSWRImmutable from "swr/immutable";

import { Loading } from "../../ui/atoms/loading";
import NoteCard from "../../ui/molecules/notecards";

import { GradeDistribution, ObservatoryResult } from "../types";
import { OBSERVATORY_API_URL } from "../../env";
import GradeSVG from "../benchmark-chart";
import { handleJsonResponse } from "../utils";

export function useGradeDistribution(grade: string | null | undefined) {
  return useSWRImmutable("gradeDistribution", async () => {
    const url = new URL(OBSERVATORY_API_URL + "/api/v2/grade_distribution");
    const res = await fetch(url);
    return await handleJsonResponse<GradeDistribution[]>(res);
  });
}

export async function handleGradeDistributionResponse(
  res: Response
): Promise<GradeDistribution[]> {
  if (!res.ok) {
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

export default function ObservatoryBenchmark({
  result,
}: {
  result: ObservatoryResult;
}) {
  const {
    data: gradeDistribution,
    isLoading,
    error,
  } = useGradeDistribution(result.scan.grade);
  const hasData = !!gradeDistribution;

  return hasData ? (
    <>
      <h2>Performance trends from the past year</h2>
      {
        <GradeSVG
          gradeDistribution={gradeDistribution.slice(
            0,
            gradeDistribution.length - 1 // do not display "F" grades
          )}
          result={result}
        ></GradeSVG>
      }
      <p>
        Refer to this graph to assess the website's current status. By following
        the recommendations provided and rescanning, you can expect an
        improvement in the website's grade.
      </p>
    </>
  ) : isLoading ? (
    <Loading />
  ) : (
    <NoteCard type="error">
      <h4>Error</h4>
      <p>{error ? error.message : "An error occurred."}</p>
    </NoteCard>
  );
}
