import { CalendarBox } from "@/components/CalendarBox";
import CustomFeed from "@/components/homepage/CustomFeed";
import GeneralFeed from "@/components/homepage/GeneralFeed";
import { buttonVariants } from "@/components/ui/Button";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Home as HomeIcon } from "lucide-react";
import Link from "next/link";

// Función para convertir los guiones en espacios y capitalizar la primera letra de cada palabra
function formatSubredditName(name: string) {
  return name
    .split("-") // Dividir el nombre en palabras separadas por guiones
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalizar la primera letra de cada palabra
    .join(" "); // Unir las palabras con un espacio
}

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function Home() {
  const session = await getAuthSession();

  const isAdministrator = session?.user
    ? await db.user.findUnique({
        where: {
          id: session.user.id,
        },
        select: {
          isAdmin: true,
        },
      })
    : null;

  const AllSubreddits = await db.subreddit.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <>
      <h1 className="font-bold text-3xl md:text-4xl">Your feed</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 md:gap-x-4 py-6">
        {/* @ts-expect-error server component */}
        {session ? <CustomFeed /> : <GeneralFeed />}

        {/* subreddit info */}
        <div className="overflow-hidden h-fit rounded-lg border border-gray-200 order-first md:order-last">
          <div className="bg-emerald-100 px-6 py-4">
            <p className="font-semibold py-3 flex items-center gap-1.5">
              <HomeIcon className="h-4 w-4" />
              Home
            </p>
          </div>
          <dl className="-my-3 divide-y divide-gray-100 px-6 py-4 text-sm leading-6">
            <div className="flex justify-between gap-x-4 py-3">
              <p className="text-zinc-500">
                Your personal Breadit frontpage. Come here to check in with your
                favorite communities.
              </p>
            </div>

            {isAdministrator?.isAdmin && (
              <Link
                className={buttonVariants({
                  className: "w-full mt-4 mb-6",
                })}
                href={`/r/create`}
              >
                Create Community
              </Link>
            )}

            {/* Bucle para listar todos los subreddits */}
            <div className="mt-4">
              <h2 className="font-semibold text-lg">All Communities</h2>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                {AllSubreddits.map((subreddit, idx) => (
                  <li key={idx}>
                    <Link
                      className="text-blue-600 hover:underline"
                      href={`/r/${subreddit.name}`}
                    >
                      {/* Aplicar el formato al nombre del subreddit */}
                      {formatSubredditName(subreddit.name)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </dl>
          <div className="mt-4">
            <h2 className="font-semibold text-lg px-6 py-3">Calendar</h2>
            <dl className="-my-3 divide-y divide-gray-100 px-6 py-4 text-sm leading-6">
              <CalendarBox />
            </dl>
          </div>
        </div>
      </div>
    </>
  );
}
