import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
type Story = {
  id: number;
  title: string;
  content: string;
  childName: string;
  image?: string;
};

export default function ChildrenStories() {
  const { t } = useTranslation();
  const [stories, setStories] = useState<Story[]>([]);
  const [filteredStories, setFilteredStories] = useState<Story[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {

    // Dummy data مؤقتاً
    const storiesData: Story[] = [
      {
        id: 1,
        title: "The Brave Lion",
        content:
          "Once upon a time there was a brave lion protecting the forest.",
        childName: "Lana",
        image:
          "https://images.unsplash.com/photo-1546182990-dffeafbe841d",
      },
      {
        id: 2,
        title: "Magic Fish",
        content:
          "A little fish discovered magical powers in the ocean.",
        childName: "Adam",
        image:
          "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9",
      },
      {
        id: 3,
        title: "Space Adventure",
        content:
          "Ali travelled to space and explored new planets.",
        childName: "Ali",
      },
    ];

    setStories(storiesData);
    setFilteredStories(storiesData);

  }, []);

  useEffect(() => {

    const filtered = stories.filter((story) =>
      story.childName.toLowerCase().includes(search.toLowerCase())
    );

    setFilteredStories(filtered);

  }, [search, stories]);

  return (

    <div className="min-h-screen bg-background p-6">

      <div className="max-w-6xl mx-auto">

        {/* TITLE */}
        <h1 className="text-4xl font-bold mb-8">
          {t("childrenStories")}
        </h1>

        {/* SEARCH */}
        <div className="mb-8">

          <input
            type="text"
            placeholder={t("searchByChildName")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-4 rounded-2xl border border-border bg-card"
          />

        </div>

        {/* STORIES */}
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

                {story.image && (

                  <img
                    src={story.image}
                    alt={story.title}
                    className="w-full h-56 object-cover"
                  />

                )}

                <div className="p-5">

                  <h2 className="text-2xl font-bold mb-2">
                    {story.title}
                  </h2>

                  <p className="text-sm text-purple-500 mb-4">
                   {t("child")}: {story.childName}
                  </p>

                  <p className="text-muted-foreground whitespace-pre-line">
                    {story.content}
                  </p>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>

  );
}