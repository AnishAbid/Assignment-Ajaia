import Link from "next/link";
import { requireCurrentUserOrRedirect } from "@/lib/current-user";
import { loadDocumentForUser } from "@/lib/document-access";
import { DocumentEditor } from "@/components/DocumentEditor";

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireCurrentUserOrRedirect();
  const { id } = await params;

  let document;
  let role;
  try {
    ({ document, role } = await loadDocumentForUser(id, user.id));
  } catch {
    // Not found, or the current user has no access — both look identical
    // from the outside so we don't leak which documents exist.
    return <NotFoundOrNoAccess />;
  }

  return (
    <DocumentEditor
      documentId={document.id}
      ownerId={document.ownerId}
      initialTitle={document.title}
      initialContent={document.content}
      role={role}
    />
  );
}

function NotFoundOrNoAccess() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="text-xl font-semibold">Document not found</h1>
      <p className="text-sm text-black/50 dark:text-white/50">
        It may have been deleted, or you don&apos;t have access to it. Ask the owner to share it
        with you.
      </p>
      <Link href="/" className="mt-2 rounded-md bg-black px-4 py-2 text-sm text-white dark:bg-white dark:text-black">
        Back to my documents
      </Link>
    </main>
  );
}
