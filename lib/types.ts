// ─── Shared types and defaults ───────────────────────────────────────────────
// Single source of truth for AppConfig — used by /dashboard and /preview.

export type AppConfig = {
  businessName: string;
  tagline: string;
  aboutText: string;
  phone: string;
  website: string;
  hours: string;
  primaryColor: string;
  accentColor: string;
  category: string;
  appTheme: "light" | "dark";
  welcomeMessage: string;
  logoDataUrl: string;
  loyaltyEnabled: boolean;
  loyaltyStampsRequired: number;
  loyaltyRewardName: string;
  orderingEnabled: boolean;
  pushEnabled: boolean;
  menuItems: { id: string; name: string; price: string }[];
  notificationTitle: string;
  notificationBody: string;
};

export const DEFAULT_CONFIG: AppConfig = {
  businessName: "Your Business",
  tagline: "",
  aboutText: "",
  phone: "",
  website: "",
  hours: "",
  primaryColor: "#4F46E5",
  accentColor: "#F97316",
  category: "Restaurant",
  appTheme: "light",
  welcomeMessage: "",
  logoDataUrl: "",
  loyaltyEnabled: true,
  loyaltyStampsRequired: 8,
  loyaltyRewardName: "Free item",
  orderingEnabled: true,
  pushEnabled: false,
  menuItems: [
    { id: "1", name: "Brisket Plate", price: "$18" },
    { id: "2", name: "Pulled Pork Sandwich", price: "$12" },
    { id: "3", name: "Loaded Fries", price: "$8" },
  ],
  notificationTitle: "",
  notificationBody: "",
};

export const DEMO_CONFIG: AppConfig = {
  businessName: "Smoke & Fire BBQ",
  tagline: "Real BBQ. Real slow.",
  aboutText: "Award-winning BBQ smoked low and slow for 14+ hours over hickory and oak. Come hungry — you won't leave disappointed.",
  phone: "(512) 555-0182",
  website: "smokeandfirebbq.com",
  hours: "Tue–Sun: 11am – 9pm",
  primaryColor: "#C2410C",
  accentColor: "#F59E0B",
  category: "Restaurant",
  appTheme: "dark",
  welcomeMessage: "Welcome to Smoke & Fire!",
  logoDataUrl: "",
  loyaltyEnabled: true,
  loyaltyStampsRequired: 8,
  loyaltyRewardName: "Free Brisket Plate",
  orderingEnabled: true,
  pushEnabled: true,
  menuItems: [
    { id: "1", name: "Brisket Plate", price: "$18" },
    { id: "2", name: "Pulled Pork Sandwich", price: "$12" },
    { id: "3", name: "Loaded Fries", price: "$8" },
    { id: "4", name: "Smoked Ribs (Half Rack)", price: "$22" },
  ],
  notificationTitle: "Weekend Special",
  notificationBody: "Smoked brisket just came off the pit. First 20 plates only.",
};
