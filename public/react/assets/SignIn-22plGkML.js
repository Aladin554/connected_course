import{r as o,u as _,i as P,c as F,g as D,a as z,j as e,y as d,b as E,p as W,P as O}from"./index-3yd4nIpT.js";import{A as R}from"./AuthPageLayout-Dq1MQIES.js";const T="/images/bg-mobile.jpeg",Y="/images/bg-desktop.jpeg",C="/images/bg-mobile.webp",A="/images/bg-desktop.webp";function G(){const[x,u]=o.useState("splash"),[m,f]=o.useState(!1),[i,k]=o.useState(""),[a,c]=o.useState(""),[p,w]=o.useState(!1),[n,y]=o.useState(!0),[v,S]=o.useState(!1),I=o.useRef(null),r=_();if(o.useEffect(()=>{const g=window.matchMedia("(min-width: 1024px)").matches,t=document.createElement("link");return t.rel="preload",t.as="image",t.href=g?A:C,t.type="image/webp",t.setAttribute("fetchpriority","high"),document.head.appendChild(t),()=>{t.remove()}},[]),o.useEffect(()=>{const g=sessionStorage.getItem("token"),t=sessionStorage.getItem("role_id");if(g){if(P()){F(),y(!1);return}const l=t?parseInt(t,10):null;if(l===3)r("/introduction",{replace:!0});else if(l===1||l===2){const j=D();r(z(j)?"/choose-dashboard":"/dashboard",{replace:!0})}else r("/dashboard",{replace:!0})}else y(!1)},[r]),n)return null;const M=()=>{u("login"),requestAnimationFrame(()=>{requestAnimationFrame(()=>{w(!0)})})},N=()=>{w(!1),setTimeout(()=>u("splash"),420)},L=async g=>{var t,l,j;if(g.preventDefault(),!i||!a){d.error("Email and password are required");return}try{const h=await E.post("/api/login",{email:i,password:a}),{access_token:b,user:s}=h.data;W(b,s),s.role_id===3?r("/introduction",{replace:!0}):s.role_id===1||s.role_id===2?r(z(s)?"/choose-dashboard":"/dashboard",{replace:!0}):r("/dashboard",{replace:!0})}catch(h){if(E.isAxiosError(h)){const b=(t=h.response)==null?void 0:t.status,s=(j=(l=h.response)==null?void 0:l.data)==null?void 0:j.message;b===401?d.error("Invalid email or password"):b===403&&s?d.error(s):b===404?d.error("User not found"):d.error("Something went wrong. Please try again!")}else d.error("Unexpected error occurred!")}};return e.jsxs(e.Fragment,{children:[e.jsx("style",{children:`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

        *, *::before, *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          font-family: 'Inter';
        }

        body {
          background: #0a0e1a;
          min-height: 100dvh;
          overflow-x: hidden;
        }

        /* ══════════════════════════════════════════
           MOBILE  (< 1024 px)
        ══════════════════════════════════════════ */
        .mobile-wrap {
          display: flex;
          flex-direction: column;
          width: 100%;
          min-height: 100dvh;
          position: relative;
          overflow: hidden;
        }

        .mobile-bg {
          position: fixed;
          inset: 0;
          background: #0a0e1a;
          z-index: 0;
          overflow: hidden;
        }
        .mobile-bg::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(10,14,26,0.0) 0%,
            rgba(10,14,26,0.0) 40%,
            rgba(10,14,26,0.75) 65%,
            rgba(10,14,26,0.97) 80%,
            rgba(10,14,26,1.0) 100%
          );
        }

        .auth-bg-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          opacity: 0;
          transition: opacity 0.24s ease;
        }
        .auth-bg-img.ready {
          opacity: 1;
        }
        .mobile-bg .auth-bg-img {
          object-position: center top;
        }
        .mobile-bg picture,
        .desktop-left-img picture {
          width: 100%;
          height: 100%;
          display: block;
        }

        /* ── Splash ── */
        .splash-content {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          min-height: 100dvh;
          padding: 0 24px 44px;
        }

        .splash-headline {
          font-size: 40px;
          font-weight: 800;
          color: #fff;
          line-height: 1.05;
          letter-spacing: -1px;
          margin-bottom: 4px;
          text-align: center;
        }
        .splash-headline-orange {
          font-size: 35px;
          font-weight: 800;
          color: #f97316;
          line-height: 1.05;
          letter-spacing: -1px;
          margin-bottom: 14px;
          text-align: center;
          display: block;
        }
        .splash-body {
          font-size: 14px;
          color: rgba(255,255,255,0.5);
          line-height: 1.55;
          margin-bottom: 32px;
          text-align: center;
        }
        .btn-start {
          width: 100%;
          padding: 18px;
          background: #f97316;
          color: #fff;
          border: none;
          border-radius: 50px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          letter-spacing: 0.1px;
          transition: background 0.2s, transform 0.1s;
        }
        .btn-start:hover { background: #ea6c0a; }
        .btn-start:active { transform: scale(0.99); }

        /* ── Mobile login sheet ── */
        .login-sheet-overlay {
          position: fixed;
          inset: 0;
          z-index: 10;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
        }

        /* Dim backdrop — fades in alongside the slide */
        .login-sheet-bg {
          position: absolute;
          inset: 0;
          background: rgba(10,14,26,0.55);
          opacity: 0;
          transition: opacity 0.4s cubic-bezier(0.32, 0.72, 0, 1);
        }
        .login-sheet-bg.visible {
          opacity: 1;
        }

        .login-sheet {
          position: relative;
          z-index: 1;
          background: #0d1220;
          border-radius: 28px 28px 0 0;
          padding: 52px 28px 48px;
          /* START hidden below the viewport */
          transform: translateY(100%);
          transition: transform 0.45s cubic-bezier(0.32, 0.72, 0, 1);
          max-height: 92dvh;
          overflow-y: auto;
          scrollbar-width: none;
          /* Drag handle visual hint */
          box-shadow: 0 -4px 40px rgba(0,0,0,0.4);
        }
        .login-sheet::-webkit-scrollbar { display: none; }

        /* .open triggers the upward slide */
        .login-sheet.open {
          transform: translateY(0);
        }

        /* Small pill handle at the top of the sheet */
        .sheet-handle {
          width: 40px;
          height: 4px;
          background: rgba(255,255,255,0.15);
          border-radius: 4px;
          margin: 0 auto 32px;
        }

        .mobile-back-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          color: rgba(255,255,255,0.5);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          padding: 0;
          margin-bottom: 28px;
          transition: color 0.2s;
        }
        .mobile-back-btn:hover { color: #fff; }

        /* ══════════════════════════════════════════
           DESKTOP  (≥ 1024 px)
        ══════════════════════════════════════════ */
        .desktop-wrap {
          display: none;
          width: 100%;
          height: 100dvh;
          background: #0a0e1a;
          align-items: center;
          justify-content: center;
          padding: 24px;
          gap: 20px;
          overflow: hidden;
        }

        .desktop-left-card {
          flex: 1 1 0%;
          height: calc(100dvh - 48px);
          max-height: 860px;
          max-width: 860px;
          border-radius: 28px;
          overflow: hidden;
          position: relative;
          background: #000;
          border: 1.5px solid rgba(255,255,255,0.08);
          box-shadow: 0 0 0 1px rgba(255,255,255,0.03), 0 24px 64px rgba(0,0,0,0.5);
        }

        .desktop-left-img {
          position: absolute;
          inset: 0;
          background: #0a0e1a;
          z-index: 0;
          overflow: hidden;
        }
        .desktop-left-img .auth-bg-img {
          object-position: center center;
        }
        .desktop-left-img::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(0,0,0,0.0) 0%,
            rgba(0,0,0,0.0) 48%,
            rgba(0,0,0,0.55) 75%,
            rgba(0,0,0,0.85) 100%
          );
        }

        .desktop-brand-top {
          position: absolute;
          top: 32px;
          z-index: 2;
          display: flex;
          align-items: center;
        }

        .desktop-hero-bottom {
          position: absolute;
          bottom: 44px; left: 40px; right: 40px;
          z-index: 2;
        }
        .desktop-hero-headline {
          font-size: 48px;
          font-weight: 800;
          color: #fff;
          line-height: 1.05;
          letter-spacing: -1.5px;
          margin-bottom: 4px;
        }
        .desktop-hero-headline-orange {
          font-size: 48px;
          font-weight: 800;
          color: #f97316;
          line-height: 1.05;
          letter-spacing: -1.5px;
          margin-bottom: 16px;
          display: block;
        }
        .desktop-hero-body {
          font-size: 16px;
          color: rgba(255,255,255,0.6);
          line-height: 1.6;
          max-width: 460px;
        }

        .desktop-right-card {
          width: 460px;
          height: calc(100dvh - 48px);
          max-height: 860px;
          background: #0d1220;
          border: 1.5px solid rgba(255,255,255,0.08);
          border-radius: 28px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 0 48px;
          flex-shrink: 0;
          box-shadow: 0 0 0 1px rgba(255,255,255,0.03), 0 24px 64px rgba(0,0,0,0.5);
        }

        @media (min-width: 1024px) {
          .mobile-wrap  { display: none; }
          .desktop-wrap { display: flex; }
        }

        /* ══════════════════════════════════════════
           SHARED FORM STYLES
        ══════════════════════════════════════════ */
        .form-title {
          font-size: 28px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.6px;
          margin-bottom: 8px;
          line-height: 1.1;
        }
        .form-title-dot { color: #f97316; }
        .form-sub {
          font-size: 14px;
          color: rgba(255,255,255,0.4);
          line-height: 1.55;
          margin-bottom: 22px;
        }

        .field { margin-bottom: 22px; }
        .field label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: rgba(255,255,255,0.7);
          margin-bottom: 10px;
          letter-spacing: 0.1px;
        }
        .input-wrap { position: relative; display: flex; align-items: center; }
        .input-icon {
          position: absolute; left: 18px;
          color: rgba(255,255,255,0.2);
          pointer-events: none;
          display: flex; align-items: center;
        }
        .field input {
          width: 100%;
          padding: 0 18px 0 50px;
          background: rgba(255,255,255,0.04);
          border: 1.5px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          font-size: 15px;
          color: #fff;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
          height: 58px;
        }
        .field input::placeholder { color: rgba(255,255,255,0.2); }
        .field input:focus {
          border-color: rgba(249,115,22,0.5);
          background: rgba(249,115,22,0.03);
        }
        .eye-btn {
          position: absolute; right: 16px;
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.22);
          display: flex; align-items: center; padding: 6px;
          transition: color 0.2s;
        }
        .eye-btn:hover { color: rgba(255,255,255,0.55); }

        .forgot-row {
          display: flex;
          justify-content: flex-end;
          margin-top: 14px;
          margin-bottom: 32px;
        }
        .forgot {
          font-size: 13px;
          color: #f97316;
          text-decoration: none;
          font-weight: 500;
        }
        .forgot:hover { text-decoration: underline; }

        .field input:-webkit-autofill,
        .field input:-webkit-autofill:hover,
        .field input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0px 1000px #0d1220 inset !important;
          -webkit-text-fill-color: #fff !important;
          border-color: rgba(255,255,255,0.08) !important;
          transition: background-color 5000s ease-in-out 0s;
        }

        .btn-signin {
          width: 100%;
          height: 58px;
          background: #f97316;
          color: #fff;
          border: none;
          border-radius: 14px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          letter-spacing: 0.2px;
          transition: background 0.2s, transform 0.1s;
        }
        .btn-signin:hover { background: #ea6c0a; }
        .btn-signin:active { transform: scale(0.99); }
        .btn-signin:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
      `}),e.jsxs("div",{className:"mobile-wrap",children:[e.jsx("div",{className:"mobile-bg",children:e.jsxs("picture",{children:[e.jsx("source",{srcSet:C,type:"image/webp"}),e.jsx("img",{src:T,alt:"",className:`auth-bg-img ${v?"ready":""}`,loading:"eager",fetchPriority:"high",decoding:"async",onLoad:()=>S(!0)})]})}),e.jsxs("div",{className:"splash-content",style:{display:x==="login"?"none":"flex"},children:[e.jsx("img",{src:"/images/logo/connected_logo_dark.png",alt:"Connected",style:{width:"140px",objectFit:"contain",display:"block",margin:"0 auto 16px"}}),e.jsx("h1",{className:"splash-headline",children:"Your Future."}),e.jsx("span",{className:"splash-headline-orange",children:"Any Destination."}),e.jsxs("p",{className:"splash-body",children:["Your complete preparation platform for"," ",e.jsx("strong",{style:{fontWeight:700,color:"rgba(255,255,255,0.7)"},children:"studying abroad"}),"."]}),e.jsx("button",{className:"btn-start",onClick:M,children:"Get Started"})]}),x==="login"&&e.jsxs("div",{className:"login-sheet-overlay",children:[e.jsx("div",{className:`login-sheet-bg ${p?"visible":""}`,onClick:N}),e.jsxs("div",{className:`login-sheet ${p?"open":""}`,ref:I,children:[e.jsx("div",{className:"sheet-handle"}),e.jsxs("button",{className:"mobile-back-btn",onClick:N,children:[e.jsx("svg",{width:"16",height:"16",fill:"none",stroke:"currentColor",strokeWidth:"2",viewBox:"0 0 24 24",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M15 19l-7-7 7-7"})}),"Back"]}),e.jsx(B,{email:i,setEmail:k,password:a,setPassword:c,showPassword:m,setShowPassword:f,onSubmit:L})]})]})]}),e.jsxs("div",{className:"desktop-wrap",children:[e.jsxs("div",{className:"desktop-left-card",children:[e.jsx("div",{className:"desktop-left-img",children:e.jsxs("picture",{children:[e.jsx("source",{srcSet:A,type:"image/webp"}),e.jsx("img",{src:Y,alt:"",className:`auth-bg-img ${v?"ready":""}`,loading:"eager",fetchPriority:"high",decoding:"async",onLoad:()=>S(!0)})]})}),e.jsx("div",{className:"desktop-brand-top",children:e.jsx("img",{src:"/images/logo/connected_logo_dark.png",alt:"Connected Logo Dark",style:{width:"215px",height:"45px",objectFit:"contain"}})}),e.jsxs("div",{className:"desktop-hero-bottom",children:[e.jsx("h2",{className:"desktop-hero-headline",children:"Your Future."}),e.jsx("span",{className:"desktop-hero-headline-orange",children:"Any Destination."}),e.jsxs("p",{className:"desktop-hero-body",children:["Your complete preparation platform for"," ",e.jsx("strong",{style:{fontWeight:700,color:"rgba(255,255,255,0.8)"},children:"studying abroad"}),"."]})]})]}),e.jsx("div",{className:"desktop-right-card",children:e.jsx(B,{email:i,setEmail:k,password:a,setPassword:c,showPassword:m,setShowPassword:f,onSubmit:L})})]})]})}function B({email:x,setEmail:u,password:m,setPassword:f,showPassword:i,setShowPassword:k,onSubmit:a}){const[c,p]=o.useState(!1),w=async n=>{p(!0);try{await a(n)}finally{p(!1)}};return e.jsxs("form",{onSubmit:w,children:[e.jsxs("h1",{className:"form-title",children:["Welcome",e.jsx("span",{className:"form-title-dot",children:"."})]}),e.jsx("p",{className:"form-sub",children:"Sign in to get access to your training materials."}),e.jsxs("div",{className:"field",children:[e.jsx("label",{htmlFor:"email",children:"Email"}),e.jsxs("div",{className:"input-wrap",children:[e.jsx("span",{className:"input-icon",children:e.jsx("svg",{width:"18",height:"18",fill:"none",stroke:"currentColor",strokeWidth:"1.5",viewBox:"0 0 24 24",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"})})}),e.jsx("input",{id:"email",type:"email",placeholder:"Enter your email",value:x,onChange:n=>u(n.target.value),autoComplete:"email",required:!0})]})]}),e.jsxs("div",{className:"field",children:[e.jsx("label",{htmlFor:"password",children:"Password"}),e.jsxs("div",{className:"input-wrap",children:[e.jsx("span",{className:"input-icon",children:e.jsx("svg",{width:"18",height:"18",fill:"none",stroke:"currentColor",strokeWidth:"1.5",viewBox:"0 0 24 24",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"})})}),e.jsx("input",{id:"password",type:i?"text":"password",placeholder:"Enter your password",value:m,onChange:n=>f(n.target.value),autoComplete:"current-password",required:!0}),e.jsx("button",{type:"button",className:"eye-btn",onClick:()=>k(!i),children:i?e.jsx("svg",{width:"18",height:"18",fill:"none",stroke:"currentColor",strokeWidth:"1.5",viewBox:"0 0 24 24",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"})}):e.jsxs("svg",{width:"18",height:"18",fill:"none",stroke:"currentColor",strokeWidth:"1.5",viewBox:"0 0 24 24",children:[e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"}),e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M15 12a3 3 0 11-6 0 3 3 0 016 0z"})]})})]})]}),e.jsx("div",{className:"forgot-row",children:e.jsx("a",{href:"/forgot-password",className:"forgot",children:"Forgot password?"})}),e.jsx("button",{type:"submit",className:"btn-signin",disabled:c,children:c?"Signing in…":"Sign In"})]})}function $(){return e.jsxs(e.Fragment,{children:[e.jsx(O,{title:"ConnectedEducation",description:"ConnectedEducation"}),e.jsx(R,{children:e.jsx(G,{})})]})}export{$ as default};
