import { ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

interface Props {
  name: string;
  children?: React.ReactNode;
  showBackButton?: boolean;
}
export function Title({ name, children, showBackButton = false }: Props) {
  const navigate = useNavigate();
  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="flex items-center gap-4  mb-6">
      {showBackButton && (
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={handleGoBack}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
      )}
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
        {name}
      </h1>

      {children}
    </div>
  );
}
