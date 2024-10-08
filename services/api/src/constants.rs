/**
 * For reusable consts throughout the app
 */

// WIP
pub const RESERVED_WORKSPACE_IDS: &[&str; 246] = &[
    // Plutomi reserved
    "plutomi",
    "plutomiinc",
    "plutomi-inc",
    // Marketing pages
    "login",
    "logout",
    "register",
    "sign-up",
    "signup",
    "signups",
    "sign-in",
    "metrics",
    "updates",
    // https://resend.com/customers/turso
    "customers",
    "careers",
    "privacy",
    "terms",
    "help",
    "support",
    "faq",
    "doc",
    "docs",
    "documentation",
    "blog",
    "stats",
    "news",
    "press",
    "about",
    "contact",
    "feature",
    "features",
    "pricing",
    "testimonial",
    "testimonials",
    "sitemap",
    "seo",
    "policy",
    "terms-of-service",
    "tos",
    "privacy-policy",
    "performance",
    // NextJS
    "404",
    "500",
    // Main APP pages
    "internal",
    "playground",
    "api",
    "apis",
    "dashboard",
    "dashboards",
    "application",
    "applications",
    "applicant",
    "applicants",
    "question",
    "questions",
    "stage",
    "stages",
    "staging",
    "analytics",
    "webhook",
    "webhooks",
    "billing",
    "billings",
    "setting",
    "settings",
    "workspace",
    "workspaces",
    "user",
    "users",
    "invite",
    "invites",
    "role",
    "roles",
    "share",
    "tag",
    "tags",
    "report",
    "reports",
    "file",
    "files",
    "orgs",
    "organizations",
    "note",
    "notes",
    "comment",
    "comments",
    "search",
    // Misc
    "apply",
    "join",
    "candidate",
    "candidates",
    "team",
    "teams",
    "position",
    "positions",
    "open", // Open Startup
    "incidents",
    "incident",
    "investors",
    "ir",
    "faq",
    "support",
    "help",
    "opening",
    "openings",
    "funnel",
    "funnels",
    "account",
    "accounts",
    "admin",
    "administrator",
    "job",
    "jobs",
    "dev",
    "devs",
    "developer",
    "developers",
    "development",
    "subscribe",
    "unsubscribe",
    "sdk",
    "sdks",
    "profile",
    "review",
    "reviews",
    "feedback",
    "notification",
    "notifications",
    "message",
    "messages",
    "options",
    "option",
    "updates",
    "integration",
    "integrations",
    "permission",
    "permissions",
    "status",
    "statuses",
    "download",
    "downloads",
    "upload",
    "uploads",
    "chat",
    "chats",
    "tutorial",
    "tutorials",
    "guides",
    "resources",
    "partners",
    "community",
    "events",
    "forums",
    "benefits",
    "services",
    "training",
    "copyright",
    "disclaimers",
    "schedule",
    "calendar",
    "tasks",
    "goals",
    "projects",
    "documents",
    "template",
    "templates",
    "assets",
    "forms",
    "surveys",
    "affiliate",
    "sponsorship",
    "campaign",
    "partnerships",
    "development",
    "compliance",
    "gdpr",
    "podcasts",
    "videos",
    "webinars",
    "courses",
    "demo",
    "demos",
    "trials",
    "archive",
    "backup",
    "restore",
    "migration",
    "import",
    "export",
    "sync",
    "debug",
    "domains",
    "maintenance",
    "upgrade",
    "release-notes",
    "roadmap",
    "road-map",
    "beta",
    "alpha",
    "test",
    "research",
    "error",
    "client",
    "interviews",
    "hiring",
    "onboarding",
    "offer",
    "recruitment",
    "vacancies",
    "postings",
    "employees",
    "backgroundChecks",
    "positions",
    "pipelines",
    "company",
    "staff",
    "management",
    "compensation",
    "payroll",
    "timesheets",
    "disputes",
    "skills",
    "experiences",
    "letters",
    "endorsements",
    "discovery",
    "rankings",
    "follow-up",
    "favorites",
    "collaboration",
    "activity",
    "attachments",
    "portal",
    "categories",
    "subcategories",
    "map",
    "domains",
    "directions",
    "location",
    "place",
    "followups",
    "invites",
    "invoices",
    "assessments",
    "verification",
    "locations",
    "live",
];

// Declare an array of routes that should redirect to the docs page
pub const DOCS_ROUTES: [&str; 9] = [
    "/",
    "/api",
    "/api/",
    // "/api/health",
    // "/api/health/",
    "/api/docs",
    "/api/docs/",
    "/api/docs/*any",
    "/docs",
    "/docs/",
    "/docs/*any",
];

pub const PORT: &str = "[::]:8080";
