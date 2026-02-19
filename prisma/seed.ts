import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data
  await prisma.socialTaskClaim.deleteMany();
  await prisma.socialTask.deleteMany();
  await prisma.referral.deleteMany();
  await prisma.userBadge.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.scoreEvent.deleteMany();
  await prisma.prediction.deleteMany();
  await prisma.userSeasonStats.deleteMany();
  await prisma.question.deleteMany();
  await prisma.episode.deleteMany();
  await prisma.contestant.deleteMany();
  await prisma.tribe.deleteMany();
  await prisma.season.deleteMany();

  // Create admin user
  const adminEmail = process.env.ADMIN_EMAIL || "admin@realitypicks.xyz";
  const adminRef = "ADM" + Date.now().toString(36).slice(-5).toUpperCase();
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "ADMIN" },
    create: {
      email: adminEmail,
      name: "Admin",
      role: "ADMIN",
      emailVerified: new Date(),
      referralCode: adminRef,
    },
  });
  console.log(`  ✅ Admin user: ${admin.email} (ref: ${admin.referralCode})`);

  // Create dev test player
  const playerRef = "PLAY" + Date.now().toString(36).slice(-4).toUpperCase();
  const player = await prisma.user.upsert({
    where: { email: "player@realitypicks.xyz" },
    update: {},
    create: {
      email: "player@realitypicks.xyz",
      name: "Test Player",
      role: "USER",
      emailVerified: new Date(),
      referralCode: playerRef,
    },
  });
  console.log(`  ✅ Test player: ${player.email} (ref: ${player.referralCode})`);

  // ─── Season ─────────────────────────────────────────────────────────────────
  // Survivor 2026: All Star & Ünlüler — TV8, premiered Jan 1 2026, Dominican Republic

  const season = await prisma.season.create({
    data: {
      title: "Survivor 2026: All Star",
      description:
        "Ünlüler vs Gönüllüler — All Stars clash with Volunteers in the Dominican Republic. 32 episodes of raw competition on TV8. Who will survive?",
      active: true,
      showSlug: "survivor-2026",
    },
  });
  console.log(`  ✅ Season: ${season.title} (slug: survivor-2026)`);

  // ─── Tribes ─────────────────────────────────────────────────────────────────

  const tribeUnluler = await prisma.tribe.create({
    data: { name: "Ünlüler", color: "#ef4444", seasonId: season.id },
  });
  const tribeGonulluler = await prisma.tribe.create({
    data: { name: "Gönüllüler", color: "#3b82f6", seasonId: season.id },
  });
  console.log("  ✅ Tribes: 🔴 Ünlüler (Celebrities), 🔵 Gönüllüler (Volunteers)");

  // ─── Contestants ────────────────────────────────────────────────────────────

  // 🔴 Ünlüler (Celebrities)
  const teamUnluler = [
    { name: "Keremcem", image: "/contestants/keremcem.jpeg" },
    { name: "Meryem Boz", image: "/contestants/meryem-boz.jpeg" },
    { name: "Serhan Onat", image: "/contestants/serhan-onat.jpeg" },
    { name: "Selen Görgüzel", image: "/contestants/selen-gorguzel.jpeg" },
    { name: "Mert Nobre", image: "/contestants/mert-nobre.jpeg" },
    { name: "Dilan Çıtak", image: "/contestants/dilan-citak.jpeg" },
    { name: "Seren Ay Çetin", image: "/contestants/seren-ay-cetin.jpeg" },
    { name: "Murat Arkın", image: "/contestants/murat-arkin.jpeg" },
    { name: "Deniz Çatalbaş", image: "/contestants/deniz-cataltas.jpeg" },
    { name: "Bayhan", image: "/contestants/bayhan.jpeg" },
  ];

  // 🔵 Gönüllüler (Volunteers)
  const teamGonulluler = [
    { name: "Engincan Tura", image: "/contestants/engincan-tura.jpeg" },
    { name: "Eren Semerci", image: "/contestants/eren-semerci.jpeg" },
    { name: "Erkan Bilben", image: "/contestants/erkan-bilben.jpeg" },
    { name: "Onur Alp Çam", image: "/contestants/onur-alp-cam.jpeg" },
    { name: "Ramazan Sarı", image: "/contestants/ramazan-sari.jpeg" },
    { name: "Lina Hourieh", image: "/contestants/lina-hourieh.jpeg" },
    { name: "Gözde Bozkurt", image: "/contestants/gozde-bozkurt.jpeg" },
    { name: "Nisanur Güler", image: "/contestants/nisanur-guler.jpeg" },
    { name: "Başak Cücü", image: "/contestants/basak-cucu.jpeg" },
  ];

  for (const c of teamUnluler) {
    await prisma.contestant.create({
      data: { name: c.name, imageUrl: c.image, seasonId: season.id, tribeId: tribeUnluler.id },
    });
  }
  for (const c of teamGonulluler) {
    await prisma.contestant.create({
      data: { name: c.name, imageUrl: c.image, seasonId: season.id, tribeId: tribeGonulluler.id },
    });
  }
  console.log(
    `  ✅ ${teamUnluler.length + teamGonulluler.length} contestants (${teamUnluler.length} Ünlüler + ${teamGonulluler.length} Gönüllüler)`
  );

  const allUnluler = teamUnluler.map((c) => c.name);
  const allGonulluler = teamGonulluler.map((c) => c.name);
  const allNames = [...allUnluler, ...allGonulluler];

  // ─── Episodes ───────────────────────────────────────────────────────────────
  // Dates are calculated relative to today so predictions are always available.
  // Past episodes → RESOLVED, yesterday → LOCKED, future → OPEN or DRAFT.

  const eliminated = ["Başak Cücü", "Deniz Çatalbaş", "Erkan Bilben", "Selen Görgüzel"];
  const remaining = allNames.filter((n) => !eliminated.includes(n));

  interface QuestionDef {
    type: "CHALLENGE_WINNER" | "ELIMINATION" | "TWIST" | "TRIBAL_COUNCIL" | "IMMUNITY" | "REWARD" | "CUSTOM";
    prompt: string;
    odds: number;
    options: string[];
    correctOption?: string;
  }

  interface EpisodeDef {
    number: number;
    title: string;
    daysFromNow: number; // negative = past, positive = future
    status: "DRAFT" | "OPEN" | "LOCKED" | "RESOLVED";
    questions: QuestionDef[];
  }

  function daysFrom(offset: number): string {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toISOString().split("T")[0];
  }

  const episodes: EpisodeDef[] = [
    // ── Past episodes (RESOLVED) ─────────────────────────
    {
      number: 1,
      title: "Adaya İlk Adım",
      daysFromNow: -42,
      status: "RESOLVED",
      questions: [
        { type: "CHALLENGE_WINNER", prompt: "Which tribe wins the first reward challenge?", odds: 100, options: ["Ünlüler", "Gönüllüler"], correctOption: "Ünlüler" },
        { type: "IMMUNITY", prompt: "Which tribe wins the first immunity?", odds: -110, options: ["Ünlüler", "Gönüllüler"], correctOption: "Gönüllüler" },
        { type: "ELIMINATION", prompt: "Who is the first contestant eliminated?", odds: 400, options: allNames, correctOption: "Başak Cücü" },
      ],
    },
    {
      number: 2,
      title: "İttifaklar Kuruluyor",
      daysFromNow: -35,
      status: "RESOLVED",
      questions: [
        { type: "IMMUNITY", prompt: "Which tribe wins immunity this week?", odds: -110, options: ["Ünlüler", "Gönüllüler"], correctOption: "Ünlüler" },
        { type: "ELIMINATION", prompt: "Who gets eliminated this week?", odds: 350, options: allGonulluler.filter((n) => n !== "Başak Cücü"), correctOption: "Erkan Bilben" },
        { type: "TWIST", prompt: "Is a hidden immunity idol found this week?", odds: 200, options: ["Yes", "No"], correctOption: "No" },
      ],
    },
    {
      number: 3,
      title: "Ada Konseyi Sürprizi",
      daysFromNow: -28,
      status: "RESOLVED",
      questions: [
        { type: "CHALLENGE_WINNER", prompt: "Which tribe wins the reward challenge?", odds: 100, options: ["Ünlüler", "Gönüllüler"], correctOption: "Gönüllüler" },
        { type: "IMMUNITY", prompt: "Which tribe wins immunity?", odds: 120, options: ["Ünlüler", "Gönüllüler"], correctOption: "Gönüllüler" },
        { type: "ELIMINATION", prompt: "Who gets eliminated in Week 3?", odds: 350, options: allUnluler, correctOption: "Deniz Çatalbaş" },
      ],
    },
    {
      number: 4,
      title: "Büyük Ödül",
      daysFromNow: -21,
      status: "RESOLVED",
      questions: [
        { type: "REWARD", prompt: "Which tribe wins the big reward (food & comfort)?", odds: 100, options: ["Ünlüler", "Gönüllüler"], correctOption: "Ünlüler" },
        { type: "IMMUNITY", prompt: "Which tribe wins immunity?", odds: -105, options: ["Ünlüler", "Gönüllüler"], correctOption: "Ünlüler" },
        { type: "ELIMINATION", prompt: "Who gets eliminated in Week 4?", odds: 300, options: allGonulluler.filter((n) => !["Başak Cücü", "Erkan Bilben"].includes(n)), correctOption: "Selen Görgüzel" },
        { type: "TWIST", prompt: "Does someone play an immunity idol at council?", odds: 250, options: ["Yes", "No"], correctOption: "No" },
      ],
    },
    {
      number: 5,
      title: "Takım Değişikliği",
      daysFromNow: -14,
      status: "RESOLVED",
      questions: [
        { type: "TWIST", prompt: "Is there a tribe swap this week?", odds: 150, options: ["Yes", "No"], correctOption: "Yes" },
        { type: "IMMUNITY", prompt: "Which tribe wins immunity after the swap?", odds: 110, options: ["Ünlüler", "Gönüllüler"], correctOption: "Ünlüler" },
        { type: "ELIMINATION", prompt: "Who is eliminated after the tribe swap?", odds: 400, options: remaining },
      ],
    },
    // ── Yesterday (LOCKED — just aired, awaiting resolution) ──────
    {
      number: 6,
      title: "Bireysel Dokunulmazlık",
      daysFromNow: -1,
      status: "LOCKED",
      questions: [
        { type: "IMMUNITY", prompt: "Who wins individual immunity this week?", odds: 500, options: remaining },
        { type: "ELIMINATION", prompt: "Who gets eliminated in Week 6?", odds: 400, options: remaining },
        { type: "TRIBAL_COUNCIL", prompt: "How many votes does the eliminated player receive?", odds: 200, options: ["3 or fewer", "4-6", "7 or more", "Unanimous"] },
      ],
    },
    // ── 3 days from now (OPEN — predictions open!) ───────────────
    {
      number: 7,
      title: "Hayatta Kalma Savaşı",
      daysFromNow: 3,
      status: "OPEN",
      questions: [
        { type: "IMMUNITY", prompt: "Who wins individual immunity this week?", odds: 450, options: remaining },
        { type: "ELIMINATION", prompt: "Who will be eliminated this week?", odds: 400, options: remaining },
        { type: "TWIST", prompt: "Will a hidden immunity idol be played at council?", odds: 200, options: ["Yes", "No"] },
        { type: "REWARD", prompt: "Who wins the reward challenge?", odds: 450, options: remaining },
      ],
    },
    // ── 10 days from now (OPEN — next week) ──────────────────────
    {
      number: 8,
      title: "Çift Eleme Gecesi",
      daysFromNow: 10,
      status: "OPEN",
      questions: [
        { type: "TWIST", prompt: "Will there be a double elimination this week?", odds: 175, options: ["Yes", "No"] },
        { type: "IMMUNITY", prompt: "Who wins individual immunity?", odds: 500, options: remaining },
        { type: "ELIMINATION", prompt: "Name someone who gets eliminated this episode", odds: 350, options: remaining },
      ],
    },
    // ── 17 days from now (DRAFT — future) ────────────────────────
    {
      number: 9,
      title: "Aile Ziyareti",
      daysFromNow: 17,
      status: "DRAFT",
      questions: [
        { type: "REWARD", prompt: "Who wins the family visit reward?", odds: 500, options: remaining },
        { type: "ELIMINATION", prompt: "Who gets eliminated in Week 9?", odds: 400, options: remaining },
      ],
    },
    // ── 24 days from now (DRAFT — future) ────────────────────────
    {
      number: 10,
      title: "Final Yolu",
      daysFromNow: 24,
      status: "DRAFT",
      questions: [
        { type: "IMMUNITY", prompt: "Who wins individual immunity heading into the finale stretch?", odds: 500, options: remaining },
        { type: "ELIMINATION", prompt: "Who gets eliminated in Week 10?", odds: 450, options: remaining },
        { type: "CUSTOM", prompt: "Will the eliminated contestant cry during their farewell speech?", odds: -130, options: ["Yes", "No"] },
      ],
    },
  ];

  for (const ep of episodes) {
    const airDateStr = daysFrom(ep.daysFromNow);
    const airDate = new Date(airDateStr + "T20:00:00+03:00"); // 20:00 Turkey time
    const lockDate = new Date(airDate);
    lockDate.setMinutes(lockDate.getMinutes() - 5); // Lock 5 min before air

    const episode = await prisma.episode.create({
      data: {
        seasonId: season.id,
        number: ep.number,
        title: ep.title,
        airAt: airDate,
        lockAt: lockDate,
        status: ep.status,
      },
    });

    for (let i = 0; i < ep.questions.length; i++) {
      const q = ep.questions[i];
      await prisma.question.create({
        data: {
          episodeId: episode.id,
          type: q.type,
          prompt: q.prompt,
          odds: q.odds,
          options: q.options,
          correctOption: q.correctOption || null,
          status:
            ep.status === "RESOLVED"
              ? "RESOLVED"
              : ep.status === "LOCKED"
              ? "LOCKED"
              : "OPEN",
          sortOrder: i,
        },
      });
    }

    console.log(`  ✅ Episode ${ep.number}: ${ep.title} (${ep.status})`);
  }

  // ─── Badges ─────────────────────────────────────────────────────────────────

  const badges = [
    {
      key: "first_blood",
      title: "First Blood",
      description: "Make your first correct prediction",
      icon: "🎯",
      rules: { type: "correct", threshold: 1 },
    },
    {
      key: "sharpshooter",
      title: "Sharpshooter",
      description: "10 correct predictions",
      icon: "🏹",
      rules: { type: "correct", threshold: 10 },
    },
    {
      key: "oracle",
      title: "Oracle",
      description: "25 correct predictions",
      icon: "🔮",
      rules: { type: "correct", threshold: 25 },
    },
    {
      key: "hot_streak",
      title: "Hot Streak",
      description: "3 correct predictions in a row",
      icon: "🔥",
      rules: { type: "streak", threshold: 3 },
    },
    {
      key: "on_fire",
      title: "On Fire!",
      description: "5 correct predictions in a row",
      icon: "🌋",
      rules: { type: "streak", threshold: 5 },
    },
    {
      key: "risk_taker",
      title: "Risk Taker",
      description: "Win 3 risk bets",
      icon: "💎",
      rules: { type: "risk_wins", threshold: 3 },
    },
    {
      key: "high_roller",
      title: "High Roller",
      description: "Win 10 risk bets",
      icon: "🎰",
      rules: { type: "risk_wins", threshold: 10 },
    },
    {
      key: "thousand_club",
      title: "1K Club",
      description: "Earn 1,000 points",
      icon: "⭐",
      rules: { type: "points", threshold: 1000 },
    },
    {
      key: "five_k",
      title: "Five K",
      description: "Earn 5,000 points",
      icon: "🌟",
      rules: { type: "points", threshold: 5000 },
    },
    {
      key: "legendary",
      title: "Legendary",
      description: "Earn 10,000 points",
      icon: "👑",
      rules: { type: "points", threshold: 10000 },
    },
  ];

  // Social/Referral Badges
  const socialBadges = [
    {
      key: "recruiter",
      title: "Recruiter",
      description: "Invite 1 friend",
      icon: "🤝",
      rules: { type: "referral", threshold: 1 },
    },
    {
      key: "squad_leader",
      title: "Squad Leader",
      description: "Invite 5 friends",
      icon: "🎖️",
      rules: { type: "referral", threshold: 5 },
    },
    {
      key: "army_builder",
      title: "Army Builder",
      description: "Invite 10 friends",
      icon: "🏰",
      rules: { type: "referral", threshold: 10 },
    },
    {
      key: "social_butterfly",
      title: "Social Butterfly",
      description: "Complete 10 social tasks",
      icon: "🦋",
      rules: { type: "social_claims", threshold: 10 },
    },
    {
      key: "influencer",
      title: "Influencer",
      description: "Complete 50 social tasks",
      icon: "📱",
      rules: { type: "social_claims", threshold: 50 },
    },
    {
      key: "viral",
      title: "Viral",
      description: "Someone you invited also invites someone else",
      icon: "🚀",
      rules: { type: "chain_referral", threshold: 1 },
    },
  ];

  for (const badge of [...badges, ...socialBadges]) {
    await prisma.badge.create({ data: badge });
  }
  console.log(`  ✅ ${badges.length + socialBadges.length} badges created (${socialBadges.length} social)`);

  // ─── Social Tasks ─────────────────────────────────────────────────────────

  const socialTasks = [
    {
      key: "share_prediction",
      title: "Share Your Prediction",
      description: "Share a prediction on social media",
      icon: "📢",
      pointsReward: 25,
      cooldownHours: 24,
    },
    {
      key: "share_result",
      title: "Share Your Result",
      description: "Share your win or loss with the community",
      icon: "🏆",
      pointsReward: 50,
      cooldownHours: 24,
    },
    {
      key: "share_rank",
      title: "Share Your Ranking",
      description: "Share your leaderboard position",
      icon: "📊",
      pointsReward: 30,
      cooldownHours: 24,
    },
    {
      key: "invite_friend",
      title: "Invite a Friend",
      description: "Share your invite link and bring a friend",
      icon: "🤝",
      pointsReward: 200,
      cooldownHours: 1,
      maxPerSeason: 50,
    },
    {
      key: "follow_twitter",
      title: "Follow on X (Twitter)",
      description: "Follow @realitypicks on X for the latest updates",
      icon: "🐦",
      pointsReward: 50,
      cooldownHours: 0,
      maxPerSeason: 1,
    },
    {
      key: "join_discord",
      title: "Join Discord",
      description: "Join the RealityPicks Discord community server",
      icon: "💬",
      pointsReward: 100,
      cooldownHours: 0,
      maxPerSeason: 1,
    },
    {
      key: "follow_farcaster",
      title: "Follow on Farcaster",
      description: "Follow @0xlaszlo on Farcaster for onchain updates",
      icon: "🟣",
      pointsReward: 75,
      cooldownHours: 0,
      maxPerSeason: 1,
    },
    {
      key: "daily_login",
      title: "Daily Login",
      description: "Log in daily to earn bonus points",
      icon: "📅",
      pointsReward: 10,
      cooldownHours: 24,
    },
  ];

  for (const task of socialTasks) {
    await prisma.socialTask.create({ data: task });
  }
  console.log(`  ✅ ${socialTasks.length} social tasks created`);

  console.log("\n🎉 Seed complete!");
  console.log("\n📌 Dev Login Accounts:");
  console.log("   Admin: admin@realitypicks.xyz (ref: ADMN2026)");
  console.log("   Player: player@realitypicks.xyz (ref: PLAY2026)");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
