import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Seeds a handful of fixed-id demo users plus a couple of starter documents
 * so reviewers have something to click into immediately after setup, and so
 * the "owned vs shared" distinction is visible without manual setup.
 */

const USERS = [
  { id: "user_alice", name: "Alice Chen", email: "alice@docslite.dev" },
  { id: "user_bob", name: "Bob Okafor", email: "bob@docslite.dev" },
  { id: "user_carol", name: "Carol Diaz", email: "carol@docslite.dev" },
];

async function main() {
  for (const u of USERS) {
    await prisma.user.upsert({
      where: { id: u.id },
      update: { name: u.name, email: u.email },
      create: u,
    });
  }

  const existingDocs = await prisma.document.count();
  if (existingDocs === 0) {
    const welcomeDoc = await prisma.document.create({
      data: {
        title: "Welcome to Docs Lite",
        ownerId: "user_alice",
        content: `
          <h1>Welcome to Docs Lite 👋</h1>
          <p>This is a <strong>seeded</strong> document owned by <em>Alice</em> and shared with <u>Bob</u> as an editor.</p>
          <h2>Try the formatting toolbar</h2>
          <ul>
            <li>Bold, italic, underline</li>
            <li>Headings and paragraphs</li>
            <li>Bulleted and numbered lists</li>
          </ul>
          <ol>
            <li>Log in as Bob to see this doc under "Shared with me"</li>
            <li>Edit it — changes autosave</li>
            <li>Log in as Carol to confirm she cannot see it (no share granted)</li>
          </ol>
        `.trim(),
      },
    });

    await prisma.share.create({
      data: {
        documentId: welcomeDoc.id,
        userId: "user_bob",
        permission: "EDIT",
      },
    });

    await prisma.document.create({
      data: {
        title: "Carol's private draft",
        ownerId: "user_carol",
        content: `<p>Only Carol can see this one — nothing has been shared with anyone else yet.</p>`,
      },
    });
  }

  console.log("Seed complete:", {
    users: USERS.map((u) => u.email),
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
