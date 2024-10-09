import MiniCreatePost from "@/components/MiniCreatePost";
import PostFeed from "@/components/PostFeed";
import { INFINITE_SCROLL_PAGINATION_RESULTS } from "@/config";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";

interface PageProps {
  params: {
    slug: string;
  };
}

// Función para convertir los guiones en espacios y capitalizar la primera letra de cada palabra
function formatSubredditName(name: string) {
  return name
    .split("-") // Dividir el nombre en palabras separadas por guiones
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalizar la primera letra de cada palabra
    .join(" "); // Unir las palabras con un espacio
}

const page = async ({ params }: PageProps) => {
  const { slug } = params;

  const session = await getAuthSession();

  const subreddit = await db.subreddit.findFirst({
    where: { name: slug },
    include: {
      posts: {
        include: {
          author: true,
          votes: true,
          comments: true,
          subreddit: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: INFINITE_SCROLL_PAGINATION_RESULTS,
      },
    },
  });

  if (!subreddit) return notFound();

  // Aplicamos el formateo al nombre del subreddit
  const formattedSubredditName = formatSubredditName(subreddit.name);

  return (
    <>
      <h1 className="font-bold text-3xl md:text-4xl h-14">
        {formattedSubredditName} {/* Mostramos el nombre formateado */}
      </h1>
      <MiniCreatePost session={session} />
      <PostFeed initialPosts={subreddit.posts} subredditName={subreddit.name} />
    </>
  );
};

export default page;
