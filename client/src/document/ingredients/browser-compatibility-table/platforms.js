import React from "react";

export function Platforms({ platforms, browsers }) {
  return (
    <tr className="bc-platforms">
      <td />
      {platforms.map((platform) => (
        <th
          key={platform}
          className={`bc-platform-${platform}`}
          colSpan={Object.keys(browsers[platform]).length}
        >
          <span>{platform}</span>
        </th>
      ))}
    </tr>
  );
}
