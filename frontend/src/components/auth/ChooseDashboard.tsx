import { useNavigate } from "react-router-dom";
import Button from "../ui/button/Button";

export default function ChooseDashboard() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow dark:bg-gray-800">
        <h2 className="mb-6 text-xl font-semibold text-center text-gray-800 dark:text-white">
          Where do you want to go?
        </h2>

        <div className="space-y-4">
          <Button
            className="w-full"
            onClick={() => navigate("/dashboard", { replace: true })}
          >
            Go to Admin Dashboard
          </Button>

          <Button
            className="w-full"
            variant="outline"
            onClick={() => navigate("/user-dashboard", { replace: true })}
          >
            Go to User Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
