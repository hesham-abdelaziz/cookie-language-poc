const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const contentData = require("./data/content.json");

const app = express();
const PORT = 3000;

app.use(cookieParser());
app.use(express.json());

app.use(
  cors({
    credentials: true,
    origin: "http://localhost:4000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

const supportedLanguages = ["it", "en", "de", "fr", "es", "pt"];

// Get current language from cookies
app.get("/api/current-language", (req, res) => {
  const language = req.cookies.lang || "it"; // Default to Italian
  console.log(`Current language requested: ${language}`);

  res.json({
    language: language,
    supported: supportedLanguages,
    default: "it",
  });
});

// Set language in cookies
app.post("/api/language", (req, res) => {
  const { language } = req.body;

  // Validate language
  if (!language || !supportedLanguages.includes(language)) {
    return res.status(400).json({
      error: "Invalid language",
      supported: supportedLanguages,
    });
  }

  // Set cookie with language preference
  res.cookie("lang", language, {
    httpOnly: false, // Allow client-side access if needed
    secure: false, // Set to true in production with HTTPS
    sameSite: "lax",
    maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
    path: "/",
  });

  console.log(`Language set to: ${language}`);

  res.json({
    success: true,
    language: language,
    message: `Language preference set to ${language}`,
  });
});

// Get localized content based on cookie
app.get("/api/content", (req, res) => {
  // Read language from cookie, fallback to Italian
  const language = req.cookies.lang || "it";

  console.log(`Content requested for language: ${language}`);
  console.log(`Available cookies:`, req.cookies);

  // Get content for the specified language
  const localizedContent = contentData[language] || content["it"];

  res.json({
    language: language,
    content: localizedContent,
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    message: err.message,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📝 Supported languages: ${supportedLanguages.join(", ")}`);
  console.log(`🔧 CORS enabled for http://localhost:4200`);
  console.log(`🍪 Cookie-based language management active`);
});

module.exports = app;
