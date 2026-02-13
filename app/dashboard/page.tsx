"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import { useRouter } from "next/navigation";

interface Bookmark {
  id: string;
  title: string;
  url: string;
  user_id: string;
  created_at: string;
}

export default function Dashboard() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ✅ 1️⃣ GET LOGGED-IN USER
useEffect(() => {
  const getUser = async () => {
    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      router.push("/");
      return;
    }

    setUser(data.user);
    setLoading(false);
  };

  getUser();
}, [router]);


  // ✅ 2️⃣ FETCH BOOKMARKS
  const fetchBookmarks = async (currentUser: any) => {
    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", currentUser.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch error:", error);
      return;
    }

    setBookmarks(data || []);
  };

  // REALTIME + INITIAL FETCH
useEffect(() => {
  if (!user) return;

  fetchBookmarks(user);

  const channel = supabase
    .channel("realtime-bookmarks")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "bookmarks",
        filter: `user_id=eq.${user.id}`,
      },
      () => {
        fetchBookmarks(user);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [user]);


  // ✅ 4️⃣ ADD BOOKMARK
  const addBookmark = async () => {
    if (!title || !url || !user) return;

    setAdding(true);

    const formattedUrl =
      url.startsWith("http://") || url.startsWith("https://")
        ? url
        : `https://${url}`;

    const { error } = await supabase.from("bookmarks").insert([
      {
        title,
        url: formattedUrl,
        user_id: user.id,
      },
    ]);

    setAdding(false);

    if (error) {
      console.error("Insert error:", error);
      alert("Insert failed");
      return;
    }

    setTitle("");
    setUrl("");
  };

  // ✅ 5️⃣ DELETE BOOKMARK
  const deleteBookmark = async (id: string) => {
  if (!user) return;

  setDeletingId(id);

  const { error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Delete error:", error);
    alert("Delete failed");
    setDeletingId(null);
    return;
  }

  // 🔥 Remove instantly from UI
  setBookmarks((prev) =>
    prev.filter((bookmark) => bookmark.id !== id)
  );

  setDeletingId(null);
};


  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg font-medium">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <div className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">
          Smart Bookmark
        </h1>

        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-semibold">
            {user?.email?.charAt(0).toUpperCase()}
          </div>

          <button
            onClick={logout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-12 px-6">
        {/* Add Bookmark */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Add New Bookmark
          </h2>

          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 border p-3 rounded-lg"
            />

            <input
              type="text"
              placeholder="URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 border p-3 rounded-lg"
            />

            <button
              onClick={addBookmark}
              disabled={adding}
              className={`px-6 py-3 rounded-lg text-white transition ${
                adding
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-black hover:bg-gray-800 cursor-pointer"
              }`}
            >
              {adding ? "Adding..." : "Add"}
            </button>
          </div>
        </div>

        {/* Bookmark List */}
        <div className="space-y-4">
          {bookmarks.length === 0 && (
            <p className="text-gray-500 text-center">
              No bookmarks yet.
            </p>
          )}

          {bookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              className="bg-white p-4 rounded-lg shadow flex justify-between items-center"
            >
              <div>
                <h3 className="font-semibold">
                  {bookmark.title}
                </h3>

                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 text-sm hover:underline break-all"
                >
                  {bookmark.url}
                </a>
              </div>

              <button
                onClick={() => deleteBookmark(bookmark.id)}
                disabled={deletingId === bookmark.id}
                className="text-red-500 hover:text-red-700 cursor-pointer"
              >
                {deletingId === bookmark.id
                  ? "Deleting..."
                  : "Delete"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
