"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion, useAnimation } from "framer-motion";
import { LampContainer } from "../../components/lamp";
import Cookies from 'js-cookie';

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
      <Icon className="text-4xl text-gray-300 hover:text-blue-400 transition-colors duration-300" />
    </motion.div>
  );
};

export async function getServerSideProps(context) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASEURL}/api/bowls`);
  const bowls = await res.json();

  return {
    props: {
      bowls,
    },
  };
}

export default function LandingPage({ bowls }) {
  const router = useRouter();
  const { id } = router.query;
  const [username, setUsername] = useState("");
  const [valid, setValid] = useState(false);

  useEffect(() => {
    if (!bowls.includes(id)) {
      router.push("/404");
    } else {
      setValid(true);
    }
  }, [id]);

  const formattedId = id
    ? id.charAt(0).toUpperCase() + id.slice(1).toLowerCase()
    : "";

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem("username", username);
    Cookies.set("username", username, { secure: true, sameSite: "strict" });
    router.push(`/${id}/test`);
  };

  if (!valid) {
    return (
      <div className="min-h-screen bg-[hsl(210,100%,6%)] text-[hsl(180,100%,90%)] flex items-center justify-center"></div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-b from-gray-900 to-black text-white">
      <LampContainer>
        <div className="flex-grow flex items-center justify-center">
          <div className="relative z-10 text-center">
            <motion.h1
              initial={{ opacity: 0.5, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.3,
                duration: 0.8,
                ease: "easeInOut",
              }}
              className="mt-4 mb-4 bg-gradient-to-br from-slate-300 to-slate-500 py-4 bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl"
            >
              What’s your culinary alias?
            </motion.h1>

            <motion.form
              onSubmit={handleSubmit}
              className="mb-7"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6, ease: "easeInOut" }}
            >
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your name here"
                className="w-full md:w-96 px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
              />
            </motion.form>

            <motion.button
              onClick={handleSubmit}
              className="bg-[hsl(200,100%,18%)] text-[hsl(180,100%,90%)] px-4 py-2 rounded-lg hover:bg-[hsl(200,100%,24%)] transition-colors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6, ease: "easeInOut" }}
            >
              {`Cook ${formattedId}`}
            </motion.button>
          </div>
        </div>
      </LampContainer>
    </div>
  );
}
