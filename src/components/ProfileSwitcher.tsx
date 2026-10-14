import { useState, FC, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import type { ContentAgeGroup } from "@/context/WellnessContext";
import {
  User,
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  X,
  Loader2,
  Download,
} from "lucide-react";
import { useProfile, useProfileId } from "@/context/ProfileContext";
import { useWellness } from "@/context/WellnessContext";
import type { FamilyMode } from "@/lib/profiles";

const MODE_CYCLE: FamilyMode[] = ["parent", "child", "family"];

function nextMode(current: FamilyMode): FamilyMode {
  const idx = MODE_CYCLE.indexOf(current);
  return MODE_CYCLE[(idx + 1) % MODE_CYCLE.length];
}

const ProfileSwitcher: FC = () => {
  const { currentProfile, profiles, createNewProfile, switchProfile, updateCurrentProfile, deleteCurrentProfile, resetCurrentProgress } = useProfile();
  const { mode, setMode, contentAgeGroup, setContentAgeGroup } = useWellness();
  const profileId = useProfileId();

  const [isOpen, setIsOpen] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editMode, setEditMode] = useState<FamilyMode>("parent");
  const [newNickname, setNewNickname] = useState("");
  const [editingNickname, setEditingNickname] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!currentProfile) return null;

  const handleCreate = () => {
    setNewNickname("");
    setShowNew(true);
  };

  const confirmCreate = () => {
    if (!newNickname.trim()) {
      createNewProfile("", mode);
    } else {
      createNewProfile(newNickname.trim(), mode);
    }
    setShowNew(false);
    setNewNickname("");
  };

  const startEdit = () => {
    setEditingNickname(currentProfile.nickname);
    setEditMode(currentProfile.mode);
    setEditing(true);
  };

  const saveEdit = () => {
    const nickname = editingNickname.trim() || currentProfile.nickname;
    updateCurrentProfile({
      nickname,
      mode: editMode,
    });
    setEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm("Delete this profile and its local progress?")) {
      resetCurrentProgress();
      deleteCurrentProfile();
    }
  };

  const selectedProfile = currentProfile;

  return (
    <div className="relative">
      <button
        data-tour="profile-switcher"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/20 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors"
      >
        <User className="w-4 h-4" />
        <span className="max-w-[120px] truncate">
          {selectedProfile.nickname || "Unnamed"}
        </span>
        <ChevronDown className="w-3 h-3" />
      </button>

      {isOpen && (
        <div ref={dropdownRef} className="absolute right-0 top-full mt-2 w-72 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl p-3 z-50">
          <div className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3">
            Active Profile
          </div>

          <div className="space-y-2 mb-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">Profile</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {selectedProfile.nickname || "Unnamed"}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">Family</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {selectedProfile.familyId}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">Mode</span>
              <button
                onClick={() => {
                  const newMode = nextMode(selectedProfile.mode);
                  updateCurrentProfile({ mode: newMode });
                  setMode(newMode);
                }}
                className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                {selectedProfile.mode}
              </button>
            </div>
          </div>

          <div className="flex gap-2 mb-3">
            <button
              onClick={startEdit}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <Pencil className="w-3 h-3" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-bold rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              Delete
            </button>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
            <div className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
              Switch Profile
            </div>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {profiles.map((profile) => (
                <button
                  key={profile.id}
                  onClick={() => {
                    switchProfile(profile.id);
                    setMode(profile.mode);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm flex items-center justify-between transition-colors ${
                    profile.id === selectedProfile.id
                      ? "bg-[#4FD1C5]/10 text-[#2C7A7B] dark:text-[#4FD1C5]"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <span className="truncate">
                    {profile.nickname || "Unnamed"} · {profile.familyId.slice(0, 8)}
                  </span>
                  {profile.id === selectedProfile.id && (
                    <span className="text-xs">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
            <Link
              to="/transfer"
              onClick={() => setIsOpen(false)}
              className="block w-full text-left px-3 py-2 rounded-xl text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
            >
              <Download className="w-3 h-3 text-[#4FD1C5]" />
              Transfer Profiles
            </Link>
          </div>

          <button
            onClick={handleCreate}
            className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold rounded-xl bg-[#4FD1C5] text-white hover:bg-[#4FD1C5]/90 transition-colors"
          >
            <Plus className="w-3 h-3" />
            New Profile
          </button>
        </div>
      )}

      {showNew && (
        <div
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
          onClick={() => setShowNew(false)}
        >
          <div
            className="absolute inset-0 flex flex-col items-center justify-start p-4 pt-[15vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 w-full max-w-sm">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
                new profile
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">
                    nickname (optional)
                  </label>
                  <input
                    type="text"
                    value={newNickname}
                    onChange={(e) => setNewNickname(e.target.value)}
                    placeholder="e.g. Mom, Alex, Family 2"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4FD1C5]"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">
                    content age group
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(["kids", "teens", "parents", "both", "family"] as ContentAgeGroup[]).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setContentAgeGroup(g)}
                        className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                          contentAgeGroup === g
                            ? "bg-[#4FD1C5] text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                    Chooses which content is suggested to you. Saved per profile.
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">
                    mode
                  </label>
                  <div className="flex gap-2">
                    {(["parent", "child", "family"] as FamilyMode[]).map((m) => (
                      <button
                        key={m}
                        onClick={() => setMode(m)}
                        className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                          mode === m
                            ? "bg-[#4FD1C5] text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-5">
                <button
                  onClick={() => setShowNew(false)}
                  className="flex-1 px-4 py-2 text-sm font-bold rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  cancel
                </button>
                <button
                  onClick={confirmCreate}
                  className="flex-1 px-4 py-2 text-sm font-bold rounded-xl bg-[#4FD1C5] text-white hover:bg-[#4FD1C5]/90 transition-colors"
                >
                  create profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editing && (
        <div
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
          onClick={() => setEditing(false)}
        >
          <div
            className="absolute inset-0 flex flex-col items-center justify-start p-4 pt-[15vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 w-full max-w-sm">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
                edit profile
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">
                    nickname
                  </label>
                  <input
                    type="text"
                    value={editingNickname}
                    onChange={(e) => setEditingNickname(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4FD1C5]"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">
                    mode
                  </label>
                  <div className="flex gap-2">
                    {(["parent", "child", "family"] as FamilyMode[]).map((m) => (
                      <button
                        key={m}
                        onClick={() => setEditMode(m)}
                        className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                          editMode === m
                            ? "bg-[#4FD1C5] text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-5">
                <button
                  onClick={() => setEditing(false)}
                  className="flex-1 px-4 py-2 text-sm font-bold rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  cancel
                </button>
                <button
                  onClick={saveEdit}
                  className="flex-1 px-4 py-2 text-sm font-bold rounded-xl bg-[#4FD1C5] text-white hover:bg-[#4FD1C5]/90 transition-colors"
                >
                  save changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSwitcher;
