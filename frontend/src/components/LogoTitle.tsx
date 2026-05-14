import { useNavigate } from "react-router-dom";
import Logo from "../assets/logo.svg";

interface LogoTitleProps {
  hideTextOnSmall?: boolean;
  backHomepage?: boolean;
  compact?: boolean;
}

const LogoTitle = ({
  hideTextOnSmall = false,
  backHomepage = false,
  compact = false,
}: LogoTitleProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (backHomepage) navigate("/recipes");
  };

  return (
    <div
      className={`flex w-fit items-center px-0.5 py-0 ${
        compact ? "gap-1.5 sm:gap-2" : "gap-2 sm:gap-3"
      }`}
    >
      <img
        src={Logo}
        alt="Logo"
        onClick={handleClick}
        className={`rounded-full object-contain transition-all duration-200 ${
          compact
            ? "h-9 w-9 min-h-9 min-w-9 sm:min-h-13 sm:min-w-13"
            : "h-14 w-14 min-h-14 min-w-14 sm:h-16 sm:w-16"
        } ${
          backHomepage ? "cursor-pointer hover:opacity-90" : ""
        }`}
      />
      <h1
        className={`font-['Fraunces'] whitespace-nowrap font-semibold tracking-[-0.05em] text-[#284734] ${
          compact ? "text-base sm:text-xl" : "text-2xl sm:text-3xl"
        } ${
          hideTextOnSmall ? "hidden md:block" : ""
        }`}
      >
        Kitchen Hub
      </h1>
    </div>
  );
};

export default LogoTitle;
