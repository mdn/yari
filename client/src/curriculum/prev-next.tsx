import { CurriculumDoc } from "../../../libs/types/curriculum";
import { Button } from "../ui/atoms/button";

import "./prev-next.scss";

export function PrevNext({ doc }: { doc: CurriculumDoc }) {
  return (
    <section className="curriculum-prev-next">
      {doc.prevNext?.prev && (
        <Button
          type="primary"
          target="_self"
          icon="cur-prev"
          href={doc.prevNext?.prev?.url}
        >
          Previous: {doc.prevNext?.prev?.title}
        </Button>
      )}
      {doc.prevNext?.next && (
        <Button
          type="primary"
          target="_self"
          icon="cur-next"
          href={doc.prevNext?.next?.url}
        >
          Next: {doc.prevNext?.next?.title}
        </Button>
      )}
    </section>
  );
}
