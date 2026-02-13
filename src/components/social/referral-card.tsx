"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CopyButton, ShareButton } from "./share-button";
import {
  Users,
  Gift,
  Link2,
  Loader2,
  UserPlus,
} from "lucide-react";
import { getOrCreateReferralCode, type ReferralStats } from "@/lib/actions/referral";

interface ReferralCardProps {
  stats: ReferralStats | null;
  seasonId: string;
}

export function ReferralCard({ stats, seasonId }: ReferralCardProps) {
  const [referralCode, setReferralCode] = useState<string | null>(
    stats?.referralCode || null
  );
  const [loading, setLoading] = useState(false);

  const generateCode = async () => {
    setLoading(true);
    const code = await getOrCreateReferralCode();
    if (code) setReferralCode(code);
    setLoading(false);
  };

  useEffect(() => {
    if (!referralCode && !loading) {
      generateCode();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const referralLink = referralCode && origin
    ? `${origin}/?ref=${referralCode}`
    : referralCode
      ? `/?ref=${referralCode}`
      : "";

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Invite Friends
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Reward info */}
        <div className="flex items-center gap-3 rounded-lg bg-primary/5 border border-primary/20 p-3">
          <Gift className="h-8 w-8 text-primary shrink-0" />
          <div>
            <p className="text-sm font-medium">Earn 200 points per invite!</p>
            <p className="text-xs text-muted-foreground">
              Your friend gets 100 bonus points too. Win-win!
            </p>
          </div>
        </div>

        {/* Referral code */}
        {referralCode ? (
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">
                Your referral code
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-lg bg-secondary/50 border border-border/50 px-4 py-2.5 text-center font-mono text-lg font-bold tracking-widest">
                  {referralCode}
                </code>
                <CopyButton text={referralCode} label="Copy" />
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1.5">
                Or share your invite link
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 rounded-lg bg-secondary/50 border border-border/50 px-3 py-2 text-xs text-muted-foreground truncate">
                  <Link2 className="h-3 w-3 inline mr-1" />
                  {referralLink}
                </div>
                <CopyButton text={referralLink} label="Copy" />
              </div>
            </div>

            <ShareButton
              shareType="invite"
              shareData={{ referralCode }}
              taskKey="invite_friend"
              seasonId={seasonId}
              variant="default"
              size="default"
              className="w-full"
              label="Share Invite Link"
            />
          </div>
        ) : (
          <div className="text-center py-4">
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
            ) : (
              <Button onClick={generateCode} variant="outline" className="gap-2">
                <UserPlus className="h-4 w-4" />
                Generate My Code
              </Button>
            )}
          </div>
        )}

        {/* Stats */}
        {stats && stats.totalReferrals > 0 && (
          <div className="border-t border-border/30 pt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Friends invited</span>
              <span className="font-mono font-bold">{stats.totalReferrals}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Points earned</span>
              <span className="font-mono font-bold text-primary">
                +{stats.totalPointsEarned}
              </span>
            </div>
            {stats.recentReferrals.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-muted-foreground mb-1.5">
                  Recent referrals
                </p>
                <div className="space-y-1">
                  {stats.recentReferrals.slice(0, 5).map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between text-xs"
                    >
                      <span>{r.refereeName}</span>
                      <span className="text-primary font-mono">
                        +{r.pointsAwarded}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
