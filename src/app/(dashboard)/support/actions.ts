"use server";

import { createServerClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function getSupportTickets(status?: string) {
  const supabase = await createServerClient();

  try {
    let query = supabase.from("support_tickets").select(`
      *,
      user:users(name, email)
    `);

    if (status && status !== "All") {
      query = query.eq("status", status);
    }

    const { data: tickets, error } = await query.order("created_at", { ascending: false });

    if (error) throw error;

    return (tickets || []).map((ticket: any) => ({
      ...ticket,
      userId: ticket.user_id,
      createdAt: ticket.created_at,
    }));
  } catch (error) {
    console.error("[getSupportTickets Error]:", error);
    return [];
  }
}

export async function updateTicketStatus(id: string, status: string) {
  const supabase = await createServerClient();

  try {
    const { data: ticket, error } = await supabase
      .from("support_tickets")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/support");
    return { success: true, ticket };
  } catch (error) {
    console.error("[updateTicketStatus Error]:", error);
    return { success: false, error: "Failed to update ticket status" };
  }
}
