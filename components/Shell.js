"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

const LINKS = [["/", "Dashboard"], ["/reports", "Reports"], ["/settings", "Settings"]];

export default function Shell({ children }) {
  const [ok, setOk] = useState(false);
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.replace("/login");
      else setOk(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => { if (!s) router.replace("/login"); });
    return () => data.subscription.unsubscribe();
  }, [router]);

  if (!ok) return null;
  return (
    <div className="wrap">
      <header>
        <h1>Payment Tracker</h1>
        <div className="grp">
          <nav>
            {LINKS.map(([href, label]) => (
              <Link key={href} href={href} className={path === href ? "on" : ""}>{label}</Link>
            ))}
          </nav>
          <button className="btn ghost" onClick={() => supabase.auth.signOut()}>Sign out</button>
        </div>
      </header>
      {children}
    </div>
  );
}
