// import { useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { useTranslation } from "react-i18next";
// import { getChildStories, getMyStories } from "@/lib/story";

// export default function MyStories() {
//   const { t } = useTranslation();
//   const [stories, setStories] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);

//   const navigate = useNavigate();

//   const { childId } = useParams();

//   const role = localStorage.getItem("role");

//   useEffect(() => {

//     const loadStories = async () => {

//       try {

//         let response;

//         console.log("role", role)
//         console.log("childId", childId)
//         console.log("response", response)
//         // parent
//         if (childId) {

//           response = await getChildStories(Number(childId));
//           console.log(response)
//         }

//         // child
//         else {

//           response = await getMyStories();

//         }

//         setStories(response.data);

//       } catch (err) {

//         console.log(err);

//       } finally {

//         setLoading(false);

//       }
//     };

//     loadStories();

//   }, [childId, role]);

//   if (loading) {
//     return (
//       <div className="p-10 text-center">
//         Loading stories...
//       </div>
//     );
//   }

//   return (

//     <div className="min-h-screen bg-gray-100 p-6">

//       <div className="max-w-5xl mx-auto">

//         {/* BACK BUTTON */}
//         <button
//           onClick={() => navigate("/dashboard")}
//           className="mb-6 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-xl"
//         >
//           ← Back
//         </button>
        

//         {/* PAGE TITLE */}
//         <h1 className="text-4xl font-bold mb-8">
//           t(myStories)
//         </h1>

//         {/* EMPTY */}
//         {stories.length === 0 ? (
//           <div className="bg-white p-6 rounded-2xl shadow">{t("noStoriesYet")}</div>
//         ) : (

//           <div className="grid md:grid-cols-2 gap-6">

//             {stories.map((story: any) => (

//               <div
//                 key={story.id}
//                 className="bg-white rounded-2xl shadow-md overflow-hidden"
//               >


//                 <div className="p-5">

//                   {/* TITLE */}
//                   <h2 className="text-2xl font-bold mb-3">

//                   {story.title}
//                   {/* CHILD */}
//                   <p className="text-sm text-gray-500 mb-2">
//                     {t("child")}: {story.child}
//                   </p>

//                   {/* STATUS */}
//                   <p className="text-sm text-purple-600 mb-4">
//                     {t("status")}: {story.status}
//                   </p>

//                   </h2>
//                   {/* CONTENT */}
//                   <p className="text-gray-700 mb-6 whitespace-pre-line">

//                     {story.content}

//                   </p>

//                   {/* SCENES */}
//                   <div className="space-y-6">

//                     {story.scenes?.map((scene: any) => (

//                       <div
//                         key={scene.id}
//                         className="border rounded-xl p-4"
//                       >

//                         {/* SCENE TITLE */}
//                         <h3 className="font-bold text-lg mb-3">

//                           {scene.title}

//                         </h3>

//                         {/* IMAGE */}
//                         {scene.imageUrl && (

//                           <img
//                             src={`http://localhost:3000${scene.imageUrl}`}
//                             alt={scene.title}
//                             className="w-full rounded-xl mb-4"
//                           />

//                         )}

//                         {/* SCENE CONTENT */}
//                         <p className="text-gray-700 whitespace-pre-line">

//                           {scene.content}

//                         </p>

//                       </div>

//                     ))}

//                     {/* AUDIO */}

//                     {story.audioUrl && (

//                   <audio
//                     controls
//                     className="w-full"
//                   >

//                     <source
//                       src={`http://localhost:3000${story.audioUrl}`}
//                       type="audio/mpeg"
//                     />

//                   </audio>

//                 )}

//                   </div>

//                 </div>

//               </div>

//             ))}

//           </div>

//         )}

//       </div>

//     </div>
//   );
// }
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getChildStories, getMyStories } from "@/lib/story";
import { submitAnswers } from "@/lib/questions";
import { toast } from "sonner";
export default function MyStories() {
  const { childId } = useParams();
  const navigate = useNavigate();

  const [stories, setStories] = useState<any[]>([]);
  const [selectedStory, setSelectedStory] = useState<any | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);

    const [showQuestions, setShowQuestions] =
    useState(false);
  
     const [answers, setAnswers] =
    useState<Record<number, string>>({});
  // ---------------- LOAD ----------------
  useEffect(() => {
  console.log("STORIES", stories);
}, [stories]);
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

    const index = selectedStory.scenes.findIndex(
      (s: any) =>
        s.startTime !== null &&
        s.endTime !== null &&
        time >= s.startTime &&
        time < s.endTime
    );

    console.log("index:", index);
console.log("SCENES:", selectedStory.scenes);
console.log("TIME:", audio.currentTime);
console.log("FIRST SCENE:", selectedStory.scenes?.[0]);
    if (index !== -1) {
      setCurrentSceneIndex(index);
    }
  };

  audio.addEventListener("timeupdate", onTimeUpdate);

  return () => audio.removeEventListener("timeupdate", onTimeUpdate);
}, [selectedStory]);
  // ---------------- RESET ----------------
  useEffect(() => {
    setCurrentSceneIndex(0);
  }, [selectedStory]);

  // ---------------- SYNC ----------------
  // useEffect(() => {
  //   const audio = audioRef.current;
  //   if (!audio || !selectedStory) return;

  //   const onTimeUpdate = () => {
  //     const time = audio.currentTime;

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
  // ---------------- GRID VIEW ----------------
  if (!selectedStory) {
    return (
      <div className="p-6 grid md:grid-cols-2 gap-4">
        {stories.map((story) => (
          <div key={story.id} className="bg-white p-4 rounded-xl shadow">
            <h2 className="font-bold text-xl">{story.title}</h2>

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
              Open Story
            </button>
          </div>
        ))}
      </div>
    );
  }

  // ---------------- PLAYER VIEW ----------------
  const story = selectedStory;
  const scene = story.scenes[currentSceneIndex];

  const handleSubmitAnswers =
  async () => {
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

    toast.success("Answers submitted successfully");

    } catch (err) {
      console.log(err);
    }
  };
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <button
        onClick={() => setSelectedStory(null)}
        className="mb-4 bg-gray-200 px-3 py-2 rounded"
      >
        ← Back
      </button>

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
          Scene {currentSceneIndex + 1} / {story.scenes.length}
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
          onClick={handleSubmitAnswers}
          className="bg-green-600 text-white px-4 py-2 rounded-xl"
        >
          Submit Answers
        </button>
      </div>
    )}
      </div>
    </div>
  );
}
