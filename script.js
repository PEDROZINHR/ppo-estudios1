/* PPO ESTÚDIOS — protótipo front-end
   Perfis e preferências ficam apenas no armazenamento local deste navegador.
   Para autenticação real, streaming e sincronização entre dispositivos será necessário um backend.
*/
const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];

const AVATARS = [
  {id:"pedro",emoji:"⚡",name:"Pedro Prime"},
  {id:"tortugon",emoji:"🐢",name:"Tortugon"},
  {id:"joaozinho",emoji:"🧦",name:"Joãozinho"},
  {id:"daelos",emoji:"🪄",name:"Daelos"},
  {id:"eva",emoji:"🤖",name:"EVA"},
  {id:"marcos",emoji:"🌌",name:"Marcos"},
  {id:"jan",emoji:"🌀",name:"JAN.EXE"},
  {id:"sinistro",emoji:"🌑",name:"Sinistro"}
];

const known = [
  {id:1,title:"Pedro Prime",kind:"series",type:"SÉRIE ORIGINAL",desc:"Um adolescente descobre poderes extraordinários enquanto tenta entender seu lugar em um mundo muito maior do que imaginava.",glyph:"P",colors:["#075da8","#020b19"],featured:true},
  {id:2,title:"Novos Heróis da PPO Estúdios",kind:"film",type:"FILME",desc:"Uma reunião de novos personagens e histórias do universo PPO.",glyph:"✦",colors:["#31577e","#07101b"],featured:true},
  {id:3,title:"Marcos — A Era de Aetherion",kind:"film",type:"FILME",desc:"Uma aventura original ambientada na era de Aetherion.",glyph:"A",colors:["#775d36","#15101b"],featured:true},
  {id:4,title:"A Origem de JAN.EXE",kind:"film",type:"FILME",desc:"O começo de uma história misteriosa ligada a JAN.EXE.",glyph:"J",colors:["#513a83","#0b0a18"],featured:true},
  {id:5,title:"Ditador JP — A Verdade",kind:"film",type:"FILME",desc:"Uma produção original da PPO Estúdios.",glyph:"JP",colors:["#69443e","#100c12"],featured:true}
];

const catalog = [...known];
for(let i=6;i<=100;i++){
  const animation = [8,13,17,22,26,31,36,41,46,51,57,63,69,75,81,87,93,98].includes(i);
  const series = [11,19,28,34,43,52,61,70,79,88,97].includes(i);
  catalog.push({
    id:i,
    title:`Projeto PPO ${String(i).padStart(3,"0")}`,
    kind:series?"series":"film",
    type:animation?"ANIMAÇÃO EM DESENVOLVIMENTO":series?"SÉRIE EM DESENVOLVIMENTO":"FILME EM DESENVOLVIMENTO",
    desc:"Título e detalhes desta produção serão anunciados em breve. Fique de olho nas novidades da PPO Estúdios.",
    glyph:animation?"✦":series?"S":"＋",
    colors: animation?["#426c65","#0a1720"]:series?["#354e7a","#0a1020"]:["#344a65","#080e18"],
    placeholder:true,
    animation
  });
}

let profiles = JSON.parse(localStorage.getItem("ppo_profiles") || "[]");
let activeProfile = Number(localStorage.getItem("ppo_active_profile") || 0);
let selectedAvatar = AVATARS[0].id;
let activeView = "home";
let activeLetter = "Todos";
let toastTimer;

function saveProfiles(){localStorage.setItem("ppo_profiles",JSON.stringify(profiles));}
function notify(message){
  const el=$("#toast");el.textContent=message;el.classList.add("show");
  clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),2300);
}
function showScreen(id){
  ["login-screen","profile-screen","browse-screen"].forEach(x=>$("#"+x).classList.toggle("is-hidden",x!==id));
}
function renderAvatarPicker(){
  $("#avatar-picker").innerHTML=AVATARS.map(a=>`<button type="button" class="avatar-option ${a.id===selectedAvatar?"selected":""}" data-avatar="${a.id}" title="${a.name}" aria-label="${a.name}" aria-pressed="${a.id===selectedAvatar}">${a.emoji}</button>`).join("");
  $$(".avatar-option").forEach(b=>b.addEventListener("click",()=>{selectedAvatar=b.dataset.avatar;renderAvatarPicker()}));
}
function renderProfiles(){
  $("#profile-list").innerHTML=profiles.map((p,i)=>`<button class="profile-tile" data-profile="${i}"><span class="avatar-face">${AVATARS.find(a=>a.id===p.avatar)?.emoji||"⚡"}</span><strong>${escapeHtml(p.name)}</strong></button>`).join("");
  $$(".profile-tile").forEach(b=>b.addEventListener("click",()=>activateProfile(Number(b.dataset.profile))));
}
function escapeHtml(str){return String(str).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function activateProfile(index){
  activeProfile=index;localStorage.setItem("ppo_active_profile",String(index));
  const p=profiles[index];$("#active-name").textContent=p.name;$("#active-avatar").textContent=AVATARS.find(a=>a.id===p.avatar)?.emoji||"⚡";
  showScreen("browse-screen");goView("home");notify(`Bem-vindo, ${p.name}.`);
}
function enter(){
  const name=$("#login-name").value.trim();
  if(!name){notify("Digite seu nome para continuar.");$("#login-name").focus();return;}
  const existing=profiles.findIndex(p=>p.name.toLowerCase()===name.toLowerCase());
  if(existing>=0){activateProfile(existing);return;}
  $("#profile-name").value=name;showScreen("profile-screen");renderProfiles();renderAvatarPicker();
}
function createProfile(){
  const name=$("#profile-name").value.trim();
  if(!name){notify("Escolha um nome para o perfil.");$("#profile-name").focus();return;}
  if(profiles.length>=6){notify("Limite de 6 perfis neste protótipo.");return;}
  profiles.push({name,avatar:selectedAvatar});
  saveProfiles();renderProfiles();activateProfile(profiles.length-1);
}
function posterCard(item){
  const [c1,c2]=item.colors;
  const title=escapeHtml(item.title);
  return `<article class="poster-card" data-item="${item.id}" tabindex="0" role="button" aria-label="Ver ${title}">
    <div class="poster-art" style="--c1:${c1};--c2:${c2}">
      <span class="poster-serial">PPO • ${String(item.id).padStart(3,"0")}</span>
      <span class="poster-glyph">${escapeHtml(item.glyph)}</span>
      <div class="poster-copy"><div class="poster-status">${item.placeholder?"EM BREVE":item.id===1?"SÉRIE ORIGINAL":"PPO ORIGINAL"}</div><div class="poster-title">${title}</div><div class="poster-type">${item.type}</div></div>
    </div>
  </article>`;
}
function bindCards(root){
  $$(".poster-card",root).forEach(card=>{
    const open=()=>openTitle(Number(card.dataset.item));
    card.addEventListener("click",open);
    card.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();open();}});
  });
}
function fillGrid(selector,items){
  const el=$(selector);el.innerHTML=items.map(posterCard).join("");bindCards(el);
}
function openTitle(id){
  const item=catalog.find(x=>x.id===id);if(!item)return;
  $("#modal-title").textContent=item.title;
  $("#modal-description").textContent=item.desc;
  $("#modal-art").textContent=item.glyph;
  $("#title-modal").classList.remove("is-hidden");
}
function closeModal(){$("#title-modal").classList.add("is-hidden");}
function goView(view){
  activeView=view;
  $$(".view").forEach(v=>v.classList.add("is-hidden"));
  const target=$("#"+view+"-view");if(target)target.classList.remove("is-hidden");
  $$(".nav-link").forEach(b=>b.classList.toggle("active",b.dataset.view===view));
  $("#search-panel").classList.add("is-hidden");
  window.scrollTo({top:0,behavior:"smooth"});
  if(view==="films")fillGrid("#films-grid",catalog.filter(x=>x.kind==="film"));
  if(view==="series")fillGrid("#series-grid",catalog.filter(x=>x.kind==="series"));
  if(view==="productions")renderCatalog();
}
function renderCatalog(){
  const filter=$("#catalog-filter").value;
  let items=catalog.filter(x=>filter==="all"||(filter==="film"&&x.kind==="film")||(filter==="series"&&x.kind==="series")||(filter==="animation"&&x.animation));
  $("#catalog-count").textContent=`${items.length} PRODUÇÕES`;
  fillGrid("#all-grid",items);
}
function renderHome(){
  fillGrid("#coming-soon-row",catalog.filter(x=>x.id!==1).slice(0,5));
  fillGrid("#featured-row",known);
}
function renderSearch(){
  const query=$("#search-input").value.trim().toLocaleLowerCase("pt-BR");
  let items=catalog.filter(x=>{
    const matchesQuery=!query||x.title.toLocaleLowerCase("pt-BR").includes(query);
    const matchesLetter=activeLetter==="Todos"||x.title.toLocaleUpperCase("pt-BR").startsWith(activeLetter);
    return matchesQuery&&matchesLetter;
  });
  $("#search-results").innerHTML=items.length?items.map(posterCard).join(""):`<div class="search-results-empty">Nenhuma produção encontrada. Tente outro título ou letra.</div>`;
  bindCards($("#search-results"));
}
function buildAlphabet(){
  const letters=["Todos",..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")];
  $("#alphabet-filter").innerHTML=letters.map(l=>`<button class="letter-button ${l===activeLetter?"active":""}" data-letter="${l}">${l==="Todos"?"TODOS":l}</button>`).join("");
  $$(".letter-button").forEach(b=>b.addEventListener("click",()=>{activeLetter=b.dataset.letter;buildAlphabet();renderSearch();}));
}
function toggleSearch(force){
  const panel=$("#search-panel");
  const open=typeof force==="boolean"?force:panel.classList.contains("is-hidden");
  panel.classList.toggle("is-hidden",!open);
  if(open){$("#search-input").focus();renderSearch();}
}
function initialize(){
  renderHome();buildAlphabet();renderAvatarPicker();
  $("#intro").addEventListener("animationend",()=>{$("#intro").classList.add("is-hidden");$("#app").classList.remove("is-hidden");},{once:true});
  // Fallback in browsers that do not dispatch animationend for visibility.
  setTimeout(()=>{$("#intro").classList.add("is-hidden");$("#app").classList.remove("is-hidden");},3900);
  $("#enter-button").addEventListener("click",enter);
  $("#login-name").addEventListener("keydown",e=>{if(e.key==="Enter")enter()});
  $("#create-profile").addEventListener("click",createProfile);
  $("#profile-name").addEventListener("keydown",e=>{if(e.key==="Enter")createProfile()});
  $("#back-login").addEventListener("click",()=>showScreen("login-screen"));
  $("#profile-menu").addEventListener("click",()=>{renderProfiles();showScreen("profile-screen")});
  $("#search-toggle").addEventListener("click",()=>toggleSearch());
  $("#search-input").addEventListener("input",renderSearch);
  $("#clear-search").addEventListener("click",()=>{$("#search-input").value="";activeLetter="Todos";buildAlphabet();renderSearch();$("#search-input").focus()});
  $("#catalog-filter").addEventListener("change",renderCatalog);
  $("#modal-close").addEventListener("click",closeModal);
  $("#title-modal").addEventListener("click",e=>{if(e.target.id==="title-modal")closeModal()});
  document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeModal();toggleSearch(false)}});
  $$("[data-view]").forEach(b=>b.addEventListener("click",()=>goView(b.dataset.view)));
  $$("[data-modal]").forEach(b=>b.addEventListener("click",()=>openTitle(1)));
  if(profiles.length){renderProfiles();showScreen("profile-screen");}else{showScreen("login-screen");}
}
initialize();
