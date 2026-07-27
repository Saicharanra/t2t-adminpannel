import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { z } from "zod";

const sendEmailSchema = z.object({
  to: z.union([z.string().email(), z.array(z.string().email())]),
  subject: z.string().min(1, "Subject is required"),
  html: z.string().min(1, "HTML content is required"),
  text: z.string().optional(),
  from: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = sendEmailSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors[0]?.message || "Invalid input data" },
        { status: 400 }
      );
    }

    const response = await sendEmail(result.data);
    if (!response.success) {
      return NextResponse.json(
        { success: false, error: response.error?.message || "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: "Email sent successfully" });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
