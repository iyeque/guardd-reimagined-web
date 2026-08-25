import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Workshop = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/workshops", { replace: true });
  }, [navigate]);

  return null;
};

export default Workshop;
