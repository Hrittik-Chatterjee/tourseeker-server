import { MessageStatus } from "@prisma/client";

export interface ISendMessage {
  conversationId: string;
  content: string;
  attachments?: string[];
}

export interface IGetMessages {
  conversationId: string;
  page?: number;
  limit?: number;
}

export interface IMarkAsRead {
  conversationId: string;
}

export interface IGetConversations {
  page?: number;
  limit?: number;
}
