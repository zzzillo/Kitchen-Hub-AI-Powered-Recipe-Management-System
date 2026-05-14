import type { LandingFeature } from "@/utils/landing-content";

interface FeatureCardProps {
  feature: LandingFeature;
}

const FeatureCard = ({ feature }: FeatureCardProps) => {
  const textBlock = (
    <div className="max-w-2xl">
      <h3 className="font-serif text-[2.7rem] leading-[0.95] tracking-[-0.06em] text-[#1f2b1f] sm:text-[3.1rem] md:text-[2.7rem] lg:text-[3.2rem] xl:text-[3.8rem]">
        {feature.title[0]}
        <br />
        <span className="text-[#4f8f45]">{feature.title[1]}</span>
      </h3>

      <p className="mt-3 text-[1rem] leading-8 text-[#7a7b73] sm:mt-4 sm:text-[1.08rem] sm:leading-[1.7] md:mt-5 md:text-[1rem] md:leading-7 lg:text-[1.08rem] lg:leading-[1.72] xl:text-[1.15rem] xl:leading-[1.75]">
        {feature.copy}
      </p>
    </div>
  );

  const imageBlock = (
    <div className="mx-auto w-fit rounded-[2rem] border border-[#d7e1d8] bg-white p-6 sm:p-7 md:mx-0 md:p-5 lg:mr-6 lg:p-6 xl:mr-10 xl:p-7">
      <div className="overflow-hidden rounded-[1.5rem]">
        <img
          src={feature.imageSrc}
          alt={feature.imageAlt}
          className="block aspect-square w-[17rem] rounded-[1.5rem] object-cover object-center sm:w-[21rem] md:w-[16rem] lg:w-[20rem] xl:w-[25rem]"
        />
      </div>
    </div>
  );

  return (
    <article className="overflow-hidden bg-transparent text-[#223426] transition duration-300 hover:-translate-y-1">
      <div className="grid gap-0 md:grid-cols-[0.88fr_1.12fr] lg:grid-cols-[0.9fr_1.1fr]">
        <div className={`p-4 sm:p-5 md:p-4 lg:p-5 ${feature.reverseOnDesktop ? "md:order-2 md:justify-self-end" : "md:order-1"}`}>
          {imageBlock}
        </div>

        <div className={`flex items-center px-4 py-6 sm:px-6 sm:py-7 md:px-4 md:py-4 lg:px-8 lg:py-8 ${feature.reverseOnDesktop ? "md:order-1" : "md:order-2"}`}>
          {textBlock}
        </div>
      </div>
    </article>
  );
};

export default FeatureCard;
