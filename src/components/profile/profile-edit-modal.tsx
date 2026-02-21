"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Check, AlertCircle, Globe, AtSign } from "lucide-react";

type ProfileEditModalProps = {
  open: boolean;
  onClose: () => void;
  initial: {
    name: string | null;
    username: string | null;
    image: string | null;
    bio: string | null;
    socialTwitter: string | null;
    socialInstagram: string | null;
    socialTiktok: string | null;
    socialFarcaster: string | null;
    socialWebsite: string | null;
  };
  onSave: (updates: {
    name?: string;
    username?: string;
    image?: string;
    bio?: string;
    socialTwitter?: string;
    socialInstagram?: string;
    socialTiktok?: string;
    socialFarcaster?: string;
    socialWebsite?: string;
  }) => Promise<unknown>;
};

export function ProfileEditModal({ open, onClose, initial, onSave }: ProfileEditModalProps) {
  const router = useRouter();
  const [name, setName] = useState(initial.name || "");
  const [username, setUsername] = useState(initial.username || "");
  const [image, setImage] = useState(initial.image || "");
  const [bio, setBio] = useState(initial.bio || "");
  const [socialTwitter, setSocialTwitter] = useState(initial.socialTwitter || "");
  const [socialInstagram, setSocialInstagram] = useState(initial.socialInstagram || "");
  const [socialTiktok, setSocialTiktok] = useState(initial.socialTiktok || "");
  const [socialFarcaster, setSocialFarcaster] = useState(initial.socialFarcaster || "");
  const [socialWebsite, setSocialWebsite] = useState(initial.socialWebsite || "");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open) {
      setName(initial.name || "");
      setUsername(initial.username || "");
      setImage(initial.image || "");
      setBio(initial.bio || "");
      setSocialTwitter(initial.socialTwitter || "");
      setSocialInstagram(initial.socialInstagram || "");
      setSocialTiktok(initial.socialTiktok || "");
      setSocialFarcaster(initial.socialFarcaster || "");
      setSocialWebsite(initial.socialWebsite || "");
      setError(null);
      setUsernameStatus("idle");
    }
  }, [open, initial]);

  function handleUsernameChange(val: string) {
    const clean = val.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 20).toLowerCase();
    setUsername(clean);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (clean.length < 3) {
      setUsernameStatus("idle");
      return;
    }
    if (clean === initial.username) {
      setUsernameStatus("available");
      return;
    }

    setUsernameStatus("checking");
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch("/api/profile/check-username", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: clean }),
        });
        const data = await res.json();
        setUsernameStatus(data.available ? "available" : "taken");
      } catch {
        setUsernameStatus("idle");
      }
    }, 400);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await onSave({
        name: name.trim(),
        username: username.trim(),
        image: image.trim(),
        bio: bio.trim(),
        socialTwitter: socialTwitter.trim(),
        socialInstagram: socialInstagram.trim(),
        socialTiktok: socialTiktok.trim(),
        socialFarcaster: socialFarcaster.trim(),
        socialWebsite: socialWebsite.trim(),
      });
      onClose();
      router.refresh();
      window.dispatchEvent(new Event("auth-change"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-muted-foreground outline-none focus:border-neon-cyan/50 transition-colors";

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-[301] overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative w-full max-w-lg rounded-2xl border border-white/[0.1] bg-studio-dark shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-studio-dark rounded-t-2xl">
                  <h2 className="text-lg font-display font-bold">Edit Profile</h2>
                  <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors">
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>

                <div className="p-6 space-y-5">
                  {error && (
                    <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      {error}
                    </div>
                  )}

                  {/* Display Name */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">Display Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      maxLength={50}
                      className={inputClass}
                    />
                  </div>

                  {/* Username */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">Username</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <AtSign className="h-3.5 w-3.5" />
                      </div>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => handleUsernameChange(e.target.value)}
                        placeholder="your_username"
                        maxLength={20}
                        className={`${inputClass} pl-8 pr-8`}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {usernameStatus === "checking" && <Loader2 className="h-3.5 w-3.5 text-muted-foreground animate-spin" />}
                        {usernameStatus === "available" && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                        {usernameStatus === "taken" && <X className="h-3.5 w-3.5 text-red-400" />}
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      3-20 characters, letters, numbers, underscores
                    </p>
                  </div>

                  {/* Avatar URL */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">Avatar URL</label>
                    <input
                      type="url"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      placeholder="https://..."
                      className={inputClass}
                    />
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                      Bio <span className="text-muted-foreground/50">({bio.length}/160)</span>
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value.slice(0, 160))}
                      placeholder="Tell everyone a bit about yourself..."
                      rows={3}
                      className={`${inputClass} resize-none`}
                    />
                  </div>

                  {/* Social Links */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-3">Social Links</label>
                    <div className="space-y-3">
                      {[
                        { label: "X / Twitter", value: socialTwitter, set: setSocialTwitter, placeholder: "username" },
                        { label: "Instagram", value: socialInstagram, set: setSocialInstagram, placeholder: "username" },
                        { label: "TikTok", value: socialTiktok, set: setSocialTiktok, placeholder: "username" },
                        { label: "Farcaster", value: socialFarcaster, set: setSocialFarcaster, placeholder: "username" },
                        { label: "Website", value: socialWebsite, set: setSocialWebsite, placeholder: "https://..." },
                      ].map((social) => (
                        <div key={social.label} className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-20 shrink-0">{social.label}</span>
                          <input
                            type="text"
                            value={social.value}
                            onChange={(e) => social.set(e.target.value)}
                            placeholder={social.placeholder}
                            className={inputClass}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.06]">
                    <button
                      onClick={onClose}
                      className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-white hover:bg-white/[0.06] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving || usernameStatus === "taken"}
                      className="px-4 py-2 rounded-lg text-sm font-semibold bg-neon-cyan text-studio-black hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                    >
                      {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                      Save Changes
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
