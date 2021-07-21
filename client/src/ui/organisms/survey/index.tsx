import "./index.scss";

const Survey = () => {
  return (
    <div className="survey-wrapper">
      <form
        name="survey-form"
        action=""
        method="post"
        className="survey-container girdle"
      >
        <fieldset className="survey-section">
          <legend className="survey-heading">
            Please help us by answering some questions (1/2)
          </legend>
          <div className="survey-question">
            <h3>How often do you use MDN?</h3>
            <div className="form-input-group">
              <label htmlFor="daily">
                <input id="daily" type="radio" name="mdn-usage" />
                Every day
              </label>
              <label htmlFor="weekly">
                <input id="weekly" type="radio" name="mdn-usage" />
                Weekly
              </label>
              <label htmlFor="biweekly">
                <input id="biweekly" type="radio" name="mdn-usage" />
                Every few weeks
              </label>
              <label htmlFor="never">
                <input id="never" type="radio" name="mdn-usage" />I do not use
                MDN
              </label>
            </div>
          </div>
          <h3>How would you rate the articles?</h3>
          <div className="survey-question">
            <h4>Planning for browser support</h4>
            <div className="form-input-group">
              <label htmlFor="notread">
                <input id="notread" type="radio" name="pfbs" />
                Didn’t read
              </label>
              <label htmlFor="bad">
                <input id="bad" type="radio" name="pfbs" />
                Bad
              </label>
              <label htmlFor="neutral">
                <input id="neutral" type="radio" name="pfbs" />
                Neutral
              </label>
              <label htmlFor="good">
                <input id="good" type="radio" name="pfbs" />
                Good
              </label>
              <label htmlFor="verygood">
                <input id="verygood" type="radio" name="pfbs" />
                Very Good
              </label>
            </div>
            <div className="form-input-group">
              <label htmlFor="pfbs-motivation" className="visually-hidden">
                What motivated your selection?
              </label>
              <input
                id="pfbs-motivation"
                type="text"
                name=""
                placeholder="What motivated your selection?"
              />
            </div>
          </div>
          <div className="survey-question">
            <h4>Your browser support toolkit</h4>
            <div className="form-input-group">
              <label htmlFor="notread">
                <input id="notread" type="radio" name="ybst" />
                Didn’t read
              </label>
              <label htmlFor="bad">
                <input id="bad" type="radio" name="ybst" />
                Bad
              </label>
              <label htmlFor="neutral">
                <input id="neutral" type="radio" name="ybst" />
                Neutral
              </label>
              <label htmlFor="good">
                <input id="good" type="radio" name="ybst" />
                Good
              </label>
              <label htmlFor="verygood">
                <input id="verygood" type="radio" name="ybst" />
                Very Good
              </label>
            </div>
            <div className="form-input-group">
              <label htmlFor="ybst-motivation" className="visually-hidden">
                What motivated your selection?
              </label>
              <input
                id="ybst-motivation"
                type="text"
                name=""
                placeholder="What motivated your selection?"
              />
            </div>
          </div>
          <button type="button">Continue</button>
        </fieldset>
        <fieldset className="survey-section">
          <legend className="survey-heading">
            Please help us by answering some questions (2/2)
          </legend>
          <div className="survey-question">
            <h3>What future deep dive topics would you consider paying for?</h3>
            <div className="form-input-group">
              <label htmlFor="security">
                <input id="security" type="checkbox" name="security" />
                Deep dive: Security considerations in web development
              </label>
              <label htmlFor="responsive">
                <input
                  id="responsive"
                  type="checkbox"
                  name="responsive-design"
                />
                Deep dive: Modern responsive web design
              </label>
              <label htmlFor="pattern-library">
                <input
                  id="pattern-library"
                  type="checkbox"
                  name="pattern-library"
                />
                Deep dive: A robust CSS pattern library
              </label>
              <label htmlFor="laws">
                <input id="laws" type="checkbox" name="laws" />
                Deep dive: GDPR, DSAR, CCPA, and COPPA. So many acronyms! Learn
                Mozilla's framework to handle privacy laws
              </label>
              <label htmlFor="modernjs">
                <input id="modernjs" type="checkbox" name="modernjs" />
                Deep dive: Stop using jQuery and start using JavaScript!
              </label>
              <label htmlFor="other">
                <input id="other" type="checkbox" name="other" />
                Other:
              </label>
            </div>
          </div>
          <div className="survey-question">
            <div className="form-input-group">
              <label htmlFor="comments" className="custom-label">
                Is there anything else you’d like to share with us?
              </label>
              <textarea id="comments" name="comments">
                Enter your response
              </textarea>
            </div>
          </div>
          <button type="button">Submit</button>
        </fieldset>
      </form>
    </div>
  );
};

export default Survey;
