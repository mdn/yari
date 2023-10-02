import { TopPlacement } from "./ui/organisms/placement";
import { useUserData } from "./user-context";

export function TopBanner() {
  const user = useUserData();
  return user?.experiments && !user.experiments.active ? (
    <div className={`top-banner`}>
      <section className="place top container">
        <p className="fallback-copy">
          As an MDN Plus Supporter, you can test our AI Help optimizations and
          have a direct say in our product's evolution. Activate and provide
          feedback <a href="/en-US/plus/settings">here</a>.
        </p>
      </section>
    </div>
  ) : (
    <TopPlacement />
  );
}
