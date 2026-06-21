import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

serve(async (req) => {
  try {
    // Only allow POST requests
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const { fileName, fileData, contentType, userId } = await req.json();

    if (!fileName || !fileData || !contentType || !userId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: fileName, fileData, contentType, userId" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get Supabase credentials
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Upload to Supabase Storage
    const uploadResponse = await fetch(
      `${supabaseUrl}/storage/v1/object/memories/${fileName}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": contentType,
        },
        body: fileData,
      }
    );

    if (!uploadResponse.ok) {
      const error = await uploadResponse.text();
      console.error("Upload error:", error);
      return new Response(
        JSON.stringify({ error: "Upload failed", details: error }),
        { status: uploadResponse.status, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get public URL
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/memories/${fileName}`;

    return new Response(
      JSON.stringify({ success: true, publicUrl }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in upload-image:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
