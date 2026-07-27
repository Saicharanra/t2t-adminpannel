"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSupportTickets(status?: string) {
  try {
    const where: any = {};
    if (status && status !== "All") where.status = status;

    const tickets = await prisma.supportTicket.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return tickets;
  } catch (error) {
    console.error("[getSupportTickets Error]:", error);
    return [];
  }
}

export async function updateTicketStatus(id: string, status: string) {
  try {
    const ticket = await prisma.supportTicket.update({
      where: { id },
      data: { status },
    });

    revalidatePath("/support");
    return { success: true, ticket };
  } catch (error) {
    console.error("[updateTicketStatus Error]:", error);
    return { success: false, error: "Failed to update ticket status" };
  }
}
