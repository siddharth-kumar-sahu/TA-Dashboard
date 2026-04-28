import express from "express";
import * as msal from "@azure/msal-node";
import fetch from "node-fetch";

const router = express.Router();

const SCOPES = ["Mail.Read", "Mail.ReadBasic", "Calendars.Read", "offline_access", "User.Read"];

function getPCA() {
  if (!process.env.MS_CLIENT_ID || !process.env.MS_CLIENT_SECRET) {
    throw new Error("MS_CLIENT_ID or MS_CLIENT_SECRET not set in .env");
  }
  return new msal.ConfidentialClientApplication({
    auth: {
      clientId:     process.env.MS_CLIENT_ID,
      clientSecret: process.env.MS_CLIENT_SECRET,
      authority:    `https://login.microsoftonline.com/${process.env.MS_TENANT_ID}`,
    },
  });
}

/* ===============================
   AUTH
================================ */
router.get("/auth", async (req, res) => {
  try {
    const pca = getPCA();
    const authUrl = await pca.getAuthCodeUrl({
      scopes:      SCOPES,
      redirectUri: process.env.MS_REDIRECT_URI,
    });
    res.redirect(authUrl);
  } catch (err) {
    console.error("Auth error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ===============================
   CALLBACK
================================ */
router.get("/callback", async (req, res) => {
  try {
    const pca = getPCA();
    const { code } = req.query;
    const result = await pca.acquireTokenByCode({
      code,
      scopes:      SCOPES,
      redirectUri: process.env.MS_REDIRECT_URI,
    });
    req.session.outlookTokens = result;
    console.log("✅ Tokens stored in session");
    res.redirect("http://localhost:5173/email-tracking?connected=true");
  } catch (err) {
    console.error("OAuth callback error:", err.message);
    res.redirect("http://localhost:5173/email-tracking?connected=false");
  }
});

/* ===============================
   STATUS
================================ */
router.get("/status", (req, res) => {
  const tokens = req.session?.outlookTokens;
  res.json({
    connected: !!tokens,
    email:     tokens?.account?.username || null,
  });
});

/* ===============================
   DISCONNECT
================================ */
router.post("/disconnect", (req, res) => {
  req.session.outlookTokens = null;
  res.json({ success: true });
});

/* ===============================
   EMAILS (paginated)
   ?folder=inbox|sent&top=15&skip=0
================================ */
router.get("/emails", async (req, res) => {
  const tokens = req.session?.outlookTokens;
  if (!tokens) return res.status(401).json({ error: "Not connected to Outlook" });

  try {
    const { folder = "inbox", top = 15, skip = 0 } = req.query;
    const accessToken = tokens.accessToken;
    const folderMap   = { inbox: "inbox", sent: "sentItems" };
    const graphFolder = folderMap[folder] || "inbox";

    const response = await fetch(
      `https://graph.microsoft.com/v1.0/me/mailFolders/${graphFolder}/messages` +
      `?$top=${top}&$skip=${skip}` +
      `&$select=id,subject,from,toRecipients,receivedDateTime,sentDateTime,isRead,bodyPreview` +
      `&$orderby=receivedDateTime desc` +
      `&$count=true`,
      {
        headers: {
          Authorization:    `Bearer ${accessToken}`,
          "Content-Type":   "application/json",
          ConsistencyLevel: "eventual",
        },
      }
    );

    if (!response.ok) {
      const errData = await response.json();
      return res.status(response.status).json({ error: errData.error?.message || "Graph API error" });
    }

    const data = await response.json();
    res.json({
      emails:     data.value || [],
      totalCount: data["@odata.count"] || 0,
      skip:       Number(skip),
      top:        Number(top),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ===============================
   MEETINGS (next 30 days from Outlook calendar)
================================ */
router.get("/meetings", async (req, res) => {
  const tokens = req.session?.outlookTokens;
  if (!tokens) return res.status(401).json({ error: "Not connected to Outlook" });

  try {
    const accessToken = tokens.accessToken;

    const now   = new Date();
    const later = new Date();
    later.setDate(later.getDate() + 30);

    const response = await fetch(
      `https://graph.microsoft.com/v1.0/me/calendarView` +
      `?startDateTime=${now.toISOString()}&endDateTime=${later.toISOString()}` +
      `&$top=50` +
      `&$select=id,subject,start,end,location,attendees,organizer,isOnlineMeeting,onlineMeetingUrl,bodyPreview` +
      `&$orderby=start/dateTime asc`,
      {
        headers: {
          Authorization:  `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errData = await response.json();
      return res.status(response.status).json({ error: errData.error?.message || "Graph API error" });
    }

    const data = await response.json();
    console.log(`📅 Meetings fetched: ${data.value?.length || 0}`);
    res.json(data.value || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;