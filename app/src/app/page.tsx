import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireCurrentUserOrRedirect } from "@/lib/current-user";
import { TopNav } from "@/components/TopNav";
import { NewDocumentButton } from "@/components/NewDocumentButton";
import { UploadFileButton } from "@/components/UploadFileButton";
import { DeleteDocumentButton } from "@/components/DeleteDocumentButton";

function formatDate(d: Date) {
  return new Date(d).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function DashboardPage() {
  const user = await requireCurrentUserOrRedirect();

  const [owned, sharedWithMe] = await Promise.all([
    prisma.document.findMany({
      where: { ownerId: user.id },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        updatedAt: true,
        _count: { select: { shares: true } },
      },
    }),
    prisma.share.findMany({
      where: { userId: user.id },
      orderBy: { document: { updatedAt: "desc" } },
      select: {
        permission: true,
        document: {
          select: {
            id: true,
            title: true,
            updatedAt: true,
            owner: { select: { name: true } },
          },
        },
      },
    }),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <TopNav user={user} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">My documents</h1>
            <p className="text-sm text-black/50 dark:text-white/50">
              Owned by you · {owned.length} document{owned.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="flex gap-3">
            <UploadFileButton />
            <NewDocumentButton />
          </div>
        </div>

        {owned.length === 0 ? (
          <EmptyState text="No documents yet. Create one or upload a .txt/.md file to get started." />
        ) : (
          <ul className="mb-12 divide-y divide-black/5 rounded-lg border border-black/10 dark:divide-white/10 dark:border-white/10">
            {owned.map((doc) => (
              <li key={doc.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <Link href={`/documents/${doc.id}`} className="min-w-0 flex-1">
                  <p className="truncate font-medium">{doc.title}</p>
                  <p className="text-xs text-black/50 dark:text-white/50">
                    Updated {formatDate(doc.updatedAt)}
                    {doc._count.shares > 0 &&
                      ` · shared with ${doc._count.shares} ${doc._count.shares === 1 ? "person" : "people"}`}
                  </p>
                </Link>
                <span className="shrink-0 rounded-full bg-black/5 px-2 py-0.5 text-xs font-medium dark:bg-white/10">
                  Owner
                </span>
                <DeleteDocumentButton documentId={doc.id} title={doc.title} />
              </li>
            ))}
          </ul>
        )}

        <div className="mb-4">
          <h2 className="text-xl font-semibold tracking-tight">Shared with me</h2>
          <p className="text-sm text-black/50 dark:text-white/50">
            Documents other people have shared with you · {sharedWithMe.length}
          </p>
        </div>

        {sharedWithMe.length === 0 ? (
          <EmptyState text="Nothing has been shared with you yet." />
        ) : (
          <ul className="divide-y divide-black/5 rounded-lg border border-black/10 dark:divide-white/10 dark:border-white/10">
            {sharedWithMe.map(({ document: doc, permission }) => (
              <li key={doc.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <Link href={`/documents/${doc.id}`} className="min-w-0 flex-1">
                  <p className="truncate font-medium">{doc.title}</p>
                  <p className="text-xs text-black/50 dark:text-white/50">
                    Owned by {doc.owner.name} · Updated {formatDate(doc.updatedAt)}
                  </p>
                </Link>
                <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                  {permission === "EDIT" ? "Can edit" : "Can view"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="mb-12 rounded-lg border border-dashed border-black/15 px-4 py-10 text-center text-sm text-black/50 dark:border-white/15 dark:text-white/50">
      {text}
    </div>
  );
}
