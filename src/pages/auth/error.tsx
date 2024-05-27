import { useRouter } from "next/navigation";
import Link from "next/link";

const AuthError = () => {
  const router = useRouter();
  const { error } = router.query;

  return (
    <div>
      <h1>Authentication Error</h1>
      <p>{error ? `Error: ${error}` : "An unknown error occurred."}</p>
      <Link href="/login">
        <a>Go back to login</a>
      </Link>
    </div>
  );
};

export default AuthError;
