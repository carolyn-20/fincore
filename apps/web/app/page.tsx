"use client";
import {useEffect,useState} from "react";
type Wallet={id:string;currency:string;balance:string;status:string};
type User={email:string;fullName:string;role:string};
const API=`${process.env.NEXT_PUBLIC_API_URL||"http://localhost:4000"}/api/v1`;
export default function Home(){
 const [mode,setMode]=useState<"login"|"register">("login");
 const [fullName,setFullName]=useState(""),[email,setEmail]=useState(""),[password,setPassword]=useState("");
 const [token,setToken]=useState(""),[user,setUser]=useState<User|null>(null),[wallets,setWallets]=useState<Wallet[]>([]);
 const [recipient,setRecipient]=useState(""),[amount,setAmount]=useState("100.00"),[message,setMessage]=useState(""),[busy,setBusy]=useState(false);
 async function request(path:string,opts:RequestInit={}){
  const res=await fetch(`${API}${path}`,{...opts,headers:{"Content-Type":"application/json",...(token?{Authorization:`Bearer ${token}`}:{}),...(opts.headers||{})}});
  const data=await res.json().catch(()=>({}));
  if(!res.ok)throw new Error(data.error?.message||"Request failed. Please try again.");
  return data;
 }
 async function authenticate(e:React.FormEvent){
  e.preventDefault();setBusy(true);setMessage("");
  try{
   if(mode==="register"){
    await request("/auth/register",{method:"POST",body:JSON.stringify({email,fullName,password})});
    setMessage("Account created — signing you in…");
   }
   const d=await request("/auth/login",{method:"POST",body:JSON.stringify({email,password})});
   setToken(d.accessToken);setUser(d.user);setMessage("You're signed in. Loading your wallet…");
  }catch(err){setMessage((err as Error).message)}finally{setBusy(false)}
 }
 useEffect(()=>{if(!token)return;request("/wallets").then(d=>setWallets(d.items)).catch(e=>setMessage(e.message));},[token]);
 async function transfer(){
  setBusy(true);setMessage("");
  try{const d=await request("/transfers",{method:"POST",headers:{"Idempotency-Key":crypto.randomUUID()},body:JSON.stringify({toEmail:recipient,amount,description:"FinCore demo transfer"})});setMessage(`Transfer ${d.transfer.id} posted. Synthetic funds only.`);const w=await request("/wallets");setWallets(w.items);}
  catch(e){setMessage((e as Error).message)}finally{setBusy(false)}
 }
 return <main className="min-h-screen px-4 py-6 md:px-8">
  <div className="mx-auto max-w-7xl">
   <header className="flex items-center justify-between border-b border-white/10 pb-5">
    <div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-400 font-black text-slate-950">F</div><div><p className="text-sm font-bold tracking-[.22em]">FINCORE</p><p className="muted text-xs">Digital finance sandbox</p></div></div>
    <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-[11px] font-semibold tracking-wider text-amber-200">SIMULATED · NO REAL FUNDS</span>
   </header>
   {!token?<div className="grid min-h-[78vh] items-center gap-10 py-10 lg:grid-cols-2">
    <section className="max-w-xl">
     <p className="mb-4 text-sm font-semibold uppercase tracking-[.25em] text-cyan-300">A modern finance playground</p>
     <h1 className="text-4xl font-bold leading-tight sm:text-6xl">Move money.<br/><span className="text-cyan-300">Understand every move.</span></h1>
     <p className="muted mt-6 max-w-lg text-lg leading-8">Explore wallets, transfers, ledger integrity and risk workflows in a safe environment built with synthetic data.</p>
     <div className="mt-8 grid gap-3 sm:grid-cols-2">
      {["Double-entry ledger","Wallet & transfers","Risk insights","Audit-ready activity"].map((x,i)=><div key={x} className="panel flex items-center gap-3 p-4"><span className="grid h-8 w-8 place-items-center rounded-lg bg-cyan-400/10 text-cyan-300">{["↔","◈","⌁","✓"][i]}</span><span className="text-sm font-medium">{x}</span></div>)}
     </div>
     <p className="muted mt-8 text-xs">Learning demo only · Not a bank · Not connected to payment rails</p>
    </section>
    <section className="panel mx-auto w-full max-w-md p-6 sm:p-8">
     <div className="mb-6"><h2 className="text-2xl font-bold">{mode==="login"?"Welcome back":"Create your account"}</h2><p className="muted mt-2 text-sm">{mode==="login"?"Sign in to your FinCore workspace.":"Join the FinCore sandbox in a few steps."}</p></div>
     <div className="mb-6 grid grid-cols-2 rounded-xl bg-slate-950/70 p-1"><button type="button" onClick={()=>{setMode("login");setMessage("")}} className={`rounded-lg p-2 text-sm font-semibold ${mode==="login"?"bg-slate-800 text-white":"muted"}`}>Sign in</button><button type="button" onClick={()=>{setMode("register");setMessage("")}} className={`rounded-lg p-2 text-sm font-semibold ${mode==="register"?"bg-slate-800 text-white":"muted"}`}>Create account</button></div>
     <form onSubmit={authenticate} className="space-y-4">
      {mode==="register"&&<label className="block text-sm font-medium">Full name<input className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 p-3.5 outline-none focus:border-cyan-400" value={fullName} onChange={e=>setFullName(e.target.value)} autoComplete="name" minLength={2} maxLength={100} required/></label>}
      <label className="block text-sm font-medium">Email address<input className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 p-3.5 outline-none focus:border-cyan-400" value={email} onChange={e=>setEmail(e.target.value)} type="email" autoComplete="email" required/></label>
      <label className="block text-sm font-medium">Password<input className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 p-3.5 outline-none focus:border-cyan-400" value={password} onChange={e=>setPassword(e.target.value)} type="password" autoComplete={mode==="login"?"current-password":"new-password"} minLength={mode==="register"?10:1} required/>{mode==="register"&&<span className="muted mt-1 block text-xs">At least 10 characters.</span>}</label>
      <button disabled={busy} className="w-full rounded-xl bg-cyan-400 p-3.5 font-bold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-60">{busy?(mode==="login"?"Signing in…":"Creating account…"):(mode==="login"?"Sign in":"Create account & sign in")}</button>
     </form>
     <p className="muted mt-5 text-center text-xs">Protected access · Passwords are hashed · Demo data only</p>
    </section>
   </div>:<><section className="mt-8 flex flex-wrap items-center justify-between gap-3"><div><p className="muted text-sm">Your workspace</p><h2 className="mt-1 text-2xl font-semibold">Hello, {user?.fullName}</h2><p className="muted text-sm">{user?.role} · {user?.email}</p></div><button onClick={()=>{setToken("");setUser(null);setWallets([]);setPassword("");setMessage("")}} className="rounded-xl border border-slate-700 px-4 py-2 hover:bg-slate-800">Sign out</button></section>
    <section className="mt-6 grid gap-4 md:grid-cols-3">{wallets.map(w=><div className="panel p-5" key={w.id}><p className="muted text-sm">Available simulated balance</p><p className="mt-2 text-3xl font-bold">{w.currency} {Number(w.balance).toLocaleString("en-IN",{minimumFractionDigits:2})}</p><p className="muted mt-3 text-xs">Wallet {w.id.slice(0,8)} · {w.status}</p></div>)}<div className="panel p-5"><p className="muted text-sm">Platform status</p><p className="mt-2 text-2xl font-bold text-emerald-300">Operational</p><p className="muted mt-3 text-xs">Synthetic assessment environment</p></div></section>
    <section className="mt-6 grid gap-4 md:grid-cols-2"><div className="panel p-6"><h3 className="text-lg font-semibold">Send a simulated transfer</h3><p className="muted mt-1 text-sm">Funds move between FinCore demo wallets only.</p><label className="mt-5 block text-sm">Recipient email<input className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 p-3" value={recipient} onChange={e=>setRecipient(e.target.value)} type="email"/></label><label className="mt-4 block text-sm">Amount (INR)<input className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 p-3" value={amount} onChange={e=>setAmount(e.target.value)} inputMode="decimal"/></label><button disabled={busy} onClick={transfer} className="mt-5 rounded-xl bg-cyan-400 px-5 py-3 font-bold text-slate-950 disabled:opacity-60">{busy?"Processing…":"Transfer funds"}</button></div><div className="panel p-6"><h3 className="text-lg font-semibold">Platform modules</h3><ul className="mt-4 space-y-3 text-sm">{["Customer profiles & wallets","Beneficiaries & transfers","Immutable double-entry ledger","Payment intents & webhook inbox","Disputes & operations queue","Risk analytics & audit trail","Statements & reconciliation"].map(x=><li key={x} className="flex items-center gap-2"><span className="text-emerald-300">✓</span>{x}</li>)}</ul></div></section></>}
   {message&&<p role="status" className="mt-5 rounded-xl border border-cyan-900 bg-cyan-950/40 p-4 text-sm">{message}</p>}
   <footer className="muted mt-12 border-t border-slate-800 pt-5 text-xs">FinCore is an educational simulation. Balances are synthetic and have no monetary value.</footer>
  </div>
 </main>
}
