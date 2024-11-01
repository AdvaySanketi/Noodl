import { Bricolage_Grotesque } from "next/font/google";
import { Space_Mono } from "next/font/google";
import { useRouter } from "next/router";
import Link from "next/link";
import { useEffect, useState } from "react";

const fontHeading = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-heading",
});

const fontBody = Space_Mono({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});

export async function getServerSideProps(context) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASEURL}/api/bowls`);
  const bowls = await res.json();

  return {
    props: {
      bowls,
    },
  };
}

export default function LeaderboardPage({ bowls }) {
  const router = useRouter();
  const { id: noodlCode } = router.query;
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState("");
  const [valid, setValid] = useState(false);

  useEffect(() => {
    if (!bowls.includes(noodlCode)) {
      router.push("/404");
    } else {
      setValid(true);
    }
  }, [noodlCode]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let username = localStorage.getItem("username");
        setUsername(username);
        const response = await fetch("/api/noodl", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            username: username || null,
            quiz: noodlCode,
          },
        });

        const result = await response.json();
        setUsers(result);
      } catch (error) {
        console.error("Failed to get users:", error);
      }
    };

    if (noodlCode) {
      fetchData();
    }
  }, [noodlCode]);

  if (!valid) {
    return (
      <div className="min-h-screen bg-[hsl(210,100%,6%)] text-[hsl(180,100%,90%)] flex items-center justify-center"></div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-[hsl(210,100%,6%)] text-[hsl(180,100%,90%)] flex flex-col ${fontBody.variable} ${fontHeading.variable}`}
      style={{
        fontFamily: "var(--font-body)",
      }}
    >
      <img
        src="/ramen.png"
        alt="Logo"
        className="absolute top-4 right-8 w-16 h-16"
      />
      <button
        onClick={() => router.push("/")}
        className="absolute top-5 left-6 text-[hsl(180,100%,90%)] px-4 py-2 rounded-lg text-4xl transition-colors"
      >
        Noodl.
      </button>
      <div className="container max-w-6xl w-full mt-32">
        <h1
          className="text-3xl font-bold mb-5"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Leaderboard
        </h1>
        <div className="bg-[hsl(210,100%,12%)] text-[hsl(180,100%,90%)] rounded-lg overflow-hidden">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-[hsl(210,100%,15%)]">
                <th className="px-4 py-3 text-left font-medium">Rank</th>
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-right font-medium">Score</th>
                <th className="px-4 py-3 text-right font-medium">
                  Bonus Score
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr
                  key={index}
                  className={`${
                    user.username == username
                      ? "bg-[hsl(180,100%,15%)] border border-2 border-[hsl(210,100%,90%)]/10"
                      : "border-b border-[hsl(180,100%,90%)]/10"
                  }`}
                >
                  <td className="px-4 py-3 font-medium">
                    {user.username == username && users.length == 11
                      ? user.rank
                      : index + 1}
                  </td>
                  <td className="px-4 py-3">{user.username}</td>
                  <td className="px-4 py-3 text-right">{user.score}</td>
                  <td className="px-4 py-3 text-right">{user.bonus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
