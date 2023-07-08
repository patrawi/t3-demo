import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import Head from "next/head";
import { type RouterOutputs, api } from "~/utils/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
dayjs.extend(relativeTime);
const CreatePostWizard = () => {
  const { user } = useUser();

  if (!user) return null;
  return (
    <div className="flex w-full gap-3">
      <Image
        className="h-14 w-14 rounded-full"
        src={user.profileImageUrl}
        alt="profile image"
        width={56}
        height={56}
      />
      <input
        placeholder="Type Some Emojis!"
        className="grow bg-transparent outline-none"
      />
    </div>
  );
};
type PostWithUser = RouterOutputs["posts"]["getAll"][number];
const PostView = (props: PostWithUser) => {
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
        src={author.profileImage}
        alt={`@${author.username} profile image`}
      />
      <div className="flex-col">
        <div className="flex gap-1  text-slate-300">
          <span>{`@${author.username}`}</span>
          <span className="font-thin">{` · ${dayjs(
            post.createdAt
          ).fromNow()}`}</span>
        </div>
        <span> {post.content}</span>
      </div>
    </div>
  );
};

export default function Home() {
  const user = useUser();
  const { data, isLoading } = api.posts.getAll.useQuery();
  if (isLoading) return <div>Loading</div>;
  if (!data) return <div>Something Went Wrong</div>;
  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen justify-center ">
        <div className="w-full  border-x border-slate-200 md:max-w-2xl ">
          <div className="border-b border-slate-400 p-4">
            {!user.isSignedIn && (
              <div className="flex justify-center">
                <SignInButton />
              </div>
            )}
            {user.isSignedIn && <CreatePostWizard />}
          </div>

          <div className="flex flex-col">
            {[...data]?.map((fullPost) => (
              <PostView {...fullPost} key={fullPost.post.id} />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
