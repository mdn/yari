import { GradeDistribution, ObservatoryResult } from "../types";
import { formatMinus } from "../utils";
import "./index.scss";

export default function GradeSVG({
  gradeDistribution,
  result,
}: {
  gradeDistribution: GradeDistribution[];
  result: ObservatoryResult;
}) {
  const width = 1200;
  const height = 380;
  const leftSpace = 100; // left edge to left edge of first bar
  const rightSpace = 80; // right edge to tight edge of last bar
  const bottomSpace = 60; // bottom edge to bottom edge of bars
  const topSpace = 60; // top padding
  const itemCount = gradeDistribution.length;
  const barWidth = 60;

  // The x-axis has the different grades from "A+" to "D-".
  const xTickIncr =
    (width - leftSpace - rightSpace - barWidth) / (itemCount - 1);
  const xTickOffset = leftSpace + xTickIncr / 2;

  // The y-axis has ticks according to the maximum value of all grades.
  const yMarks = calculateTicks(gradeDistribution);
  const yTickOffset = height - bottomSpace;
  const yTickIncr = (height - bottomSpace - topSpace) / (yMarks.length - 1);
  const yTickMax = Math.max(...yMarks);

  return (
    <>
      <table id="grade-svg-a11y-table" className="visually-hidden">
        <caption>Number of sites by grade</caption>
        <thead>
          <tr>
            <th scope="col">Grade</th>
            <th scope="col">Sites</th>
          </tr>
        </thead>
        <tbody>
          {gradeDistribution.map((item, index) => (
            <tr key={`grade-svg-a11y-table-row-${index}`}>
              <th>
                {formatMinus(item.grade)}
                {item.grade === result.scan.grade ? " (Current grade)" : ""}
              </th>
              <td>{item.count} sites</td>
            </tr>
          ))}
        </tbody>
      </table>
      <svg
        className="chart"
        viewBox="0 0 1200 380"
        aria-labelledby="grade-svg-title"
        aria-describedby="grade-svg-a11y-table"
      >
        <title id="grade-svg-title">Number of sites by grade</title>
        <g className="axes-g">
          <g
            className="x-axis"
            transform={`translate(${xTickOffset}, ${height - bottomSpace})`}
          >
            {gradeDistribution.map((item, index) => (
              <g // x-axis labels
                key={`tick-x-${index}`}
                className="tick tick-x"
                transform={`translate(${index * xTickIncr}, 0)`}
              >
                <text
                  fill="currentColor"
                  y="6"
                  dy="1em"
                  className={[
                    "x-labels",
                    item.grade === result.scan.grade // highlight the current grade
                      ? `current grade-${item.grade[0].toLowerCase()}`
                      : undefined,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {formatMinus(item.grade)}
                </text>
              </g>
            ))}
          </g>
          <g>
            {gradeDistribution.map((item, index) => {
              // draw the individual grade bars
              const barHeight =
                (height - bottomSpace - topSpace) * (item.count / yTickMax);
              return (
                <rect
                  key={`bar-${index}`}
                  className={`bar grade-${item.grade.replace(/[+-]/, "").toLowerCase()} ${item.grade === result.scan.grade ? "current-grade" : ""}`}
                  x={xTickOffset + index * xTickIncr - barWidth / 2}
                  y={yTickOffset - barHeight - 1} // do not overlap the y-axis dashed lines
                  rx="4"
                  ry="4"
                  width={barWidth}
                  height={barHeight}
                ></rect>
              );
            })}
          </g>
          <g
            className="y-axis"
            fill="none"
            textAnchor="end"
            transform={`translate(${leftSpace}, 0)`}
          >
            {yMarks.map((item, index) => (
              <g
                key={`tick-y-${index}`}
                className="tick tick-y"
                transform={`translate(0, ${yTickOffset - yTickIncr * index})`}
              >
                <line
                  stroke="currentColor"
                  x2={width - leftSpace - rightSpace + barWidth / 2}
                ></line>
                <text
                  className="y-labels"
                  fill="currentColor"
                  x="-25"
                  dy="0.32em"
                >
                  {/* format as kilo-sites, which works well for our current and future ranges below 10^6*/}
                  {item / 1000}k
                </text>
              </g>
            ))}
          </g>
        </g>
        <g>
          {gradeDistribution.map((item, index) => {
            // Draw the "This website is here" marker. Drawn explicitly last so it is above all other elements in the drawing.
            if (item.grade === result.scan.grade) {
              const barHeight =
                (height - bottomSpace - topSpace) * (item.count / yTickMax);
              return (
                <g
                  key="you-are-here"
                  className="you-are-here"
                  transform={`translate(${xTickOffset + index * xTickIncr}, ${height - bottomSpace - barHeight - 50})`}
                >
                  <polyline points="-60,0 60,0 60,36 7,36 0,48 -7,36 -60,36"></polyline>
                  <text
                    x="0"
                    y="0"
                    textAnchor="middle"
                    transform="translate(0, 24)"
                  >
                    Current grade
                  </text>
                </g>
              );
            } else {
              return [];
            }
          })}
        </g>
      </svg>
    </>
  );
}

/**
 * Calculate
 * @param {GradeDistribution[]} gradeDistribution
 * @returns {number[]}
 */
function calculateTicks(gradeDistribution: GradeDistribution[]): number[] {
  const maxValue = Math.max(...gradeDistribution.map((item) => item.count));
  const tickTargetCount = 7; // Target number of ticks between 5 and 10
  const range = rangeForValue(maxValue, false); // Get a nice range
  const tickInterval = rangeForValue(range / tickTargetCount, true); // Determine a nice tick interval
  const niceMaxValue = Math.ceil(maxValue / tickInterval) * tickInterval; // Adjust max value to a nice number
  const tickCount = Math.ceil(niceMaxValue / tickInterval) + 1; // Calculate the number of ticks

  const ticks: number[] = [];
  for (let i = 0; i < tickCount; i++) {
    ticks.push(i * tickInterval);
  }
  return ticks;
}

/**
 * This returns values to construct proper axis measurements in
 * diagrams. The returned value is 1|2|5 * 10^x.
 *
 * If `round` is `true`, the returned value can be also rounded down,
 * useful for calculating ticks on an axis.
 *
 * Examples:
 *
 *  |range    |rounded=false|rounded=true|
 *  |---------|-------------|------------|
 *  |  1      |  1          |  1         |
 *  |  2      |  2          |  2         |
 *  |  3      |  5          |  5         |
 *  |  4      |  5          |  5         |
 *  |  5      |  5          |  5         |
 *  |  6      |  10         |  5         |
 *  |  7      |  10         |  10        |
 *  |  8      |  10         |  10        |
 *  |  9      |  10         |  10        |
 *  |  10     |  10         |  10        |
 *  |  34     |  50         |  50        |
 *  |  450    |  500        |  500       |
 *  |  560    |  1000       |  500       |
 *  |  6780   |  10000      |  5000      |
 *  |  10     |  10         |  10        |
 *  |  100    |  100        |  100       |
 *  |  1000   |  1000       |  1000      |
 *  |  10000  |  10000      |  10000     |
 *
 * @param {number} range The input value
 * @param {boolean} round If false, the returned value will always be greater than `range`, otherwise it can be rounded off
 * @returns {number} a number according to `1|2|5 * 10^x`, where x is derived from `range` to be in the same order of magnitude
 */

function rangeForValue(range: number, round: boolean): number {
  const exponent = Math.floor(Math.log10(range));
  const fraction = range / Math.pow(10, exponent);

  let niceFraction: number;
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
