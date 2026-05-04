"use client";
import { tokenProvider } from "@/src/actions/stream.actions";
import Loader from "@/src/components/Loader";
import { useUser } from "@clerk/nextjs";
import { StreamVideo, StreamVideoClient } from "@stream-io/video-react-sdk";
import { ReactNode, useEffect, useState } from "react";
import { StreamChat } from "stream-chat";
import { Chat } from "stream-chat-react";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;

const StreamVideoProvider = ({ children }: { children: ReactNode }) => {
  const [videoClient, setVideoClient] = useState<StreamVideoClient>();
  const [chatClient, setChatClient] = useState<StreamChat>();
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded || !user) return;
    if (!apiKey) throw new Error("Stream API key missing");

    const client = new StreamVideoClient({
      apiKey,
      user: {
        id: user?.id,
        name: user?.username || user?.id,
        image: user?.imageUrl,
      },
      tokenProvider,
    });

    setVideoClient(client);

    const cClient = StreamChat.getInstance(apiKey);

    const connectChatUser = async () => {
      await cClient.connectUser(
        {
          id: user.id,
          name: user.username || user.id,
          image: user.imageUrl,
        },
        tokenProvider
      );
      setChatClient(cClient);
    };

    if (cClient.userID !== user.id) {
      connectChatUser();
    } else {
      setChatClient(cClient);
    }

    return () => {
      if (cClient) {
        cClient.disconnectUser();
        setChatClient(undefined);
      }
    };
  }, [user, isLoaded]);

  if (!videoClient || !chatClient) return <Loader />;

  return (
    <StreamVideo client={videoClient}>
      <Chat client={chatClient}>{children}</Chat>
    </StreamVideo>
  );
};

export default StreamVideoProvider;
