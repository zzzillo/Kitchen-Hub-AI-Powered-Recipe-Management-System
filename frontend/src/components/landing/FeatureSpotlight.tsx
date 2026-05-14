import FeatureCard from "@/components/landing/FeatureCard";
import { landingFeatures } from "@/utils/landing-content";

const FeatureSpotlight = () => (
  <div className="grid gap-6 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-left-4 motion-safe:duration-700">
    <div className="grid gap-4 md:gap-5 lg:gap-5">
      <FeatureCard feature={landingFeatures[0]} />
      {landingFeatures.slice(1).map((feature) => (
        <FeatureCard key={feature.title.join(" ")} feature={feature} />
      ))}
    </div>
  </div>
);

export default FeatureSpotlight;
