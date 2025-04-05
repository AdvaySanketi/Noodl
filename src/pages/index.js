"use client";

import { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { RiDrinks2Fill } from "react-icons/ri";
import { GiNoodles } from "react-icons/gi";
import { FaBowlRice } from "react-icons/fa6";
import { LuIceCream2 } from "react-icons/lu";
import { Bricolage_Grotesque, Space_Mono } from "next/font/google";

// Import the same fonts from the leaderboard page
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

const IconComponent = ({ Icon }) => {
  const controls = useAnimation();

  useEffect(() => {
    controls.start({
      y: [0, -10, 0],
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 5,
        repeat: Infinity,
        repeatType: "mirror",
        ease: "easeInOut",
      },
    });
  }, [controls]);

  return (
    <motion.div
      whileHover={{ scale: 1.2, rotate: 360 }}
      whileTap={{ scale: 0.8 }}
      animate={controls}
    >
      <Icon className="text-4xl text-[hsl(180,100%,90%)] hover:text-blue-400 transition-colors duration-300" />
    </motion.div>
  );
};

export async function getServerSideProps(context) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASEURL}/api/bowls`);
  const bowls = await res.json();

  const randomStyles = [...Array(20)].map(() => ({
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    width: `${Math.random() * 4 + 1}px`,
    height: `${Math.random() * 4 + 1}px`,
    animationDuration: `${Math.random() * 10 + 5}s`,
  }));

  return {
    props: {
      bowls,
      randomStyles,
    },
  };
}

export default function LandingPage({ bowls, randomStyles }) {
  const [quizCode, setQuizCode] = useState("");

  const handleRedirect = (e) => {
    e.preventDefault();
    if (bowls.includes(quizCode)) {
      window.location.href = `/${quizCode.replace(/\//g, "")}/`;
    } else if (quizCode.startsWith("admin-")) {
      const code = quizCode.replace("admin-", "");
      if (bowls.includes(code)) {
        window.location.href = `/${code}/admin`;
      } else {
        window.location.href = `/404`;
      }
    } else {
      window.location.href = `/404`;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between bg-[hsl(210,100%,6%)] text-[hsl(180,100%,90%)] ${fontBody.variable} ${fontHeading.variable}`}
      style={{
        fontFamily: "var(--font-body)",
      }}>
      {/* Header with Create Quiz button and Logo */}
      <header className="w-full py-4 px-6 absolute top-0 left-0 z-20">
        <div className="flex justify-end">
          <motion.button
            onClick={() => window.location.href = "/create-quiz"}
            className="bg-[hsl(200,100%,18%)] text-[hsl(180,100%,90%)] text-lg px-4 py-2 rounded-lg hover:bg-[hsl(200,100%,24%)] transition-colors shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6, ease: "easeInOut" }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Create Quiz
          </motion.button>
        </div>
      </header>

      <div className="flex-grow flex items-center justify-center">
        <div className="relative z-10 text-center">
          <motion.h1
            className="text-4xl md:text-6xl font-bold mb-4"
            style={{ fontFamily: "var(--font-heading)" }}
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            Welcome to Noodl. 🍜
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl mb-4 text-[hsl(180,100%,90%)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Start by entering the noodl-bowl code below
          </motion.p>
          <pre className="text-sm mb-7 text-[hsl(180,100%,90%)]/70">If you're an admin, enter "admin-&lt;noodl-bowl code&gt;"</pre> 
          <form onSubmit={handleRedirect} className="mb-12">
            <input
              type="text"
              value={quizCode}
              onChange={(e) => setQuizCode(e.target.value)}
              placeholder="Enter your noodl-bowl code here"
              className="w-full md:w-96 px-4 py-2 rounded-lg bg-gray-800 text-[hsl(180,100%,90%)] border border-[hsl(180,100%,90%)]/10 focus:outline-none focus:border-blue-500"
            />
          </form>
          <motion.div
            className="flex justify-center space-x-8"
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            {[RiDrinks2Fill, FaBowlRice, GiNoodles, LuIceCream2].map(
              (Icon, index) => (
                <IconComponent key={index} Icon={Icon} />
              )
            )}
          </motion.div>
        </div>
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          {randomStyles.map((style, i) => (
            <div
              key={i}
              className="absolute bg-blue-300 opacity-30 rounded-full"
              style={{
                top: style.top,
                left: style.left,
                width: style.width,
                height: style.height,
                animation: `float ${style.animationDuration} linear infinite`,
              }}
            />
          ))}
        </div>
      </div>

      <footer className="text-center py-4">
        <p className="text-[hsl(180,100%,90%)]/70">
          Prepared with the perfect ingredients and a lot of ❤️ by Advay Sanketi
        </p>
      </footer>
    </div>
  );
}