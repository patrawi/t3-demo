import { type RouterOutputs, api } from "~/utils/api";
import dayjs from "dayjs";

import Image from "next/image";

import Link from "next/link";

type PostWithUser = RouterOutputs["posts"]["getAll"][number];
export const PostView = (props: PostWithUser) => {
  const { author, post } = props;
  return (
    <div
      className="flex items-center gap-3 border-b border-slate-400 p-4 "
      key={post.id}
    >
      <Image
        width={56}
        height={56}
        className="h-14 w-14 rounded-full "
        src={author.profileImageUrl}
        alt={`@${author.username} profile image`}
      />
      <div className="flex-col">
        <div className="flex gap-1  text-slate-300">
          <Link href={`/@${author.username}`}>
            <span>{`@${author.username}`}</span>
          </Link>
          <Link href={`/post/${post.id}`}>
            {" "}
            <span className="font-thin">{` · ${dayjs(
              post.createdAt
            ).fromNow()}`}</span>
          </Link>
        </div>
        <span className="text-2xl"> {post.content}</span>
      </div>
    </div>
  );
};
