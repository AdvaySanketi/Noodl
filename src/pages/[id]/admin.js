"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import Link from "next/link";
import { Bricolage_Grotesque, Space_Mono } from "next/font/google";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/dropdown-menu";
import { Button } from "@/components/button";
import { FaBan, FaUser, FaChartLine, FaClock, FaUnlockAlt } from "react-icons/fa";
import { Card, CardContent, CardFooter } from "@/components/card";
import { Label } from "@/components/label";
import { Input } from "@/components/input";

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

export default function AdminPage({ bowls }) {
  const router = useRouter();
  const { id: noodlCode } = router.query;
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState("");
  const [analytics, setAnalytics] = useState({
    totalAttempts: 0,
    averageScore: 0,
    averageTime: 0,
  });
  const [valid, setValid] = useState(false);

  useEffect(() => {
    if (!bowls.includes(noodlCode)) {
      router.push("/404");
    } else {
      setValid(true);
    }
  }, [noodlCode]);

  useEffect(() => {
    if (noodlCode && isAuthenticated && valid) {
      fetchData();
      const interval = setInterval(fetchData, 5000);

      return () => clearInterval(interval);
    }
  }, [noodlCode, isAuthenticated, valid]);

  const fetchData = async () => {
    try {
      let username = localStorage.getItem("username");
      setUsername(username);
      const response = await fetch("/api/admin-data", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          quiz: noodlCode,
        },
      });
      const result = await response.json();
      setUsers(result["leaderboard"]);
      const totalAttempts = result["leaderboard"].length;
      const averageScore =
        result["leaderboard"].reduce((sum, attempt) => sum + attempt.score, 0) /
        totalAttempts;

      const totalTestTime = 20;
      const averageTime =
        totalAttempts > 0
          ? totalTestTime * (averageScore / result["totalScore"])
          : 0;

      setAnalytics({ ...analytics, totalAttempts, averageScore, averageTime });
    } catch (error) {
      console.error("Failed to get users:", error);
    }
  };

  const handleBanToggle = async (username) => {
    try {
      const response = await fetch("/api/ban-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          quizId: noodlCode,
        }),
      });
  
      const result = await response.json();
      
      if (result.success) {
        setUsers(users.map(user => 
          user.username === username 
            ? { ...user, isBanned: !user.isBanned }
            : user
        ));
      } else {
        console.error("Failed to toggle ban status:", result.error);
      }
    } catch (error) {
      console.error("Error toggling ban status:", error);
    }
  };

  const handleLogin = async () => {
    try {
      const response = await fetch("/api/authenticate-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: adminUsername,
          password: adminPassword,
          quizId: noodlCode,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setIsAuthenticated(true);
        setAuthError("");
      } else {
        setAuthError(result.message || "Invalid username or password");
      }
    } catch (error) {
      console.error("Login error:", error);
      setAuthError("Authentication failed. Please try again.");
    }
  };

  const handleLogout = () => {
    router.push("/");
  };

  const exportToCSV = () => {
    if (!users || users.length === 0) return;
    const headers = ["Rank", "Name", "Score", "Bonus Score"];
    const rows = users.map((user, index) => [
      index + 1,
      user.username,
      user.score,
      user.bonus,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `leaderboard_${noodlCode}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!valid) {
    return (
      <div className="min-h-screen bg-[hsl(210,100%,6%)] text-[hsl(180,100%,90%)] flex items-center justify-center"></div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div 
        className={`min-h-screen flex items-center justify-center bg-[hsl(210,100%,6%)] text-[hsl(180,100%,90%)] ${fontBody.variable} ${fontHeading.variable}`}
        style={{
          fontFamily: "var(--font-body)",
        }}
      >
        
        <motion.div
          className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-lg shadow-lg max-w-sm w-full p-6"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <div className="text-center mb-6">
            <img src="/ramen.png" className="h-12 mx-auto mb-3" alt="Logo" />
            <h1 
              className="text-3xl font-semibold text-[hsl(180,100%,90%)]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Admin Login
            </h1>
          </div>
          <Card className="bg-[hsl(210,100%,15%)]">
            <CardContent className="space-y-4">
              <div className="space-y-2 mt-5">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Enter your username"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  className="bg-[hsl(210,100%,12%)] text-[hsl(180,100%,90%)] border border-[hsl(180,100%,90%)]/10 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="bg-[hsl(210,100%,12%)] text-[hsl(180,100%,90%)] border border-[hsl(180,100%,90%)]/10 focus:outline-none focus:border-blue-500"
                />
              </div>
              {authError && <p className="text-red-500 mb-4">{authError}</p>}
            </CardContent>
            <CardFooter>
              <Button
                variant="secondary"
                className="w-full bg-[hsl(200,100%,18%)] hover:bg-[hsl(200,100%,24%)] text-[hsl(180,100%,90%)]"
                onClick={handleLogin}
              >
                Login
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-[hsl(210,100%,6%)] text-[hsl(180,100%,90%)] flex flex-col ${fontBody.variable} ${fontHeading.variable}`}
      style={{
        fontFamily: "var(--font-body)",
      }}
    >
      <header className="sticky top-2 z-30 flex h-14 items-center gap-4 bg-background px-6 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-8">
        <Link
          href=""
          className="flex items-center gap-2 font-semibold"
          prefetch={false}
        >
          <img
            src="/ramen.png"
            alt="Noodl."
            className="h-10 w-10"
            style={{ borderRadius: "50%" }}
          />
          <span className="sr-only">Noodl.</span>
        </Link>

        <div className="ml-auto flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <div
                  className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-300 to-blue-800"
                  style={{ aspectRatio: "1/1", objectFit: "cover" }}
                />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Admin</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => {}}>Settings</DropdownMenuItem>
              <DropdownMenuItem onClick={exportToCSV}>
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <div className="container max-w-6xl w-full mt-10">
        <h1
          className="text-3xl font-bold mb-5"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Analytics
        </h1>
        <div className="bg-[hsl(210,100%,12%)] text-[hsl(180,100%,90%)] mb-5 p-6 rounded-lg shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-lg bg-[hsl(210,100%,15%)] flex items-center gap-4 shadow-md hover:shadow-lg transition-shadow">
              <FaUser className="text-blue-300 text-3xl" />
              <div>
                <p className="font-semibold text-lg">Total Attempts</p>
                <p className="text-2xl font-bold">{analytics.totalAttempts}</p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-[hsl(210,100%,15%)] flex items-center gap-4 shadow-md hover:shadow-lg transition-shadow">
              <FaChartLine className="text-green-300 text-3xl" />
              <div>
                <p className="font-semibold text-lg">Average Score</p>
                <p className="text-2xl font-bold">
                  {analytics.averageScore.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-[hsl(210,100%,15%)] flex items-center gap-4 shadow-md hover:shadow-lg transition-shadow">
              <FaClock className="text-yellow-300 text-3xl" />
              <div>
                <p className="font-semibold text-lg">Average Time Spent</p>
                <p className="text-2xl font-bold">
                  {analytics.averageTime.toFixed(2)}mins
                </p>
              </div>
            </div>
          </div>
        </div>
        <h1
          className="text-3xl font-bold mb-5"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Leaderboard
        </h1>
        <div className="bg-[hsl(210,100%,12%)] text-[hsl(180,100%,90%)] mb-20 rounded-lg overflow-hidden">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-[hsl(210,100%,15%)]">
                <th className="px-4 py-3 text-left font-medium">Rank</th>
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-right font-medium">Score</th>
                <th className="px-4 py-3 text-right font-medium">
                  Bonus Score
                </th>
                <th className="px-4 py-3 text-right font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr
                  key={index}
                  className={
                    user.isBanned ? "bg-red-500/20 border-b border-[hsl(180,100%,90%)]/10" :
                    "border-b border-[hsl(180,100%,90%)]/10"
                  }
                >
                  <td className="px-4 py-3 font-medium">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3">{user.username}</td>
                  <td className="px-4 py-3 text-right">{user.score}</td>
                  <td className="px-4 py-3 text-right">{user.bonus}</td>
                  <td className="px-4 py-3 text-right">
                  <button 
                    onClick={() => handleBanToggle(user.username)} 
                    className={`text-${user.isBanned ? "green" : "red"}-500`}
                  >
                  {user.isBanned ? <FaUnlockAlt color="#50C878"/> : <FaBan />}
                  </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}