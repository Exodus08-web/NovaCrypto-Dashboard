// GLOBAL VARIABLES
let overview, watch, gainers, losers, coinQuick;
let coins=[], watchlist=JSON.parse(localStorage.getItem("watch"))||[], chartInstance=null;

// LOGIN
document.getElementById("loginBtn").addEventListener("click", login);
document.getElementById("logoutBtn").addEventListener("click", logout);

function login(){
  const u=document.getElementById("username").value;
  const p=document.getElementById("password").value;
  if(u && p){
    localStorage.setItem("loggedIn","true");
    document.getElementById("loginPage").style.display="none";
    document.getElementById("dashboard").style.display="flex";
    initDashboard();
  } else alert("Enter username & password");
}

function logout(){
  localStorage.removeItem("loggedIn");
  document.getElementById("dashboard").style.display="none";
  document.getElementById("loginPage").style.display="flex";
}

// TAB SWITCH
document.querySelectorAll(".tabBtn").forEach(btn=>{
  btn.addEventListener("click", ()=>switchTab(btn.dataset.tab, btn));
});

function switchTab(tab, btn){
  document.querySelectorAll(".tabBtn").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active");
  overview.style.display = tab==="overview"?"grid":"none";
  watch.style.display = tab==="watchlist"?"grid":"none";
  gainers.style.display = tab==="gainers"?"grid":"none";
  losers.style.display = tab==="losers"?"grid":"none";
  document.getElementById("detail").style.display="none";
}

// BACK BUTTON
document.getElementById("backBtn").addEventListener("click", ()=>{
  document.getElementById("detail").style.display="none";
  overview.style.display="grid";
  renderWatch(); renderGainers(); renderLosers();
});

// ADD TO WATCHLIST
function addWatch(name){
  if(!watchlist.includes(name)){
    watchlist.push(name);
    localStorage.setItem("watch",JSON.stringify(watchlist));
    renderWatch();
  }
}

// SHOW DETAIL WITH SIMULATED LINE CHART
function showDetail(name){
  overview.style.display="none"; watch.style.display="none"; gainers.style.display="none"; losers.style.display="none";
  const detail=document.getElementById("detail");
  detail.style.display="block";
  document.getElementById("coinTitle").innerText=name;

  const coin = coins.find(c=>c.name===name);

  // Generate simulated chart data (numeric x, safe)
  if(!coin.candles || coin.candles.length===0){
    coin.candles = Array.from({length:30}, (_,i)=>({x:i, y: +(Math.random()*50000+1000).toFixed(2)}));
  }

  // Destroy old chart safely
  if(chartInstance){ chartInstance.destroy(); chartInstance=null; }

  const ctx = document.getElementById("bigChart").getContext("2d");
  chartInstance = new Chart(ctx,{
    type:'line',
    data:{datasets:[{label:name, data:coin.candles, fill:true, borderColor:'#00f0ff', backgroundColor:'rgba(128,0,255,0.2)'}]},
    options:{
      responsive:true,
      plugins:{legend:{display:false}, zoom:{zoom:{wheel:{enabled:true}, pinch:{enabled:true}, mode:'x'}}},
      scales:{x:{type:'linear'}, y:{beginAtZero:false}}
    }
  });
}

// RENDER FUNCTIONS
function renderOverview(data){
  overview.innerHTML="";
  data.forEach(c=>{
    const div=document.createElement("div");
    div.className="card";
    div.innerHTML=`<h3>${c.name}</h3><div>${c.symbol}</div><div class="price">$${c.price}</div><div class="${c.change>0?'green':'red'}">${c.change}%</div><button class="add">Add</button>`;
    div.querySelector(".add").addEventListener("click", e=>{e.stopPropagation(); addWatch(c.name);});
    div.addEventListener("click", ()=>showDetail(c.name));
    overview.appendChild(div);
  });
}

function renderWatch(){
  watch.innerHTML="";
  watchlist.forEach(name=>{
    const coin=coins.find(c=>c.name===name)||{price:(Math.random()*50000).toFixed(2)};
    const div=document.createElement("div"); div.className="card"; div.innerHTML=`<h3>${name}</h3><div>$${coin.price}</div>`;
    watch.appendChild(div);
  });
}

function renderGainers(){
  gainers.innerHTML=""; coins.sort((a,b)=>b.change-a.change).forEach(c=>{
    const div=document.createElement("div"); div.className="card";
    div.innerHTML=`<h3>${c.name}</h3><div class="price">$${c.price}</div><div class="green">${c.change}</div>`;
    div.addEventListener("click", ()=>showDetail(c.name)); gainers.appendChild(div);
  });
}

function renderLosers(){
  losers.innerHTML=""; coins.sort((a,b)=>a.change-b.change).forEach(c=>{
    const div=document.createElement("div"); div.className="card";
    div.innerHTML=`<h3>${c.name}</h3><div class="price">$${c.price}</div><div class="red">${c.change}</div>`;
    div.addEventListener("click", ()=>showDetail(c.name)); losers.appendChild(div);
  });
}

// SEARCH
document.getElementById("search").addEventListener("input", e=>{
  const val=e.target.value.toLowerCase();
  renderOverview(coins.filter(c=>c.name.toLowerCase().includes(val)||c.symbol.toLowerCase().includes(val)));
});

// QUICK SELECT
function renderQuickSelect(){
  coinQuick.innerHTML="";
  coins.forEach(c=>{
    const btn=document.createElement("button");
    btn.innerText=c.name;
    btn.addEventListener("click",()=>showDetail(c.name));
    coinQuick.appendChild(btn);
  });
}

// SIMULATE LIVE PRICES
function simulatePrices(){
  coins.forEach(c=>{
    const factor=0.98+Math.random()*0.04;
    c.price=(parseFloat(c.price)*factor).toFixed(2);
    c.change=(Math.random()*20-10).toFixed(2);
    c.candles.push({x:c.candles.length, y:+c.price});
    if(c.candles.length>30) c.candles.shift();
  });
  renderOverview(coins); renderWatch(); renderGainers(); renderLosers();

  if(chartInstance){
    const name=document.getElementById("coinTitle").innerText;
    const coin=coins.find(c=>c.name===name);
    chartInstance.data.datasets[0].data = coin.candles;
    chartInstance.update();
  }
}

// INIT DASHBOARD
function initDashboard(){
  overview=document.getElementById("overview");
  watch=document.getElementById("watchlist");
  gainers=document.getElementById("gainers");
  losers=document.getElementById("losers");
  coinQuick=document.getElementById("coinQuickSelect");

  const coinNames=["Bitcoin","Ethereum","Cardano","Solana","Dogecoin","Polkadot","Litecoin","Avalanche","Chainlink","Polygon","Uniswap","Stellar","TRON","VeChain","Cosmos","Algorand","Shiba Inu","Fantom","Tezos","NEAR"];
  coins=coinNames.map(name=>({name,symbol:name.slice(0,3).toUpperCase(),price:(Math.random()*50000).toFixed(2),change:(Math.random()*20-10).toFixed(2),candles:[]}));

  renderOverview(coins); renderWatch(); renderGainers(); renderLosers(); renderQuickSelect();
  setInterval(simulatePrices,5000);
}

// AUTO LOGIN
if(localStorage.getItem("loggedIn")){
  document.getElementById("loginPage").style.display="none";
  document.getElementById("dashboard").style.display="flex";
  initDashboard();
}