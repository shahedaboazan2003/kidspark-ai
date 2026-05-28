import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getChildStories, getMyStories } from "@/lib/story";

export default function MyStories() {

  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const { childId } = useParams();

  const role = localStorage.getItem("role");

  useEffect(() => {

    const loadStories = async () => {

      try {

        let response;

        console.log("role", role)
        console.log("childId", childId)
        console.log("response", response)
        // parent
        if (childId) {

          response = await getChildStories(Number(childId));
          console.log(response)
        }

        // child
        else {

          response = await getMyStories();

        }

        setStories(response.data);

      } catch (err) {

        console.log(err);

      } finally {

        setLoading(false);

      }
    };

    loadStories();

  }, [childId, role]);

  if (loading) {
    return (
      <div className="p-10 text-center">
        Loading stories...
      </div>
    );
  }

  return (

    <div className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-5xl mx-auto">

        {/* BACK BUTTON */}
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-6 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-xl"
        >
          ← Back
        </button>

        {/* PAGE TITLE */}
        <h1 className="text-4xl font-bold mb-8">
          My Stories
        </h1>

        {/* EMPTY */}
        {stories.length === 0 ? (

          <div className="bg-white p-8 rounded-2xl shadow text-center">

            No stories found.

          </div>

        ) : (

          <div className="grid md:grid-cols-2 gap-6">

            {stories.map((story: any) => (

              <div
                key={story.id}
                className="bg-white rounded-2xl shadow-md overflow-hidden"
              >


                <div className="p-5">

                  {/* TITLE */}
                  <h2 className="text-2xl font-bold mb-3">

                    {story.title}

                  </h2>
                  {/* CONTENT */}
                  <p className="text-gray-700 mb-6 whitespace-pre-line">

                    {story.content}

                  </p>

                  {/* SCENES */}
                  <div className="space-y-6">

                    {story.scenes?.map((scene: any) => (

                      <div
                        key={scene.id}
                        className="border rounded-xl p-4"
                      >

                        {/* SCENE TITLE */}
                        <h3 className="font-bold text-lg mb-3">

                          {scene.title}

                        </h3>

                        {/* IMAGE */}
                        {scene.imageUrl && (

                          <img
                            src={`http://localhost:3000${scene.imageUrl}`}
                            alt={scene.title}
                            className="w-full rounded-xl mb-4"
                          />

                        )}

                        {/* SCENE CONTENT */}
                        <p className="text-gray-700 whitespace-pre-line">

                          {scene.content}

                        </p>

                      </div>

                    ))}

                    {/* AUDIO */}

                    {story.audioUrl && (

                  <audio
                    controls
                    className="w-full"
                  >

                    <source
                      src={`http://localhost:3000${story.audioUrl}`}
                      type="audio/mpeg"
                    />

                  </audio>

                )}

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
}