(() => {
 const $ = id => document.getElementById(id);
 const cfg = window.SAYIT_CONFIG || {};
 const configured = cfg.supabaseUrl && cfg.supabaseAnonKey &&
   cfg.supabaseUrl.startsWith("https://") && !cfg.supabaseUrl.includes("PASTE_") &&
   !cfg.supabaseAnonKey.includes("PASTE_");
 const client = configured && window.supabase ? window.supabase.createClient(cfg.supabaseUrl,cfg.supabaseAnonKey) : null;
 const setStatus=(id,msg,type="")=>{const el=$(id);if(el){el.textContent=msg;el.className="status "+type;}};
 document.querySelectorAll(".suggestion").forEach(b=>b.addEventListener("click",()=>{$("promptText").value=b.textContent.replace(/ 👀/,"");$("promptText").focus();}));
 const promptId=new URLSearchParams(location.search).get("prompt");
 let activePrompt=null;
 async function init(){
   if(!client){setStatus("authStatus","Setup needed: connect your free Supabase project using README.md.","");setStatus("createStatus","Finish the Supabase setup to save prompts.");}
   if(promptId && client){
     const {data,error}=await client.from("prompts").select("id,text").eq("id",promptId).maybeSingle();
     if(data){activePrompt=data;$("replyPrompt").textContent=data.text;$("sendReply").disabled=false;}
     else $("replyPrompt").textContent="This prompt link is invalid or no longer available.";
   } else if(promptId) $("replyPrompt").textContent="This prompt is ready once the website owner connects Supabase.";
 }
 async function auth(mode){
   if(!client){setStatus("authStatus","First connect Supabase. Follow the setup guide in README.md.","error");return;}
   const email=$("email").value.trim(),password=$("password").value;
   if(!email||password.length<6){setStatus("authStatus","Enter a valid email and a password of at least 6 characters.","error");return;}
   setStatus("authStatus","Working…");
   const result=mode==="up"?await client.auth.signUp({email,password,options:{emailRedirectTo:location.origin+location.pathname}}):await client.auth.signInWithPassword({email,password});
   if(result.error){setStatus("authStatus",result.error.message,"error");return;}
   setStatus("authStatus",mode==="up"?(result.data.session?"Account created! You can create a prompt.":"Check your email to confirm your account, then sign in."):"Signed in! You can create prompts and open your inbox.","success");
 }
 $("signUp").addEventListener("click",()=>auth("up"));$("signIn").addEventListener("click",()=>auth("in"));
 $("createPrompt").addEventListener("click",async()=>{
   if(!client){setStatus("createStatus","Connect Supabase first (README.md).","error");return;}
   const text=$("promptText").value.trim();if(text.length<3){setStatus("createStatus","Write a prompt first (at least 3 characters).","error");return;}
   const {data:{user}}=await client.auth.getUser();if(!user){setStatus("createStatus","Sign in above first.","error");return;}
   setStatus("createStatus","Creating your link…");
   const {data,error}=await client.from("prompts").insert({text,owner_id:user.id}).select("id").single();
   if(error){setStatus("createStatus",error.message,"error");return;}
   const url=location.origin+location.pathname+"?prompt="+data.id;
   setStatus("createStatus","Your prompt is ready! Copy the link below and share it.","success");
   const a=document.createElement("a");a.href=url;a.className="text-link";a.textContent=url;a.style.display="block";a.style.wordBreak="break-all";a.style.marginTop="10px";
   const old=$("createdLink");if(old)old.remove();a.id="createdLink";$("createStatus").after(a);
   const share=document.createElement("button");share.className="button light full";share.textContent="Copy prompt link";share.onclick=async()=>{try{await navigator.clipboard.writeText(url);share.textContent="Copied! ✓";}catch{prompt("Copy your prompt link:",url);}};share.id="shareLink";a.after(share);
 });
 $("replyText").addEventListener("input",()=>{$("replyCount").textContent=$("replyText").value.length+" / 1000";});
 $("sendReply").addEventListener("click",async()=>{
   if(!client||!activePrompt){setStatus("replyStatus","Open a valid prompt link and make sure the website is configured.","error");return;}
   const text=$("replyText").value.trim();if(text.length<1){setStatus("replyStatus","Write a reply first.","error");return;}
   $("sendReply").disabled=true;setStatus("replyStatus","Sending…");
   const {error}=await client.from("messages").insert({prompt_id:activePrompt.id,body:text});
   if(error){setStatus("replyStatus","Could not send: "+error.message,"error");$("sendReply").disabled=false;return;}
   $("replyText").value="";$("replyCount").textContent="0 / 1000";setStatus("replyStatus","Your reply was sent privately. Thanks for being real! 💜","success");
 });
 init();
})();