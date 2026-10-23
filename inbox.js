(() => {
 const $=id=>document.getElementById(id),cfg=window.SAYIT_CONFIG||{};
 const configured=cfg.supabaseUrl&&cfg.supabaseAnonKey&&cfg.supabaseUrl.startsWith("https://")&&!cfg.supabaseUrl.includes("PASTE_")&&!cfg.supabaseAnonKey.includes("PASTE_");
 const db=configured&&window.supabase?window.supabase.createClient(cfg.supabaseUrl,cfg.supabaseAnonKey):null;
 const status=(s,t="")=>{$("inboxStatus").textContent=s;$("inboxStatus").className="status "+t;};
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 async function load(){
   if(!db){status("Connect Supabase first. Open README.md and follow the setup guide.","error");$("inboxList").innerHTML='<div class="empty">Your private inbox will appear here after setup.</div>';return;}
   const {data:{user}}=await db.auth.getUser();if(!user){status("Sign in on the home page, then return here.","error");$("inboxList").innerHTML='<div class="empty"><a class="text-link" href="index.html#create">Go to sign in →</a></div>';return;}
   status("Loading your prompts…");
   const {data:prompts,error}=await db.from("prompts").select("id,text,created_at").eq("owner_id",user.id).order("created_at",{ascending:false});
   if(error){status(error.message,"error");return;}if(!prompts.length){status("You're signed in. Create your first prompt on the home page.","success");$("inboxList").innerHTML='<div class="empty">No prompts yet. <a class="text-link" href="index.html#create">Create one →</a></div>';return;}
   status("Signed in as "+user.email,"success");$("inboxList").innerHTML="";
   for(const p of prompts){
     const {data:msgs,error:msgErr}=await db.from("messages").select("id,body,created_at").eq("prompt_id",p.id).order("created_at",{ascending:false});
     const card=document.createElement("section");card.className="inbox-card";
     const link=location.origin+location.pathname.replace(/inbox\.html$/,"index.html")+"?prompt="+p.id;
     card.innerHTML=`<div class="muted">PROMPT · ${new Date(p.created_at).toLocaleDateString()}</div><h3>${esc(p.text)}</h3><div class="muted">${msgErr?"Could not load replies":(msgs||[]).length+" anonymous repl"+((msgs||[]).length===1?"y":"ies")}</div><div class="row-actions"><button class="small-btn copy">Copy share link</button><button class="small-btn danger delete">Delete prompt</button></div><div class="replies"></div>`;
     card.querySelector(".copy").onclick=async()=>{try{await navigator.clipboard.writeText(link);card.querySelector(".copy").textContent="Copied ✓";}catch{prompt("Copy link:",link);}};
     card.querySelector(".delete").onclick=async()=>{if(!confirm("Delete this prompt and its replies?"))return;const {error}=await db.from("prompts").delete().eq("id",p.id);if(error){alert(error.message);return;}load();};
     const replies=card.querySelector(".replies");
     if(msgErr)replies.textContent=msgErr.message;else if(!msgs.length)replies.innerHTML='<p class="muted">No replies yet. Share your link to get started.</p>';else msgs.forEach(m=>{const d=document.createElement("div");d.style.cssText="background:#f7f4ff;border-radius:12px;padding:14px;margin-top:10px;font-size:13px;line-height:1.7";d.textContent=m.body;replies.appendChild(d);});
     $("inboxList").appendChild(card);
   }
 }
 $("refreshInbox").addEventListener("click",load);$("signOut").addEventListener("click",async()=>{if(db){await db.auth.signOut();status("Signed out.");load();}});load();
})();