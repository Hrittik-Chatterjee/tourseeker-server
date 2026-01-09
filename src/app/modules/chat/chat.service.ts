import { MessageStatus, Prisma, UserRole } from "@prisma/client";
import { prisma } from "../../shared/prisma";
import { pusher } from "../../shared/pusher";
import { ISendMessage, IGetMessages, IMarkAsRead, IGetConversations } from "./chat.interface";

// Send message
const sendMessage = async (
  userId: string,
  role: UserRole,
  payload: ISendMessage
) => {
  const { conversationId, content, attachments = [] } = payload;

  // Get user profile (tourist or guide)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      tourist: true,
      guide: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Determine sender ID based on role
  let senderId: string;
  if (role === UserRole.TOURIST && user.tourist) {
    senderId = user.tourist.id;
  } else if (role === UserRole.GUIDE && user.guide) {
    senderId = user.guide.id;
  } else {
    throw new Error("Invalid user role");
  }

  // Verify conversation exists and user is a participant
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      participants: {
        include: {
          tourist: {
            select: {
              id: true,
              name: true,
              profilePhoto: true,
            },
          },
          guide: {
            select: {
              id: true,
              name: true,
              profilePhoto: true,
            },
          },
        },
      },
    },
  });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  // Check if user is a participant
  const isParticipant = conversation.participants.some(
    (p) => p.touristId === senderId || p.guideId === senderId
  );

  if (!isParticipant) {
    throw new Error("You are not a participant in this conversation");
  }

  // Get recipient participant
  const recipientParticipant = conversation.participants.find(
    (p) => p.touristId !== senderId && p.guideId !== senderId
  );

  if (!recipientParticipant) {
    throw new Error("Recipient not found");
  }

  // Use transaction for message creation and conversation update
  const result = await prisma.$transaction(async (tx) => {
    // Create message
    const message = await tx.message.create({
      data: {
        conversationId,
        senderId,
        senderType: role,
        content,
        attachments,
        status: MessageStatus.SENT,
      },
      include: {
        conversation: true,
      },
    });

    // Update conversation last message
    await tx.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessage: content,
        lastMessageAt: new Date(),
      },
    });

    // Increment recipient's unread count
    await tx.conversationParticipant.update({
      where: { id: recipientParticipant.id },
      data: {
        unreadCount: {
          increment: 1,
        },
      },
    });

    return message;
  });

  // Trigger Pusher event for real-time message
  await pusher.trigger(`conversation-${conversationId}`, "new-message", {
    id: result.id,
    conversationId,
    senderId,
    senderType: role,
    content,
    attachments,
    createdAt: result.createdAt,
  });

  // Get recipient ID for notification
  const recipientId = recipientParticipant.touristId || recipientParticipant.guideId;

  // Trigger notification for recipient
  if (recipientId) {
    await pusher.trigger(`user-${recipientId}`, "new-message-notification", {
      conversationId,
      senderId,
      senderName:
        role === UserRole.TOURIST
          ? user.tourist?.name
          : user.guide?.name,
      content,
      timestamp: result.createdAt,
    });
  }

  return result;
};

// Get messages for a conversation
const getMessages = async (
  userId: string,
  role: UserRole,
  params: IGetMessages
) => {
  const { conversationId, page = 1, limit = 50 } = params;

  // Get user profile
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      tourist: true,
      guide: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const profileId = role === UserRole.TOURIST ? user.tourist?.id : user.guide?.id;

  if (!profileId) {
    throw new Error("User profile not found");
  }

  // Verify user is a participant
  const participant = await prisma.conversationParticipant.findFirst({
    where: {
      conversationId,
      OR: [{ touristId: profileId }, { guideId: profileId }],
    },
  });

  if (!participant) {
    throw new Error("You are not a participant in this conversation");
  }

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Get messages and total count
  const [messages, total] = await Promise.all([
    prisma.message.findMany({
      where: {
        conversationId,
        isDeleted: false,
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        tourist: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
          },
        },
        guide: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
          },
        },
      },
    }),
    prisma.message.count({
      where: {
        conversationId,
        isDeleted: false,
      },
    }),
  ]);

  return {
    data: messages.reverse(), // Reverse to show oldest first
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Get user's conversations
const getMyConversations = async (
  userId: string,
  role: UserRole,
  params: IGetConversations
) => {
  const { page = 1, limit = 20 } = params;

  // Get user profile
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      tourist: true,
      guide: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const profileId = role === UserRole.TOURIST ? user.tourist?.id : user.guide?.id;

  if (!profileId) {
    throw new Error("User profile not found");
  }

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Build where clause
  const where: Prisma.ConversationParticipantWhereInput =
    role === UserRole.TOURIST
      ? { touristId: profileId }
      : { guideId: profileId };

  // Get conversations and total count
  const [participants, total] = await Promise.all([
    prisma.conversationParticipant.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        conversation: {
          lastMessageAt: "desc",
        },
      },
      include: {
        conversation: {
          include: {
            participants: {
              include: {
                tourist: {
                  select: {
                    id: true,
                    name: true,
                    profilePhoto: true,
                  },
                },
                guide: {
                  select: {
                    id: true,
                    name: true,
                    profilePhoto: true,
                  },
                },
              },
            },
            booking: {
              select: {
                id: true,
                status: true,
                bookingDate: true,
                listing: {
                  select: {
                    id: true,
                    title: true,
                    images: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
    prisma.conversationParticipant.count({ where }),
  ]);

  // Format conversations
  const conversations = participants.map((p) => ({
    id: p.conversation.id,
    unreadCount: p.unreadCount,
    lastMessage: p.conversation.lastMessage,
    lastMessageAt: p.conversation.lastMessageAt,
    booking: p.conversation.booking,
    // Get the other participant (not the current user)
    otherParticipant: p.conversation.participants.find(
      (participant) =>
        participant.touristId !== profileId && participant.guideId !== profileId
    ),
    createdAt: p.conversation.createdAt,
    updatedAt: p.conversation.updatedAt,
  }));

  return {
    data: conversations,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Mark conversation messages as read
const markAsRead = async (
  userId: string,
  role: UserRole,
  payload: IMarkAsRead
) => {
  const { conversationId } = payload;

  // Get user profile
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      tourist: true,
      guide: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const profileId = role === UserRole.TOURIST ? user.tourist?.id : user.guide?.id;

  if (!profileId) {
    throw new Error("User profile not found");
  }

  // Find participant
  const participant = await prisma.conversationParticipant.findFirst({
    where: {
      conversationId,
      OR: [{ touristId: profileId }, { guideId: profileId }],
    },
  });

  if (!participant) {
    throw new Error("You are not a participant in this conversation");
  }

  // Reset unread count
  await prisma.conversationParticipant.update({
    where: { id: participant.id },
    data: {
      unreadCount: 0,
    },
  });

  return { message: "Messages marked as read" };
};

export const ChatService = {
  sendMessage,
  getMessages,
  getMyConversations,
  markAsRead,
};
