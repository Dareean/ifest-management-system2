module.exports=[78494,a=>{"use strict";async function b(a){let b,c=process.env.FONNTE_API_TOKEN;if(!c)return console.error("FONNTE_API_TOKEN not configured in environment variables"),{status:!1,message:"Fonnte API token not configured"};let d=((b=a.phone.replace(/\D/g,"")).startsWith("0")&&(b="62"+b.slice(1)),b.startsWith("62")||(b="62"+b),b);try{let b=new URLSearchParams;b.append("target",d),b.append("message",a.message),a.url&&b.append("url",a.url);let e=await fetch("https://api.fonnte.com/send",{method:"POST",headers:{Authorization:c,"Content-Type":"application/x-www-form-urlencoded"},body:b.toString()}),f=await e.json();if(!e.ok)return console.error("Fonnte API error:",f),{status:!1,message:f.message||"Failed to send WhatsApp message"};return f}catch(a){return console.error("Error sending WhatsApp message:",a),{status:!1,message:a instanceof Error?a.message:"Unknown error"}}}a.s(["formatWhatsAppMessage",0,function(a){let b=`*${a.title}*

${a.body}`;return a.footer&&(b+=`

_${a.footer}_`),b},"sendWhatsAppMessage",0,b])}];

//# sourceMappingURL=src_lib_fonnte_ts_0b2sdxv._.js.map