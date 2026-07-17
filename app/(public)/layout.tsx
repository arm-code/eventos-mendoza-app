import Navbar from "@/components/navbar/Navbar.component";
import Footer from "@/components/footer/Footer.component";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-violet-50 flex flex-col">
      <div className="flex justify-end p-4 fixed top-0 right-0 w-full z-40 bg-violet-50/90 backdrop-blur-sm border-b border-violet-100">
        <Navbar />
      </div>
      <div className="pt-20 flex-grow">
        {children}
      </div>
      <Footer />
    </div>
  );
}
