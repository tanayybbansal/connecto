"use client";

import React, { useEffect, useState } from "react";
import {
  Channel,
  Window,
  ChannelHeader,
  MessageList,
  MessageComposer as MessageInput,
  Thread,
  useChatContext,
} from "stream-chat-react";
import { Channel as StreamChannel } from "stream-chat";
import "stream-chat-react/dist/css/index.css";
import Loader from "./Loader";

interface ChatPanelProps {
  meetingId: string;
}

const ChatPanel = ({ meetingId }: ChatPanelProps) => {
  const { client } = useChatContext();
  const [channel, setChannel] = useState<StreamChannel>();

  useEffect(() => {
    if (!client || !meetingId) return;

    const initChannel = async () => {
      const newChannel = client.channel("messaging", meetingId, {
        name: `Meeting: ${meetingId}`,
      });

      await newChannel.watch();
      setChannel(newChannel);
    };

    initChannel();
  }, [client, meetingId]);

  if (!channel) return <Loader />;

  return (
    <div className="flex h-full w-full flex-col border-l border-[var(--clr-border)] bg-[var(--clr-surface)]">
      <Channel channel={channel}>
        <Window>
          <ChannelHeader title="Meeting Chat" />
          <MessageList />
          <MessageInput />
        </Window>
        <Thread />
      </Channel>
    </div>
  );
};

export default ChatPanel;