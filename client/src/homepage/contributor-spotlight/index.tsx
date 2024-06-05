import useSWR from "swr";
import { DEV_MODE } from "../../env";
import { HydrationData } from "../../../../libs/types/hydration";
import { Icon } from "../../ui/atoms/icon";
import Mandala from "../../ui/molecules/mandala";
import mdnContributorLogo from "../../../public/assets/mdn_contributor.png";

import "./index.scss";

export function ContributorSpotlight(props: HydrationData<any>) {
  const fallbackData = props.hyData ? props : undefined;

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
      fallbackData,
      revalidateOnFocus: DEV_MODE,
      revalidateOnMount: !fallbackData,
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
            loading="lazy"
            width="512"
            height="323"
            src={mdnContributorLogo}
            alt="Tiled Mozilla Logo"
          />
        </figure>
      </div>
      <Mandala />
    </div>
  );
}
