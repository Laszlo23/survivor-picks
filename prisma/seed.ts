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
  const adminEmail = process.env.ADMIN_EMAIL || "admin@survivorpicks.com";
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "ADMIN", referralCode: "ADMN2026" },
    create: {
      email: adminEmail,
      name: "Admin",
      role: "ADMIN",
      emailVerified: new Date(),
      referralCode: "ADMN2026",
    },
  });
  console.log(`  ✅ Admin user: ${admin.email} (ref: ADMN2026)`);

  // Create dev test player
  const player = await prisma.user.upsert({
    where: { email: "player@survivorpicks.com" },
    update: { referralCode: "PLAY2026" },
    create: {
      email: "player@survivorpicks.com",
      name: "Test Player",
      role: "USER",
      emailVerified: new Date(),
      referralCode: "PLAY2026",
    },
  });
  console.log(`  ✅ Test player: ${player.email} (ref: PLAY2026)`);

  // ─── Season ─────────────────────────────────────────────────────────────────

  const season = await prisma.season.create({
    data: {
      title: "Survivor 2026 — Island of Competition",
      description:
        "21 contestants, two tribes, one island. Who will outlast the rest? Make your predictions, earn points, and climb to the top!",
      active: true,
    },
  });
  console.log(`  ✅ Season: ${season.title}`);

  // ─── Tribes ─────────────────────────────────────────────────────────────────

  const tribeRot = await prisma.tribe.create({
    data: { name: "Red", color: "#ef4444", seasonId: season.id },
  });
  const tribeBlau = await prisma.tribe.create({
    data: { name: "Blue", color: "#3b82f6", seasonId: season.id },
  });
  console.log("  ✅ Tribes: 🔴 Red, 🔵 Blue");

  // ─── Contestants ────────────────────────────────────────────────────────────

  // 🔴 Team Red (12 players)
  const teamRot = [
    "Bayhan Gürhan",
    "Deniz Çatalbaş",
    "Nagihan Karadere",
    "Sercan Yıldırım",
    "Mert Nobre",
    "Meryem Boz",
    "Murat Arkın",
    "Seren Ay Çetin",
    "Serhan Onat",
    "Büşra Yalçın",
    "Can Berkay Ertemiz",
    "Seda Albayrak",
  ];

  // 🔵 Team Blue (9 players)
  const teamBlau = [
    "Ramazan Sarı",
    "Engincan Tura",
    "Eren Semerci",
    "Gözde Bozkurt",
    "Lina Hourieh",
    "Nisanur Güler",
    "Onur Alp Çam",
    "Nefise Karatay",
    "Osman Can Ural",
  ];

  for (const name of teamRot) {
    await prisma.contestant.create({
      data: { name, seasonId: season.id, tribeId: tribeRot.id },
    });
  }
  for (const name of teamBlau) {
    await prisma.contestant.create({
      data: { name, seasonId: season.id, tribeId: tribeBlau.id },
    });
  }
  console.log(`  ✅ ${teamRot.length + teamBlau.length} contestants (${teamRot.length} Red + ${teamBlau.length} Blue)`);

  const allNames = [...teamRot, ...teamBlau];

  // ─── Episodes ───────────────────────────────────────────────────────────────

  const now = new Date();

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
    daysFromNow: number;
    status: "DRAFT" | "OPEN" | "LOCKED" | "RESOLVED";
    questions: QuestionDef[];
  }

  const episodes: EpisodeDef[] = [
    {
      number: 1,
      title: "First Steps on the Island",
      daysFromNow: -14,
      status: "RESOLVED",
      questions: [
        {
          type: "CHALLENGE_WINNER",
          prompt: "Which tribe wins the first reward challenge?",
          odds: 100,
          options: ["Red", "Blue"],
          correctOption: "Red",
        },
        {
          type: "ELIMINATION",
          prompt: "Who is the first person eliminated at tribal council?",
          odds: 350,
          options: allNames,
          correctOption: "Osman Can Ural",
        },
        {
          type: "TWIST",
          prompt: "Is a hidden immunity idol found in Episode 1?",
          odds: 200,
          options: ["Yes", "No"],
          correctOption: "No",
        },
      ],
    },
    {
      number: 2,
      title: "Alliances Form",
      daysFromNow: -7,
      status: "RESOLVED",
      questions: [
        {
          type: "IMMUNITY",
          prompt: "Which tribe wins immunity?",
          odds: -110,
          options: ["Red", "Blue"],
          correctOption: "Blue",
        },
        {
          type: "ELIMINATION",
          prompt: "Who gets eliminated this week?",
          odds: 300,
          options: teamRot,
          correctOption: "Seda Albayrak",
        },
        {
          type: "REWARD",
          prompt: "Which tribe wins the reward challenge?",
          odds: 100,
          options: ["Red", "Blue"],
          correctOption: "Red",
        },
      ],
    },
    {
      number: 3,
      title: "Surprise Council",
      daysFromNow: -1,
      status: "LOCKED",
      questions: [
        {
          type: "IMMUNITY",
          prompt: "Which tribe wins immunity?",
          odds: 120,
          options: ["Red", "Blue"],
        },
        {
          type: "ELIMINATION",
          prompt: "Who gets eliminated in Episode 3?",
          odds: 400,
          options: allNames.filter(
            (n) => !["Osman Can Ural", "Seda Albayrak"].includes(n)
          ),
        },
        {
          type: "TWIST",
          prompt: "Does someone play a hidden immunity idol?",
          odds: 250,
          options: ["Yes", "No"],
        },
      ],
    },
    {
      number: 4,
      title: "The Merge",
      daysFromNow: 6,
      status: "OPEN",
      questions: [
        {
          type: "CHALLENGE_WINNER",
          prompt: "Who wins the first individual immunity?",
          odds: 450,
          options: allNames.filter(
            (n) => !["Osman Can Ural", "Seda Albayrak"].includes(n)
          ),
        },
        {
          type: "ELIMINATION",
          prompt: "Who is the first person eliminated after the merge?",
          odds: 400,
          options: allNames.filter(
            (n) => !["Osman Can Ural", "Seda Albayrak"].includes(n)
          ),
        },
        {
          type: "TWIST",
          prompt: "Is there a tribe swap or merge this episode?",
          odds: -150,
          options: ["Yes — Merge", "Yes — Tribe Swap", "No"],
        },
        {
          type: "TRIBAL_COUNCIL",
          prompt: "How many votes does the eliminated person receive?",
          odds: 200,
          options: ["3 or fewer", "4-6", "7 or more", "Unanimous"],
        },
      ],
    },
    {
      number: 5,
      title: "Shifting Alliances",
      daysFromNow: 13,
      status: "DRAFT",
      questions: [
        {
          type: "IMMUNITY",
          prompt: "Who wins individual immunity in Episode 5?",
          odds: 450,
          options: allNames.filter(
            (n) => !["Osman Can Ural", "Seda Albayrak"].includes(n)
          ),
        },
        {
          type: "ELIMINATION",
          prompt: "Who gets eliminated in Episode 5?",
          odds: 350,
          options: allNames.filter(
            (n) => !["Osman Can Ural", "Seda Albayrak"].includes(n)
          ),
        },
      ],
    },
    {
      number: 6,
      title: "Double Tribal",
      daysFromNow: 20,
      status: "DRAFT",
      questions: [
        {
          type: "TWIST",
          prompt: "Will there be a double elimination?",
          odds: 150,
          options: ["Yes", "No"],
        },
        {
          type: "ELIMINATION",
          prompt: "Name someone who gets eliminated this episode",
          odds: 350,
          options: allNames.filter(
            (n) => !["Osman Can Ural", "Seda Albayrak"].includes(n)
          ),
        },
      ],
    },
    {
      number: 7,
      title: "Family Visit",
      daysFromNow: 27,
      status: "DRAFT",
      questions: [
        {
          type: "REWARD",
          prompt: "Who wins the family visit reward?",
          odds: 500,
          options: allNames.filter(
            (n) => !["Osman Can Ural", "Seda Albayrak"].includes(n)
          ),
        },
        {
          type: "ELIMINATION",
          prompt: "Who gets eliminated in Episode 7?",
          odds: 400,
          options: allNames.filter(
            (n) => !["Osman Can Ural", "Seda Albayrak"].includes(n)
          ),
        },
      ],
    },
  ];

  for (const ep of episodes) {
    const airDate = new Date(now);
    airDate.setDate(airDate.getDate() + ep.daysFromNow);
    airDate.setHours(20, 0, 0, 0); // 20:00

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
      cooldownHours: 1, // Can share invite link frequently
      maxPerSeason: 50,
    },
  ];

  for (const task of socialTasks) {
    await prisma.socialTask.create({ data: task });
  }
  console.log(`  ✅ ${socialTasks.length} social tasks created`);

  console.log("\n🎉 Seed complete!");
  console.log("\n📌 Dev Login Accounts:");
  console.log("   Admin: admin@survivorpicks.com (ref: ADMN2026)");
  console.log("   Player: player@survivorpicks.com (ref: PLAY2026)");
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
