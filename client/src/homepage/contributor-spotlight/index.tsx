import useSWR from "swr";
import { CRUD_MODE } from "../../constants";
import { Icon } from "../../ui/atoms/icon";
import Mandala from "../../ui/molecules/mandala";

import "./index.scss";
const contributorGraphic = `${
  process.env.PUBLIC_URL || ""
}/assets/mdn_contributor.png`;

export function ContributorSpotlight(props) {
  const { data } = useSWR<any>(
    "./index.json",
    async (url) => {
      const response = await fetch(url);
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`${response.status} on ${url}: ${text}`);
      }
      return await response.json();
    },
    {
      initialData: props.featuredContributor
        ? { featuredContributor: props.featuredContributor }
        : undefined,
      revalidateOnFocus: CRUD_MODE,
    }
  );

  return (
    <div className="contributor-spotlight dark">
      <div className="wrapper">
        <div className="text-col">
          <h2 className="mdn-ui-emphasis-l">Contributor Spotlight</h2>
          {data && data?.featuredContributor && (
            <>
              <a
                className="contributor-name"
                href={data?.featuredContributor?.url}
              >
                {data?.featuredContributor?.contributorName}
              </a>
              <blockquote>
                <Icon name="quote"></Icon>
                {data?.featuredContributor?.quote}
              </blockquote>
            </>
          )}
          <a href="/en-US/community" className="spotlight-cta">
            Get involved →
          </a>
        </div>
        <figure className="contributor-graphic">
          <img src={contributorGraphic} alt="Tiled Mozilla Logo" />
        </figure>
      </div>
      <Mandala />
    </div>
  );
}
