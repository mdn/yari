import { AI_HELP } from "../../telemetry/constants";
import Container from "../../ui/atoms/container";
import ThemedPicture from "../../ui/atoms/themed-picture";
import { AuthContainer } from "../../ui/molecules/auth-container";
import { ReactComponent as ContextSVG } from "../../../public/assets/ai-help/context.svg";
import { ReactComponent as HistorySVG } from "../../../public/assets/ai-help/history.svg";
import { ReactComponent as GPT4SVG } from "../../../public/assets/ai-help/gpt-4.svg";
import screenshotDark from "../../../public/assets/ai-help/ai-help_dark.png";
import screenshotLight from "../../../public/assets/ai-help/ai-help_light.png";

import "./landing.scss";

export function AIHelpLanding() {
  return (
    <div className="ai-help-landing">
      <Container extraClasses="ai-help-landing-top">
        <div>
          <h1>
            Utilize AI Help to <em>boost</em> your productivity
          </h1>
          <p>Receive MDN-sourced answers complete with consulted links</p>
          <Login placement="top" />
        </div>
        <figure>
          <ThemedPicture
            srcDark={screenshotDark}
            srcLight={screenshotLight}
            alt="Screenshot of AI Help"
          />
        </figure>
      </Container>
      <div className="ai-help-landing-features">
        <Container>
          <h2>New Additions</h2>
          <div className="ai-help-new-additions">
            <figure>
              <HistorySVG />
              <figcaption>
                <h3>History</h3>
                <p>Save your history to revisit your chats at anytime</p>
              </figcaption>
            </figure>
            <figure>
              <ContextSVG />
              <figcaption>
                <h3>Enhanced Context</h3>
                <p>Ask queries about browser compatibility data</p>
              </figcaption>
            </figure>
            <figure>
              <GPT4SVG />
              <figcaption>
                <h3>GPT-4-Powered</h3>
                <p>Now based on GPT-4 for peak performance</p>
              </figcaption>
            </figure>
          </div>
        </Container>
      </div>
      <Container extraClasses="ai-help-landing-bottom">
        <h2>Boost Your Productivity with AI-Assisted Help on MDN</h2>
        <ul className="highlights">
          <li>
            <em>Direct Access to Information</em>: We provide the verified links
            checked by AI for your answers, enabling you to dive directly into
            them at your preferred pace for a comprehensive understanding.
          </li>
          <li>
            <em>Summarised Insights</em>: We provide quick, concise summary of
            your questions, making it easy to grasp key points without extensive
            reading.
          </li>
          <li>
            <em>Interactive Learning</em>: We've integrated this with our
            Playground feature, allowing you to directly experiment with the
            code provided, verify solutions, and enhance your understanding
            through practical application.
          </li>
        </ul>
        <Login placement="bottom" />
      </Container>
    </div>
  );
}

function Login({ placement }: { placement: "top" | "bottom" }) {
  return (
    <AuthContainer
      logInGleanContext={`${AI_HELP}: banner-login ${placement}`}
      signUpGleanContext={`${AI_HELP}: banner-signup ${placement}`}
    />
  );
}
