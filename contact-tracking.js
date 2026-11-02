/* A click or submitted inquiry is not a confirmed booking. Analytics receives no form field values. */
(() => {
  if (window.biminiContactTracking) return;
  window.biminiContactTracking = true;
  const page = location.pathname, pendingKey = 'biminiPendingInquiry';
  const track = (name, extra = {}) => {
    if (typeof window.gtag === 'function') window.gtag('event', name, {
      site_name:'Bimini Boat Tours', page_path:page, source_page:page,
      transport_type:'beacon', ...extra
    });
  };
  const upsert = (form,name,value) => {
    let input = form.querySelector('input[name="'+name+'"]');
    if (!input) { input=document.createElement('input');input.type='hidden';input.name=name;form.appendChild(input); }
    input.value=value;
  };
  const initializeForms = () => {
    document.querySelectorAll('form[action="/api/contact"]').forEach(form => {
      upsert(form,'Landing Page',page);upsert(form,'Landing Title',document.title);
      let started=false;
      form.addEventListener('input',() => {if(!started){started=true;track('inquiry_start',{contact_method:'form'});}});
      form.addEventListener('submit',() => {
        if (form.elements.namedItem('bot-field')?.value) return;
        track('submit_lead_form',{contact_method:'form',form_id:form.id||'contact-form'});
        // The native server returns to the confirmation page after accepting the inquiry.
        try {sessionStorage.setItem(pendingKey,JSON.stringify({time:Date.now(),page}));} catch {}
      });
    });
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',initializeForms);else initializeForms();
  document.addEventListener('click',event => {
    const a=event.target.closest?.('a[href]');if(!a)return;
    let u;try{u=new URL(a.href,location.href);}catch{return;}
    const phone=u.protocol==='tel:',whatsapp=u.hostname==='wa.me'&&u.pathname==='/13054570817';
    if(!phone&&!whatsapp)return;
    const placement=a.closest('.sticky-mobile-actions')?'mobile':a.closest('header')?'header':a.closest('footer')?'footer':a.closest('.hero')?'hero':'content';
    track(phone?'click_call':'click_whatsapp',{contact_method:phone?'phone':'whatsapp',contact_placement:placement});
  });
  if(page==='/thank-you'||page==='/thank-you.html'){
    let pending=null;try{pending=JSON.parse(sessionStorage.getItem(pendingKey));sessionStorage.removeItem(pendingKey);}catch{}
    let ownReferrer=false;try{ownReferrer=['biminiboattours.com','www.biminiboattours.com'].includes(new URL(document.referrer).hostname);}catch{}
    const age=pending?Date.now()-pending.time:-1;
    if(ownReferrer&&age>=0&&age<5*60*1000&&typeof pending.page==='string'&&/^\/(?!\/)[A-Za-z0-9/_-]*$/.test(pending.page)) track('generate_lead',{contact_method:'form',source_page:pending.page});
  }
})();
