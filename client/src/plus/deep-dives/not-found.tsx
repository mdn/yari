import { useEffect } from "react";

import "./index.scss";

export function DeepDiveNotFound({ slug }: { slug: string }) {
  useEffect(() => {
    document.title = "Sorry. Deep dive article not found ~ Plus";
  }, []);

  return (
    <>
      <div className="main-article-page-content-container girdle">
        <article className="deep-dive-article-container">
          <header className="main-heading-group heading-group">
            <h1>Article not found</h1>
          </header>
          <p className="article-lead">
            Sorry, can't find that article. <code>{slug}</code>
          </p>
        </article>
      </div>
    </>
  );
}
