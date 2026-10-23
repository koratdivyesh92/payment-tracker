"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const router = useRouter();

  async function submit(e) {
    e.preventDefault();
    setErr("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setErr(error.message);
    else router.replace("/");
  }

  return (
    <div className="wrap">
      <form className="panel" onSubmit={submit} style={{ maxWidth: 380, margin: "12vh auto 0" }}>
        <h1 style={{ marginBottom: 16 }}>Payment Tracker</h1>
        <div className="f"><label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label></div>
        <div className="f"><label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label></div>
        <div className="err">{err}</div>
        <button className="btn" style={{ width: "100%" }}>Sign in</button>
      </form>
    </div>
  );
}
