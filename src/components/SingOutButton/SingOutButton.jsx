import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "../../utils/api.js";

function SingOutButton({ className }) {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await api.auth.logout();
    } catch (error) {
      console.error("Ошибка при выходе из аккаунта:", error.message);
    }
    navigate("/", { replace: true });
  };

  return (
    <Button variant="outline" className={className} onClick={handleSignOut}>
      <LogOut data-icon="inline-start" />
      Выход
    </Button>
  );
}

export default SingOutButton;
