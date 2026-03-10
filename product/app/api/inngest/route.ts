import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { processUploadedDocument } from "@/lib/inngest/functions";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [processUploadedDocument],
});
