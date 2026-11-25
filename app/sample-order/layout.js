import { notFound } from "next/navigation";

export const metadata = {
  title: "Sample Order (test)",
  robots: { index: false, follow: false },
};

// Developer test page: it exists only in development unless ENABLE_TEST_ROUTES=true.
export default function SampleOrderLayout({ children }) {
  if (process.env.NODE_ENV === "production" && process.env.ENABLE_TEST_ROUTES !== "true") notFound();
  return children;
}
