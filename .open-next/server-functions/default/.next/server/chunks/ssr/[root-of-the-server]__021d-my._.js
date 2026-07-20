module.exports=[64240,(a,b,c)=>{"use strict";function d(a){if("function"!=typeof WeakMap)return null;var b=new WeakMap,c=new WeakMap;return(d=function(a){return a?c:b})(a)}c._=function(a,b){if(!b&&a&&a.__esModule)return a;if(null===a||"object"!=typeof a&&"function"!=typeof a)return{default:a};var c=d(b);if(c&&c.has(a))return c.get(a);var e={__proto__:null},f=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var g in a)if("default"!==g&&Object.prototype.hasOwnProperty.call(a,g)){var h=f?Object.getOwnPropertyDescriptor(a,g):null;h&&(h.get||h.set)?Object.defineProperty(e,g,h):e[g]=a[g]}return e.default=a,c&&c.set(a,e),e}},93695,(a,b,c)=>{b.exports=a.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},10585,a=>{a.v("/_next/static/media/favicon.2vob68tjqpejf.ico"+(globalThis.NEXT_CLIENT_ASSET_SUFFIX||""))},68611,a=>{"use strict";let b={src:a.i(10585).default,width:256,height:256};a.s(["default",0,b])},50657,a=>{"use strict";a.s(["LetterDetailClient",()=>b]);let b=(0,a.i(11857).registerClientReference)(function(){throw Error("Attempted to call LetterDetailClient() from the server but LetterDetailClient is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/src/app/dashboard/letters/[id]/client.tsx <module evaluation>","LetterDetailClient")},65536,a=>{"use strict";a.s(["LetterDetailClient",()=>b]);let b=(0,a.i(11857).registerClientReference)(function(){throw Error("Attempted to call LetterDetailClient() from the server but LetterDetailClient is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/src/app/dashboard/letters/[id]/client.tsx","LetterDetailClient")},87131,a=>{"use strict";a.i(50657);var b=a.i(65536);a.n(b)},49190,a=>{"use strict";var b=a.i(7997);a.i(70396);var c=a.i(73727),d=a.i(20539);async function e(a){let b=(0,d.createAdminClient)(),{data:c}=await b.from("letter_requests").select(`
      id,
      letter_type,
      subject,
      body,
      status,
      revision_count,
      final_document_url,
      deadline_at,
      target_institution,
      category,
      request_options,
      priority,
      created_at,
      updated_at,
      division:divisions(name),
      requester:committee_assignments!requester_id(user:profiles(full_name)),
      handler:committee_assignments!current_handler_id(user:profiles(full_name))
    `).eq("id",a).single();if(!c)return null;let{data:e}=await b.from("letter_revisions").select(`
      id,
      note,
      created_at,
      reviewer:committee_assignments(user:profiles(full_name))
    `).eq("letter_request_id",a).order("created_at",{ascending:!1});return{id:c.id,letterType:c.letter_type,subject:c.subject,body:c.body,status:c.status,revisionCount:c.revision_count??0,finalDocumentUrl:c.final_document_url,deadlineAt:c.deadline_at,targetInstitution:c.target_institution,category:c.category,requestOptions:c.request_options,priority:c.priority??"sedang",createdAt:c.created_at,updatedAt:c.updated_at,division:c.division?.name??"",requester:c.requester?.user?.full_name??"",handler:c.handler?.user?.full_name??null,revisions:(e??[]).map(a=>({id:a.id,note:a.note,reviewer:a.reviewer?.user?.full_name??"",createdAt:a.created_at}))}}var f=a.i(87131),g=a.i(16349),h=a.i(58235);async function i(a){let{id:i}=await a.params,j=await e(i);j||(0,c.notFound)();let k=await (0,g.createClient)(),{data:l}=await k.auth.getUser(),m=l?.user?.id;m||(0,c.redirect)("/login");let n=(0,d.createAdminClient)(),{data:o}=await n.from("committee_assignments").select("id, role:roles(slug)").eq("committee_year_id","c2f2a48e-3e58-4559-aaa0-623a3825348b").eq("user_id",m).eq("is_active",!0).maybeSingle(),p=o?.role?.slug??"",q=h.SECRETARY_SLUGS.includes(p);return(0,b.jsx)(f.LetterDetailClient,{letter:j,isApprover:q})}a.s(["default",0,i],49190)},87008,a=>{a.n(a.i(49190))}];

//# sourceMappingURL=%5Broot-of-the-server%5D__021d-my._.js.map