import type { NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { trpc } from "../utils/trpc";

const Home: NextPage = () => {
  const { data: session, status } = useSession();
  const [name, nameSet] = useState("");
  const ctx = trpc.useContext();
  const postBlock = trpc.useMutation("block.postBlock", {
    onMutate: () => {
      ctx.cancelQuery(["block.getAll"]);

      const optimisticUpdate = ctx.getQueryData(["block.getAll"]);
      if (optimisticUpdate) {
        ctx.setQueryData(["block.getAll"], optimisticUpdate);
      }
    },
    onSettled: () => {
      ctx.invalidateQueries(["block.getAll"]);
    },
  });

  if (status === "loading") {
    return <main>Loading...</main>;
  }

  return (
    <>
      <div>
        <h1>Blocks</h1>
        {session ? (
          <div>
            <p>hi {session.user?.name}</p>
            <button onClick={() => signOut()}>Logout</button>
            <div>
              <form
                onSubmit={(event) => {
                  event.preventDefault();

                  postBlock.mutate({
                    name,
                  });

                  nameSet("");
                }}
              >
                <input
                  type="text"
                  value={name}
                  placeholder="Block name..."
                  maxLength={100}
                  onChange={(event) => nameSet(event.target.value)}
                />
                <button type="submit">Submit</button>
              </form>
            </div>
          </div>
        ) : (
          <div>
            <button onClick={() => signIn("discord")}>
              Login with Discord
            </button>
          </div>
        )}{" "}
        <Blocks />
      </div>
    </>
  );
};

const Blocks = () => {
  const { data: blocks, isLoading } = trpc.useQuery(["block.getAll"]);

  if (isLoading) return <div>Fetching blocks...</div>;

  return (
    <div className="flex flex-col gap-4">
      {blocks?.map((block) => {
        return (
          <div key={block.name}>
            <p>{block.name}</p>
          </div>
        );
      })}
    </div>
  );
};

export default Home;
