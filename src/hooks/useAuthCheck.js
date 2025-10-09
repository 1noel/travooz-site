import { useState } from "react";
import { useAuth } from "../context/useAuth";

/**
 * Hook to check authentication and show prompt if not authenticated
 * @returns {Object} - { checkAuth, AuthPromptComponent }
 */
export const useAuthCheck = () => {
  const { isAuthenticated } = useAuth();
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [authPromptMessage, setAuthPromptMessage] = useState("");

  /**
   * Check if user is authenticated before performing an action
   * @param {string} message - Optional custom message to show in auth prompt
   * @returns {boolean} - true if authenticated, false if not
   */
  const checkAuth = (message = "") => {
    if (!isAuthenticated) {
      setAuthPromptMessage(message);
      setShowAuthPrompt(true);
      return false;
    }
    return true;
  };

  const closeAuthPrompt = () => {
    setShowAuthPrompt(false);
    setAuthPromptMessage("");
  };

  return {
    isAuthenticated,
    checkAuth,
    showAuthPrompt,
    closeAuthPrompt,
    authPromptMessage,
  };
};

export default useAuthCheck;
