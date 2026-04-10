import express from "express";
import * as msal from "@azure/msal-node";
import fetch from "node-fetch";

const router = express.Router();

const SCOPES = ["Mail.Read", "Mail.ReadBasic", "offline_access", "User.Read"];

// ── Create MSAL client lazily ────────────────────────────
function getPCA() {
  if (!process.env.MS_CLIENT_ID || !process.env.MS_CLIENT_SECRET) {
    throw new Error("MS_CLIENT_ID or MS_CLIENT_SECRET not set in .env");
  }

  return new msal.ConfidentialClientApplication({
    auth: {
      clientId: process.env.MS_CLIENT_ID,
      clientSecret: process.env.MS_CLIENT_SECRET,
      authority: `https://login.microsoftonline.com/${process.env.MS_TENANT_ID}`,
    },
  });
}

/* ===============================
   AUTH: Redirect to Microsoft login
================================ */
router.get("/auth", async (req, res) => {
  try {
    const pca = getPCA();

    const authUrl = await pca.getAuthCodeUrl({
      scopes: SCOPES,
      redirectUri: process.env.MS_REDIRECT_URI,
    });

    res.redirect(authUrl);
  } catch (err) {
    console.error("Auth error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ===============================
   CALLBACK: Exchange code for token
================================ */
router.get("/callback", async (req, res) => {
  try {
    const pca = getPCA();
    const { code } = req.query;

    const result = await pca.acquireTokenByCode({
      code,
      scopes: SCOPES,
      redirectUri: process.env.MS_REDIRECT_URI,
    });

    // ✅ STORE TOKEN IN SESSION (FIXED)
    req.session.outlookTokens = result;

    console.log("✅ Tokens stored in session");

    res.redirect("http://localhost:5173/email-tracking?connected=true");
  } catch (err) {
    console.error("OAuth callback error:", err.message);
    res.redirect("http://localhost:5173/email-tracking?connected=false");
  }
});

/* ===============================
   STATUS: Check if connected
================================ */
router.get("/status", (req, res) => {
  const tokens = req.session.outlookTokens;

  console.log("🔍 SESSION TOKENS:", tokens ? "EXISTS" : "NULL");

  res.json({
    connected: !!tokens,
    email: tokens?.account?.username || null,
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
   EMAILS: Fetch inbox or sent
================================ */
router.get("/emails", async (req, res) => {
  const tokens = req.session.outlookTokens;

  if (!tokens) {
    return res.status(401).json({ error: "Not connected to Outlook" });
  }

  try {
    const { folder = "inbox", top = 25 } = req.query;

    let accessToken = tokens.accessToken;

    // ⚠️ Skipping acquireTokenSilent (not reliable in backend)
    // Use existing token directly

    const folderMap = {
      inbox: "inbox",
      sent: "sentItems",
    };

    const graphFolder = folderMap[folder] || "inbox";

    const response = await fetch(
      `https://graph.microsoft.com/v1.0/me/mailFolders/${graphFolder}/messages?$top=${top}&$select=id,subject,from,toRecipients,receivedDateTime,sentDateTime,isRead,bodyPreview&$orderby=receivedDateTime desc`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errData = await response.json();
      console.error("❌ Graph API error:", errData);

      return res.status(response.status).json({
        error: errData.error?.message || "Graph API error",
      });
    }

    const data = await response.json();

    console.log("📧 Emails fetched:", data.value?.length || 0);

    res.json(data.value || []);
  } catch (err) {
    console.error("❌ Email fetch error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;