import React from "react";

export function Legend({
  hasDeprecation,
  hasExperimental,
  hasNonStandard,
  hasFlag,
  hasPrefix,
  hasAlternative,
  hasNotes,
}) {
  return (
    <section className="bc-legend">
      <h3 className="offscreen highlight-spanned" id="Legend">
        <span className="highlight-span">Legend</span>
      </h3>
      <dl>
        <dt>
          <span className="bc-supports-yes bc-supports">
            <abbr
              className="bc-level bc-level-yes only-icon"
              title="Full support"
            >
              <span>Full support</span>
            </abbr>
          </span>
        </dt>
        <dd>Full support</dd>
        <dt>
          <span className="bc-supports-no bc-supports">
            <abbr className="bc-level bc-level-no only-icon" title="No support">
              <span>No support</span>
            </abbr>
          </span>
        </dt>
        <dd>No support</dd>
        <dt>
          <span className="bc-supports-unknown bc-supports">
            <abbr
              className="bc-level bc-level-unknown only-icon"
              title="Compatibility unknown"
            >
              <span>Compatibility unknown</span>
            </abbr>
          </span>
        </dt>
        <dd>Compatibility unknown</dd>
        {hasNotes && [
          <dt key="notes-dt">
            <abbr className="only-icon" title="See implementation notes.">
              <span>See implementation notes.</span>
              <i className="ic-footnote" />
            </abbr>
          </dt>,
          <dd key="notes-dd">See implementation notes.</dd>,
        ]}
        {hasDeprecation && [
          <dt key="deprecated-dt">
            <abbr
              className="only-icon"
              title="Deprecated. Not for use in new websites."
            >
              <span>Deprecated. Not for use in new websites.</span>
              <i className="ic-deprecated" />
            </abbr>
          </dt>,
          <dd key="deprecated-dd">Deprecated. Not for use in new websites.</dd>,
        ]}
        {hasExperimental && [
          <dt key="experimental-dt">
            <abbr
              className="only-icon"
              title="Experimental. Expect behavior to change in the future."
            >
              <span>
                Experimental. Expect behavior to change in the future.
              </span>
              <i className="ic-experimental" />
            </abbr>
          </dt>,
          <dd key="experimental-dd">
            Experimental. Expect behavior to change in the future.
          </dd>,
        ]}
        {hasNonStandard && [
          <dt key="standard-dt">
            <abbr
              className="only-icon"
              title="Non-standard. Expect poor cross-browser support."
            >
              <span>Non-standard. Expect poor cross-browser support.</span>
              <i className="ic-non-standard" />
            </abbr>
          </dt>,
          <dd key="standard-dd">
            Non-standard. Expect poor cross-browser support.
          </dd>,
        ]}
        {hasFlag && [
          <dt key="flag-dt">
            <abbr
              className="only-icon"
              title="User must explicitly enable this feature."
            >
              <span>User must explicitly enable this feature.</span>
              <i className="ic-disabled" />
            </abbr>
          </dt>,
          <dd key="flag-dd">User must explicitly enable this feature.</dd>,
        ]}
        {hasPrefix && [
          <dt key="prefix-dt">
            <abbr
              className="only-icon"
              title="Requires a vendor prefix or different name for use."
            >
              <span>Requires a vendor prefix or different name for use.</span>
              <i className="ic-prefix" />
            </abbr>
          </dt>,
          <dd key="prefix-dd">
            Requires a vendor prefix or different name for use.
          </dd>,
        ]}
        {hasAlternative && [
          <dt key="alternative-dt">
            <abbr className="only-icon" title="Uses a non-standard name.">
              <span>Uses a non-standard name.</span>
              <i className="ic-altname" />
            </abbr>
          </dt>,
          <dd key="alternative-dd">Uses a non-standard name.</dd>,
        ]}
      </dl>
    </section>
  );
}
