import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { ChatService } from "./chat.service";

// Send message
const sendMessage = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const role = req.user!.role;

  const result = await ChatService.sendMessage(userId, role, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Message sent successfully",
    data: result,
  });
});

// Get messages for a conversation
const getMessages = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const role = req.user!.role;
  const conversationId = String(req.params.conversationId);

  const result = await ChatService.getMessages(userId, role, {
    conversationId,
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 50,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Messages retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

// Get user's conversations
const getMyConversations = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const role = req.user!.role;

  const result = await ChatService.getMyConversations(userId, role, {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Conversations retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

// Mark conversation as read
const markAsRead = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const role = req.user!.role;
  const conversationId = String(req.params.conversationId);

  const result = await ChatService.markAsRead(userId, role, {
    conversationId,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: null,
  });
});

export const ChatController = {
  sendMessage,
  getMessages,
  getMyConversations,
  markAsRead,
};
