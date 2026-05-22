import { useState } from "react";

export default function StoryForm() {
  const [form, setForm] = useState({
    child: "",
    length: "",
    type: "",
    withImage: false,
    withAudio: false,
  });

  const [generatedStory, setGeneratedStory] = useState(null);

  // مؤقتاً بيانات وهمية لحد ما يتوصل API
  const children = [
    { id: 1, name: "Lana" },
    { id: 2, name: "Omar" },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleGenerate = async () => {
    // لاحقاً API CALL

    const fakeStory = `
Once upon a time, there was a brave little dragon
who loved helping children in his magical village.
One day, he discovered a hidden treasure map...
    `;

    setGeneratedStory({
      title: "Magic Dragon Adventure",
      content: fakeStory,
      approved: false,
      image: form.withImage
        ? "https://images.unsplash.com/photo-1517849845537-4d257902454a"
        : null,
      audio: form.withAudio
        ? "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
        : null,
    });
  };

  const handleStoryChange = (e) => {
    setGeneratedStory({
      ...generatedStory,
      content: e.target.value,
    });
  };

  const handleSaveEdit = () => {
    // لاحقاً API update

    alert("Story edited successfully!");
  };

  const handleApprove = () => {
    // لاحقاً API approve

    const approvedStories = JSON.parse(localStorage.getItem("stories")) || [];

    approvedStories.push({
      ...generatedStory,
      status: "approved",
      child: form.child,
    });

    localStorage.setItem("stories", JSON.stringify(approvedStories));

    alert("Story approved and sent to child!");

    setGeneratedStory(null);

    setForm({
      child: "",
      length: "",
      type: "",
      withImage: false,
      withAudio: false,
    });
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-md p-6">
        <h1 className="text-3xl font-bold mb-6">Story Generator</h1>

        {/* FORM */}
        <div className="space-y-4">
          {/* CHILD SELECT */}
          <div>
            <label htmlFor="child" className="block mb-2 font-semibold">
              Choose Child
            </label>

            <select
              id="child"
              name="child"
              value={form.child}
              onChange={handleChange}
              className="w-full border rounded-xl p-3"
            >
              <option value="">Select Child</option>

              {children.map((child) => (
                <option key={child.id} value={child.name}>
                  {child.name}
                </option>
              ))}
            </select>
          </div>

          {/* STORY LENGTH */}
          <div>
            <label htmlFor="length" className="block mb-2 font-semibold">
              Story Length
            </label>

            <select
              id="length"
              name="length"
              value={form.length}
              onChange={handleChange}
              className="w-full border rounded-xl p-3"
            >
              <option value="">Select Length</option>
              <option value="short">Short</option>
              <option value="medium">Medium</option>
              <option value="long">Long</option>
            </select>
          </div>

          {/* STORY TYPE */}
          <div>
            <label htmlFor="type" className="block mb-2 font-semibold">
              Story Type
            </label>

            <select
              id="type"
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full border rounded-xl p-3"
            >
              <option value="">Select Type</option>
              <option value="adventure">Adventure</option>
              <option value="fantasy">Fantasy</option>
              <option value="educational">Educational</option>
              <option value="funny">Funny</option>
            </select>
          </div>

          {/* CHECKBOXES */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="withImage"
                checked={form.withImage}
                onChange={handleChange}
              />
              With Image
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="withAudio"
                checked={form.withAudio}
                onChange={handleChange}
              />
              With Audio
            </label>
          </div>

          {/* GENERATE BUTTON */}
          <button
            onClick={handleGenerate}
            className="bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition"
          >
            Generate Story
          </button>
        </div>

        {/* GENERATED STORY */}
        {generatedStory && (
          <div className="mt-10 border rounded-2xl p-6 bg-gray-50">
            <h2 className="text-2xl font-bold mb-4">{generatedStory.title}</h2>

            {/* IMAGE */}
            {generatedStory.image && (
              <img
                src={generatedStory.image}
                alt="story"
                className="w-full h-64 object-cover rounded-xl mb-4"
              />
            )}

            {/* STORY CONTENT */}
            <textarea
              id="storyContent"
              value={generatedStory.content}
              onChange={handleStoryChange}
              placeholder="Edit your story here..."
              className="w-full min-h-[250px] border rounded-xl p-4"
            />

            {/* AUDIO */}
            {generatedStory.audio && (
              <audio controls className="mt-4 w-full">
                <source src={generatedStory.audio} type="audio/mpeg" />
              </audio>
            )}

            {/* ACTION BUTTONS */}
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleSaveEdit}
                className="bg-yellow-500 text-white px-5 py-2 rounded-xl"
              >
                Save Edit
              </button>

              <button
                onClick={handleApprove}
                className="bg-green-600 text-white px-5 py-2 rounded-xl"
              >
                Approve Story
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
