import { getLoginAuthSettings, getSiteIdentity } from "@/actions/pageActions";
import LetsTravelPageClient from "./LetsTravelPageClient";

export default async function LetsTravelPage() {
  const [identity, loginAuth] = await Promise.all([
    getSiteIdentity(),
    getLoginAuthSettings(),
  ]);
  return <LetsTravelPageClient initialIdentity={identity} initialLoginAuth={loginAuth} />;
}
