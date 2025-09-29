import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import React from "react";
import FuzzyText from "../components/FuzzyText";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center", // center the content vertically
        height: "100vh",
        backgroundColor: "#000",
        paddingTop: "2rem",
      }}
    >
      <FuzzyText
        fontSize="clamp(2rem, 8vw, 8rem)"
        fontWeight={900}
        fontFamily="inherit"
        color="#fff"
        enableHover={true}
        baseIntensity={0.18}
        hoverIntensity={0.5}
      >
        404: Page Not Found
      </FuzzyText>
    </div>
  );
};

export default NotFound;
