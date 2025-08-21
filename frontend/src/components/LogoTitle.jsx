import { useNavigate } from "react-router-dom";
import Logo from "../assets/logo.svg";

function LogoTitle({ hideTextOnSmall = false, backHomepage = false }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (backHomepage) navigate("/home");
  };

  return (
    <div className="w-fit h-fit flex items-center gap-4 pl-2 py-4 lg:pl-4">
      <img
        src={Logo}
        alt="Logo"
        onClick={handleClick}
        className={`w-16 h-16 min-w-16 min-h-16 lg:w-20 lg:h-20 rounded-full transition-all duration-200 ${
          backHomepage ? "cursor-pointer hover:opacity-90" : ""
        }`}
      />
      <h1
        className={`text-3xl text-green font-light whitespace-nowrap ${
          hideTextOnSmall ? "hidden lg:block" : ""
        }`}
      >
        Kitchen Hub
      </h1>
    </div>
  );
}

export default LogoTitle;
