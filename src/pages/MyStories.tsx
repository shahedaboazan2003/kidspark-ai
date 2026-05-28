import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
export default function MyStories() {
  const { t } = useTranslation();
  const [stories, setStories] = useState([
  {
    title: "The Brave Little Fox",
    child: "Lana",
    status: "approved",
    content: `Once upon a time, a little fox learned about kindness and sharing in the forest.`,
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
    audio: null,
  },
]);
  const navigate = useNavigate();
  // مؤقتاً
  const userRole = localStorage.getItem("role") || "child";

  useEffect(() => {
    const savedStories = JSON.parse(localStorage.getItem("stories")) || [];

    if (userRole === "child") {
      const approvedStories = savedStories.filter(
        (story) => story.status === "approved",
      );

      setStories(approvedStories);
    } else {
      setStories(savedStories);
    }
  }, [userRole]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">{t("myStories")}</h1>

        {stories.length === 0 ? (
          <div className="bg-white p-6 rounded-2xl shadow">{t("noStoriesYet")}</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {stories.map((story, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-md overflow-hidden"
              >
                {/* IMAGE */}
                {story.image && (
                  <img
                    src={story.image}
                    alt="story"
                    className="w-full h-56 object-cover"
                  />
                )}

                <div className="p-5">
                  {/* TITLE */}
                  <h2 className="text-2xl font-bold mb-3">{story.title}</h2>

                  {/* CHILD */}
                  <p className="text-sm text-gray-500 mb-2">
                    {t("child")}: {story.child}
                  </p>

                  {/* STATUS */}
                  <p className="text-sm text-purple-600 mb-4">
                    {t("status")}: {story.status}
                  </p>

                  {/* CONTENT */}
                  <p className="text-gray-700 whitespace-pre-line">
                    {story.content}
                  </p>

                  {/* AUDIO */}
                  {story.audio && (
                    <audio controls className="mt-5 w-full">
                      <source src={story.audio} type="audio/mpeg" />
                    </audio>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
// import { useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { getChildStories, getMyStories } from "@/lib/story";

// export default function MyStories() {
//   const [stories, setStories] = useState<any[]>([]);
//   const [search, setSearch] = useState("");
//   const [filteredStories, setFilteredStories] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);

//   const navigate = useNavigate();

//   const { childId } = useParams();

//   const role = localStorage.getItem("role");

//   useEffect(() => {
//     const loadStories = async () => {
//       try {
//         let response;

//         console.log("role", role);
//         console.log("childId", childId);
//         console.log("response", response);
//         // parent
//         if (childId) {
//           response = await getChildStories(Number(childId));
//           console.log(response);
//         }

//         // child
//         else {
//           response = await getMyStories();
//         }

//         setStories(response.data);
//         setFilteredStories(response.data);
//       } catch (err) {
//         console.log(err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadStories();
//   }, [childId, role]);

//   useEffect(() => {
//     // إذا الطفل → لا تعمل فلترة
//     if (role === "child") {
//       setFilteredStories(stories);
//       return;
//     }

//     const filtered = stories.filter((story: any) =>
//       story.child?.name?.toLowerCase().includes(search.toLowerCase()),
//     );

//     setFilteredStories(filtered);
//   }, [search, stories, role]);

//   if (loading) {
//     return <div className="p-10 text-center">Loading stories...</div>;
//   }

//   return (
//     <div className="min-h-screen bg-background  p-6">
//       <div className="max-w-5xl mx-auto">
//         {/* PAGE TITLE */}
//         <h1 className="text-4xl font-bold mb-8">My Stories</h1>
//         {/* SEARCH BAR — parent only */}
//         {role === "parent" && (
//           <div className="mb-8">
//             <input
//               type="text"
//               placeholder="Search by child name..."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="w-full p-4 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
//             />
//           </div>
//         )}
//         {/* EMPTY */}
//         {stories.length === 0 ? (
//           <div className="bg-white p-8 rounded-2xl shadow text-center">
//             No stories found.
//           </div>
//         ) : (
//           <div className="grid md:grid-cols-2 gap-6">
//             {/* {stories.map((story: any) => ( */}
//             {filteredStories.map((story: any) => (
//               <div
//                 key={story.id}
//                 className="bg-white rounded-2xl shadow-md overflow-hidden"
//               >
//                 <div className="p-5">
//                   {/* TITLE */}
//                   <h2 className="text-2xl font-bold mb-3">{story.title}</h2>
//                   {/* CHILD NAME */}
//                   {story.child?.name && (
//                     <p className="text-sm text-purple-600 mb-4">
//                       Child: {story.child.name}
//                     </p>
//                   )}
//                   {/* CONTENT */}
//                   <p className="text-gray-700 mb-6 whitespace-pre-line">
//                     {story.content}
//                   </p>

//                   {/* SCENES */}
//                   <div className="space-y-6">
//                     {story.scenes?.map((scene: any) => (
//                       <div key={scene.id} className="border rounded-xl p-4">
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
//                       <audio controls className="w-full">
//                         <source
//                           src={`http://localhost:3000${story.audioUrl}`}
//                           type="audio/mpeg"
//                         />
//                       </audio>
//                     )}
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
