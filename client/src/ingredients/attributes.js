import React from "react";

function RenderValues({ values }) {
  return (
    <ul>
      {values.map(value => {
        return (
          <li key={value.value}>
            <p><code>{value.value}</code></p>
            <div dangerouslySetInnerHTML={{ __html: value.description }} />
          </li>
        );
      })}
    </ul>
  );
}

function RenderAttributes({ attributes }) {
  return (
    <dl>
      {attributes.map(attribute => {
        return (
          <React.Fragment key={attribute.name}>
            <dt>
              <p><code>{attribute.name}</code>: <i>{attribute.type}</i></p>
            </dt>
            <dd>
              {/* XXX a div tag in the middle of a dd tag!
              See https://github.com/peterbe/mdn2/issues/5
              */}
              <div
                dangerouslySetInnerHTML={{ __html: attribute.description }}
              />

              {attribute.values && attribute.values.length && (
                <RenderValues values={attribute.values} />
              )}
            </dd>
          </React.Fragment>
        );
      })}
    </dl>
  );
}

export function Attributes({ document }) {
  return (
    <>
      <h2>Attributes</h2>
      <RenderAttributes attributes={document.attributes} />
    </>
  );
}
