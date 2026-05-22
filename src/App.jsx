import { useState, useEffect, useRef, useCallback } from "react";
import { loadMessages, saveMessage } from "./supabase.js";

function Confetti({ active }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const colors = ["#F5C842", "#E8A0BF", "#A8D8EA", "#C7CEEA", "#fff", "#FFD700", "#FF6B9D"];
    const pieces = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      w: Math.random() * 10 + 6,
      h: Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      rot: Math.random() * 360,
      vx: (Math.random() - 0.5) * 2,
      vy: Math.random() * 3 + 1.5,
      vr: (Math.random() - 0.5) * 4,
    }));
    let frame = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach((p) => {
        ctx.save();
        ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.85;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
        p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        if (p.y > canvas.height) { p.y = -20; p.x = Math.random() * canvas.width; }
      });
      frame++;
      if (frame < 300) animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [active]);

  if (!active) return null;
  return <canvas ref={canvasRef} style={{ position:"fixed",inset:0,zIndex:9999,pointerEvents:"none",width:"100vw",height:"100vh" }} />;
}

function FloatingParticles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 8}s`,
    duration: `${6 + Math.random() * 6}s`,
    size: `${14 + Math.random() * 8}px`,
    emoji: ["✨","⭐","🌟","💫","🎀","🎁","💛"][Math.floor(Math.random() * 7)],
  }));
  return (
    <div style={{ position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden" }}>
      {particles.map((p) => (
        <div key={p.id} style={{ position:"absolute",left:p.left,bottom:"-40px",fontSize:p.size,animation:`floatUp ${p.duration} ${p.delay} infinite ease-in`,opacity:0 }}>
          {p.emoji}
        </div>
      ))}
    </div>
  );
}
const GIFT_PALETTES = [
  { lid:"#C0392B",body:"#E74C3C",ribbon:"#F5C842",bow:"#F39C12" },
  { lid:"#1A5276",body:"#2980B9",ribbon:"#F5C842",bow:"#D4AC0D" },
  { lid:"#7D3C98",body:"#9B59B6",ribbon:"#FAD7A0",bow:"#F0B27A" },
  { lid:"#1E8449",body:"#27AE60",ribbon:"#F5C842",bow:"#F39C12" },
  { lid:"#B7950B",body:"#F4D03F",ribbon:"#C0392B",bow:"#922B21" },
  { lid:"#6E2F1A",body:"#A04000",ribbon:"#FAD7A0",bow:"#F0B27A" },
];

function GiftBox({ message, index, onOpen }) {
  const [opened, setOpened] = useState(false);
  const [lidPos, setLidPos] = useState(0);
  const palette = GIFT_PALETTES[index % GIFT_PALETTES.length];

  const handleOpen = () => {
    if (opened) return;
    setLidPos(-30);
    setTimeout(() => { setOpened(true); onOpen(); }, 350);
  };

  return (
    <div onClick={handleOpen} style={{ cursor:opened?"default":"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:"12px",animation:`fadeScaleIn 0.5s ${index*0.08}s both` }}>
      <div style={{ position:"relative",width:110,height:110 }}>
        <svg width="110" height="110" viewBox="0 0 110 110" fill="none">
          <rect x="10" y="45" width="90" height="60" rx="6" fill={palette.body}/>
          <rect x="48" y="45" width="14" height="60" fill={palette.ribbon} opacity="0.85"/>
          <rect x="10" y="65" width="90" height="12" fill={palette.ribbon} opacity="0.85"/>
          <rect x="6" y="30" width="98" height="20" rx="5" fill={palette.lid} style={{ transform:`translateY(${lidPos}px)`,transition:"transform 0.35s cubic-bezier(.68,-0.55,.27,1.55)" }}/>
          <ellipse cx="42" cy="34" rx="16" ry="9" fill={palette.bow} style={{ transform:`rotate(-25deg) translateY(${lidPos}px)`,transformOrigin:"42px 34px",transition:"transform 0.35s cubic-bezier(.68,-0.55,.27,1.55)" }}/>
          <ellipse cx="68" cy="34" rx="16" ry="9" fill={palette.bow} style={{ transform:`rotate(25deg) translateY(${lidPos}px)`,transformOrigin:"68px 34px",transition:"transform 0.35s cubic-bezier(.68,-0.55,.27,1.55)" }}/>
          <circle cx="55" cy="34" r="7" fill={palette.ribbon} style={{ transform:`translateY(${lidPos}px)`,transition:"transform 0.35s cubic-bezier(.68,-0.55,.27,1.55)" }}/>
        </svg>
        {!opened && <div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",paddingTop:"28px",fontSize:"22px",animation:"pulse 2s infinite" }}>🎁</div>}
      </div>
      {opened ? (
        <div style={{ background:"linear-gradient(135deg,#fffde7 0%,#fff9c4 100%)",border:"2px solid #F5C842",borderRadius:"14px",padding:"16px 20px",maxWidth:"220px",minHeight:"80px",boxShadow:"0 4px 20px rgba(245,200,66,0.3)",animation:"revealCard 0.4s ease",textAlign:"center",fontSize:"14px",color:"#3D2B00",lineHeight:"1.6",fontFamily:"'Lora',serif" }}>
          <div style={{ fontSize:"18px",marginBottom:"6px" }}>💌</div>
          <p style={{ margin:0 }}>{message.text}</p>
          <p style={{ margin:"8px 0 0",fontSize:"11px",color:"#A0845C",fontStyle:"italic" }}>— Anonymous ✨</p>
        </div>
      ) : (
        <div style={{ background:"rgba(255,255,255,0.07)",border:"1px dashed rgba(245,200,66,0.4)",borderRadius:"10px",padding:"8px 16px",color:"rgba(245,200,66,0.7)",fontSize:"12px",fontFamily:"'Lato',sans-serif",letterSpacing:"0.05em" }}>
          Tap to open ✦
        </div>
      )}
    </div>
  );
    }
function MessageModal({ onSubmit, onClose }) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setSending(true);
    await onSubmit(text.trim());
    setSending(false);
  };

  return (
    <div style={{ position:"fixed",inset:0,zIndex:1000,background:"rgba(5,10,25,0.85)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"20px",animation:"fadeIn 0.25s ease" }} onClick={(e)=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:"linear-gradient(145deg,#0D1B3E 0%,#0A1628 100%)",border:"1px solid rgba(245,200,66,0.35)",borderRadius:"24px",padding:"40px 36px",maxWidth:"480px",width:"100%",boxShadow:"0 30px 80px rgba(0,0,0,0.6)",animation:"slideUp 0.35s cubic-bezier(.34,1.56,.64,1)",position:"relative" }}>
        <button onClick={onClose} style={{ position:"absolute",top:"16px",right:"20px",background:"none",border:"none",cursor:"pointer",color:"rgba(245,200,66,0.5)",fontSize:"24px",lineHeight:1 }}>×</button>
        <div style={{ textAlign:"center",marginBottom:"28px" }}>
          <div style={{ fontSize:"42px",marginBottom:"10px" }}>💌</div>
          <h2 style={{ fontFamily:"'Playfair Display',serif",color:"#F5C842",fontSize:"24px",margin:"0 0 8px",fontWeight:700 }}>Leave a Birthday Wish</h2>
          <p style={{ color:"rgba(200,210,255,0.6)",fontSize:"13px",fontFamily:"'Lato',sans-serif",margin:0 }}>Your message will be anonymous — only love here ✨</p>
        </div>
        <textarea autoFocus value={text} onChange={(e)=>setText(e.target.value)} placeholder="Write something beautiful for Amal..." rows={5}
          style={{ width:"100%",background:"rgba(255,255,255,0.05)",border:"1.5px solid rgba(245,200,66,0.3)",borderRadius:"14px",padding:"16px",color:"#F0E6C8",fontFamily:"'Lora',serif",fontSize:"15px",lineHeight:"1.65",resize:"none",outline:"none",boxSizing:"border-box" }}
          onFocus={(e)=>(e.target.style.borderColor="rgba(245,200,66,0.7)")}
          onBlur={(e)=>(e.target.style.borderColor="rgba(245,200,66,0.3)")}
        />
        <button onClick={handleSubmit} disabled={!text.trim()||sending} style={{ marginTop:"20px",width:"100%",padding:"15px",background:text.trim()?"linear-gradient(135deg,#F5C842 0%,#E8A000 100%)":"rgba(255,255,255,0.08)",border:"none",borderRadius:"12px",color:text.trim()?"#0A1628":"rgba(255,255,255,0.3)",fontFamily:"'Playfair Display',serif",fontSize:"16px",fontWeight:700,cursor:text.trim()?"pointer":"not-allowed",letterSpacing:"0.04em" }}>
          {sending ? "Sending your wish... 🎁" : "Send My Wish ✦"}
        </button>
      </div>
    </div>
  );
          }
function LandingPage({ onModalOpen }) {
  return (
    <div style={{ minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 20px",position:"relative",textAlign:"center" }}>
      <div style={{ position:"absolute",width:"600px",height:"600px",borderRadius:"50%",border:"1px solid rgba(245,200,66,0.07)",top:"50%",left:"50%",transform:"translate(-50%,-50%)",animation:"spinSlow 20s linear infinite",pointerEvents:"none" }}/>
      <div style={{ position:"absolute",width:"420px",height:"420px",borderRadius:"50%",border:"1px dashed rgba(245,200,66,0.1)",top:"50%",left:"50%",transform:"translate(-50%,-50%)",animation:"spinSlow 14s linear infinite reverse",pointerEvents:"none" }}/>
      <div style={{ fontSize:"52px",marginBottom:"16px",animation:"floatBob 3s ease-in-out infinite" }}>👑</div>
      <h1 style={{ fontFamily:"'Playfair Display',serif",fontSize:"clamp(40px,9vw,86px)",fontWeight:700,margin:"0 0 8px",lineHeight:1.1,letterSpacing:"-0.02em",background:"linear-gradient(135deg,#F5C842 0%,#FFE88A 40%,#E8A000 70%,#F5C842 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundSize:"200% auto",animation:"shimmer 4s linear infinite" }}>
        Miss Amal Said
      </h1>
      <p style={{ fontFamily:"'Lato',sans-serif",fontSize:"clamp(13px,2.5vw,17px)",color:"rgba(200,220,255,0.55)",margin:"0 0 12px",letterSpacing:"0.22em",textTransform:"uppercase",fontWeight:300 }}>✦ &nbsp; Celebrating You &nbsp; ✦</p>
      <div style={{ display:"inline-flex",alignItems:"center",gap:"10px",background:"rgba(245,200,66,0.08)",border:"1px solid rgba(245,200,66,0.25)",borderRadius:"100px",padding:"8px 22px",marginBottom:"48px",fontFamily:"'Lora',serif",fontSize:"14px",color:"rgba(245,200,66,0.8)",fontStyle:"italic" }}>
        🎂 &nbsp; Happy Birthday &nbsp; 🎂
      </div>
      <button onClick={onModalOpen} style={{ padding:"20px 48px",background:"linear-gradient(135deg,#F5C842 0%,#E8A000 100%)",border:"none",borderRadius:"100px",color:"#0A1628",fontFamily:"'Playfair Display',serif",fontSize:"clamp(15px,2.5vw,18px)",fontWeight:700,cursor:"pointer",letterSpacing:"0.03em",boxShadow:"0 0 40px rgba(245,200,66,0.35),0 8px 32px rgba(0,0,0,0.4)",transition:"transform 0.2s,box-shadow 0.2s" }}
        onMouseEnter={(e)=>{ e.currentTarget.style.transform="scale(1.05) translateY(-2px)"; e.currentTarget.style.boxShadow="0 0 60px rgba(245,200,66,0.55),0 16px 48px rgba(0,0,0,0.4)"; }}
        onMouseLeave={(e)=>{ e.currentTarget.style.transform="scale(1) translateY(0)"; e.currentTarget.style.boxShadow="0 0 40px rgba(245,200,66,0.35),0 8px 32px rgba(0,0,0,0.4)"; }}
      >
        💌 &nbsp; What would you like to say to Miss Amal?
      </button>
      <p style={{ marginTop:"24px",fontFamily:"'Lato',sans-serif",fontSize:"12px",color:"rgba(200,220,255,0.3)",letterSpacing:"0.05em" }}>
        Completely anonymous · No sign-up needed
      </p>
    </div>
  );
}

function GiftsPage({ messages, onBack, onGiftOpen }) {
  return (
    <div style={{ minHeight:"100vh",padding:"40px 20px 60px" }}>
      <div style={{ textAlign:"center",marginBottom:"50px" }}>
        <button onClick={onBack} style={{ display:"inline-flex",alignItems:"center",gap:"8px",background:"rgba(245,200,66,0.08)",border:"1px solid rgba(245,200,66,0.25)",borderRadius:"100px",padding:"8px 18px",color:"rgba(245,200,66,0.75)",fontFamily:"'Lato',sans-serif",fontSize:"13px",cursor:"pointer",marginBottom:"32px" }}
          onMouseEnter={(e)=>(e.currentTarget.style.background="rgba(245,200,66,0.15)")}
          onMouseLeave={(e)=>(e.currentTarget.style.background="rgba(245,200,66,0.08)")}
        >← Back</button>
        <div style={{ fontSize:"42px",marginBottom:"12px" }}>🎁</div>
        <h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:"clamp(28px,6vw,52px)",fontWeight:700,margin:"0 0 10px",background:"linear-gradient(135deg,#F5C842 0%,#FFE88A 50%,#E8A000 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>Amal's Gift Wall</h2>
        <p style={{ fontFamily:"'Lora',serif",fontSize:"15px",color:"rgba(200,220,255,0.5)",fontStyle:"italic",margin:0 }}>
          {messages.length} beautiful {messages.length===1?"wish":"wishes"} waiting to be opened ✨
        </p>
      </div>
      {messages.length===0 ? (
        <div style={{ textAlign:"center",color:"rgba(200,220,255,0.3)",fontFamily:"'Lora',serif",fontSize:"18px",fontStyle:"italic",marginTop:"80px" }}>
          <div style={{ fontSize:"60px",marginBottom:"20px",opacity:0.4 }}>🎁</div>
          No messages yet — be the first to leave a wish!
        </div>
      ) : (
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:"32px",maxWidth:"1100px",margin:"0 auto",justifyItems:"center" }}>
          {messages.map((msg,i)=>(
            <GiftBox key={msg.id} message={msg} index={i} onOpen={onGiftOpen}/>
          ))}
        </div>
      )}
    </div>
  );
}
const SECRET_KEY = "1979";

function PasswordGate({ onSuccess }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleCheck = () => {
    if (input.trim() === SECRET_KEY) {
      sessionStorage.setItem("amal_auth","1");
      onSuccess();
    } else {
      setError(true); setShake(true);
      setTimeout(()=>setShake(false),500);
    }
  };

  return (
    <div style={{ minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"20px" }}>
      <div style={{ background:"linear-gradient(145deg,#0D1B3E 0%,#0A1628 100%)",border:"1px solid rgba(245,200,66,0.35)",borderRadius:"24px",padding:"48px 40px",maxWidth:"400px",width:"100%",textAlign:"center",animation:shake?"shakeIt 0.4s ease":"slideUp 0.4s ease" }}>
        <div style={{ fontSize:"48px",marginBottom:"16px" }}>🔐</div>
        <h2 style={{ fontFamily:"'Playfair Display',serif",color:"#F5C842",fontSize:"22px",margin:"0 0 8px",fontWeight:700 }}>This page is private</h2>
        <p style={{ color:"rgba(200,210,255,0.5)",fontSize:"13px",fontFamily:"'Lato',sans-serif",margin:"0 0 28px" }}>Enter the secret key to view Amal's wishes ✨</p>
        <input autoFocus type="password" value={input} onChange={(e)=>{ setInput(e.target.value); setError(false); }} onKeyDown={(e)=>e.key==="Enter"&&handleCheck()} placeholder="Enter secret key..."
          style={{ width:"100%",background:"rgba(255,255,255,0.05)",border:`1.5px solid ${error?"#E74C3C":"rgba(245,200,66,0.3)"}`,borderRadius:"12px",padding:"14px 16px",color:"#F0E6C8",fontFamily:"'Lora',serif",fontSize:"18px",outline:"none",boxSizing:"border-box",textAlign:"center",letterSpacing:"0.3em" }}
        />
        {error && <p style={{ color:"#E74C3C",fontSize:"12px",fontFamily:"'Lato',sans-serif",margin:"8px 0 0" }}>Wrong key — try again 🚫</p>}
        <button onClick={handleCheck} style={{ marginTop:"20px",width:"100%",padding:"14px",background:"linear-gradient(135deg,#F5C842 0%,#E8A000 100%)",border:"none",borderRadius:"12px",color:"#0A1628",fontFamily:"'Playfair Display',serif",fontSize:"16px",fontWeight:700,cursor:"pointer" }}>
          Open Gifts 🎁
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("landing");
  const [modalOpen, setModalOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [confetti, setConfetti] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(()=>sessionStorage.getItem("amal_auth")==="1");

  useEffect(()=>{
    if (page==="gifts" && authenticated) {
      loadMessages().then((msgs)=>{ setMessages(msgs); setLoading(false); });
    } else { setLoading(false); }
  },[page,authenticated]);

  const handleSubmit = useCallback(async(text)=>{
    const newMsg = await saveMessage(text);
    if (newMsg) { setMessages((prev)=>[newMsg,...prev]); setModalOpen(false); setConfetti(true); setTimeout(()=>setConfetti(false),6000); setPage("gifts"); }
  },[]);

  const triggerConfetti = useCallback(()=>{ setConfetti(true); setTimeout(()=>setConfetti(false),4000); },[]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Lora:ital,wght@0,400;0,600;1,400&family=Lato:wght@300;400;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body{background:#050A19;color:#F0E6C8;font-family:'Lato',sans-serif;}
        @keyframes floatUp{0%{transform:translateY(0) rotate(0deg);opacity:0.8;}100%{transform:translateY(-110vh) rotate(360deg);opacity:0;}}
        @keyframes shimmer{0%{background-position:0% center;}100%{background-position:200% center;}}
        @keyframes spinSlow{from{transform:translate(-50%,-50%) rotate(0deg);}to{transform:translate(-50%,-50%) rotate(360deg);}}
        @keyframes floatBob{0%,100%{transform:translateY(0);}50%{transform:translateY(-12px);}}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.7;transform:scale(1.1);}}
        @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
        @keyframes slideUp{from{opacity:0;transform:translateY(40px) scale(0.95);}to{opacity:1;transform:translateY(0) scale(1);}}
        @keyframes fadeScaleIn{from{opacity:0;transform:scale(0.8) translateY(20px);}to{opacity:1;transform:scale(1) translateY(0);}}
        @keyframes revealCard{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
        @keyframes shakeIt{0%,100%{transform:translateX(0);}20%{transform:translateX(-10px);}40%{transform:translateX(10px);}60%{transform:translateX(-8px);}80%{transform:translateX(8px);}}
        textarea::placeholder{color:rgba(240,230,200,0.3);}
        #starfield{position:fixed;inset:0;z-index:0;pointer-events:none;background:radial-gradient(ellipse at 20% 50%,rgba(15,30,80,0.4) 0%,transparent 60%),radial-gradient(ellipse at 80% 20%,rgba(80,20,60,0.25) 0%,transparent 55%),#050A19;}
      `}</style>
      <div id="starfield"/>
      <FloatingParticles/>
      <Confetti active={confetti}/>
      <div style={{ position:"relative",zIndex:1,minHeight:"100vh" }}>
        {page==="landing" ? (
          <LandingPage onModalOpen={()=>setModalOpen(true)}/>
        ) : !authenticated ? (
          <PasswordGate onSuccess={()=>setAuthenticated(true)}/>
        ) : loading ? (
          <div style={{ minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:"16px" }}>
            <div style={{ fontSize:"48px",animation:"pulse 1.5s infinite" }}>🎁</div>
            <p style={{ fontFamily:"'Lora',serif",color:"rgba(245,200,66,0.6)",fontStyle:"italic" }}>Loading wishes...</p>
          </div>
        ) : (
          <GiftsPage messages={messages} onBack={()=>setPage("landing")} onGiftOpen={triggerConfetti}/>
        )}
      </div>
      {modalOpen && <MessageModal onSubmit={handleSubmit} onClose={()=>setModalOpen(false)}/>}
    </>
  );
}
