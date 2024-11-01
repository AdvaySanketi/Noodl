import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { Bricolage_Grotesque } from "next/font/google";
import { Space_Mono } from "next/font/google";
import { NoodlSnackbar } from "@/components/snackbar";

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
  const noodlCode = context.query.id;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASEURL}/api/noodl-questions`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        quiz: noodlCode,
      },
    }
  );
  const data = await res.json();

  const result = await fetch(`${process.env.NEXT_PUBLIC_BASEURL}/api/bowls`);
  const bowls = await result.json();

  const questions = data[0].questions || [];

  return {
    props: {
      questions,
      bowls,
    },
  };
}

export default function QuizPage({ questions, bowls }) {
  const router = useRouter();
  const { id: noodlCode } = router.query;
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(1200);
  const [isGameOver, setIsGameOver] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [isRunning, setIsRunning] = useState(true);
  const [error, setError] = useState("");
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [restoring, setRestoring] = useState(true);
  const [valid, setValid] = useState(false);
  const progressBarRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (!bowls.includes(noodlCode)) {
      router.push("/404");
    } else {
      setValid(true);
    }
  }, [noodlCode]);

  useEffect(() => {
    const username = localStorage.getItem("username");
    if (!username) {
      router.push(`/${noodlCode}`);
    }
    const savedOptions = localStorage.getItem(`selectedOptions`);
    const savedTimeLeft = localStorage.getItem(`timeLeft`);
    const savedQuestionIndex = localStorage.getItem(`currentQuestionIndex`);

    if (savedOptions) setSelectedOptions(JSON.parse(savedOptions));
    if (savedTimeLeft) setTimeLeft(Number(savedTimeLeft));
    if (savedQuestionIndex) setCurrentQuestionIndex(Number(savedQuestionIndex));
    setRestoring(false);
  }, [noodlCode]);

  useEffect(() => {
    if (!restoring) {
      localStorage.setItem(`selectedOptions`, JSON.stringify(selectedOptions));
      localStorage.setItem(`timeLeft`, timeLeft);
      localStorage.setItem(`currentQuestionIndex`, currentQuestionIndex);
    }
  }, [selectedOptions, timeLeft, currentQuestionIndex, noodlCode, restoring]);

  useEffect(() => {
    const timerId = setInterval(() => {
      if (timeLeft > 0) {
        setTimeLeft((prev) => prev - 1);
        setIsRunning(true);
      } else if (timeLeft === 0) {
        setIsGameOver(true);
      }
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, isGameOver]);

  useEffect(() => {
    const updateProgressBar = () => {
      if (isRunning) {
        const currentTime = Date.now();
        const elapsed = (currentTime - startTimeRef.current) / 1000;
        const remaining = Math.max(timeLeft - elapsed, 0);

        if (progressBarRef.current) {
          progressBarRef.current.style.transform = `scaleX(${
            remaining / 1200
          })`;
        }

        if (remaining <= 0) {
          setIsRunning(false);
        } else {
          requestAnimationFrame(updateProgressBar);
        }
      }
    };

    if (!isGameOver) {
      if (isRunning) {
        startTimeRef.current = Date.now();
        requestAnimationFrame(updateProgressBar);
      }

      return () => {
        setIsRunning(false);
      };
    }
  }, [isRunning, timeLeft]);

  useEffect(() => {
    if (isGameOver) {
      const updateScore = async () => {
        try {
          let calculatedScore = 0;
          let bonusScore = 0;

          selectedOptions.forEach((optionIndex, index) => {
            if (optionIndex !== null) {
              const question = questions[index];
              const selectedOption = question.options[optionIndex];

              if (selectedOption.isCorrect) {
                if (question.bonus) {
                  bonusScore += question.score;
                } else {
                  calculatedScore += question.score;
                }
              }
            }
          });

          const username = localStorage.getItem("username");
          const response = await fetch("/api/noodl", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "add",
              data: {
                username,
                quiz: noodlCode,
                score: calculatedScore,
                bonus: bonusScore,
              },
            }),
          });

          if (!response.ok) {
            setIsGameOver(false);
            setError("Name Already Exists");
            setShowSnackbar(true);
          } else {
            localStorage.removeItem(`selectedOptions`);
            localStorage.removeItem(`timeLeft`);
            localStorage.removeItem(`currentQuestionIndex`);
            router.push(`/${noodlCode}/leaderboard`);
          }
        } catch (error) {
          setError("Failed to update record");
          setShowSnackbar(true);
        }
      };

      updateScore();
    }
  }, [isGameOver, selectedOptions, noodlCode]);

  const handleOptionClick = (index) => {
    setSelectedOptions((prev) => {
      const newSelection = [...prev];
      newSelection[currentQuestionIndex] =
        newSelection[currentQuestionIndex] === index ? null : index;
      return newSelection;
    });
    handleNextQuestion();
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handleQuestionSelect = (index) => {
    setCurrentQuestionIndex(index);
  };

  const handleSubmit = () => {
    setIsGameOver(true);
  };

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-[hsl(210,100%,6%)] text-[hsl(180,100%,90%)] flex items-center justify-center">
        <p className="text-2xl font-bold">Starting Quiz...</p>
      </div>
    );
  }

  if (!valid) {
    return (
      <div className="min-h-screen bg-[hsl(210,100%,6%)] text-[hsl(180,100%,90%)] flex items-center justify-center"></div>
    );
  }

  const closeSnackbar = () => {
    setShowSnackbar(false);
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div
      className={`bg-[hsl(210,100%,6%)] text-[hsl(180,100%,90%)] min-h-screen flex flex-col ${fontBody.variable} ${fontHeading.variable}`}
      style={{
        fontFamily: "var(--font-body)",
      }}
    >
      {showSnackbar && (
        <NoodlSnackbar
          message={error}
          onClose={closeSnackbar}
          bgColor="black"
        />
      )}
      <img
        src="/ramen.png"
        alt="Logo"
        className="absolute top-4 left-4 w-12 h-12"
      />
      <div className="container max-w-7xl w-full flex-1 flex flex-col justify-center">
        <button
          onClick={handleSubmit}
          className="absolute top-4 right-4 bg-[hsl(200,100%,18%)] text-[hsl(180,100%,90%)] px-4 py-2 rounded-lg hover:bg-[hsl(200,100%,24%)] transition-colors"
        >
          {`Finish ${
            noodlCode.charAt(0).toUpperCase() + noodlCode.slice(1).toLowerCase()
          } Bowl`}
        </button>
        <div className="bg-[hsl(210,100%,12%)] rounded-2xl overflow-hidden relative">
          <div className="p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div className="flex flex-col gap-1">
                <h2
                  className="text-2xl font-bold max-h-40 overflow-auto"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {currentQuestion.question.split("\n").map((line, index) => (
                    <span key={index}>
                      {line}
                      {index <
                        currentQuestion.question.split("\n").length - 1 && (
                        <br />
                      )}
                    </span>
                  ))}
                </h2>
              </div>

              <div className="bg-[hsl(200,100%,28%)] text-[hsl(180,100%,90%)] px-3 py-1 rounded-full text-sm font-medium text-center">
                {`${currentQuestion.score} pts`}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleOptionClick(index)}
                  className={`rounded-2xl px-4 py-3 text-left transition-colors ${
                    selectedOptions[currentQuestionIndex] === index
                      ? "bg-[hsl(180,100%,90%)]/30"
                      : "bg-[hsl(180,100%,90%)]/10 hover:bg-[hsl(180,100%,90%)]/20"
                  }`}
                >
                  <div className="font-medium">{option.answer}</div>
                </button>
              ))}
            </div>
          </div>
          <div className="bg-[hsl(180,100%,90%)]/10 bg-[hsl(180,100%,90%)]/20 px-6 py-4 ">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="text-[hsl(180,100%,90%)] text-sm">
                  Question {currentQuestionIndex + 1} / {questions.length}
                </div>
                {currentQuestion.bonus && (
                  <div className="bg-[hsl(200,100%,28%)] text-[hsl(180,100%,90%)] px-3 py-1 rounded-full text-sm font-medium">
                    Bonus
                  </div>
                )}
              </div>
              <div className="text-[hsl(180,100%,90%)] text-sm">
                Time Left: {Math.floor(timeLeft / 60)}:
                {(timeLeft % 60).toString().padStart(2, "0")}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-4 flex-wrap">
        <div
          className={`grid ${
            questions.length > 10
              ? "grid-cols-10"
              : `grid-cols-${questions.length}`
          } gap-2`}
        >
          {questions.map((_, index) => (
            <button
              key={index}
              onClick={() => handleQuestionSelect(index)}
              className={`w-12 h-12 rounded-md flex items-center justify-center mx-1 mb-1 ${
                selectedOptions[index] !== undefined
                  ? "bg-[hsl(200,100%,28%)] text-[hsl(180,100%,90%)]"
                  : questions[index].bonus
                  ? "bg-[hsl(50,100%,85%)] text-[hsl(30,50%,20%)] hover:bg-[hsl(50,100%,85%)]/50"
                  : "bg-[hsl(180,100%,90%)] text-[hsl(210,100%,10%)] hover:bg-[hsl(180,100%,90%)]/50"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full h-3 bg-[hsl(210,100%,90%)]/20 bg-[hsl(210,100%,90%)]/30 mt-4">
        <div
          ref={progressBarRef}
          className="h-full bg-[hsl(180,100%,90%)] transition-transform duration-100 ease-linear"
          style={{
            transformOrigin: "left",
          }}
        />
      </div>
    </div>
  );
}
