import useSWR from "swr";
import { CRUD_MODE } from "../../constants";

import { Button } from "../../ui/atoms/button";
import "./index.scss";
const contributorGraphic = `${
  process.env.PUBLIC_URL || ""
}/assets/tiled-dinos.svg`;

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
    <div className="contributor-spotlight">
      <div className="wrapper">
        <div className="text-col">
          <h2 className="mdn-ui-emphasis-l">Contributor Spotlight</h2>
          {data && (
            <>
              <a
                className="contributor-name"
                href={data.featuredContributor.url}
              >
                {data.featuredContributor.contributorName}
              </a>
              <p>{data.featuredContributor.quote}</p>
            </>
          )}
          <Button href="/contribute" extraClasses="spotlight-cta">
            Get involved
          </Button>
        </div>
        <figure className="contributor-graphic">
          <img src={contributorGraphic} alt="Tiled Mozilla Logo" />
        </figure>
      </div>
    </div>
  );
}
