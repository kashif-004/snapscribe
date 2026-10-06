import { useEffect, useState } from 'react';
import Auth from './Auth';
import api from './api';

function App() {
  const [activeView, setActiveView] = useState('My Notes');
  const [notes, setNotes] = useState([]);
  const [showEditor, setShowEditor] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [token, setToken] = useState(
    () => localStorage.getItem('token')
  );
  const [loading, setLoading] = useState(true);

  // Load notes from MongoDB
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    async function fetchNotes() {
      try {
        const response = await api.get('/notes');
        setNotes(response.data);
      } catch (error) {
        console.error('Failed to load notes:', error);

        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          setToken(null);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchNotes();
  }, [token]);

  // Create a new note
  async function addNote(e) {
    e.preventDefault();

    if (!title.trim()) return;

    try {
      const response = await api.post('/notes', {
        title: title.trim(),
        content: content.trim(),
      });

      setNotes((prev) => [response.data.note, ...prev]);

      setTitle('');
      setContent('');
      setShowEditor(false);
      setActiveView('My Notes');
    } catch (error) {
      console.error('Failed to create note:', error);

      alert(
        error.response?.data?.message ||
          'Failed to create note.'
      );
    }
  }

  // Favorite / unfavorite a note
  async function toggleFavorite(note) {
    try {
      const response = await api.put(`/notes/${note._id}`, {
        favorite: !note.favorite,
      });

      setNotes((prev) =>
        prev.map((item) =>
          item._id === note._id ? response.data.note : item
        )
      );
    } catch (error) {
      console.error('Failed to update favorite:', error);

      alert(
        error.response?.data?.message ||
          'Failed to update favorite.'
      );
    }
  }

  // Move note to Trash
  async function moveToTrash(note) {
    try {
      const response = await api.put(`/notes/${note._id}`, {
        isDeleted: true,
      });

      setNotes((prev) =>
        prev.map((item) =>
          item._id === note._id ? response.data.note : item
        )
      );
    } catch (error) {
      console.error('Failed to move note to trash:', error);

      alert(
        error.response?.data?.message ||
          'Failed to move note to trash.'
      );
    }
  }

  // Restore note from Trash
  async function restoreNote(note) {
    try {
      const response = await api.put(`/notes/${note._id}`, {
        isDeleted: false,
      });

      setNotes((prev) =>
        prev.map((item) =>
          item._id === note._id ? response.data.note : item
        )
      );
    } catch (error) {
      console.error('Failed to restore note:', error);

      alert(
        error.response?.data?.message ||
          'Failed to restore note.'
      );
    }
  }

  // Permanently delete note
  async function permanentlyDelete(note) {
    const confirmed = window.confirm(
      'Delete this note permanently? This cannot be undone.'
    );

    if (!confirmed) return;

    try {
      await api.delete(`/notes/${note._id}`);

      setNotes((prev) =>
        prev.filter((item) => item._id !== note._id)
      );
    } catch (error) {
      console.error('Failed to permanently delete note:', error);

      alert(
        error.response?.data?.message ||
          'Failed to delete note.'
      );
    }
  }

  // Logout
  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    setToken(null);
    setShowAccountMenu(false);
  }

  const menuItems = [
    { name: 'My Notes', icon: '▤' },
    { name: 'Favorites', icon: '☆' },
    { name: 'Trash', icon: '♧' },
  ];

  // Show login page when there is no token
  if (!token) {
    return <Auth onAuth={setToken} />;
  }

  // Filter notes depending on selected section
  const visibleNotes = notes.filter((note) => {
    if (activeView === 'Trash') {
      return note.isDeleted === true;
    }

    if (activeView === 'Favorites') {
      return note.favorite === true && note.isDeleted !== true;
    }

    return note.isDeleted !== true;
  });

  return (
    <div className="flex min-h-screen bg-[#fafafa] text-[#242424] max-[600px]:flex-col">
      <aside className="flex min-h-screen w-[230px] shrink-0 flex-col border-r border-[#ededed] bg-white px-4 py-7 max-[900px]:w-[190px] max-[900px]:px-3 max-[900px]:py-6 max-[600px]:order-2 max-[600px]:fixed max-[600px]:bottom-0 max-[600px]:left-0 max-[600px]:z-[5] max-[600px]:h-[66px] max-[600px]:min-h-0 max-[600px]:w-full max-[600px]:border-r-0 max-[600px]:border-t max-[600px]:border-[#ededed] max-[600px]:px-2.5 max-[600px]:py-1.5">
        <div className="hidden items-center gap-2.5 text-[19px] font-bold max-[600px]:hidden">
          <span className="grid h-[30px] w-[30px] place-items-center rounded-[9px] bg-[#6857db] text-[17px] font-bold text-white">
            S
          </span>
          <span>SnapScribe</span>
        </div>

        <nav className="mt-[78px] flex flex-col gap-2 max-[600px]:m-0 max-[600px]:h-full max-[600px]:flex-row max-[600px]:justify-around max-[600px]:gap-1">
          {menuItems.map((item) => (
            <button
              key={item.name}
              className={`flex w-full items-center gap-[13px] rounded-lg border-0 px-3.5 py-3 text-left text-sm cursor-pointer transition-colors duration-200 max-[600px]:flex-1 max-[600px]:flex-col max-[600px]:justify-center max-[600px]:gap-[3px] max-[600px]:px-0.5 max-[600px]:py-[5px] max-[600px]:text-center max-[600px]:text-[10px] ${
                activeView === item.name
                  ? 'bg-[#f1efff] font-semibold text-[#6857db]'
                  : 'bg-transparent text-[#777] hover:bg-[#f7f7f7] hover:text-[#222]'
              }`}
              onClick={() => setActiveView(item.name)}
            >
              <span className="w-5 text-center text-[19px] max-[600px]:text-lg">
                {item.icon}
              </span>
              <span>{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto flex items-center gap-[11px] border-t border-[#eee] px-2 pt-4 max-[600px]:hidden">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#eeeaff] text-sm font-semibold text-[#6857db]">
            K
          </span>

          <div className="flex min-w-0 flex-col gap-1">
            <strong className="text-[13px] font-semibold">My Account</strong>
            <span className="text-[11px] text-[#999]">Personal space</span>
          </div>
        </div>

        <div className="mt-3 px-2 py-2 text-center text-[11px] leading-[1.4] text-[#aaa5b5] max-[600px]:hidden">
          © 2026 SnapScribe. Made by Muhammad Kashif.
        </div>
      </aside>

      <main className="min-w-0 flex-1 max-[600px]:order-1 max-[600px]:pb-[75px]">
        <header className="relative flex h-[78px] items-center justify-between border-b border-[#ededed] bg-white px-[34px] max-[900px]:px-[22px] max-[600px]:h-16 max-[600px]:px-3.5">
          <div className="w-20 max-[600px]:w-[45px]" />

          <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-[9px] whitespace-nowrap text-[19px] font-bold tracking-[-0.5px] max-[600px]:gap-[7px] max-[600px]:text-base">
            <span className="grid h-[30px] w-[30px] place-items-center rounded-[9px] bg-[#6857db] text-[17px] font-bold text-white max-[600px]:h-[27px] max-[600px]:w-[27px] max-[600px]:rounded-lg max-[600px]:text-[15px]">
              S
            </span>
            <span>SnapScribe</span>
          </div>

          <div className="ml-auto flex items-center gap-3 max-[600px]:gap-[7px]">
            {activeView !== 'Trash' && (
              <button
                className="grid h-[38px] w-[38px] cursor-pointer place-items-center rounded-[10px] border border-[#6857db] bg-[#6857db] text-[26px] leading-none text-white transition-colors duration-200 hover:border-[#5746c5] hover:bg-[#5746c5] max-[600px]:h-[34px] max-[600px]:w-[34px] max-[600px]:rounded-[9px] max-[600px]:text-[23px]"
                onClick={() => setShowEditor(true)}
                aria-label="Add a new note"
                title="New note"
              >
                +
              </button>
            )}

            <div className="relative">
              <button
                className="grid h-[38px] w-[38px] cursor-pointer place-items-center rounded-[10px] border border-[#e9e9e9] bg-white text-[#555] transition-colors duration-200 hover:border-[#d8d1ff] hover:bg-[#f5f3ff] max-[600px]:h-[34px] max-[600px]:w-[34px] max-[600px]:rounded-[9px]"
                aria-label="Account"
                title="Account"
                onClick={() =>
                  setShowAccountMenu((prev) => !prev)
                }
              >
                <svg
                  className="h-[21px] w-[21px]"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="8" r="3.5" />
                  <path d="M5 20c.5-3.5 3.2-5.5 7-5.5s6.5 2 7 5.5" />
                </svg>
              </button>

              {showAccountMenu && (
                <div className="absolute right-0 top-[calc(100%+12px)] z-[100] w-[190px] rounded-xl border border-[#eeeaf5] bg-white p-2.5 shadow-[0_8px_25px_rgba(35,20,70,0.12)]">
                  <div className="flex flex-col gap-1 p-2.5">
                    <strong className="text-sm text-[#252238]">My Account</strong>
                    <span className="text-xs text-[#888398]">Personal space</span>
                  </div>

                  <div className="my-1.5 h-px bg-[#eeeaf5]" />

                  <button
                    onClick={handleLogout}
                    className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg border-0 bg-transparent p-2.5 text-left text-sm text-[#dc3545] hover:bg-[#fff0f1]"
                  >
                    <span>↪</span>
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <section className="mx-auto w-full max-w-[1100px] px-10 py-[42px] max-[900px]:px-6 max-[900px]:py-8 max-[600px]:px-4 max-[600px]:py-7">
          <div className="mb-[26px] flex items-center justify-between gap-4 max-[600px]:mb-5">
            <div>
              <h1 className="m-0 text-[23px] font-semibold tracking-[-0.5px] max-[600px]:text-xl">
                {activeView}
              </h1>
              <p className="m-0 mt-[7px] text-[13px] text-[#999]">
                Your thoughts, organized.
              </p>
            </div>

            <span className="whitespace-nowrap rounded-[20px] border border-[#ededed] bg-white px-3 py-[7px] text-xs text-[#777]">
              {loading ? 'Loading...' : `${visibleNotes.length} notes`}
            </span>
          </div>

          {loading ? (
            <div className="px-5 py-[70px] text-center text-[#888]">
              <h2 className="m-0 text-[17px] text-[#333]">Loading notes...</h2>
            </div>
          ) : visibleNotes.length > 0 ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4 max-[900px]:grid-cols-[repeat(auto-fill,minmax(190px,1fr))] max-[600px]:grid-cols-1 max-[600px]:gap-3">
              {visibleNotes.map((note) => (
                <article
                  className="flex min-h-[170px] flex-col rounded-[10px] border border-[#ededed] bg-white p-5 transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-[#d8d1ff] max-[600px]:min-h-[145px]"
                  key={note._id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="m-0 mb-3 text-[15px] font-semibold">
                      {note.title}
                    </h2>

                    {activeView !== 'Trash' && (
                      <button
                        className={`cursor-pointer border-0 bg-transparent px-1 py-0.5 text-[22px] leading-none transition-[transform,color] duration-150 hover:scale-[1.15] hover:text-[#e25565] ${
                          note.favorite ? 'text-[#e25565]' : 'text-[#aaa]'
                        }`}
                        onClick={() => toggleFavorite(note)}
                        aria-label={
                          note.favorite
                            ? 'Remove from favorites'
                            : 'Add to favorites'
                        }
                        title={
                          note.favorite
                            ? 'Remove from favorites'
                            : 'Add to favorites'
                        }
                      >
                        {note.favorite ? '♥' : '♡'}
                      </button>
                    )}
                  </div>

                  <p className="m-0 break-words text-[13px] leading-[1.6] text-[#777]">
                    {note.content}
                  </p>

                  <span className="mt-auto pt-[18px] text-[11px] text-[#aaa]">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </span>

                  <div className="mt-4 flex items-center gap-2">
                    {activeView === 'Trash' ? (
                      <>
                        <button
                          className="cursor-pointer rounded-[7px] border-0 bg-transparent px-2 py-1.5 text-[13px] hover:bg-[#f0f7ff]"
                          onClick={() => restoreNote(note)}
                        >
                          ↩ Restore
                        </button>

                        <button
                          className="cursor-pointer rounded-[7px] border-0 bg-transparent px-2 py-1.5 text-[13px] text-[#dc3545] hover:bg-[#fff0f0]"
                          onClick={() =>
                            permanentlyDelete(note)
                          }
                        >
                          Delete Permanently
                        </button>
                      </>
                    ) : (
                      <button
                        className="cursor-pointer rounded-[7px] border-0 bg-transparent px-2 py-1.5 text-[13px] hover:bg-[#fff0f0]"
                        onClick={() => moveToTrash(note)}
                        title="Move to Trash"
                      >
                        🗑 Trash
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="px-5 py-[70px] text-center text-[#888]">
              <span className="text-[30px] text-[#aaa]">✎</span>

              <h2 className="mb-2 mt-[15px] text-[17px] text-[#333]">
                {activeView === 'Trash'
                  ? 'Trash is empty'
                  : activeView === 'Favorites'
                  ? 'No favorite notes'
                  : 'No notes yet'}
              </h2>

              <p className="text-[13px]">
                {activeView === 'Trash'
                  ? 'Deleted notes will appear here.'
                  : activeView === 'Favorites'
                  ? 'Favorite a note to see it here.'
                  : 'Click the + button to create your first note.'}
              </p>
            </div>
          )}
        </section>
      </main>

      {showEditor && (
        <div
          className="fixed inset-0 z-10 grid place-items-center bg-[rgba(20,20,30,0.35)] p-5"
          onClick={() => setShowEditor(false)}
        >
          <form
            className="w-full max-w-[440px] rounded-[14px] border border-[#eee] bg-white p-6 shadow-[0_15px_50px_rgba(0,0,0,0.12)]"
            onSubmit={addNote}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="m-0 text-lg">New Note</h2>

              <button
                type="button"
                className="cursor-pointer border-0 bg-transparent text-[26px] text-[#888]"
                onClick={() => setShowEditor(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <input
              type="text"
              placeholder="Note title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              required
              className="mb-3.5 block w-full resize-y rounded-lg border border-[#e8e8e8] p-3 text-sm outline-none focus:border-[#9689ee]"
            />

            <textarea
              placeholder="Start writing..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows="6"
              className="mb-3.5 block w-full resize-y rounded-lg border border-[#e8e8e8] p-3 text-sm outline-none focus:border-[#9689ee]"
            />

            <button
              className="w-full cursor-pointer rounded-lg border-0 bg-[#6857db] p-3 font-semibold text-white hover:bg-[#5746c5]"
              type="submit"
            >
              Save Note
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;
