"use client";

import { useEffect } from "react";

export default function GoogleCallback() {
  useEffect(() => {
    const fragmentString = window.location.hash.substring(1); // Extract hash fragment
    const params = new URLSearchParams(fragmentString);

    const accessToken = params.get("access_token");
    const state = params.get("state");

    if (!accessToken) {
      console.error("No access token found");
      return;
    }

    // Check the state parameter to prevent CSRF
    const storedState = localStorage.getItem("oauth_state");
    if (state !== storedState) {
      alert("Invalid state parameter. Potential CSRF detected.");
      return;
    }

    // Send token to the backend for validation/storage
    async function sendTokenToBackend() {
      try {
        const response = await fetch("http://localhost:8000/api/v1/auth/oauth/google/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ access_token: accessToken }),
        });

        if (!response.ok) {
          throw new Error("Failed to send token to backend");
        }

        alert("Google OAuth successful!");
      } catch (error) {
        console.error("Error sending token to backend:", error);
      }
    }

    sendTokenToBackend();

    // Clean the URL
    window.history.replaceState(null, "", window.location.pathname);
  }, []);

  return <p>Processing Google OAuth...</p>;
}
