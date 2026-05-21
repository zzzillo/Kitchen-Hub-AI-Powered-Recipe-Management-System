import RevealOnScroll from "@/components/landing/RevealOnScroll";
import { recipeIdeaSamples } from "@/utils/landing-content";

const RecipeIdeaSection = () => (
  <section className="bg-transparent">
    <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="space-y-8">
        <RevealOnScroll className="mx-auto max-w-3xl text-center lg:mx-0 lg:max-w-none lg:text-left" distance={22}>
          <h2 className="mt-4 font-serif text-4xl leading-[0.93] tracking-[-0.06em] text-[#233526] sm:text-5xl">
            Recipe ideas to explore.
          </h2>
        </RevealOnScroll>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {recipeIdeaSamples.map((sample, index) => (
            <RevealOnScroll key={sample.title} delayMs={index * 80} distance={30}>
              <article className="mx-auto w-full max-w-md overflow-hidden rounded-[2rem] bg-white shadow-[0_14px_28px_rgba(23,37,22,0.06)] ring-1 ring-inset ring-[#e6dece] transition duration-300 hover:-translate-y-1 md:max-w-none">
                <div className="flex h-52 items-center justify-center overflow-hidden bg-white/45 sm:h-56">
                  <img
                    src={sample.image}
                    alt={sample.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#4f8f45]">
                    {sample.meta}
                  </p>
                  <h3 className="mt-3 font-serif text-[1.45rem] leading-[0.98] tracking-[-0.05em] text-[#223426]">
                    {sample.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-[#5d6c5d]">
                    {sample.prompt}
                  </p>
                </div>
              </article>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default RecipeIdeaSection;
