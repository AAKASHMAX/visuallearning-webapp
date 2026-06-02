"use client";

import Link from "next/link";
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Target,
  Trophy,
  XCircle,
} from "lucide-react";
import { useState } from "react";

const quizQuestions = [
  {
    id: 1,
    question: "Who discovered cells for the first time?",
    options: ["Robert Brown", "Robert Hooke", "Leeuwenhoek", "Virchow"],
    correct: 1,
  },
  {
    id: 2,
    question: "Which organelle is known as the 'powerhouse of the cell'?",
    options: ["Golgi apparatus", "Nucleus", "Mitochondria", "Endoplasmic reticulum"],
    correct: 2,
  },
  {
    id: 3,
    question: "Prokaryotic cells lack which of the following?",
    options: ["Cell membrane", "Cytoplasm", "Nuclear membrane", "Ribosomes"],
    correct: 2,
  },
  {
    id: 4,
    question: "Which of the following is NOT a function of the plasma membrane?",
    options: [
      "Protects the cell",
      "Allows selective permeability",
      "Photosynthesis",
      "Maintains cell shape",
    ],
    correct: 2,
  },
  {
    id: 5,
    question: "Lysosomes are also called:",
    options: ["Powerhouse of cell", "Suicide bags", "Kitchen of cell", "Control centre"],
    correct: 1,
  },
];

type QuizState = "idle" | "active" | "result";

export default function DemoQuizPage() {
  const [state, setState] = useState<QuizState>("idle");
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);

  const q = quizQuestions[currentQ];

  function startQuiz() {
    setState("active");
    setCurrentQ(0);
    setSelected(null);
    setAnswered(false);
    setScore(0);
    setAnswers([]);
  }

  function handleSelect(idx: number) {
    if (answered) return;
    setSelected(idx);
  }

  function handleSubmit() {
    if (selected === null) return;
    setAnswered(true);
    const isCorrect = selected === q.correct;
    if (isCorrect) setScore((s) => s + 1);
    setAnswers((a) => [...a, selected]);
  }

  function handleNext() {
    if (currentQ + 1 >= quizQuestions.length) {
      setState("result");
    } else {
      setCurrentQ((c) => c + 1);
      setSelected(null);
      setAnswered(false);
    }
  }

  const percentage = Math.round((score / quizQuestions.length) * 100);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-text-muted">
        <Link href="/demo" className="hover:text-primary">Demo</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-semibold text-heading">Quiz</span>
      </div>

      <div className="mb-8 flex flex-col gap-3">
        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-amber-600">
          <Sparkles className="h-3.5 w-3.5" />
          Demo Preview
        </div>
        <h1 className="text-3xl font-black tracking-tight text-heading sm:text-4xl">Interactive Quiz</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-text-muted sm:text-base">
          Test your knowledge with instant feedback, score tracking, and detailed explanations.
        </p>
      </div>

      {/* Start screen */}
      {state === "idle" && (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
          <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 px-8 py-12 text-center text-white">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <Brain className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-black">The Fundamental Unit of Life</h2>
            <p className="mt-2 text-sm text-white/70">Class 9 — Biology — Chapter 5</p>
          </div>
          <div className="p-8 text-center">
            <div className="mx-auto mb-6 flex max-w-sm justify-center gap-6">
              <div className="flex flex-col items-center gap-1">
                <span className="text-2xl font-black text-heading">{quizQuestions.length}</span>
                <span className="text-xs font-bold text-text-muted">Questions</span>
              </div>
              <div className="h-10 w-px bg-gray-200" />
              <div className="flex flex-col items-center gap-1">
                <span className="text-2xl font-black text-heading">MCQ</span>
                <span className="text-xs font-bold text-text-muted">Format</span>
              </div>
              <div className="h-10 w-px bg-gray-200" />
              <div className="flex flex-col items-center gap-1">
                <span className="text-2xl font-black text-heading">Instant</span>
                <span className="text-xs font-bold text-text-muted">Feedback</span>
              </div>
            </div>
            <button
              onClick={startQuiz}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-amber-500/20 transition-all hover:gap-3 hover:shadow-xl"
            >
              Start Quiz
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Active quiz */}
      {state === "active" && (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
          {/* Progress bar */}
          <div className="h-1.5 bg-gray-100">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
              style={{ width: `${((currentQ + (answered ? 1 : 0)) / quizQuestions.length) * 100}%` }}
            />
          </div>

          <div className="p-6 sm:p-8">
            {/* Question header */}
            <div className="mb-2 flex items-center justify-between">
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-600">
                Question {currentQ + 1} / {quizQuestions.length}
              </span>
              <span className="flex items-center gap-1 text-xs font-bold text-text-muted">
                <Target className="h-3.5 w-3.5" />
                Score: {score}
              </span>
            </div>

            {/* Question text */}
            <h3 className="mb-6 mt-4 text-lg font-black leading-relaxed text-heading sm:text-xl">
              {q.question}
            </h3>

            {/* Options */}
            <div className="flex flex-col gap-3">
              {q.options.map((opt, i) => {
                let optionClass = "border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50/50";
                if (answered) {
                  if (i === q.correct) {
                    optionClass = "border-emerald-400 bg-emerald-50";
                  } else if (i === selected && i !== q.correct) {
                    optionClass = "border-red-300 bg-red-50";
                  } else {
                    optionClass = "border-gray-100 bg-gray-50 opacity-50";
                  }
                } else if (i === selected) {
                  optionClass = "border-amber-400 bg-amber-50 shadow-md shadow-amber-500/10";
                }

                return (
                  <button
                    key={i}
                    onClick={() => handleSelect(i)}
                    disabled={answered}
                    className={`flex items-center gap-3 rounded-xl border-2 px-5 py-4 text-left transition-all ${optionClass}`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-black ${
                        answered && i === q.correct
                          ? "bg-emerald-500 text-white"
                          : answered && i === selected && i !== q.correct
                            ? "bg-red-500 text-white"
                            : i === selected
                              ? "bg-amber-500 text-white"
                              : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {answered && i === q.correct ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : answered && i === selected && i !== q.correct ? (
                        <XCircle className="h-5 w-5" />
                      ) : (
                        String.fromCharCode(65 + i)
                      )}
                    </div>
                    <span className={`text-sm font-medium ${answered && i === q.correct ? "text-emerald-700" : "text-gray-700"}`}>
                      {opt}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Action buttons */}
            <div className="mt-6 flex justify-end">
              {!answered ? (
                <button
                  onClick={handleSubmit}
                  disabled={selected === null}
                  className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-amber-500/20 transition-all hover:shadow-xl disabled:opacity-40 disabled:shadow-none"
                >
                  Submit Answer
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-amber-500/20 transition-all hover:gap-3 hover:shadow-xl"
                >
                  {currentQ + 1 >= quizQuestions.length ? "See Results" : "Next Question"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Results screen */}
      {state === "result" && (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
          <div
            className={`px-8 py-12 text-center text-white ${
              percentage >= 80
                ? "bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500"
                : percentage >= 50
                  ? "bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-500"
                  : "bg-gradient-to-br from-rose-500 via-red-500 to-orange-500"
            }`}
          >
            <Trophy className="mx-auto mb-4 h-16 w-16 opacity-80" />
            <h2 className="text-3xl font-black">
              {percentage >= 80 ? "Excellent!" : percentage >= 50 ? "Good Try!" : "Keep Practicing!"}
            </h2>
            <p className="mt-2 text-lg font-bold text-white/80">
              You scored {score} out of {quizQuestions.length}
            </p>
            <div className="mx-auto mt-4 h-3 w-48 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-white/80 transition-all duration-1000"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <p className="mt-2 text-2xl font-black">{percentage}%</p>
          </div>

          {/* Answer summary */}
          <div className="p-6">
            <h3 className="mb-4 text-sm font-black text-heading">Answer Summary</h3>
            <div className="flex flex-col gap-2">
              {quizQuestions.map((qq, i) => {
                const userAnswer = answers[i];
                const isCorrect = userAnswer === qq.correct;
                return (
                  <div
                    key={qq.id}
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 ${
                      isCorrect ? "bg-emerald-50" : "bg-red-50"
                    }`}
                  >
                    {isCorrect ? (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                    ) : (
                      <XCircle className="h-5 w-5 shrink-0 text-red-500" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-700">{qq.question}</p>
                      {!isCorrect && (
                        <p className="mt-0.5 text-xs text-emerald-600">
                          Correct: {qq.options[qq.correct]}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={startQuiz}
                className="flex-1 rounded-xl border-2 border-amber-200 px-4 py-3 text-sm font-bold text-amber-600 transition-all hover:bg-amber-50"
              >
                Retake Quiz
              </button>
              <Link
                href="/courses"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-amber-500/20 transition-all hover:gap-3"
              >
                View Plans
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
