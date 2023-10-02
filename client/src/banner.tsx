import { TopPlacement } from "./ui/organisms/placement";
import { useUserData } from "./user-context";

export function TopBanner() {
  const user = useUserData();
  return user?.experiments && !user.experiments.active ? (
    <div className={`top-banner`}>
      <section className="place top container">
        <p className="fallback-copy">
          You are eligible to test our AI-Help experiments. Go to{" "}
          <a href="/en-US/plus/settings">settings</a> to start.
        </p>
      </section>
    </div>
  ) : (
    <TopPlacement />
  );
}
