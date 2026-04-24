import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Dashboard - Partikur",
};

export default function DashboardLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
