import { Link } from "react-router-dom";
import LandingBackground from "@/assets/landing-background.jpg";
import Logo from "@/assets/logo.svg";

interface HeroSectionProps {
  isAuthenticated: boolean;
}

const HeroSection = ({ isAuthenticated }: HeroSectionProps) => (
  <section className="relative isolate overflow-hidden bg-[#f8faf7]">
    <div
      className="absolute inset-0 hidden bg-cover bg-left bg-no-repeat md:block lg:bg-[position:center_right]"
      style={{
        backgroundImage: `url(${LandingBackground})`,
      }}
    />
    <div className="mx-auto grid w-full grid-cols-1 px-4 py-6 sm:px-6 lg:min-h-[100dvh] lg:px-8 lg:py-8">
      <div className="flex w-full justify-center py-10 lg:justify-start lg:items-center lg:py-0">
        <div className="relative z-10 w-full p-4 text-center motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-left-4 motion-safe:duration-700 sm:p-6 lg:p-0 lg:text-left">
          <div className="text-left">
            <div className="flex items-center gap-4">
              <img
                src={Logo}
                alt="Kitchen Hub logo"
                className="h-14 w-14 rounded-full object-contain sm:h-16 sm:w-16"
              />
              <div>
                <p className="font-serif text-3xl tracking-[-0.055em] text-[#203126] sm:text-4xl">
                  Kitchen Hub
                </p>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#70806d]">
                  Recipe management system
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center lg:mt-12 lg:block">
            <h1 className="mx-auto mt-8 max-w-[11ch] text-balance font-serif text-[3.7rem] leading-[0.86] tracking-[-0.085em] text-[#203126] sm:max-w-[10ch] sm:text-[5rem] lg:mx-0 lg:mt-12 lg:max-w-[9ch] lg:text-[6.1rem]">
              A better way to
              <br />
              keep your recipes.
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-base leading-8 text-[#5b6d5a] sm:max-w-2xl sm:text-lg lg:mx-0 lg:max-w-[26rem]">
              Kitchen Hub gives you one place to save recipes, edit them later,
              search your collection, and build new drafts with AI.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4 lg:justify-start">
              <Link
                to={isAuthenticated ? "/recipes" : "/signup"}
                className="inline-flex h-12 items-center justify-center rounded-full bg-[#539246] px-6 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(35,58,30,0.16)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#487f3c] active:translate-y-px sm:text-base"
              >
                {isAuthenticated ? "Open Kitchen Hub" : "Create your account"}
              </Link>
              <Link
                to={isAuthenticated ? "/recipes/new" : "/login"}
                className="inline-flex h-12 items-center justify-center rounded-full border border-[#d7d2c3] bg-white/60 px-6 text-sm font-semibold text-[#315032] transition duration-300 hover:bg-white active:translate-y-px sm:text-base"
              >
                {isAuthenticated ? "Add recipe" : "Login"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default HeroSection;
