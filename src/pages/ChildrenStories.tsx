import {
  approveStory,
  deleteStory,
  getChildrenStories,
  updateStory,
  updateStoryWithAi,
} from "@/lib/story";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  addQuestions,
  approveQuestions,
  deleteQuestion,
  generateQuestions,
  regenerateQuestions,
  updateQuestion,
} from "@/lib/questions";
import { Edit2, Trash2 } from "lucide-react";
import PlayfulBackground from "@/components/PlayfulBackground";

type Scene = {
  id: number;
  title: string;
  content: string;
  imageUrl?: string | null;
};

type Story = {
  id: number;
  title: string;
  content: string;
  childName: string;
  status: string;
  audioUrl?: string | null;
  scenes: Scene[];
  questions: Question[];
  isApproved: boolean;
  questionsApproved: boolean;
};

type Question = {
  id: number;
  storyId: number;
  question: string;
};

export default function ChildrenStories() {
  const { t } = useTranslation();
  const [stories, setStories] = useState<Story[]>([]);
  const [filteredStories, setFilteredStories] = useState<Story[]>([]);
  const [search, setSearch] = useState("");
  const [editingStoryId, setEditingStoryId] = useState<number | null>(null);
  const [showAiEditor, setShowAiEditor] = useState(false);
  const [aiMessage, setAiMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(
    null,
  );
  const [editedQuestion, setEditedQuestion] = useState("");
  const [showAddQuestionForStory, setShowAddQuestionForStory] = useState<
    number | null
  >(null);
  const [newQuestion, setNewQuestion] = useState("");
  const [questionLoading, setQuestionLoading] = useState(false);
  const [loadingStoryId, setLoadingStoryId] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const data = await getChildrenStories();
        setStories(
          data.data.map((s: any) => ({
            id: s.id,
            title: s.title,
            content: s.content,
            childName: s.child?.firstName || "Unknown",
            status: s.status,
            audioUrl: s.audioUrl,
            scenes: s.scenes || [],
            questions: s.questions || [],
            isApproved: s.isApproved,
            questionsApproved: s.questionsApproved,
          })),
        );
      } catch (err) {
        console.log(err);
      }
    };
    fetchStories();
  }, []);


  useEffect(() => {
    const filtered = stories.filter((story) =>
      (story.childName || "").toLowerCase().includes(search.toLowerCase()),
    );
    setFilteredStories(filtered);
  }, [search, stories]);


  const handleSaveEdit = async (story: Story) => {
    try {
      const res = await updateStory(story.id, {
        scenes: story.scenes.map((scene) => ({
          id: scene.id,
          title: scene.title,
          content: scene.content,
        })),
      });

      setStories((prev) =>
        prev.map((s) =>
          s.id === story.id
            ? {
                ...s,
                ...res.data.story,
                scenes: res.data.scenes,
                status: "DRAFT",
                isApproved: false,
                questionsApproved: false,
              }
            : s,
        ),
      );

      if (selectedStory?.id === story.id) {
        setSelectedStory({
          ...selectedStory,
          ...res.data.story,
          scenes: res.data.scenes,
          status: "DRAFT",
          isApproved: false,
          questionsApproved: false,
        });
      }

      setEditingStoryId(null);
    } catch (err) {
      console.log(err);
    }
  };


  const handleApprove = async (storyId: number) => {
    try {
      await approveStory(storyId);
      setStories((prev) =>
        prev.map((story) =>
          story.id === storyId
            ? { ...story, status: "PUBLISHED", isApproved: true }
            : story,
        ),
      );
    } catch (err) {
      console.log(err);
    }
  };


  const handleEditWithAi = async () => {
    if (!aiMessage.trim() || !selectedStory) return;
    const message = aiMessage;
    setAiMessage("");

    try {
      setAiLoading(true);
      setChatMessages((prev) => [...prev, { role: "user", text: message }]);

      const res = await updateStoryWithAi(selectedStory.id, {
        editRequest: message,
      });

      setStories((prev) =>
        prev.map((story) => {
          if (story.id !== selectedStory.id) return story;
          return {
            ...story,
            title: res.data.story?.title || story.title,
            content: res.data.story?.content || story.content,
            scenes: res.data.scenes || story.scenes,
            audioUrl: res.data.story?.audioUrl || story.audioUrl,
            status: res.data.story?.status || story.status,
          };
        }),
      );

      setSelectedStory((prev) =>
        prev
          ? {
              ...prev,
              title: res.data.story?.title || prev.title,
              content: res.data.story?.content || prev.content,
              scenes: res.data.scenes || prev.scenes,
            }
          : null,
      );

      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: res.data.summaryOfChanges || "Story updated successfully",
        },
      ]);
    } catch (err) {
      console.log(err);
      setAiMessage(message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleDelete = async (storyId: number) => {
    try {
      await deleteStory(storyId);
      setStories((prev) => prev.filter((story) => story.id !== storyId));
    } catch (err) {
      console.log(err);
    }
  };

  const handleGenerateQuestions = async (storyId: number) => {
    try {
      setQuestionLoading(true);
      const res = await generateQuestions(storyId);
      setStories((prev) =>
        prev.map((story) =>
          story.id === storyId ? { ...story, questions: res.data } : story,
        ),
      );
    } catch (err) {
      console.log(err);
    } finally {
      setQuestionLoading(false);
    }
  };

  const handleRegenerateQuestions = async (storyId: number) => {
    try {
      setLoadingStoryId(storyId);
      const res = await regenerateQuestions(storyId);
      setStories((prev) =>
        prev.map((story) =>
          story.id === storyId ? { ...story, questions: res.data } : story,
        ),
      );
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingStoryId(null);
    }
  };

  const handleApproveQuestions = async (storyId: number) => {
    try {
      await approveQuestions(storyId);
      setStories((prev) =>
        prev.map((story) =>
          story.id === storyId ? { ...story, status: "PUBLISHED" } : story,
        ),
      );
    } catch (err) {
      console.log(err);
    }
  };

  const handleAddQuestion = async (storyId: number) => {
    try {
      const res = await addQuestions(storyId, { question: newQuestion });
      setStories((prev) =>
        prev.map((story) =>
          story.id === storyId
            ? { ...story, questions: [...story.questions, res.data] }
            : story,
        ),
      );
      setNewQuestion("");
      setShowAddQuestionForStory(null);
    } catch (err) {
      console.log(err);
    }
  };


  const handleDeleteQuestion = async (storyId: number, questionId: number) => {
    try {
      await deleteQuestion(questionId);
      setStories((prev) =>
        prev.map((story) =>
          story.id === storyId
            ? {
                ...story,
                questions: story.questions.filter((q) => q.id !== questionId),
              }
            : story,
        ),
      );
    } catch (err) {
      console.log(err);
    }
  };

  const handleUpdateQuestion = async (storyId: number, questionId: number) => {
    try {
      const res = await updateQuestion(questionId, {
        question: editedQuestion,
      });
      setStories((prev) =>
        prev.map((story) =>
          story.id === storyId
            ? {
                ...story,
                questions: story.questions.map((q) =>
                  q.id === questionId ? res.data : q,
                ),
              }
            : story,
        ),
      );
      setEditingQuestionId(null);
      setEditedQuestion("");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 playful-bg opacity-60" aria-hidden />
      <PlayfulBackground />
      <div className="relative z-10 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">{t("childrenStories")}</h1>

          <div className="mb-8">
            <input
              type="text"
              placeholder={t("searchByChildName")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-4 rounded-2xl border border-border bg-card"
            />
          </div>

          {filteredStories.length === 0 ? (
            <div className="bg-card rounded-2xl p-8 text-center shadow">
              {t("noStoriesFound")}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {filteredStories.map((story) => (
                <div
                  key={story.id}
                  className="bg-card rounded-2xl shadow-md overflow-hidden"
                >
                  <div className="p-5">
                    <h2 className="text-2xl font-bold mb-2">{story.title}</h2>
                    <p className="text-sm text-purple-500 mb-4">
                      {t("child")}: {story.childName}
                    </p>
                    <p className="text-sm text-purple-500 mb-4">
                      {t("status")}: {story.status}
                    </p>
                    <p className="text-muted-foreground whitespace-pre-line">
                      {story.content}
                    </p>

                    {story.audioUrl && (
                      <audio controls className="w-full mb-4">
                        <source
                          src={`${import.meta.env.VITE_API_URL}${story.audioUrl}`}
                          type="audio/mpeg"
                        />
                      </audio>
                    )}

                    <div className="space-y-6">
                      {story.scenes.map((scene, index) => (
                        <div key={scene.id} className="border-t pt-4">
                          <h3 className="text-lg font-semibold mb-1">
                            {index + 1}. {scene.title}
                          </h3>
                          {scene.imageUrl && (
                            <img
                              src={`${import.meta.env.VITE_API_URL}${scene.imageUrl}`}
                              className="w-full h-48 object-cover rounded-lg mb-2"
                            />
                          )}
                          <textarea
                            value={scene.content}
                            readOnly={editingStoryId !== story.id}
                            onChange={(e) => {
                              const updatedStories = stories.map((s) => {
                                if (s.id !== story.id) return s;
                                return {
                                  ...s,
                                  scenes: s.scenes.map((sc) =>
                                    sc.id === scene.id
                                      ? { ...sc, content: e.target.value }
                                      : sc,
                                  ),
                                };
                              });
                              setStories(updatedStories);
                            }}
                            className={`w-full border rounded-xl p-3 ${
                              editingStoryId === story.id
                                ? "bg-white"
                                : "bg-background"
                            }`}
                          />
                        </div>
                      ))}

                      {story.questions.length > 0 && (
                        <div className="mt-6 border-t pt-4">
                          <h3 className="font-bold text-xl mb-4">
                            {t("questions")}
                          </h3>
                          {story.questions.map((q) => (
                            <div
                              key={q.id}
                              className="border rounded-xl p-3 mb-3"
                            >
                              {editingQuestionId === q.id ? (
                                <>
                                  <input
                                    value={editedQuestion}
                                    onChange={(e) =>
                                      setEditedQuestion(e.target.value)
                                    }
                                    className="w-full border rounded p-2"
                                  />
                                  <div className="flex gap-2 mt-2">
                                    <button
                                      onClick={() =>
                                        handleUpdateQuestion(story.id, q.id)
                                      }
                                    >
                                      {t("save")}
                                    </button>
                                    <button
                                      onClick={() => setEditingQuestionId(null)}
                                    >
                                      {t("cancel")}
                                    </button>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <p>{q.question}</p>
                                  <div className="flex gap-2 mt-2">
                                    <button
                                      onClick={() => {
                                        setEditingQuestionId(q.id);
                                        setEditedQuestion(q.question);
                                      }}
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteQuestion(story.id, q.id)
                                      }
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {showAddQuestionForStory === story.id && (
                        <div className="mt-4">
                          <input
                            value={newQuestion}
                            onChange={(e) => setNewQuestion(e.target.value)}
                            className="w-full border rounded-xl p-2"
                          />
                          <div className="flex gap-2 mt-2">
                            <button onClick={() => handleAddQuestion(story.id)}>
                              {t("save")}
                            </button>
                            <button
                              onClick={() => setShowAddQuestionForStory(null)}
                            >
                              {t("cancel")}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-3 mt-6">
                      {editingStoryId === story.id && (
                        <div className="flex gap-4">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button className="bg-yellow-600 text-white px-4 py-2 rounded-xl">
                                {t("saveEdit")}
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  {t("saveEdit")}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t("confirmSaveEdit")}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>
                                  {t("cancel")}
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleSaveEdit(story)}
                                >
                                  {t("save")}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          <button
                            onClick={() => setEditingStoryId(null)}
                            className="bg-gray-500 text-white px-5 py-2 rounded-xl"
                          >
                            {t("cancel")}
                          </button>
                        </div>
                      )}

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button className="bg-red-600 text-white px-4 py-2 rounded-xl">
                            {t("delete")}
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {t("deleteStory")}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {t("deleteStoryConfirmation")}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(story.id)}
                            >
                              {t("delete")}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <button
                        onClick={() => {
                          setSelectedStory(story);
                          setEditingStoryId(story.id);
                        }}
                        className="bg-blue-500 text-white px-4 py-2 rounded-xl"
                      >
                        {t("editStory")}
                      </button>

                      <button
                        onClick={() => {
                          setSelectedStory(story);
                          setShowAiEditor(true);
                        }}
                        className="bg-purple-600 text-white px-4 py-2 rounded-xl"
                      >
                        {t("editUsingAi")}
                      </button>

                      {!story.isApproved && story.status !== "PUBLISHED" && (
                        <button
                          onClick={() => handleApprove(story.id)}
                          className="bg-green-600 text-white px-4 py-2 rounded-xl"
                        >
                          {t("approveStory")}
                        </button>
                      )}

                      {story.isApproved &&
                        story.status !== "PUBLISHED" &&
                        story.questions.length === 0 && (
                          <button
                            onClick={() => handleGenerateQuestions(story.id)}
                            disabled={questionLoading}
                            className="bg-purple-600 text-white px-4 py-2 rounded-xl"
                          >
                            {questionLoading
                              ? t("generating")
                              : t("generateQuestions")}
                          </button>
                        )}

                      {story.isApproved &&
                        story.status !== "PUBLISHED" &&
                        story.questions.length > 0 && (
                          <>
                            <button
                              onClick={() => handleApproveQuestions(story.id)}
                              className="bg-purple-600 text-white px-4 py-2 rounded-xl"
                            >
                              {t("approveQuestions")}
                            </button>
                            <button
                              onClick={() =>
                                setShowAddQuestionForStory(story.id)
                              }
                              className="bg-blue-600 text-white px-4 py-2 rounded-xl"
                            >
                              {t("addQuestion")}
                            </button>
                          </>
                        )}

                      {story.questions.length > 0 && (
                        <button
                          disabled={loadingStoryId === story.id}
                          onClick={() => handleRegenerateQuestions(story.id)}
                          className="bg-orange-600 text-white px-6 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loadingStoryId === story.id
                            ? t("regeneratingQuestions")
                            : t("regenerateQuestions")}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {showAiEditor && (
          <div className="fixed top-0 right-0 w-[400px] h-screen bg-white shadow-2xl border-l z-50 flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">{t("aiStoryEditor")}</h2>
              <button
                onClick={() => setShowAiEditor(false)}
                className="text-gray-500"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-xl max-w-[85%] ${
                    msg.role === "user"
                      ? "bg-purple-600 text-white ml-auto"
                      : "bg-gray-200 text-black"
                  }`}
                >
                  {msg.text}
                </div>
              ))}
              {aiLoading && (
                <div className="bg-gray-200 p-3 rounded-xl w-fit">
                  {t("updatingStory")}
                </div>
              )}
            </div>

            <div className="p-4 border-t flex gap-2">
              <textarea
                value={aiMessage}
                onChange={(e) => {
                  setAiMessage(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleEditWithAi();
                  }
                }}
                rows={1}
                placeholder={t("askAiToModifyStory")}
                className="flex-1 border rounded-xl px-3 py-2 resize-none overflow-hidden min-h-[44px] max-h-[250px]"
              />
              <button
                onClick={handleEditWithAi}
                disabled={aiLoading}
                className="bg-purple-600 text-white px-4 py-2 rounded-xl"
              >
                {t("send")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
