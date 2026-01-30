import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useClerk, useUser, UserButton } from "@clerk/clerk-react";

import { assets } from "../assets/assets";

const Navbar = () => {
  // React Router hook to navigate programmatically
  const navigate = useNavigate();

  /**
   * Clerk hook that gives the current authenticated user
   * - user === null  -> not logged in
   * - user === object -> logged in
   */
  const { user } = useUser();

  /**
   * Clerk hook that provides auth-related actions
   * openSignIn() opens Clerk's sign-in modal
   */
  const { openSignIn } = useClerk();

  return (
    <div
      className="
        fixed z-5 w-full
        backdrop-blur-2xl
        flex justify-between items-center
        py-3 px-4 sm:px-20 xl:px-32
        cursor-pointer
      "
    >
      <img
        src={assets.logo}
        alt="logo"
        className="w-32 sm:w-44 cursor-pointer"
        onClick={() => navigate("/")}
      />

      {/* 
        Conditional rendering based on authentication state
        - If user exists → show profile button
        - If user does not exist → show "Get started" button
      */}
      {user ? (
        /**
         * Clerk's built-in user menu
         * Shows avatar + dropdown (account, sign out, etc.)
         */
        <UserButton />
      ) : (
        /**
         * If user is not logged in,
         * clicking this opens Clerk's sign-in modal
         */
        <button
          onClick={openSignIn}
          className="
            flex items-center gap-2
            rounded-full text-sm
            bg-primary text-white
            px-10 py-2.5
            cursor-pointer
          "
        >
          Get started
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default Navbar;
