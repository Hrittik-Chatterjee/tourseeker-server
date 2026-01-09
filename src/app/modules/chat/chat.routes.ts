import express from "express";
import { ChatController } from "./chat.controller";
import { ChatValidation } from "./chat.validation";
import validateRequest from "../../middlewares/validateRequest";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

// Get my conversations
router.get(
  "/conversations",
  auth(UserRole.TOURIST, UserRole.GUIDE),
  validateRequest(ChatValidation.getConversationsSchema),
  ChatController.getMyConversations
);

// Get messages for a conversation
router.get(
  "/conversations/:conversationId/messages",
  auth(UserRole.TOURIST, UserRole.GUIDE),
  validateRequest(ChatValidation.getMessagesSchema),
  ChatController.getMessages
);

// Send message
router.post(
  "/messages",
  auth(UserRole.TOURIST, UserRole.GUIDE),
  validateRequest(ChatValidation.sendMessageSchema),
  ChatController.sendMessage
);

// Mark conversation as read
router.patch(
  "/conversations/:conversationId/read",
  auth(UserRole.TOURIST, UserRole.GUIDE),
  validateRequest(ChatValidation.markAsReadSchema),
  ChatController.markAsRead
);

export const ChatRoutes = router;
