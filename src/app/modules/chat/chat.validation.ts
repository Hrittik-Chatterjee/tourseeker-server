import { z } from "zod";

const sendMessageSchema = z.object({
  body: z.object({
    conversationId: z
      .string({ required_error: "Conversation ID is required" })
      .uuid("Invalid conversation ID"),
    content: z
      .string({ required_error: "Message content is required" })
      .min(1, "Message cannot be empty")
      .max(5000, "Message is too long"),
    attachments: z
      .array(z.string().url("Invalid attachment URL"))
      .optional(),
  }),
});

const getMessagesSchema = z.object({
  params: z.object({
    conversationId: z
      .string({ required_error: "Conversation ID is required" })
      .uuid("Invalid conversation ID"),
  }),
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

const markAsReadSchema = z.object({
  params: z.object({
    conversationId: z
      .string({ required_error: "Conversation ID is required" })
      .uuid("Invalid conversation ID"),
  }),
});

const getConversationsSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

export const ChatValidation = {
  sendMessageSchema,
  getMessagesSchema,
  markAsReadSchema,
  getConversationsSchema,
};
