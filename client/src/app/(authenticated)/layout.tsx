import Sidebar from "@/components/SideBar";
import { AuthenticatedProviders } from "@/features/globals/providers";
export const dynamic = "force-dynamic";

// export const metadata = {
//   title: AI_NAME,
//   description: AI_NAME,
// };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthenticatedProviders>
      <div  className="flex h-screen w-screen" >
        <Sidebar />
        <div className="flex-1 flex">{children}</div>
      </div>
    </AuthenticatedProviders>
  );
}
