import { useParams } from "react-router-dom";
import StaticPage from "../../homepage/static-page";

function StaticPlusPage({ slug, ...props }) {
  const { locale } = useParams();

  return (
    <StaticPage
      {...{
        locale,
        slug: `plus/${slug}`,
        title: "MDN Plus",
        initialData: props.hyData ? props : undefined,
      }}
    />
  );
}

export default StaticPlusPage;
