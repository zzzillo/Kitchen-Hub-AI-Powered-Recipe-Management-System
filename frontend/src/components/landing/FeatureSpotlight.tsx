import RevealOnScroll from "@/components/landing/RevealOnScroll";
import FeatureCard from "@/components/landing/FeatureCard";
import { landingFeatures } from "@/utils/landing-content";

const FeatureSpotlight = () => (
  <div className="grid gap-6">
    <div className="grid gap-4 md:gap-5 lg:gap-5">
      {landingFeatures.map((feature, index) => (
        <RevealOnScroll
          key={feature.title.join(" ")}
          delayMs={index * 90}
          distance={26}
        >
          <FeatureCard feature={feature} />
        </RevealOnScroll>
      ))}
    </div>
  </div>
);

export default FeatureSpotlight;
