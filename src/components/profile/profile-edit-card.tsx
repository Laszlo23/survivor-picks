"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Pencil, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ProfileEditCardProps = {
  name: string | null;
  image: string | null;
  email: string;
  onUpdate: (updates: { name?: string; image?: string }) => Promise<void>;
};

export function ProfileEditCard({ name, image, email, onUpdate }: ProfileEditCardProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editName, setEditName] = useState(name || "");
  const [editImage, setEditImage] = useState(image || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setLoading(true);
    setError(null);
    try {
      await onUpdate({
        name: editName.trim() || undefined,
        image: editImage.trim() || undefined,
      });
      setOpen(false);
      router.refresh();
      window.dispatchEvent(new Event("auth-change"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setLoading(false);
    }
  }

  const displayName = name || "RealityPicks Player";
  const initials = displayName[0]?.toUpperCase() || email[0]?.toUpperCase() || "?";

  return (
    <>
      <div className="mb-8 flex items-center gap-3 sm:gap-4">
        <div className="relative shrink-0 group">
          <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-primary/20 text-primary text-xl sm:text-2xl font-bold relative z-10 overflow-hidden">
            {image ? (
              <Image
                src={image}
                alt={displayName}
                width={64}
                height={64}
                className="object-cover w-full h-full"
              />
            ) : (
              initials
            )}
          </div>
          <div className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-primary via-blue-500 to-violet-500 opacity-50 blur-sm" />
          <button
            onClick={() => {
              setEditName(name || "");
              setEditImage(image || "");
              setError(null);
              setOpen(true);
            }}
            className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity z-20"
            aria-label="Edit profile"
          >
            <Pencil className="h-5 w-5 text-white" />
          </button>
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-display font-bold truncate">
            {displayName}
          </h1>
          <p className="text-muted-foreground text-sm truncate">{email}</p>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md bg-studio-dark border-white/[0.08]">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {error && (
              <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                Display name
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Your name"
                maxLength={50}
                className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-muted-foreground outline-none focus:border-neon-cyan/50"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                Avatar URL
              </label>
              <input
                type="url"
                value={editImage}
                onChange={(e) => setEditImage(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-muted-foreground outline-none focus:border-neon-cyan/50"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Paste a link to your profile picture (e.g. from Gravatar)
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
