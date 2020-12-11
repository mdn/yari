import React from "react";

const defaults = {
  title: "Atoms/Forms",
};

export default defaults;

export const form = () => {
  return (
    <>
      <h1>Forms</h1>
      <h2>Fieldsets</h2>
      <fieldset>
        <legend>Default fieldset</legend>
        <p>
          Fieldsets on MDN are displayed without a border by default. The
          <code>fieldset</code> element is mainly used to group related form
          fields.
        </p>
      </fieldset>

      <fieldset class="bordered">
        <legend>Bordered fieldset</legend>
        <p>
          If you require a bordered <code>fieldset</code>, add the class
          <code>bordered</code> to the <code>fieldset</code> element.
        </p>
      </fieldset>

      <h2>Legend</h2>
      <fieldset class="bordered">
        <legend>
          Default <code>legend</code>
        </legend>
        <p>
          No additional styling is added to <code>legend</code> elements by
          default.
        </p>
      </fieldset>

      <fieldset class="bordered">
        <legend class="highlighted">
          Highlighted <code>legend</code>
        </legend>
        <p>
          For highlighted <code>legend</code> elements, use the{" "}
          <code>highlighted</code>
          class on the <code>legend</code> element.
        </p>
      </fieldset>

      <fieldset class="bordered">
        <legend class="emphasized">
          Emphasized <code>legend</code>
        </legend>
        <p>
          For a non-highlighted but emphasized <code>legend</code> use the
          <code>emphasized</code> class on the <code>legend</code> element.
        </p>
      </fieldset>

      <fieldset>
        <legend class="highlighted">
          Highlighted <code>legend</code>
        </legend>
        <p>
          You can use all <code>legend</code> styles with, or without, a
          bordered
          <code>fieldset</code>
        </p>
      </fieldset>

      <fieldset class="bordered">
        <legend class="visually-hidden">Visually hidden legend element</legend>
        <p>
          To hide a <code>legend</code>, but not negatively impact
          accessibility, use the
          <code>visually-hidden</code> utility class on the <code>legend</code>{" "}
          element.
        </p>
        <p>
          For example, this <code>fieldset</code> contains a <code>legend</code>{" "}
          with the text content of, "Visually hidden legend element"
        </p>
      </fieldset>

      <h2>Labels</h2>

      <fieldset>
        <label>Default label</label>
        <p>
          <code>label</code> elements on MDN Web Docs are displayed as block
          level elements by default.
        </p>
      </fieldset>

      <fieldset>
        <label class="inline">Inline label</label>
        <p>
          If you require an inline <code>label</code> element, add the
          <code>inline</code> class to the relevant <code>label</code> element
        </p>
      </fieldset>

      <h2>Input fields</h2>

      <fieldset>
        <label for="firstname">A text input field</label>
        <input type="text" id="firstname" name="firstname" />
      </fieldset>

      <fieldset>
        <label for="password">A password field</label>
        <input type="password" id="password" name="password" />
      </fieldset>

      <fieldset>
        <label for="invalid-email">An email input field in invalid state</label>
        <input
          type="email"
          id="invalid-email"
          name="invalid-email"
          class="invalid"
          placeholder="me@example.com"
        />
      </fieldset>

      <fieldset>
        <label for="valid-url">An url input field in a valid state</label>
        <input
          type="url"
          id="valid-url"
          name="valid-url"
          class="valid"
          pattern="http[s]?://.*"
          placeholder="https://www.duckduckgo.com"
        />
      </fieldset>

      <h2>Textarea</h2>
      <fieldset>
        <label for="comment">
          A <code>textarea</code> for comments
        </label>
        <textarea id="comment"></textarea>
      </fieldset>

      <h2>Radio Buttons</h2>

      <fieldset>
        <label for="yes">
          <input type="radio" id="yes" name="subscribe" value="yup" checked />
          Yup
        </label>
        <label for="no">
          <input type="radio" id="no" name="subscribe" value="nope" />
          Nope
        </label>
      </fieldset>

      <h2>Checkboxes</h2>

      <fieldset>
        <label for="subscribe">
          <input type="checkbox" id="subscribe" name="subscribe" />
          Subscribe to our newsletter
        </label>
      </fieldset>

      <h2>Select</h2>

      <fieldset>
        <label for="fruits">Fruits</label>
        <select name="fruit" id="fruits">
          <option value="apple">Apple</option>
          <option value="strawberry" selected>
            Strawberry
          </option>
          <option value="grapes">Grapes</option>
        </select>
      </fieldset>

      <h2>Field notes</h2>

      <form name="tester" action="" method="post">
        <fieldset>
          <div class="field-group">
            <label for="web">Website</label>
            <input type="url" id="web" name="web" />
            <p class="field-note">Please enter your company website url</p>
          </div>
        </fieldset>
      </form>

      <h2>Form layout</h2>

      <form name="tester" action="" method="post">
        <p>
          A set of <code>label</code> and <code>input</code> fields are wrapped
          with a<code>div</code> element with the class <code>field-group</code>
        </p>
        <fieldset>
          <div class="field-group">
            <label for="name">Name</label>
            <input type="text" id="name" name="name" />
          </div>

          <div class="field-group">
            <label for="website">Website</label>
            <input type="url" id="website" name="website" />
            <p class="field-note">Please enter your company website url</p>
          </div>

          <p>
            To have two field groups line up horizontally, add the class
            <code>inline</code> to the field group <code>div</code> element.
          </p>

          <div class="field-group inline">
            <label for="username">Username</label>
            <input type="text" id="username" name="username" />
          </div>

          <div class="field-group inline">
            <label for="email">Email</label>
            <input type="text" id="email" name="email" />
          </div>

          <label for="newsletter">
            <input type="checkbox" id="newsletter" name="subscribe" />
            Subscribe to our newsletter
          </label>

          <button type="submit" class="button">
            Save
          </button>
        </fieldset>
      </form>
    </>
  );
};
