interface SurveyState {
  // Random number between 0 and 1.
  random: number;
  // When the user has first seen the survey.
  seen_at: number | null;
  // When the user has manually hidden the survey.
  dismissed_at: number | null;
  // When the user has first opened the survey.
  opened_at: number | null;
}

export function getSurveyState(key: string): SurveyState {
  const stateKey = `survey.${key}`;
  const state: SurveyState = JSON.parse(
    localStorage?.getItem(stateKey) ?? "{}"
  );

  if (Object.keys(state).length === 0) {
    state.random ??= Math.random();
    state.seen_at ??= null;
    state.dismissed_at ??= null;
    state.opened_at ??= null;
    writeSurveyState(key, state);
  }

  return state;
}

export function writeSurveyState(key: string, state: SurveyState): void {
  const stateKey = `survey.${key}`;
  localStorage?.setItem(stateKey, JSON.stringify(state));
}
