import { NextRequest, NextResponse, userAgent } from "next/server";
import { headers } from "next/headers";

/** @param {NextRequest} req */
export async function GET(req) {
    const { ua } = userAgent(req);
    const headersList = headers();
    let ip = headersList.get("x-forwarded-for");
  
    // If no IP was found in headers, get the public IP using an external service
    if (!ip || ip.startsWith("::ffff:") || ip === "::1") {
      try {
        const response = await fetch("https://api.ipify.org?format=json");
        const data = await response.json();
        ip = data.ip;
      } catch (error) {
        ip = "Could not fetch public IP";
      }
    }
  
    const responseData = {
      ok: true,
      ip_address: ip,
      user_agent: ua,
    };
  
    return NextResponse.json(responseData, { status: 200 });
  }
  