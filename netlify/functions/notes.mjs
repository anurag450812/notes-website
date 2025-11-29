import { getStore } from "@netlify/blobs";

export default async (req, context) => {
  const store = getStore("notes");
  
  try {
    if (req.method === "GET") {
      // Get notes data
      const data = await store.get("sections", { type: "json" });
      
      return new Response(JSON.stringify(data || [
        { id: 'important', title: 'Important Notes', notes: [] },
        { id: 'timepass', title: 'Time Pass Notes', notes: [] }
      ]), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    
    if (req.method === "POST") {
      // Save notes data
      const body = await req.json();
      await store.setJSON("sections", body);
      
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }
    
    return new Response("Method not allowed", { status: 405 });
  } catch (error) {
    console.error("Error in notes function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
};

export const config = {
  path: "/api/notes"
};
