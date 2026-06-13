import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

interface PushPayload {
  toUserId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}

serve(async (req) => {
  try {
    // Only allow POST requests
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const { toUserId, title, body, data } = await req.json() as PushPayload;

    if (!toUserId || !title || !body) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: toUserId, title, body" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get the recipient's push token from Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userResponse = await fetch(
      `${supabaseUrl}/rest/v1/users?id=eq.${toUserId}&select=push_token`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const users = await userResponse.json();

    if (!users || users.length === 0 || !users[0].push_token) {
      console.log(`No push token found for user ${toUserId}`);
      return new Response(
        JSON.stringify({ success: true, message: "No push token found" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    const pushToken = users[0].push_token;

    // Send push notification via Expo
    const expoPushMessage = {
      to: pushToken,
      sound: "default",
      title: title,
      body: body,
      data: data || {},
      priority: "high",
    };

    const expoResponse = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(expoPushMessage),
    });

    const expoResult = await expoResponse.json();

    console.log("Push notification sent:", expoResult);

    return new Response(
      JSON.stringify({ success: true, result: expoResult }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in send-push-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
