import { useState } from "react";
import { Trash2, Upload, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MyFiles() {

  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [selectedChildren, setSelectedChildren] = useState<string[]>([]);

  const [files, setFiles] = useState<any[]>([
    {
      id: 1,
      name: "Math Notes.pdf",
      children: ["Lana", "Omar"],
      date: "2026-05-27",
    },
  ]);

  // مؤقتاً لحد API
  const children = [
    "Lana",
    "Omar",
    "Kareem",
  ];

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {

    if (e.target.files?.[0]) {

      setSelectedFile(e.target.files[0]);

    }
  };

  const handleRemoveFile = () => {

    setSelectedFile(null);

  };

  const handleChildSelect = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {

    const value = e.target.value;

    if (
      value &&
      !selectedChildren.includes(value)
    ) {

      setSelectedChildren([
        ...selectedChildren,
        value,
      ]);

    }
  };

  const handleUpload = () => {

    if (!selectedFile) return;

    const newFile = {

      id: Date.now(),

      name: selectedFile.name,

      children: selectedChildren,

      date: new Date().toLocaleDateString(),

    };

    setFiles([newFile, ...files]);

    setSelectedFile(null);

    setSelectedChildren([]);

  };

  const handleDelete = (id: number) => {

    setFiles(files.filter((f) => f.id !== id));

  };

  return (

    <div className="min-h-screen bg-background p-6">

      <div className="max-w-5xl mx-auto">

        {/* BACK */}
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-6 bg-muted hover:bg-muted/70 px-4 py-2 rounded-xl"
        >
          ← Back
        </button>

        {/* TITLE */}
        <h1 className="text-4xl font-bold mb-8">

          My Files

        </h1>

        {/* UPLOAD CARD */}
        <div className="bg-card rounded-2xl shadow-md p-6 mb-10 border">

          <h2 className="text-2xl font-bold mb-6">

            Upload New File

          </h2>

          {/* FILE INPUT */}
          <div className="mb-6">

            <label
              htmlFor="fileUpload"
              className="block mb-2 font-semibold"
            >
              Choose File
            </label>

            <input
              id="fileUpload"
              type="file"
              onChange={handleFileChange}
              className="w-full border rounded-xl p-3"
            />

          </div>

          {/* FILE PREVIEW */}
          {selectedFile && (

            <div className="flex items-center justify-between bg-muted rounded-xl p-4 mb-6">

              <div className="flex items-center gap-3">

                <FileText className="w-5 h-5" />

                <span>

                  {selectedFile.name}

                </span>

              </div>

              <button
                onClick={handleRemoveFile}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-5 h-5" />
              </button>

            </div>

          )}

          {/* CHILD SELECT */}
          <div className="mb-6">

            <label
              htmlFor="children"
              className="block mb-2 font-semibold"
            >
              Select Children
            </label>

            <select
              id="children"
              onChange={handleChildSelect}
              className="w-full border rounded-xl p-3"
            >

              <option value="">

                Select Child

              </option>

              {children.map((child) => (

                <option
                  key={child}
                  value={child}
                >
                  {child}
                </option>

              ))}

            </select>

          </div>

          {/* SELECTED CHILDREN */}
          {selectedChildren.length > 0 && (

            <div className="flex flex-wrap gap-2 mb-6">

              {selectedChildren.map((child) => (

                <div
                  key={child}
                  className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm"
                >
                  {child}
                </div>

              ))}

            </div>

          )}

          {/* UPLOAD BUTTON */}
          <button
            onClick={handleUpload}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl hover:opacity-90"
          >

            <Upload className="w-5 h-5" />

            Upload File

          </button>

        </div>

        {/* FILES LIST */}
        <div>

          <h2 className="text-2xl font-bold mb-6">

            Uploaded Files

          </h2>

          <div className="grid md:grid-cols-2 gap-6">

            {files.map((file) => (

              <div
                key={file.id}
                className="bg-card rounded-2xl shadow-md p-5 border"
              >

                <div className="flex items-start justify-between mb-4">

                  <div className="flex items-center gap-3">

                    <FileText className="w-6 h-6" />

                    <div>

                      <h3 className="font-bold">

                        {file.name}

                      </h3>

                      <p className="text-sm text-muted-foreground">

                        {file.date}

                      </p>

                    </div>

                  </div>

                  <button
                    onClick={() => handleDelete(file.id)}
                    className="text-red-500 hover:text-red-700"
                  >

                    <Trash2 className="w-5 h-5" />

                  </button>

                </div>

                {/* CHILDREN */}
                <div className="flex flex-wrap gap-2">

                  {file.children.map((child: string) => (

                    <span
                      key={child}
                      className="bg-secondary px-3 py-1 rounded-full text-sm"
                    >

                      {child}

                    </span>

                  ))}

                </div>

              </div>

            ))}

          </div>

        </div>

      </div>

    </div>
  );
}