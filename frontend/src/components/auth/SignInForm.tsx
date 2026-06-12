import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import axios from "axios";
import { clearAuthSession, isAuthSessionExpired, persistAuthSession } from "../../utils/session";
import { toast } from "react-toastify";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const roleId = sessionStorage.getItem("role_id");

    if (token) {
      if (isAuthSessionExpired()) {
        clearAuthSession();
        setLoading(false);
        return;
      }
      if (roleId && parseInt(roleId, 10) === 3) {
        navigate("/introduction", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } else {
      setLoading(false);
    }
  }, [navigate]);

  if (loading) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }

    try {
      const res = await axios.post("/api/login", { email, password });
      const { access_token, user } = res.data;

      persistAuthSession(access_token, user);

      if (user.role_id === 3) {
        navigate("/introduction", { replace: true });
      } else if (user.role_id === 2) {
        navigate(user.panel_status ? "/choose-dashboard" : "/dashboard", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const message = err.response?.data?.message;

        if (status === 401) toast.error("Invalid email or password");
        else if (status === 403 && message) toast.error(message);
        else if (status === 404) toast.error("User not found");
        else toast.error("Something went wrong. Please try again!");
      } else {
        toast.error("Unexpected error occurred!");
      }
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel (Desktop only) ── */}
      <div className="hidden lg:flex flex-col justify-between w-[440px] shrink-0 bg-[#1a2b4a] px-10 py-16">
        <div className="space-y-8">
          {/* Logo */}
          <div>
            <img
              src="/images/logo/connected_logo.png"
              alt="Connected Education"
              className="h-9 w-auto object-contain brightness-0 invert"
            />
          </div>

          <div>
            <p className="text-white/60 text-xs tracking-[2px] uppercase mb-3 font-medium">
              Study Abroad Platform
            </p>
            <h2 className="text-white text-[28px] leading-[1.1] font-semibold">
              Prepare for your<br />study abroad journey
            </h2>
            <p className="text-white/60 text-[15px] leading-relaxed mt-4 max-w-xs">
              Interview prep, course modules, and expert guidance — all in one place.
            </p>
          </div>
        </div>

        {/* Testimonial */}
        <div className="border border-white/10 rounded-2xl p-7 bg-white/5">
          <p className="text-white/80 text-[15px] leading-relaxed italic">
            "Connected Education gave me the confidence I needed for my study abroad interviews. 
            The structured modules made all the difference."
          </p>
        </div>
      </div>

      {/* ── Right panel (Mobile + Desktop) ── */}
      <div className="flex flex-1 flex-col justify-center px-5 py-8 sm:py-10 md:py-12 lg:px-16 xl:px-24 bg-white dark:bg-gray-950">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile Logo */}
          <div className="mb-8 lg:hidden flex justify-center">
            <img
              src="/images/logo/connected_logo.png"
              alt="Connected Education"
              className="dark:hidden h-8 w-auto object-contain"
            />
            <img
              src="/images/logo/connected_logo_white.png"
              alt="Connected Education"
              className="hidden dark:block h-8 w-auto object-contain"
            />
          </div>

          {/* Heading */}
          <div className="mb-8 lg:mb-9 text-center lg:text-left">
            <h1 className="text-3xl font-semibold text-gray-900 dark:text-white tracking-tight">
              Sign in to your account
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Welcome back — let's continue your preparation.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignIn} className="space-y-6">
            <div>
              <Label>
                Email address <span className="text-error-500">*</span>
              </Label>
              <Input
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label>
                  Password <span className="text-error-500">*</span>
                </Label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-[#1a2b4a] hover:text-[#14223d] dark:text-brand-400 dark:hover:text-brand-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative mt-1.5">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeIcon className="size-5" />
                  ) : (
                    <EyeCloseIcon className="size-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Checkbox checked={isChecked} onChange={setIsChecked} />
              <span className="text-sm text-gray-600 dark:text-gray-400 select-none">
                Keep me signed in
              </span>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#1a2b4a] hover:bg-[#14223d] active:bg-[#0f1a2e] text-white font-medium transition-all duration-200 py-6 text-base mt-2"
              size="sm"
            >
              Sign in
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}