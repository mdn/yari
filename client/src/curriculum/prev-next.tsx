import { CurriculumDoc } from "../../../libs/types/curriculum";
import { Button } from "../ui/atoms/button";

import "./prev-next.scss";

export function PrevNext({ doc }: { doc?: CurriculumDoc }) {
  const { prev, next } = doc?.prevNext || {};
  return (
    <section className="curriculum-prev-next">
      {prev && (
        <Button
          type="primary"
          target="_self"
          icon="curriculum-prev"
          href={prev?.url}
        >
          Previous: {prev?.title}
        </Button>
      )}
      {next && (
        <Button
          type="primary"
          target="_self"
          icon="curriculum-next"
          href={next?.url}
        >
          Next: {next?.title}
        </Button>
      )}
    </section>
  );
}
