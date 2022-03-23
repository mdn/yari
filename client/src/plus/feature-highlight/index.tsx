import { useParams } from "react-router-dom";
import StaticPlusPage from "../static-plus-page";

function FeatureHighlight(props) {
  const { feature } = useParams();

  return (
    <StaticPlusPage
      {...{
        slug: `features/${feature}`,
        ...props,
      }}
    />
  );
}

export default FeatureHighlight;
