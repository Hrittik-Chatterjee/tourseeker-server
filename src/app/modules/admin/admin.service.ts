
import { prisma } from "../../shared/prisma";
import { UserRole, UserStatus } from "@prisma/client";

const getSystemStats = async () => {
    const totalRevenue = await prisma.booking.aggregate({
        _sum: { totalAmount: true },
        where: { status: 'COMPLETED' }
    });

    const totalBookings = await prisma.booking.count();
    const totalUsers = await prisma.user.count();
    const activeGuides = await prisma.guide.count({
        where: { isVerified: true }
    });

    return {
        totalRevenue: totalRevenue._sum.totalAmount || 0,
        totalBookings,
        totalUsers,
        activeGuides
    };
};

const getAllUsers = async () => {
    // Basic listing without pagination for MVP
    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            role: true,
            status: true,
            createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 50
    });
    return users;
};

const blockUser = async (userId: string) => {
    return await prisma.user.update({
        where: { id: userId },
        data: { status: UserStatus.BLOCKED }
    });
};

const verifyGuide = async (guideId: string) => {
    return await prisma.guide.update({
        where: { id: guideId },
        data: { isVerified: true }
    });
};

export const AdminService = {
    getSystemStats,
    getAllUsers,
    blockUser,
    verifyGuide
};
