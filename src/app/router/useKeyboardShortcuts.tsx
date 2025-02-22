import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const useKeyboardShortcuts = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
       if (event.altKey && event.key.toLowerCase() === "i") {
        event.preventDefault();
        navigate("/item-list");
      } else if (event.ctrlKey && event.key.toLowerCase() === "j") {
        event.preventDefault();
        navigate("/IJForm");
      } 
      else if (event.ctrlKey && event.key.toLowerCase() === "l") {
        event.preventDefault();
        navigate("/Report/Ledger");
      }
      else if (event.ctrlKey && event.key.toLowerCase() === "g") {
        event.preventDefault();
        navigate("/Report/TrialBalance");
      }
      else if (event.altKey && event.key.toLowerCase() === "c") {
        event.preventDefault();
        navigate("Voucher/CreditSaleEntry");
      } if (event.key === 'Escape') {
        event.preventDefault();
        setTimeout(() => navigate(-1), 0);
      }else {
        switch (event.key) {
          case "F5":
            event.preventDefault();
            navigate("/Voucher/Payment");
            break;
          case "F6":
            event.preventDefault();
            navigate("/Voucher/Receipt");
            break;
          case "F7":
            event.preventDefault();
            navigate("/Voucher/BankEntry");
            break;
          case "F8":
            event.preventDefault();
            navigate("/Voucher/JournalEntry");
            break;
            case "F9":
              event.preventDefault();
              navigate("/Voucher/Sale");
              break;
              case "F10":
              event.preventDefault();
              navigate("/Voucher/Purchase");
              break;
          default:
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [navigate]);
};

export default useKeyboardShortcuts;
