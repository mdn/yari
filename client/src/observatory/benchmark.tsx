import { GradeDistribution, ObservatoryResult } from "./types";
import useSWRImmutable from "swr/immutable";
import { OBSERVATORY_API_URL } from "../env";
import { Loading } from "../ui/atoms/loading";
import NoteCard from "../ui/molecules/notecards";

export function useGradeDistribution(grade: string | null | undefined) {
  return useSWRImmutable(`gradeDistribution-${grade}`, async (key) => {
    const url = new URL(OBSERVATORY_API_URL + "/api/v2/grade_distribution");
    const res = await fetch(url);
    return await handleGradeDistributionResponse(res);
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

function niceNumber(range: number, round: boolean): number {
  const exponent = Math.floor(Math.log10(range));
  const fraction = range / Math.pow(10, exponent);

  let niceFraction;
  if (round) {
    if (fraction < 1.5) {
      niceFraction = 1;
    } else if (fraction < 3) {
      niceFraction = 2;
    } else if (fraction < 7) {
      niceFraction = 5;
    } else {
      niceFraction = 10;
    }
  } else {
    if (fraction <= 1) {
      niceFraction = 1;
    } else if (fraction <= 2) {
      niceFraction = 2;
    } else if (fraction <= 5) {
      niceFraction = 5;
    } else {
      niceFraction = 10;
    }
  }
  return niceFraction * Math.pow(10, exponent);
}

function calculateTicks(gradeDistribution: GradeDistribution[]): number[] {
  const maxValue = Math.max(...gradeDistribution.map((item) => item.count));
  const tickTargetCount = 7; // Target number of ticks between 5 and 10
  const range = niceNumber(maxValue, false); // Get a nice range
  const tickInterval = niceNumber(range / tickTargetCount, true); // Determine a nice tick interval
  const niceMaxValue = Math.ceil(maxValue / tickInterval) * tickInterval; // Adjust max value to a nice number
  const tickCount = Math.ceil(niceMaxValue / tickInterval) + 1; // Calculate the number of ticks

  const ticks: number[] = [];
  for (let i = 0; i < tickCount; i++) {
    ticks.push(i * tickInterval);
  }
  return ticks;
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

  return (
    <section className="tab-content">
      <figure className="scroll-container">
        {hasData ? (
          <>
            <h2>Performance trends from the past year</h2>
            {
              <GradeSVG
                gradeDistribution={gradeDistribution.slice(
                  0,
                  gradeDistribution.length - 1
                )}
                result={result}
              ></GradeSVG>
            }
            <p>
              Refer to this graph to assess the website's current status. By
              following the recommendations provided and rescanning, you can
              expect an improvement in the website's grade.
            </p>
          </>
        ) : isLoading ? (
          <Loading />
        ) : (
          <NoteCard type="error">
            <h4>Error</h4>
            <p>{error ? error.message : "An error occurred."}</p>
          </NoteCard>
        )}
      </figure>
    </section>
  );
}

function GradeSVG({
  gradeDistribution,
  result,
}: {
  gradeDistribution: GradeDistribution[];
  result: ObservatoryResult;
}) {
  const width = 1200;
  const height = 380;
  const leftSpace = 100;
  const rightSpace = 80;
  const bottomSpace = 60;
  const topSpace = 60;
  const itemCount = gradeDistribution.length;
  const xTickOffset = (width - leftSpace) / itemCount / 2;
  const xTickIncr = (width - leftSpace - rightSpace - 24) / (itemCount - 1);
  const yMarks = calculateTicks(gradeDistribution);
  const yTickOffset = height - bottomSpace;
  const yTickIncr = (height - bottomSpace - topSpace) / (yMarks.length - 1);
  const yTickMax = Math.max(...yMarks);

  return (
    <svg className="chart" viewBox="0 0 1200 380">
      <g className="axes-g">
        <g
          className="x-axis"
          transform={`translate(${leftSpace}, ${height - bottomSpace})`}
        >
          {gradeDistribution.map((item, index) => {
            return (
              <g
                className="tick tick-x"
                transform={`translate(${xTickOffset / 3 + index * xTickIncr}, 0)`}
              >
                <text fill="currentColor" y="6" dy="1em" className="x-labels">
                  {item.grade}
                </text>
              </g>
            );
          })}
        </g>
        <g
          className="y-axis"
          fill="none"
          text-anchor="end"
          transform={`translate(${leftSpace}, 0)`}
        >
          {yMarks.map((item, index) => {
            return (
              <g
                className="tick tick-y"
                transform={`translate(0, ${yTickOffset - yTickIncr * index})`}
              >
                <line
                  stroke="currentColor"
                  x2={width - leftSpace - rightSpace}
                ></line>
                <text
                  className="y-labels"
                  fill="currentColor"
                  x="-25"
                  dy="0.32em"
                >
                  {item / 1000}k
                </text>
              </g>
            );
          })}
        </g>
      </g>
      <g transform={`translate(${leftSpace}, 0)`}>
        {gradeDistribution.map((item, index) => {
          const barHeight =
            (height - bottomSpace - topSpace) * (item.count / yTickMax);
          return (
            <rect
              className={`bar grade-${item.grade.replace(/[+-]/, "").toLowerCase()} ${item.grade === result.scan.grade ? "current-grade" : ""}`}
              x={xTickOffset / 2 + index * xTickIncr - xTickIncr / 4}
              y={yTickOffset - barHeight}
              width={xTickOffset / 2}
              height={barHeight}
            ></rect>
          );
        })}

        {gradeDistribution.map((item, index) => {
          if (item.grade === result.scan.grade) {
            const barHeight =
              (height - bottomSpace - topSpace) * (item.count / yTickMax);
            return (
              <g
                className="you-are-here"
                transform={`translate(${xTickOffset / 2 + index * xTickIncr - xTickIncr / 8}, ${height - bottomSpace - barHeight - 50})`}
              >
                <polyline points="-80,0 80,0 80,36 7,36 0,48 -7,36 -80,36"></polyline>
                <text
                  x="0"
                  y="0"
                  textAnchor="middle"
                  transform="translate(0, 24)"
                >
                  This website is here
                </text>
              </g>
            );
          } else {
            return [];
          }
        })}
      </g>
    </svg>
  );
}
