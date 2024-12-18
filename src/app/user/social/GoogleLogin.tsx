import React, { useEffect } from "react";

interface GoogleLoginProps {
  backendAuthUrl: string;
}

const GoogleLogin: React.FC<GoogleLoginProps> = ({ backendAuthUrl }) => {
  const GOOGLE_CLIENT_ID = "145752720268-opb0hqshoprm5tqvrhuen9aiugvimtdg.apps.googleusercontent.com";
  const REDIRECT_URI = "http://localhost:3000/user/social/"; // Update this as per your setup
  const SCOPES = "https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/calendar.readonly";

  const generateState = () => {
    const array = new Uint32Array(10);
    window.crypto.getRandomValues(array);
    return Array.from(array, (val) => val.toString(36)).join("");
  };

  const handleGoogleSignIn = () => {
    const state = generateState();
    localStorage.setItem("oauth_state", state);

    const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${GOOGLE_CLIENT_ID}` +
      `&redirect_uri=${REDIRECT_URI}` +
      `&response_type=token` +
      `&scope=${encodeURIComponent(SCOPES)}` +
      `&include_granted_scopes=true` +
      `&state=${state}`;

    window.location.href = oauthUrl;
  };

  useEffect(() => {
    const fragmentString = window.location.hash.substring(1);
    const params = new URLSearchParams(fragmentString);

    const accessToken = params.get("access_token");
    const state = params.get("state");

    if (accessToken) {
      const storedState = localStorage.getItem("oauth_state");
      if (state !== storedState) {
        alert("Invalid state parameter. Potential CSRF detected.");
        return;
      }
      localStorage.removeItem("oauth_state");

      fetch(backendAuthUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ access_token: accessToken }),
      })
        .then((response) => {
          if (response.ok) {
            alert("Google login successful!");
          }
        })
        .catch((error) => {
          console.error("Error during Google login:", error);
        });
    }
  }, [backendAuthUrl]);

  return (
    <button onClick={handleGoogleSignIn}>
      Sign in with Google
    </button>
  );
};

export default GoogleLogin;