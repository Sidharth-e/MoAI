// REMOVE "use client"
import { userSession } from "@/features/auth-page/helpers";

export default async function Page() {
  const user = await userSession();
  const token = user?.jwtToken;

  const res = await fetch("http://localhost:8080/api/user/all", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) console.log("Failed to fetch users");
  const data = await res.json();

  return (
    <div>
      <h2>Users:</h2>
      <pre>{JSON.stringify(data.users, null, 2)}</pre>
    </div>
  );
}
