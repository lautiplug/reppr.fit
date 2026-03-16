import { useNavigate } from "react-router-dom";

export const useNavigationHook = (onBack?: () => void) => {
  const navigate = useNavigate();

  const goBack = () => (onBack ? onBack() : navigate(-1));
  const goHome = () => navigate("/");

  return { goBack, goHome };
};