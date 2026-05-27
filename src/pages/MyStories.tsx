import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
export default function MyStories() {
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
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-4 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-xl"
        >
          ← Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold mb-8">My Stories</h1>

        {stories.length === 0 ? (
          <div className="bg-white p-6 rounded-2xl shadow">No stories yet.</div>
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
                    Child: {story.child}
                  </p>

                  {/* STATUS */}
                  <p className="text-sm text-purple-600 mb-4">
                    Status: {story.status}
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

