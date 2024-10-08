import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function DELETE(
  req: Request,
  { params }: { params: { subredditId: string } }
) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const subreddit = await db.subreddit.findUnique({
      where: {
        id: params.subredditId,
      },
    });

    if (!subreddit) {
      return new Response("Subreddit not found", { status: 404 });
    }

    if (subreddit.creatorId !== session.user.id) {
      return new Response("You are not the owner of this subreddit", {
        status: 403,
      });
    }

    await db.subreddit.delete({
      where: {
        id: params.subredditId,
      },
    });

    return new Response("Subreddit deleted Successfully", { status: 200 });
  } catch (error) {
    console.log(error);
    return new Response("Failed to delete subreddit", { status: 500 });
  }
}
