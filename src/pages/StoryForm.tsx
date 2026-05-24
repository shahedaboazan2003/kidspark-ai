import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getChildren } from "@/lib/children";
import { useAuth } from "@/contexts/AuthContext";
import { approveStory, generateStory, updateStory } from "@/lib/story";
import { useNavigate } from "react-router-dom";

export default function StoryForm() {
  const [form, setForm] = useState({
    behavior: "",
    length: "",
    type: "",
    withImage: false,
    withAudio: false,
  });
  const [children, setChildren] = useState([])
  const [selectedChild, setSelectedChild] = useState<number | null>(null)
  const [generatedStory, setGeneratedStory] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const {user}= useAuth()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false);

  //useeffect to get children's names 
  useEffect(() => {
      if (!user?.id) return;
  
      const load = async () => {
        try {
          const childrenList = await getChildren();
          setChildren(childrenList.data || []);
          console.log("CHILDREN:", childrenList.data);
          if (childrenList.data?.length > 0) {
            setSelectedChild(childrenList[0].id);
          }
        } catch (e) {
          console.log(e);
        }
      };
  
      load();
    }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleGenerate = async () => {
    try{
      setLoading(true)
      const response = await generateStory({ educationalGoal:form.behavior, storyType:form.type, storyLength:form.length, withImages: form.withImage, withAudio: form.withAudio, childId:selectedChild})
      console.log(response)
      setGeneratedStory(response.data)
      setIsEditing(false)
    }catch(err){
      console.log(err)
    }finally{
      setLoading(false)
    }

  };

  const handleStoryChange = (e) => {
    setGeneratedStory({
      ...generatedStory,
      content: e.target.value,
    });
  };

  const handleSaveEdit = async () => {
    try{
      const res = await updateStory(generatedStory.story.id, {
        educationalGoal: form.behavior,
        storyType: form.type,
        storyLength: form.length,
        withImages: form.withImage,
        withAudio: form.withAudio,
        scenes: generatedStory.scenes.map((s: any) => ({
          id: s.id,
          title: s.title,
          content: s.content,
        })),
      })

      setGeneratedStory(res.data)
      setIsEditing(false)
    }catch(err){
      console.log(err)
    }

    alert("Story edited successfully!");
  };

  const handleApprove = async () => {
    try{
      await approveStory(generatedStory.story.id)
      console.log("approve",generatedStory)
      navigate(`/my-stories/${generatedStory.story.childId}`)
    }catch(err){
      console.log(err)
    }

    const approvedStories = JSON.parse(localStorage.getItem("stories")) || [];

    approvedStories.push({
      ...generatedStory,
      status: "approved",
    });

    localStorage.setItem("stories", JSON.stringify(approvedStories));

    setGeneratedStory(null);

    setForm({
      behavior : "",
      length: "",
      type: "",
      withImage: false,
      withAudio: false,
    });
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">

      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-md p-6">

        <h1 className="text-3xl font-bold mb-6">
          Story Generator
        </h1>

        {/* FORM */}
        <div className="space-y-4">

          {/* CHILD SELECT */}
          <div>

            <label className="block mb-2 font-semibold">
              Choose Child
            </label>

            <Select
              value={
                selectedChild
                  ? String(selectedChild)
                  : ""
              }

              onValueChange={(value) =>
                setSelectedChild(
                  Number(value)
                )
              }
            >

              <SelectTrigger className="w-[220px]">

                <SelectValue placeholder="Choose child" />

              </SelectTrigger>

              <SelectContent>

                <SelectGroup>

                  {children.map((c: any) => (

                    <SelectItem
                      key={c.id}
                      value={String(c.id)}
                    >
                      {c.firstName}
                    </SelectItem>

                  ))}

                </SelectGroup>

              </SelectContent>

            </Select>

          </div>

          {/* EDUCATIONAL GOAL */}
          <div>

            <label className="block mb-2 font-semibold">
              Educational Goal
            </label>

            <textarea
              name="behavior"
              value={form.behavior}
              onChange={handleChange}
              placeholder="honesty, kindness..."
              className="w-full min-h-[120px] border rounded-xl p-3"
            />

          </div>

          {/* LENGTH */}
          <div>

            <label className="block mb-2 font-semibold">
              Story Length
            </label>

            <select
              name="length"
              value={form.length}
              onChange={handleChange}
              className="w-full border rounded-xl p-3"
            >

              <option value="">
                Select Length
              </option>

              <option value="short">
                Short
              </option>

              <option value="medium">
                Medium
              </option>

              <option value="long">
                Long
              </option>

            </select>

          </div>

          {/* TYPE */}
          <div>

            <label className="block mb-2 font-semibold">
              Story Type
            </label>

            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full border rounded-xl p-3"
            >

              <option value="">
                Select Type
              </option>

              <option value="adventure">
                Adventure
              </option>

              <option value="fantasy">
                Fantasy
              </option>

              <option value="educational">
                Educational
              </option>

              <option value="funny">
                Funny
              </option>

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

              With Images

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

          {/* BUTTON */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="bg-purple-600 text-white px-6 py-3 rounded-xl"
          >

            {loading
              ? "Generating..."
              : "Generate Story"}

          </button>

        </div>

        {/* GENERATED STORY */}
        {generatedStory && (

          <div className="mt-10 border rounded-2xl p-6 bg-gray-50">

            {/* TITLE */}
            <h2 className="text-3xl font-bold mb-4">

              {generatedStory.story.title}

            </h2>

            {/* SUMMARY */}
            <p className="mb-6 text-gray-700">

              {generatedStory.story.content}

            </p>

            {/* AUDIO */}
            {generatedStory.story.audioUrl && (

              <audio
                controls
                className="w-full mb-6"
              >

                <source
                  src={`http://localhost:3000${generatedStory.story.audioUrl}`}
                  type="audio/mpeg"
                />

              </audio>
            )}

            {/* {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-xl mb-4"
              >
                Edit Story
              </button>
            )} */}

            {/* SCENES */}
            {generatedStory.scenes.map(
              (scene: any) => (

                <div
                  key={scene.id}
                  className="mb-10"
                >

                  <h3 className="text-xl font-bold mb-3">

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

                  {/* CONTENT */}
                  <textarea
                    value={scene.content}
                    readOnly={!isEditing}
                    onChange={(e) => {
                      const updatedScenes = generatedStory.scenes.map((s: any) =>
                        s.id === scene.id
                          ? { ...s, content: e.target.value }
                          : s
                      );

                      setGeneratedStory({
                        ...generatedStory,
                        scenes: updatedScenes,
                      });
                    }}
                    className={`w-full min-h-[120px] border rounded-xl p-3 ${
                    isEditing ? "bg-white" : "bg-gray-100"
                  }`}
                  />

                </div>

              )
            )}
            {isEditing &&  (
              <div className="flex gap-4">
                <button
                  onClick={handleSaveEdit}
                  className="bg-yellow-500 text-white px-5 py-2 rounded-xl"
                >
                  Save Edit
                </button>

                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-500 text-white px-5 py-2 rounded-xl"
                >
                  Cancel
                </button>
              </div>
            )}
            {!isEditing && (
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-500 text-white px-5 py-2 rounded-xl"
                >
                  Edit Story
                </button>

                <button
                  onClick={handleApprove}
                  className="bg-green-600 text-white px-5 py-2 rounded-xl"
                >
                  Approve Story
                </button>
              </div>
            )}
            {/* <div className="flex gap-4 mt-6">

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

            </div> */}

          </div>
        )}

      </div>

    </div>
  );
}
