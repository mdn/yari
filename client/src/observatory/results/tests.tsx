import { useMemo } from "react";
import { ObservatoryResult, SORTED_TEST_NAMES } from "../types";
import { formatMinus, Link, PassIcon } from "../utils";

export function ObservatoryTests({ result }: { result: ObservatoryResult }) {
  const showFootnote = useMemo(() => {
    return (
      (result.scan.score || 0) <= 90 &&
      Object.entries(result.tests).find(([_n, t]) => t.score_modifier > 0)
    );
  }, [result]);

  return Object.keys(result.tests).length !== 0 ? (
    <>
      <table className="tests">
        <thead>
          <tr>
            <th>Test</th>
            <th>Score</th>
            <th>Reason</th>
            <th>Recommendation</th>
          </tr>
        </thead>
        <tbody>
          {SORTED_TEST_NAMES.map((name) => {
            const test = result.tests[name];
            return (
              test && (
                <tr key={name}>
                  <td data-header="Test">
                    <Link href={test.link}>{test.title}</Link>
                  </td>
                  {test.pass === null ? (
                    <td data-header="Score">-</td>
                  ) : (
                    <td className="score" data-header="Score">
                      <span>
                        <span className="obs-score-value">
                          <ScoreModifier
                            overallScore={result.scan.score || 0}
                            scoreModifier={test.score_modifier}
                          />
                        </span>
                        <PassIcon pass={test.pass} />
                      </span>
                    </td>
                  )}
                  <td
                    data-header="Reason"
                    dangerouslySetInnerHTML={{
                      __html: test.score_description,
                    }}
                  />
                  <td
                    data-header="Advice"
                    dangerouslySetInnerHTML={{
                      __html:
                        test.recommendation || `<p class="obs-none">None</p>`,
                    }}
                  />
                </tr>
              )
            );
          })}
        </tbody>
      </table>
      {showFootnote && (
        <section className="footnote" id="bonus-points-explanation">
          <sup>*</sup> Normally awards bonus points, however, in this case they
          are not included in the overall score (
          <a href="/en-US/observatory/docs/tests_and_scoring" target="_blank">
            find out why
          </a>
          ).
        </section>
      )}
    </>
  ) : null;
}

function ScoreModifier({
  overallScore,
  scoreModifier,
}: {
  overallScore: number;
  scoreModifier: number;
}) {
  const [bonusEligible, formattedScoreModifier] = useMemo(() => {
    return [
      overallScore >= 90,
      formatMinus(`${scoreModifier > 0 ? `+${scoreModifier}` : scoreModifier}`),
    ];
  }, [overallScore, scoreModifier]);
  return (
    <span
      className={`${!bonusEligible && scoreModifier > 0 ? "not-counted" : ""}`}
    >
      {!bonusEligible && scoreModifier > 0 ? (
        <>
          0
          <sup>
            <a href="#bonus-points-explanation">*</a>
          </sup>
        </>
      ) : (
        <>{formattedScoreModifier}</>
      )}
    </span>
  );
}
