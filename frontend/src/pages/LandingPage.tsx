import FeatureSpotlight from "@/components/landing/FeatureSpotlight";
import HeroSection from "@/components/landing/HeroSection";
import LandingFooter from "@/components/landing/LandingFooter";
import RecipeIdeaSection from "@/components/landing/RecipeIdeaSection";

const LandingPage = () => {
  const storedUser = localStorage.getItem("user");
  const token = localStorage.getItem("token");
  const isAuthenticated = Boolean(storedUser && token);

  return (
    <div
      className="min-h-dvh text-[#1f3125]"
      style={{
        background:
          "radial-gradient(circle at top left, rgba(173, 212, 186, 0.18), transparent 24%), linear-gradient(180deg, #f8faf7 0%, #f0f5f0 100%)",
      }}
    >
      <main>
        <HeroSection isAuthenticated={isAuthenticated} />

        <section className="bg-transparent text-[#223426]">
          <div className="mx-auto w-full max-w-[1600px] px-3 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-18 xl:px-16 xl:py-22">
            <FeatureSpotlight />
          </div>
        </section>

        <RecipeIdeaSection />
        <LandingFooter isAuthenticated={isAuthenticated} />
      </main>
    </div>
  );
};

export default LandingPage;
