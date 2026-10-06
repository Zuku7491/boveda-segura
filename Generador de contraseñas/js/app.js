const $=s=>document.querySelector(s);
const S={rot:0};
const COMMON=["password","contrasena","123456","qwerty","admin","abc123","letmein","welcome","iloveyou","dragon","monkey","football","111111","000000","hola","amor","futbol","usuario","secreto","login","master","princesa"];
const WORDS="Luna Cobre Bosque Tigre Nube Faro Cometa Ancla Rio Trueno Jaguar Sombra Pluma Volcan Delfin Brujula Mango Neblina Ambar Tormenta Galleta Cohete Isla Relampago".split(" ");
const LEET={0:"o",1:"i",3:"e",4:"a",5:"s",7:"t","$":"s","@":"a","!":"i"};
const norm=s=>s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[0134577$@!]/g,c=>LEET[c]||c);
const LOCKS=[
["Longitud","Usa al menos 12 caracteres. Cada carácter extra multiplica el trabajo del atacante."],
["Combinación","Mezcla mayúsculas, minúsculas, números y símbolos."],
["Evita lo obvio","Sin palabras comunes, fechas ni secuencias como 123. Los nombres y cumpleaños también se adivinan fácil."],
["Frase secreta","Varias palabras únicas con números y símbolos: fácil para ti, difícil para ellos."],
["Cambio regular","Cambiarla limita el tiempo que sirve una contraseña robada."]];
const N=LOCKS.length,STEP=360/N,R=118;
function pt(a,r){a=a*Math.PI/180;return[150+r*Math.cos(a),150+r*Math.sin(a)]}
LOCKS.forEach((_,i)=>{const[x1,y1]=pt(i*STEP-90+3,R),[x2,y2]=pt((i+1)*STEP-90-3,R),[tx,ty]=pt(i*STEP-90+STEP/2,R);
$("#segs").insertAdjacentHTML("beforeend",`<path class="seg" id="s${i}" d="M${x1} ${y1}A${R} ${R} 0 0 1 ${x2} ${y2}"/><text class="segn" x="${tx}" y="${ty}">${i+1}</text>`)});
$("#locks").innerHTML=LOCKS.map((l,i)=>`<div class="lock" id="l${i}"><h3><i>${i+1}</i>${l[0]}</h3><p>${l[1]}</p><div id="x${i}"></div><div class="st" id="t${i}"></div></div>`).join("");
$("#x4").innerHTML=`<div class="seg2"><button data-r="3">Cada 3 meses</button><button data-r="6">Cada 6 meses</button></div>`;
function fmt(s){const f=n=>n.toLocaleString("es",{maximumFractionDigits:2});
if(s<1)return"Menos de un segundo";if(s<60)return f(s)+" segundos";let m=s/60;if(m<60)return f(m)+" minutos";let h=m/60;if(h<24)return f(h)+" horas";let d=h/24;if(d<365)return f(d)+" días";let y=d/365;
if(y<100)return f(y)+" años";if(y<1000)return f(y/100)+" siglos";let k=y/1000;return k>1e9?k.toExponential(1).replace("e+"," × 10^")+" milenios":f(k)+" milenios"}
const RATE=Math.pow(95,3)/0.86;
const pool=p=>(/[a-z]/.test(p)?26:0)+(/[A-Z]/.test(p)?26:0)+(/\d/.test(p)?10:0)+(/[^A-Za-z0-9]/.test(p)?33:0);
const words=p=>(p.replace(/([a-z])([A-Z])/g,"$1 $2").match(/[A-Za-z]{3,}/g)||[]).length;
function obvious(p){const n=norm(p);
for(const c of COMMON)if(n.includes(c))return`contiene la palabra común “${c}”`;
if(/(19|20)\d\d/.test(p))return"contiene algo parecido a un año o fecha";
if(/(012|123|234|345|456|567|678|789|abc|qwe)/i.test(p))return"contiene una secuencia fácil";
return""}
function update(){
const p=$("#pw").value,a=[],why=p?obvious(p):"";
a[0]=p.length>=12;
a[1]=/[a-z]/.test(p)&&/[A-Z]/.test(p)&&/\d/.test(p)&&/[^A-Za-z0-9]/.test(p);
a[2]=!!p&&!why;
a[3]=words(p)>=3&&a[0]&&a[2];
a[4]=S.rot>0;
const st=[];
st[0]=p?`${p.length} de 12 caracteres`:"Sin contraseña";
st[1]=p?[/[A-Z]/.test(p)?"A-Z":"",/[a-z]/.test(p)?"a-z":"",/\d/.test(p)?"0-9":"",/[^A-Za-z0-9]/.test(p)?"símbolos":""].filter(Boolean).join(" · ")||"—":"Sin contraseña";
st[2]=!p?"Sin contraseña":why?"Falla: "+why:"Nada obvio detectado";
st[3]=!p?"Sin contraseña":a[3]?`Se detectan ${words(p)} palabras`:"Necesita 3 palabras o más, y pasar las cerraduras 1 y 3";
if(S.rot){const d=new Date();d.setMonth(d.getMonth()+S.rot);st[4]="Próximo cambio: "+d.toLocaleDateString("es",{day:"numeric",month:"long",year:"numeric"})}else st[4]="Elige cada cuánto la cambiarás";
let n=0;
a.forEach((v,i)=>{n+=v;$("#l"+i).classList.toggle("open",v);$("#s"+i).classList.toggle("on",v);$("#t"+i).textContent=(v?"Abierta: ":"Cerrada: ")+st[i]});
$("#pct").textContent=n+"/"+N;
$("#verd").textContent=n==N?"Blindada":n>=4?"Casi blindada":n>=2?"Reforzando":"Vulnerable";
$("#vault").classList.toggle("full",n==N);
$("#dial").style.transform=`rotate(${n*STEP}deg)`;
$("#time").textContent=p?fmt(Math.pow(pool(p),p.length)/RATE):"—";
$("#msg").textContent=!p?"Escribe una contraseña o pulsa Generar.":why?"Cuidado: "+why+".":n>=4?"Va bien. Revisa las cerraduras que siguen cerradas.":"Sigue sumando cerraduras.";
$("#msg").className="msg"+(why?" bad":"");
document.querySelectorAll("[data-r]").forEach(b=>b.classList.toggle("sel",+b.dataset.r===S.rot));
const L=Math.min(p.length,12);let h="";
for(let i=3;i<=12;i++){const t=0.86*Math.pow(95,i-3),w=(Math.log10(t)+.1)/(Math.log10(0.86*Math.pow(95,9))+.1)*100,c=i<=5?"var(--bad)":i<=8?"var(--gold2)":i<=10?"#f08a24":"var(--ok)";
h+=`<div class="tr ${i===L?"me":""}"><span>${i}</span><div class="b" style="width:${Math.max(w,3)}%;background:${c}"></div><span>${fmt(t)}</span></div>`}
$("#tbl").innerHTML=h}
const r=n=>crypto.getRandomValues(new Uint32Array(1))[0]%n;
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=r(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
function leet(w){const m={a:"4",e:"3",o:"0",i:"1",s:"5"},ix=[...w].map((c,i)=>m[c.toLowerCase()]?i:-1).filter(i=>i>=0);
if(!ix.length)return w;const k=ix[r(ix.length)];return w.slice(0,k)+m[w[k].toLowerCase()]+w.slice(k+1)}
function build(base){const sy="!#$%&*+?@";let ws=base.slice();
while(ws.length<3)ws.push(WORDS[r(WORDS.length)]);
shuffle(ws);const k=r(ws.length);ws[k]=leet(ws[k]);
let p=ws.join("")+(10+r(90))+sy[r(sy.length)];
while(p.length<12)p=ws.join("")+WORDS[r(WORDS.length)]+(10+r(90))+sy[r(sy.length)];
return p}
$("#gen").onclick=()=>{
const base=$("#pers").value.split(",").map(x=>x.trim().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^A-Za-z]/g,"")).filter(x=>x.length>=2).map(w=>w[0].toUpperCase()+w.slice(1).toLowerCase());
let p="";for(let i=0;i<30;i++){p=build(base);if(!obvious(p))break}
$("#pw").value=p;$("#pw").type="text";$("#eye").textContent="Ocultar";update();
$("#msg").className="msg";$("#msg").textContent=base.length?`Generada con tus ${base.length} palabra${base.length>1?"s":""}, mezcladas con un número y un símbolo.`:"Generada al azar. Escribe tus palabras arriba para usarlas como base."};
$("#pw").addEventListener("input",update);
$("#eye").onclick=()=>{const i=$("#pw");i.type=i.type==="password"?"text":"password";$("#eye").textContent=i.type==="password"?"Ver":"Ocultar"};
$("#copy").onclick=async()=>{try{await navigator.clipboard.writeText($("#pw").value);$("#copy").textContent="Copiada";setTimeout(()=>$("#copy").textContent="Copiar",1400)}catch(e){$("#msg").textContent="No se pudo copiar. Selecciónala y cópiala a mano."}};
$("#clr").onclick=()=>{$("#pw").value="";$("#pers").value="";S.rot=0;$("#pw").type="password";$("#eye").textContent="Ver";update();$("#pw").focus()};
document.addEventListener("click",e=>{const v=e.target.dataset&&e.target.dataset.r;if(v){S.rot=+v;update()}});
update();