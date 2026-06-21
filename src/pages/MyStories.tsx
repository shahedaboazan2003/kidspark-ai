import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getChildStories, getMyStories } from "@/lib/story";
import { submitAnswers } from "@/lib/questions";
<<<<<<< Updated upstream
import Confetti from "react-confetti";

=======
import { toast } from "sonner";
import AppNavbar from "@/components/AppNavbar";
import PlayfulBackground from "@/components/PlayfulBackground";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
>>>>>>> Stashed changes
export default function MyStories() {
  const { childId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [stories, setStories] = useState<any[]>([]);
  const [selectedStory, setSelectedStory] = useState<any | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);

  const [showQuestions, setShowQuestions] = useState(false);
<<<<<<< Updated upstream
  
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const [answersSubmitted, setAnswersSubmitted] = useState(false);

  const [showConfetti, setShowConfetti] = useState(false);

  // ---------------- LOAD ----------------
  useEffect(() => {
  console.log("STORIES", stories);
}, [stories]);

=======

  const [answers, setAnswers] = useState<Record<number, string>>({});
  // ---------------- LOAD ----------------
  useEffect(() => {
    console.log("STORIES", stories);
  }, [stories]);
>>>>>>> Stashed changes
  useEffect(() => {
    const load = async () => {
      const res = childId
        ? await getChildStories(Number(childId))
        : await getMyStories();

      setStories(res.data);
      console.log("API RESPONSE", res.data);
    };

    load();
  }, [childId]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !selectedStory) return;

    const onTimeUpdate = () => {
      const time = audio.currentTime;

      console.log("time:", time);

<<<<<<< Updated upstream
    const index = selectedStory.scenes.findIndex(
      (s: any) =>
        s.startTime != null &&
        s.endTime != null &&
        time >= s.startTime &&
        time < s.endTime
    );
=======
      const index = selectedStory.scenes.findIndex(
        (s: any) =>
          s.startTime !== null &&
          s.endTime !== null &&
          time >= s.startTime &&
          time < s.endTime,
      );
>>>>>>> Stashed changes

      console.log("index:", index);
      console.log("SCENES:", selectedStory.scenes);
      console.log("TIME:", audio.currentTime);
      console.log("FIRST SCENE:", selectedStory.scenes?.[0]);
      if (index !== -1) {
        setCurrentSceneIndex(index);
      }
    };

    audio.addEventListener("timeupdate", onTimeUpdate);

<<<<<<< Updated upstream

  return () => audio.removeEventListener("timeupdate", onTimeUpdate);
}, [selectedStory]);

=======
    return () => audio.removeEventListener("timeupdate", onTimeUpdate);
  }, [selectedStory]);
  // ---------------- RESET ----------------
>>>>>>> Stashed changes
  useEffect(() => {
    setCurrentSceneIndex(0);
  }, [selectedStory]);

  useEffect(() => {
  if (!selectedStory) return;

  if (
    !selectedStory.audioUrl &&
    currentSceneIndex === selectedStory.scenes.length - 1
  ) {
    setShowQuestions(true);
  }
}, [currentSceneIndex, selectedStory]);

<<<<<<< Updated upstream
=======
  //     const index = selectedStory.scenes.findIndex(
  //       (s: any) => time >= s.startTime && time < s.endTime
  //     );

  //     if (index !== -1) {
  //       setCurrentSceneIndex(index);
  //     }
  //   };

  //   audio.addEventListener("timeupdate", onTimeUpdate);

  //   return () => audio.removeEventListener("timeupdate", onTimeUpdate);
  // }, [selectedStory]);
  console.log(selectedStory?.scenes);
>>>>>>> Stashed changes
  // ---------------- GRID VIEW ----------------
  if (!selectedStory) {
    return (
      <div className="min-h-screen bg-background relative">
        <div className="absolute inset-0 playful-bg opacity-60" aria-hidden />
        <PlayfulBackground />

        <div className="relative z-10">
          <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
            <div className="grid md:grid-cols-2 gap-4">
              {stories.map((story) => (
                <div key={story.id} className="bg-white p-4 rounded-xl shadow">
                  <h2 className="font-bold text-xl">{story.title}</h2>

<<<<<<< Updated upstream
            <button
              onClick={() => {
                setSelectedStory(story);
                setShowQuestions(false);
                setAnswers({});
                setCurrentSceneIndex(0);
              setAnswersSubmitted(false);
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Open Story
            </button>
          </div>
        ))}
=======
                  <p className="text-gray-600 mb-3">
                    {story.content.slice(0, 120)}...
                  </p>

                  <button
                    onClick={() => {
                      console.log("SELECTED", story);
                      setSelectedStory(story);
                    }}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                  >
                    {t("openStory")}
                  </button>
                </div>
              ))}
            </div>
          </main>
        </div>
>>>>>>> Stashed changes
      </div>
    );
  }

  // ---------------- PLAYER VIEW ----------------

  const story = selectedStory;
  const scene = story.scenes?.[currentSceneIndex];

  const handleSubmitAnswers = async () => {
<<<<<<< Updated upstream
    if(answersSubmitted) return
    try {
      await submitAnswers(
        story.id,
        {
          answers: story.questions.map(
              (q: any) => ({
                questionId: q.id,
                answer:
                  answers[q.id] || "",
              })
            ),
        }
      );
    setAnswersSubmitted(true)
    setShowConfetti(true);
    setTimeout(() => {
      setShowConfetti(false);
    }, 5000);
=======
    try {
      await submitAnswers(story.id, {
        answers: story.questions.map((q: any) => ({
          questionId: q.id,
          answer: answers[q.id] || "",
        })),
      });
>>>>>>> Stashed changes

      toast.success(t("answersSubmittedSuccessfully"));
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 playful-bg opacity-60" aria-hidden />
      <PlayfulBackground />

      <div className="relative z-10">
        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <button
            onClick={() => setSelectedStory(null)}
            className="mb-4 bg-gray-200 px-3 py-2 rounded"
          >
            ← {t("back")}
          </button>

<<<<<<< Updated upstream
      {story.audioUrl && (
      <audio
        ref={audioRef}
        controls
        className="w-full mb-6"
        onEnded={() => {
        setShowQuestions(true);
      }}
      >
        <source
          src={`http://localhost:3000${story.audioUrl}`}
          type="audio/mpeg"
        />
      </audio>
      )}
      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-3">{scene?.title}</h2>

        {showConfetti && (
          <>
            <Confetti />

            <div className="fixed inset-0 flex items-center justify-center z-50">
              <div className="bg-white p-8 rounded-3xl shadow-xl text-center">
                <div className="text-6xl mb-4">🏆</div>

                <h2 className="text-3xl font-bold">
                  أحسنت يا بطل!
                </h2>

                <p className="mt-3">
                  لقد أكملت أسئلة القصة بنجاح
                </p>
              </div>
            </div>
          </>
        )}
        {scene?.imageUrl && (
          <img
            src={`http://localhost:3000${scene.imageUrl}`}
            className="w-full max-h-[300px] object-contain rounded mb-3"
          />
        )}

        <p className="text-gray-700 whitespace-pre-line">
          {scene?.content}
        </p>

        <div className="text-sm text-gray-400 mt-3">
          Scene {currentSceneIndex + 1} / {story.scenes.length}
          {!story.audioUrl && (
          <div className="flex justify-between mt-4">
            <button
              onClick={() =>
                setCurrentSceneIndex((prev) => prev - 1)
              }
              disabled={currentSceneIndex === 0}
              className="bg-gray-500 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              Previous
            </button>

            <button
              onClick={() =>
                setCurrentSceneIndex((prev) => prev + 1)
              }
              disabled={
                currentSceneIndex === story.scenes.length - 1
              }
              className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
        </div>

        {showQuestions && (
        <div className="mt-8 bg-white p-4 rounded-xl shadow">
          <h2 className="text-2xl font-bold mb-4">
            Questions
          </h2>

      {story.questions?.map((q: any) => (
        <div
          key={q.id}
          className="mb-4"
        >
          <p className="font-medium mb-2">
            {q.question}
          </p>

          <textarea
                className="w-full border rounded-lg p-2"
                value={answers[q.id] || ""}
                onChange={(e) =>
                  setAnswers((prev) => ({
                    ...prev,
                    [q.id]: e.target.value,
                  }))
                }
              />
            </div>
        ))}

        <button
          disabled={answersSubmitted}
          onClick={handleSubmitAnswers}
          className="bg-green-600 text-white px-4 py-2 rounded-xl"
        >
          {answersSubmitted ? "Answers Submitted" : "Submit Answers "}
        </button>
      </div>
    )}
=======
          <h1 className="text-2xl font-bold mb-4">{story.title}</h1>

          <audio
            ref={audioRef}
            controls
            className="w-full mb-6"
            onEnded={() => {
              setShowQuestions(true);
            }}
          >
            <source
              src={`http://localhost:3000${story.audioUrl}`}
              type="audio/mpeg"
            />
          </audio>

          <div className="bg-white p-4 rounded-xl shadow">
            <h2 className="text-xl font-bold mb-3">{scene?.title}</h2>

            {scene?.imageUrl && (
              <img
                src={`http://localhost:3000${scene.imageUrl}`}
                className="w-full rounded mb-3"
              />
            )}

            <p className="text-gray-700 whitespace-pre-line">
              {scene?.content}
            </p>

            <div className="text-sm text-gray-400 mt-3">
              {t("scene")} {currentSceneIndex + 1} / {story.scenes.length}
            </div>

            {showQuestions && (
              <div className="mt-8 bg-white p-4 rounded-xl shadow">
                <h2 className="text-2xl font-bold mb-4">{t("questions")}</h2>

                {story.questions?.map((q: any) => (
                  <div key={q.id} className="mb-4">
                    <p className="font-medium mb-2">{q.question}</p>

                    <textarea
                      className="w-full border rounded-lg p-2"
                      value={answers[q.id] || ""}
                      onChange={(e) =>
                        setAnswers((prev) => ({
                          ...prev,
                          [q.id]: e.target.value,
                        }))
                      }
                    />
                  </div>
                ))}

                <button
                  onClick={handleSubmitAnswers}
                  className="bg-green-600 text-white px-4 py-2 rounded-xl"
                >
                  {t("submitAnswers")}
                </button>
              </div>
            )}
          </div>
        </main>
>>>>>>> Stashed changes
      </div>
    </div>
  );
}
