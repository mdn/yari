import useSWR from "swr";
import { CRUD_MODE } from "../../constants";
import { HydrationData } from "../../types/hydration";
import { Icon } from "../../ui/atoms/icon";
import Mandala from "../../ui/molecules/mandala";

import "./index.scss";
const contributorGraphic = `${
  process.env.PUBLIC_URL || ""
}/assets/mdn_contributor.png`;

export function ContributorSpotlight(props: HydrationData<any>) {
  const { data: { hyData } = {} } = useSWR<any>(
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
      initialData: props.hyData ? props : undefined,
      revalidateOnFocus: CRUD_MODE,
    }
  );

  return (
    <div className="contributor-spotlight dark">
      <div className="wrapper">
        <div className="text-col">
          <h3>Contributor Spotlight</h3>
          {hyData && hyData?.featuredContributor && (
            <>
              <a
                className="contributor-name"
                href={hyData?.featuredContributor?.url}
              >
                {hyData?.featuredContributor?.contributorName}
              </a>
              <blockquote>
                <Icon name="quote"></Icon>
                {hyData?.featuredContributor?.quote}
              </blockquote>
            </>
          )}
          <a href="/en-US/community" className="spotlight-cta">
            Get involved →
          </a>
        </div>
        <figure className="contributor-graphic">
          <img
            width="523"
            height="323"
            src={contributorGraphic}
            alt="Tiled Mozilla Logo"
          />
        </figure>
      </div>
      <Mandala />
    </div>
  );
}
