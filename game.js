
const $ = (q) => document.querySelector(q);

const clues = {
  1:"음악실은 20:58 관리자 마스터키 계열 카드로 열렸다.",
  2:"유리 보관함 자체에는 잠금장치가 없다.",
  3:"보관함 손잡이 아래쪽에 흰색 가루가 묻어 있다.",
  4:"음악실 문 근처에 큰 젖은 신발 자국 하나가 있다.",
  5:"6페이지 뒤에 '마지막은 원래대로.'라는 메모가 있다.",
  6:"문 옆에 검고 뻣뻣한 털 같은 물질이 떨어져 있다.",
  7:"흰 가루는 현악기용 로진일 가능성이 높다.",
  8:"검은 물질은 합성 브러시 섬유로 추정된다.",
  9:"젖은 신발 자국은 약 280mm이며 물만 있고 흙은 없다.",
  10:"사라진 7페이지는 최근 교체된 Ending B였다.",
  11:"20:58 사용된 것은 박민호 개인 카드가 아니라 비상용 마스터카드였다.",
  12:"박민호 신발 크기는 비슷하지만 현장 밑창 패턴과 다르다.",
  13:"'마지막은 원래대로.' 메모 작성자는 한유라다.",
  14:"보관함의 로진은 오후 리허설 때 묻었을 가능성이 있다.",
  15:"한유라 휴대폰에는 20:54~21:00 연속 바이올린 연습 녹음이 있다.",
  16:"서지안은 20:40경 Ending B를 포함한 악보 전체를 보관함에 넣었다.",
  17:"이태준은 Ending B 촬영을 두 차례 거절당했다.",
  18:"서지안은 20:58에 작곡가와 영상통화 중이었다.",
  19:"이태준은 20:50~21:05 정원에 있었다는 최초 진술을 수정했다.",
  20:"이태준 신발은 현장 자국과 크기와 밑창 패턴이 모두 일치한다.",
  21:"이태준은 묻지 않았는데도 '사진만 찍으면 된다'는 말을 먼저 꺼냈다.",
  22:"메모리카드에서 20:58 음악실 내부의 Ending B 사진이 복구됐다.",
  23:"삭제 사진 가장자리에 비상용 마스터카드로 보이는 카드가 찍혔다.",
  24:"최은경이 20:59경 음악실 앞에서 종이 한 장을 주워 의상실로 옮겼다."
};

const initialState = {
  started:false,
  scene:"intro",
  clues:[],
  visited:{music:false,lobby:false,park:false,yura:false,jian:false,tae:false},
  examined:{powder:false,fiber:false,shoe:false,memo:false,memory:false,sound:false,lobbyDesk:false,lobbyCard:false,lobbyTerminal:false,lobbyDelivery:false},
  interviews:{
    parkAbsence:false,parkCard:false,parkStorage:false,parkShoes:false,
    yuraEnding:false,yuraMemo:false,yuraRosin:false,yuraRecording:false,
    jianEnding:false,jianScore:false,jianRequest:false,jianCall:false,
    taeAlibi:false,taeContradiction:false,taeShoes:false,taeBrush:false,taePhoto:false
  },
  taePressed:false,
  solved:false
};

let state = loadState();

const sceneVisuals = {
  intro: {
    kicker: "THURSDAY · 21:10",
    title: "비 내리는 밤,<br>마지막 악보가 사라졌다.",
    location: "산속 음악회장 · 문라이트 하우스"
  },
  hub: {
    kicker: "FREE INVESTIGATION",
    title: "첫 단서는<br>어디에 남아 있을까?",
    location: "현장과 인물을 원하는 순서로 조사하세요"
  },
  music: { title: "침묵이 내려앉은 음악실" },
  powder: { title: "보관함에 남은 흰 가루" },
  fiber: { title: "문가에 떨어진 검은 섬유" },
  shoe: { title: "젖은 발자국 하나" },
  memo: { title: "6페이지 뒤의 짧은 문장" },
  lobby: { title: "잠시 비어 있던 관리 데스크" },
  "lobby-desk": { title: "관리 데스크에 남은 흔적" },
  "lobby-card": { title: "비상카드 보관함" },
  "lobby-terminal": { title: "출입 단말의 기록" },
  "lobby-delivery": { title: "입구에 모인 배송 상자" },
  park: { title: "관리자의 기억을 확인하다" },
  yura: { title: "바이올리니스트의 불만" },
  jian: { title: "마지막으로 악보를 본 사람" },
  tae: { title: "사진작가의 달라진 진술" },
  memory: { title: "지워진 기록을 복원하다" },
  sound: { title: "20시 59분, 복도의 소리" },
  solve: { title: "단서로 사건을 재구성한다" },
  ending: { title: "사건 파일을 닫을 시간" }
};

function updateSceneVisual(id, label){
  const visual = sceneVisuals[id] || { title: label };
  document.body.dataset.scene = id;
  $("#sceneKicker").textContent = visual.kicker || "MOONLIGHT HOUSE · CASE 001";
  $("#sceneTitle").innerHTML = visual.title || label;
  $("#sceneLocation").textContent = visual.location || "문라이트 하우스 수사 기록";
}

function saveState(){
  localStorage.setItem("moonlit_case001_bright_proto_v08b", JSON.stringify(state));
  updateUI();
}
function loadState(){
  try{
    const saved = JSON.parse(localStorage.getItem("moonlit_case001_bright_proto_v08b")||"{}");
    return {
      ...structuredClone(initialState),
      ...saved,
      clues: Array.isArray(saved.clues) ? [...saved.clues] : [],
      visited: {...initialState.visited, ...(saved.visited || {})},
      examined: {...initialState.examined, ...(saved.examined || {})},
      interviews: {...initialState.interviews, ...(saved.interviews || {})}
    };
  }catch(e){ return structuredClone(initialState); }
}
function resetGame(){
  if(confirm("수사 기록을 모두 지우고 처음부터 시작할까요?")){
    localStorage.removeItem("moonlit_case001_bright_proto_v08b");
    state = structuredClone(initialState);
    render("intro");
  }
}
function addClues(arr){
  arr.forEach(n=>{ if(!state.clues.includes(n)) state.clues.push(n); });
  state.clues.sort((a,b)=>a-b);
}

function detectiveThought(text){
  return `<aside class="detective-thought"><span>탐정의 생각</span><p>${text}</p></aside>`;
}

function getChoiceKind(choice){
  if(choice.kind) return choice.kind;
  if(choice.groupKey==="scene") return "investigate";
  if(choice.groupKey==="interview") return "question";
  if(choice.groupKey==="solve") return "decision";

  const actionName=choice.action?.name || "";
  const label=choice.label.replace(/<[^>]+>/g," ");
  if(actionName.startsWith("ask")) return "question";
  if(["powder","shoeprint","memo","fiber","memoryCard","hallSound"].includes(actionName) || actionName.startsWith("inspect")) return "investigate";
  if(["musicRoom","lobby"].includes(actionName)){
    return /전체 보기|음악실로|로비 다시 보기/.test(label) ? "navigate" : "investigate";
  }
  if(["parkMinho","hanYura","seoJian","leeTaejun","investigationHub","openNotebook"].includes(actionName)) return "navigate";
  if(actionName==="finalSolve") return "decision";
  if(/수사 본부|다음 질문|전체 보기|돌아|다시 플레이|심문|에게 질문|에게 확인/.test(label)) return "navigate";
  if(/조사|감식/.test(label)) return "investigate";
  return "action";
}

function setScene(id, html, choices, label="수사 진행"){
  state.scene=id;
  $("#chapterLabel").textContent=label;
  updateSceneVisual(id, label);
  $("#story").innerHTML=html;
  $("#choices").innerHTML="";
  let activeGroup="";
  choices.forEach(c=>{
    if(c.group && c.group!==activeGroup){
      const heading=document.createElement("div");
      heading.className=`choice-group-heading choice-group-heading--${c.groupKey || "default"}`;
      heading.innerHTML=`<span aria-hidden="true">${c.groupIcon || ""}</span><div><b>${c.group}</b>${c.groupDesc?`<small>${c.groupDesc}</small>`:""}</div>`;
      $("#choices").appendChild(heading);
      activeGroup=c.group;
    }
    const b=document.createElement("button");
    b.innerHTML=c.label;
    if(c.groupKey) b.classList.add(`choice--${c.groupKey}`);
    b.classList.add(`choice--${getChoiceKind(c)}`);
    if(c.primary) b.classList.add("primary");
    if(c.locked){ b.classList.add("locked"); b.disabled=true; }
    b.addEventListener("click", c.action);
    $("#choices").appendChild(b);
  });
  renderHotspots(id);
  saveState();
  window.scrollTo({top:0, behavior:"smooth"});
}

const sceneHotspots = {
  music: [
    {label:"출입 기록", x:8, y:31, found:()=>state.clues.includes(1), action:inspectMusicDoor},
    {label:"악보 보관함", x:89, y:29, found:()=>[2,3].every(n=>state.clues.includes(n)), action:inspectDisplayCase},
    {label:"젖은 자국", x:16, y:78, found:()=>state.clues.includes(4), action:inspectFootprint},
    {label:"남은 악보", x:20, y:53, found:()=>state.clues.includes(5), action:inspectScoreNote},
    {label:"검은 섬유", x:29, y:71, found:()=>state.clues.includes(6), action:inspectBlackFiber}
  ],
  lobby: [
    {label:"배송 상자", x:14, y:62, found:()=>state.examined.lobbyDelivery, action:inspectLobbyDelivery},
    {label:"관리 데스크", x:62, y:60, found:()=>state.examined.lobbyDesk, action:inspectLobbyDesk},
    {label:"카드 보관함", x:82, y:37, found:()=>state.examined.lobbyCard, action:inspectLobbyCard},
    {label:"출입 단말", x:91, y:54, found:()=>state.examined.lobbyTerminal, action:inspectLobbyTerminal}
  ]
};

function renderHotspots(id){
  const layer = $("#hotspotLayer");
  const points = sceneHotspots[id] || [];
  layer.innerHTML = "";
  layer.hidden = points.length === 0;
  if(points.length === 0) return;

  points.forEach(point=>{
    const found = point.found();
    const button = document.createElement("button");
    button.type = "button";
    button.className = `hotspot${found ? " hotspot--found" : ""}`;
    button.style.setProperty("--x", `${point.x}%`);
    button.style.setProperty("--y", `${point.y}%`);
    button.setAttribute("aria-label", `${point.label} ${found ? "다시 보기" : "조사하기"}`);
    button.innerHTML = `<span class="hotspot__pin" aria-hidden="true">${found ? "✓" : "+"}</span><span class="hotspot__label">${point.label}</span>`;
    button.addEventListener("click", point.action);
    layer.appendChild(button);
  });
}
function updateUI(){
  $("#clueCount").textContent=`${state.clues.length}/24`;
  $("#statusBadge").textContent = state.solved ? "완료" : state.started ? "진행" : "대기";
}

function investigationHub(){
  const progress = Math.round((state.clues.length / 24) * 100);
  const thought = state.clues.length
    ? "단서는 늘었지만 결론을 서두르지는 말자. 진술은 흔적과 맞아야 하고, 흔적은 시간표 안에 들어가야 한다."
    : "첫 단서는 가장 시끄러운 사람보다 가장 조용한 공간에 남아 있을 때가 많다.";
  setScene("hub",`
    <h2>수사의 방향은 주인님이 정합니다.</h2>
    <p class="lead">현장을 먼저 살펴도, 사람들의 말을 먼저 들어도 좋습니다. 발견한 단서는 다음 질문을 열고, 한 번 본 장면도 새로운 정보가 생기면 달라집니다.</p>
    <p class="scene-narration">음악실에는 종이와 가루가, 로비에는 카드와 사람의 동선이 기다리고 있다. 서로 무관해 보이는 조각도 같은 시간 위에 올려놓으면 전혀 다른 모양을 드러낼 것이다.</p>
    ${detectiveThought(thought)}
    <div class="hub-progress">
      <b>단서 ${state.clues.length}/24</b>
      <span class="hub-progress__bar" aria-hidden="true"><i style="width:${progress}%"></i></span>
      <span>${progress}%</span>
    </div>
  `,[
    {group:"현장 조사",groupKey:"scene",groupIcon:"⌕",groupDesc:"공간에 남은 흔적을 직접 확인합니다",label:'<span class="choice-icon">⌕</span><span class="choice-copy"><span class="choice-title">음악실 조사</span><span class="choice-desc">악보가 사라진 현장을 살핀다</span></span>', action:musicRoom},
    {group:"현장 조사",groupKey:"scene",label:'<span class="choice-icon">◇</span><span class="choice-copy"><span class="choice-title">로비 조사</span><span class="choice-desc">관리 데스크 주변을 확인한다</span></span>', action:lobby},
    {group:"인물 심문",groupKey:"interview",groupIcon:"♙",groupDesc:"진술을 듣고 확보한 단서로 추궁합니다",label:'<span class="choice-icon">♙</span><span class="choice-copy"><span class="choice-title">관리자 박민호</span><span class="choice-desc">출입 기록과 열쇠 관리 확인</span></span>', action:parkMinho},
    {group:"인물 심문",groupKey:"interview",label:'<span class="choice-icon">♪</span><span class="choice-copy"><span class="choice-title">바이올리니스트 한유라</span><span class="choice-desc">바뀐 결말에 대한 불만 확인</span></span>', action:hanYura},
    {group:"인물 심문",groupKey:"interview",label:'<span class="choice-icon">♩</span><span class="choice-copy"><span class="choice-title">피아니스트 서지안</span><span class="choice-desc">악보를 마지막으로 본 사람</span></span>', action:seoJian},
    {group:"인물 심문",groupKey:"interview",label:'<span class="choice-icon">◎</span><span class="choice-copy"><span class="choice-title">사진작가 이태준</span><span class="choice-desc">사건 시각의 동선을 묻는다</span></span>', action:leeTaejun},
    {group:"최종 판단",groupKey:"solve",groupIcon:"⚖",groupDesc:"모은 단서로 사건의 전말을 재구성합니다",label:'<span class="choice-icon">⚖</span><span class="choice-copy"><span class="choice-title">사건 해결에 도전</span><span class="choice-desc">현재 단서로 사건을 재구성한다</span></span>', action:finalSolve, primary:true}
  ],"자유 수사");
}

function intro(){
  setScene("intro",`
    <h2>〈Moonlit No. 7〉의 마지막 장이 사라졌다.</h2>
    <p class="lead">다음 날 처음 공개될 미발표 피아노곡. 작곡가의 친필 악보는 잠긴 음악실에 있었지만, 새로운 결말이 담긴 마지막 한 장만 보이지 않습니다.</p>
    <p class="scene-narration">빗물이 높은 유리창을 가늘게 두드린다. 공연이 끝난 문라이트 하우스에는 박수 대신 조율되지 않은 음 하나 같은 긴장만 남아 있다.</p>
    <div class="case-hook"><span>!</span><div><b>강제로 열린 흔적은 없습니다.</b><br>그러나 문은 20분 동안 한 차례 열렸습니다.</div></div>
    ${detectiveThought("잠긴 방, 사라진 것은 단 한 장. 누군가 훔쳤다고 단정하기에는 현장이 지나치게 조용하다.")}
  `,[
    {label:'<span class="choice-icon">→</span><span class="choice-copy"><span class="choice-title">문라이트 하우스에 들어간다</span><span class="choice-desc">수사를 시작하고 현장과 용의자를 선택합니다</span></span>', action:()=>{state.started=true; investigationHub();}, primary:true}
  ],"사건 브리핑");
}

function musicRoom(){
  state.visited.music=true;
  const found = [1,2,3,4,5,6].filter(n=>state.clues.includes(n)).length;
  setScene("music",`
    <div class="room-brief">
      <div>
        <span class="room-brief__eyebrow">INTERACTIVE SCENE</span>
        <h2>음악실을 직접 조사하세요.</h2>
        <p>피아노 덮개 위로 차가운 조명이 번지고, 악보가 놓였던 자리는 이상할 만큼 반듯하다. 빗물 냄새 사이로 송진과 오래된 나무 향이 희미하게 섞여든다.</p>
        <p class="room-brief__guide">그림 위 빛나는 지점을 누르면 관찰이 시작됩니다. 확인한 장소도 다시 살펴볼 수 있습니다.</p>
      </div>
      <div class="room-progress" aria-label="음악실 기본 조사 ${found}/6 완료">
        <strong>${found}<small>/6</small></strong>
        <span>기본 단서</span>
      </div>
    </div>
    ${detectiveThought("손대기 전에 방 전체를 본다. 사라진 것만큼, 제자리에 남아 있는 것들의 배열도 중요하다.")}
  `,[
    {label:'<span class="choice-icon">↩</span><span class="choice-copy"><span class="choice-title">수사 본부로</span><span class="choice-desc">다른 장소나 인물을 조사합니다</span></span>', action:investigationHub}
  ],"현장 조사");
}

function inspectMusicDoor(){
  addClues([1]);
  setScene("music-door",`
    <h2>🚪 음악실 출입 기록</h2>
    <p>손잡이와 문틀에는 억지로 비틀거나 긁은 흔적이 없다. 누군가는 문을 부순 것이 아니라, 이 건물이 허락하는 정상적인 방법으로 들어왔다.</p>
    <p>전자 출입 기록에는 <b>20:58, 관리자 마스터키 계열 카드로 열린 기록</b>이 한 차례 남아 있다. 짧고 무표정한 한 줄이지만, 사건의 시간은 여기서부터 움직이기 시작한다.</p>
    ${detectiveThought("문은 스스로 열리지 않는다. 기록에 남은 카드와 실제로 카드를 쥔 손은 따로 확인해야 한다.")}
    <div class="clue-found">단서 1 확보 · 20:58 출입 기록</div>
  `,[{label:"↩ 음악실 전체 보기",action:musicRoom},{label:"🏠 수사 본부로",action:investigationHub}],"현장 조사");
}

function inspectDisplayCase(){
  addClues([2,3]);
  setScene("music-case",`
    <h2>🗄️ 유리 악보 보관함</h2>
    <p>유리문을 따라 손전등 빛을 천천히 움직인다. 보관함 자체에는 <b>잠금장치가 없다</b>. 음악실 문만 통과하면 누구든 악보에 손을 댈 수 있는 구조다.</p>
    <p>손잡이 아래쪽을 비스듬히 비추자 <b>흰색 가루</b>가 얇게 드러난다. 정면에서는 보이지 않던 흔적이 빛의 각도를 바꾸자 조용히 떠오른다.</p>
    ${detectiveThought("이 가루가 범인을 가리키는지, 오래전에 남은 흔적인지는 아직 모른다. 흔적의 정체와 시간을 분리해서 보자.")}
    <div class="clue-found">단서 2, 3 확보 · 보관함 구조와 흰 가루</div>
  `,[{label:"🧪 흰 가루 정밀 조사",action:powder,primary:true},{label:"↩ 음악실 전체 보기",action:musicRoom}],"현장 조사");
}

function inspectFootprint(){
  addClues([4]);
  setScene("music-shoe",`
    <h2>👟 문 근처의 젖은 자국</h2>
    <p>입구 쪽 바닥에 빗물이 번진 자국 하나가 조명을 받아 희미하게 반짝인다. 주변의 흐릿한 물기와 달리 윤곽이 선명한 <b>큰 젖은 신발 자국</b>이다.</p>
    <p>한 걸음만 또렷하게 남았다는 점이 오히려 눈에 걸린다. 크기와 밑창을 더 자세히 확인하면, 이 발자국의 주인을 좁힐 수 있을 것이다.</p>
    ${detectiveThought("발자국 하나가 동선 전체를 말해주지는 않는다. 하지만 누가 이 문턱을 넘었는지는 말해줄 수 있다.")}
    <div class="clue-found">단서 4 확보 · 큰 젖은 신발 자국</div>
  `,[{label:"⌕ 신발 자국 정밀 조사",action:shoeprint,primary:true},{label:"↩ 음악실 전체 보기",action:musicRoom}],"현장 조사");
}

function inspectScoreNote(){
  addClues([5]);
  setScene("music-memo",`
    <h2>🎼 보관함에 남은 악보</h2>
    <p>악보를 넘길 때마다 마른 종이가 낮게 스친다. 1페이지부터 6페이지까지는 순서대로 남아 있지만, 곡이 끝나야 할 7페이지만 감쪽같이 비어 있다.</p>
    <p>6페이지 뒤에는 <b>“마지막은 원래대로.”</b>라는 짧은 메모가 붙어 있다. 누군가의 불만인지, 경고인지, 단순한 작업 메모인지는 문장만으로 알 수 없다.</p>
    ${detectiveThought("강한 말은 시선을 끈다. 하지만 시선을 끄는 문장이 반드시 범행을 설명해주는 것은 아니다.")}
    <div class="clue-found">단서 5 확보 · 6페이지 뒤의 메모</div>
  `,[{label:"✏️ 메모 정밀 조사",action:memo,primary:true},{label:"↩ 음악실 전체 보기",action:musicRoom}],"현장 조사");
}

function inspectBlackFiber(){
  addClues([6]);
  setScene("music-fiber",`
    <h2>🧵 테이블 아래의 검은 물질</h2>
    <p>문 옆 작은 테이블 아래, 바닥의 어두운 결 사이로 짧은 선 하나가 걸린다. 핀셋으로 집어 올리자 <b>검고 뻣뻣한 털 같은 물질</b>이 빛을 튕긴다.</p>
    <p>머리카락이라기에는 지나치게 곧고, 동물의 털이라기에는 탄력이 일정하다. 육안만으로 단정하지 말고 재질부터 확인해야 한다.</p>
    ${detectiveThought("작은 조각일수록 쉽게 과장된다. 물건과 연결할 수는 있어도, 사람까지 곧바로 단정해서는 안 된다.")}
    <div class="clue-found">단서 6 확보 · 검고 뻣뻣한 물질</div>
  `,[{label:"⌕ 검은 물질 정밀 조사",action:fiber,primary:true},{label:"↩ 음악실 전체 보기",action:musicRoom}],"현장 조사");
}
function powder(){
  state.examined.powder=true; addClues([7]);
  setScene("powder",`
    <h2>🧪 흰 가루</h2>
    <p>면봉 끝으로 가루를 조금 걷어내자 미세한 입자가 서로 달라붙는다. 가까이 가져가면 익숙한 송진 냄새가 희미하게 올라온다. 공연 스태프는 <b>현악기 활에 사용하는 로진 가루</b> 같다고 말한다.</p>
    <p>그러나 이곳은 여러 연주자가 오가는 공연장이다. 손이나 악보를 거쳐 다른 사람에게 옮겨 묻었을 가능성도 배제할 수 없다.</p>
    ${detectiveThought("흔적이 남아 있다는 사실과, 사건 시각에 남겨졌다는 사실은 다르다. 먼저 이 가루를 만질 법한 사람의 설명을 들어보자.")}
    <div class="clue-found">단서 7 확보 · 로진 가능성</div>
  `,[{label:"↩ 음악실로",action:musicRoom},{label:"🏠 수사 본부로",action:investigationHub}],"현장 감식");
}
function fiber(){
  state.examined.fiber=true; addClues([8]);
  setScene("fiber",`
    <h2>🧵 검은 털</h2>
    <p>확대경 아래 놓인 검은 조각은 끝이 자연스럽게 가늘어지지 않고 반듯하게 잘려 있다. 사람이나 동물의 털에서 보이는 불규칙한 결도 없다.</p>
    <p>재질과 단면을 비교해보니 <b>합성섬유 브러시 털</b>로 보인다. 특히 카메라 렌즈 청소용 브러시에 쓰이는 재질과 비슷하다.</p>
    ${detectiveThought("브러시를 쓰는 사람이 곧 침입자라는 뜻은 아니다. 그래도 현장과 누군가의 소지품을 잇는 첫 연결 고리는 생겼다.")}
    <div class="clue-found">단서 8 확보 · 사진 장비와 연결 가능</div>
  `,[{label:"↩ 음악실로",action:musicRoom},{label:"🏠 수사 본부로",action:investigationHub}],"현장 감식");
}
function shoeprint(){
  state.examined.shoe=true; addClues([9]);
  setScene("shoe",`
    <h2>👟 젖은 신발 자국</h2>
    <p>투명 자를 나란히 대고 윤곽을 기록한다. 길이는 대략 <b>275~285mm</b>, 밑창에는 사각 블록 사이로 사선 홈이 이어져 있다. 발끝은 방 안쪽을 향한다.</p>
    <p>이상한 점은 <b>흙이나 진흙 없이 물기만 있다는 것</b>, 그리고 선명한 자국이 단 하나뿐이라는 점이다. 빗속 정원을 오래 걸었다면 남았을 법한 흙이 보이지 않는다.</p>
    ${detectiveThought("크기가 비슷한 신발은 많다. 범위를 좁혀주는 건 숫자보다 밑창의 패턴, 그리고 그 사람이 말한 동선이다.")}
    <div class="clue-found">단서 9 확보 · 약 280mm, 물만 있음</div>
  `,[{label:"↩ 음악실로",action:musicRoom},{label:"🏠 수사 본부로",action:investigationHub}],"현장 감식");
}
function memo(){
  state.examined.memo=true; addClues([10]);
  setScene("memo",`
    <h2>✏️ “마지막은 원래대로.”</h2>
    <p>메모를 사선으로 기울이자 펜 끝이 눌렀던 자국이 종이 위에 얕은 골처럼 드러난다. 작곡가의 필체는 아니며, 눌림 자국 사이로 <b>“…Ending B…”</b>라는 글자가 희미하게 이어진다.</p>
    <p>관계자들의 자료를 대조한 결과, 이 곡에는 원래 Ending A와 최근 교체된 <b>Ending B</b>가 있었다. 그리고 사라진 7페이지가 바로 새 결말이 적힌 Ending B다.</p>
    ${detectiveThought("이제 사라진 종이가 아니라, 사라진 ‘내용’에 관심을 가진 사람을 찾아야 한다. 다만 반대했던 사람과 탐냈던 사람은 같은 방식으로 움직이지 않는다.")}
    <div class="clue-found">단서 10 확보 · 사건의 핵심은 ‘새 엔딩’일 수 있다.</div>
  `,[{label:"↩ 음악실로",action:musicRoom},{label:"🏠 수사 본부로",action:investigationHub}],"문서 감식");
}
function lobby(){
  state.visited.lobby=true;
  const found = ["lobbyDesk","lobbyCard","lobbyTerminal","lobbyDelivery"].filter(key=>state.examined[key]).length;
  setScene("lobby",`
    <div class="room-brief">
      <div>
        <span class="room-brief__eyebrow">INTERACTIVE SCENE</span>
        <h2>관리 로비를 직접 조사하세요.</h2>
        <p>젖은 우산 냄새와 배송 상자의 마른 종이 냄새가 로비에 겹친다. 관리 데스크는 단정하지만, 여러 사람이 스쳐 갔을 법한 흔적까지 감추지는 못한다.</p>
        <p class="room-brief__guide">현장에서 확인한 내용은 박민호에게 물을 질문을 엽니다. 빛나는 네 지점을 살펴보세요.</p>
      </div>
      <div class="room-progress" aria-label="로비 조사 ${found}/4 완료">
        <strong>${found}<small>/4</small></strong>
        <span>조사 지점</span>
      </div>
    </div>
    ${detectiveThought("음악실보다 열린 공간이다. 물건이 어디 있었는지보다 누가 언제 손을 뻗을 수 있었는지부터 따져보자.")}
  `,[
    {label:'<span class="choice-icon">♙</span><span class="choice-copy"><span class="choice-title">박민호에게 확인</span><span class="choice-desc">조사 결과를 바탕으로 질문합니다</span></span>',action:parkMinho,primary:true},
    {label:'<span class="choice-icon">↩</span><span class="choice-copy"><span class="choice-title">수사 본부로</span><span class="choice-desc">다른 장소나 인물을 조사합니다</span></span>',action:investigationHub}
  ],"로비 조사");
}

function inspectLobbyDelivery(){
  state.examined.lobbyDelivery=true;
  setScene("lobby-delivery",`
    <h2>📦 입구의 배송 상자</h2>
    <p>로비 옆 출입구에 크기와 모양이 제각각인 배송 상자가 모여 있다. 통로를 비우려면 한 번에 옮기기 어려웠을 만큼 수가 많다.</p>
    <p>누가 상자를 정리했고 그동안 데스크가 어떻게 관리됐는지, 현장만으로는 확정할 수 없다. 정확한 시각과 당시 상황은 <b>관리자에게 직접 확인</b>해야 한다.</p>
    ${detectiveThought("사람이 자리를 비운 순간은 짧아도, 누군가에게는 충분히 긴 틈이 될 수 있다.")}
    <div class="question-unlocked">새 질문 해금 · 20:50 전후 로비를 비운 이유</div>
  `,[{label:"♙ 박민호에게 질문",action:parkMinho,primary:true},{label:"↩ 로비 전체 보기",action:lobby}],"로비 조사");
}

function inspectLobbyDesk(){
  state.examined.lobbyDesk=true;
  setScene("lobby-desk",`
    <h2>🛎️ 관리자 데스크</h2>
    <p>데스크 안쪽에는 직원용 서랍과 카드 관리 공간이 나란히 배치돼 있다. 관리자가 앉아 있다면 접근이 눈에 띄지만, 자리가 비면 로비 쪽에서도 손을 뻗을 수 있는 구조다.</p>
    <p>누가 실제로 접근했는지는 현장만으로 알 수 없다. 다만 <b>데스크가 잠시 비었다면 손이 닿는 위치</b>라는 사실은 분명하다.</p>
    ${detectiveThought("잠금장치만큼 중요한 건 관리 습관이다. 완벽한 보관 규칙도 단 한 번의 빈틈 앞에서는 힘을 잃는다.")}
    <div class="question-unlocked">확인 필요 · 관리자 공백 시간과 주변 인물</div>
  `,[{label:"♙ 박민호에게 질문",action:parkMinho,primary:true},{label:"↩ 로비 전체 보기",action:lobby}],"로비 조사");
}

function inspectLobbyCard(){
  state.examined.lobbyCard=true;
  setScene("lobby-card",`
    <h2>🪪 비상카드 보관함</h2>
    <p>데스크 안쪽 벽에 작은 비상카드 보관함이 붙어 있다. 평소에는 잠겨 있다는 표시가 있지만, 지금 보이는 외관만으로 사건 당시 상태까지 알 수는 없다.</p>
    <p>배송 물품을 정리하는 동안에도 계속 잠겨 있었는지, 카드가 제자리에 있었는지는 <b>관리자의 확인이 필요</b>하다.</p>
    ${detectiveThought("카드는 문을 연 도구일 뿐이다. 중요한 건 카드의 주인이 아니라, 그 시간에 카드를 꺼낼 수 있었던 사람이다.")}
    <div class="question-unlocked">새 질문 해금 · 비상용 마스터카드 관리 방식</div>
  `,[{label:"♙ 박민호에게 질문",action:parkMinho,primary:true},{label:"↩ 로비 전체 보기",action:lobby}],"로비 조사");
}

function inspectLobbyTerminal(){
  state.examined.lobbyTerminal=true;
  addClues([1]);
  setScene("lobby-terminal",`
    <h2>🖥️ 전자 출입 단말</h2>
    <p>대기 화면을 깨우자 출입 기록이 차가운 빛으로 떠오른다. 수많은 시간 표시 사이에서 음악실의 한 줄만 유독 선명하다.</p>
    <p><b>20:58, 관리자 마스터키 계열 카드 사용.</b> 개인 카드인지 비상카드인지는 관리자 권한으로 세부 기록을 열어봐야 한다.</p>
    ${detectiveThought("현장은 침묵해도 시스템은 시간을 기억한다. 이제 이 기록이 가리키는 카드의 정체를 확인할 차례다.")}
    <div class="clue-found">단서 1 확보 · 20:58 출입 기록</div>
    <div class="question-unlocked">새 질문 해금 · 사용된 카드의 정확한 종류</div>
  `,[{label:"♙ 박민호에게 기록 확인 요청",action:parkMinho,primary:true},{label:"↩ 로비 전체 보기",action:lobby}],"로비 조사");
}

function parkMinho(){
  state.visited.park=true;
  const asked = countInterview("park");
  const canAskAbsence = state.examined.lobbyDelivery || state.examined.lobbyDesk;
  const canAskStorage = state.examined.lobbyCard;
  const canAskCard = state.examined.lobbyTerminal && state.clues.includes(1);
  const canAskShoes = state.clues.includes(4);
  setScene("park",characterInterviewHeader({name:"박민호",role:"문라이트 하우스 관리자",image:"portrait-park-minho.png",asked,total:4,intro:"정돈된 말투와 달리 열쇠를 쥔 손끝은 좀처럼 가만있지 않는다. 현장 기록과 그의 기억을 하나씩 맞춰볼 차례다."}),[
    {label:`<span class="choice-icon">${state.interviews.parkAbsence?"✓":"?"}</span><span class="choice-copy"><span class="choice-title">20:50 전후, 왜 로비를 비웠습니까?</span><span class="choice-desc">${canAskAbsence?"배송 상자와 비어 있던 데스크를 근거로 묻습니다":"로비의 배송 구역이나 관리 데스크 조사 필요"}</span></span>`,action:askParkAbsence,locked:!canAskAbsence},
    {label:`<span class="choice-icon">${state.interviews.parkStorage?"✓":"?"}</span><span class="choice-copy"><span class="choice-title">비상용 카드는 어떻게 보관합니까?</span><span class="choice-desc">${canAskStorage?"카드 보관함 상태를 근거로 묻습니다":"로비의 카드 보관함 조사 필요"}</span></span>`,action:askParkStorage,locked:!canAskStorage},
    {label:`<span class="choice-icon">${state.interviews.parkCard?"✓":"?"}</span><span class="choice-copy"><span class="choice-title">20:58에 사용된 카드 종류는?</span><span class="choice-desc">${canAskCard?"출입 단말의 세부 기록을 요청합니다":"음악실 출입 기록과 로비 단말 확인 필요"}</span></span>`,action:askParkCard,locked:!canAskCard},
    {label:`<span class="choice-icon">${state.interviews.parkShoes?"✓":"?"}</span><span class="choice-copy"><span class="choice-title">신발 밑창을 비교하겠습니다.</span><span class="choice-desc">${canAskShoes?"현장의 젖은 자국과 대조합니다":"음악실의 젖은 신발 자국 발견 필요"}</span></span>`,action:askParkShoes,locked:!canAskShoes},
    {label:'<span class="choice-icon">🏛</span><span class="choice-copy"><span class="choice-title">로비를 더 조사한다</span><span class="choice-desc">잠긴 질문의 근거를 찾습니다</span></span>',action:lobby},
    {label:'<span class="choice-icon">↩</span><span class="choice-copy"><span class="choice-title">수사 본부로</span><span class="choice-desc">다른 인물이나 장소로 이동합니다</span></span>',action:investigationHub}
  ],"용의자 심문");
}

function askParkAbsence(){
  state.interviews.parkAbsence=true;
  setScene("park-absence",`
    <p class="scene-narration">박민호는 대답하기 전에 로비 출입구를 한 번 바라본다. 짧았던 공백을 기억 속에서 다시 세는 표정이다.</p>
    <div class="dialogue-scene dialogue-scene--portrait" style="--portrait:url('assets/portrait-park-minho.png')">
      <p class="dialogue dialogue--detective"><span>탐정</span>20:50 전후, 왜 관리 데스크를 비웠습니까?</p>
      <p class="dialogue dialogue--suspect"><span>박민호</span>택배 기사 때문에 2~3분 정도 밖으로 나갔습니다. 돌아왔을 때 사진작가 이태준 씨가 데스크 앞에 있었어요. 20:52~20:53쯤입니다.</p>
    </div>
    ${detectiveThought("로비가 비었던 몇 분과 그 앞에서 목격된 사람. 아직 범행은 아니지만, 접근 가능성을 따질 시간표에는 넣어둘 만하다.")}
    <div class="question-unlocked">진술 기록 · 로비 공백 시간과 이태준 목격</div>
  `,[{label:"↩ 다음 질문 선택",action:parkMinho,primary:true},{label:"🏠 수사 본부로",action:investigationHub}],"관리자 심문");
}

function askParkStorage(){
  state.interviews.parkStorage=true;
  setScene("park-storage",`
    <p class="scene-narration">비상카드 보관함을 언급하자 박민호의 대답이 조금 느려진다. 규칙은 분명하지만, 그날의 관리가 규칙대로였는지는 다른 문제다.</p>
    <div class="dialogue-scene dialogue-scene--portrait" style="--portrait:url('assets/portrait-park-minho.png')">
      <p class="dialogue dialogue--detective"><span>탐정</span>비상용 마스터카드는 평소 어떻게 보관합니까?</p>
      <p class="dialogue dialogue--suspect"><span>박민호</span>작은 보관함에 넣어 잠급니다. 다만 그날은 배송 물품을 정리하느라 보관함이 열려 있었을 가능성이 있습니다.</p>
    </div>
    ${detectiveThought("잠겨 있어야 할 물건이 잠시 열려 있었다면, 권한이 없는 사람에게도 기회가 생긴다. 이제 카드의 정확한 종류가 필요하다.")}
    <div class="question-unlocked">진술 기록 · 로비 공백 중 다른 사람의 접근 가능성</div>
  `,[{label:"↩ 다음 질문 선택",action:parkMinho,primary:true},{label:"🏛 로비 다시 보기",action:lobby}],"관리자 심문");
}

function askParkCard(){
  state.interviews.parkCard=true;
  addClues([11]);
  setScene("park-card",`
    <p class="scene-narration">박민호가 관리자 화면에 접속해 기록 한 줄을 확대한다. 카드 분류 코드가 확인되자 그의 표정도 함께 굳어진다.</p>
    <div class="dialogue-scene dialogue-scene--portrait" style="--portrait:url('assets/portrait-park-minho.png')">
      <p class="dialogue dialogue--detective"><span>탐정</span>20:58 기록을 관리자 권한으로 다시 확인해주세요.</p>
      <p class="dialogue dialogue--suspect"><span>박민호</span>제 개인 카드가 아닙니다. 그 시각 사용된 것은 <b>비상용 마스터카드</b>입니다.</p>
    </div>
    ${detectiveThought("관리자의 개인 카드가 아니라 비상용 카드였다. 이제 ‘관리자가 열었다’는 단순한 결론은 성립하지 않는다.")}
    <div class="clue-found">단서 11 확보 · 개인 카드가 아닌 비상용 마스터카드</div>
  `,[{label:"↩ 다음 질문 선택",action:parkMinho,primary:true},{label:"🏠 수사 본부로",action:investigationHub}],"관리자 심문");
}

function askParkShoes(){
  state.interviews.parkShoes=true;
  addClues([12]);
  setScene("park-shoes",`
    <p class="scene-narration">신발을 종이 위에 올리고 현장 사진과 나란히 맞춘다. 크기는 비슷하지만, 밑창이 남기는 선은 숫자보다 더 구체적이다.</p>
    <div class="dialogue-scene dialogue-scene--portrait" style="--portrait:url('assets/portrait-park-minho.png')">
      <p class="dialogue dialogue--detective"><span>탐정</span>현장 자국과 신발 밑창을 대조하겠습니다.</p>
      <p class="dialogue dialogue--suspect"><span>박민호</span>제 신발은 280mm입니다. 확인하셔도 됩니다.</p>
    </div>
    <p class="comparison-result"><b>비교 결과</b> 크기는 비슷하지만 밑창 패턴이 현장 자국과 다르다.</p>
    ${detectiveThought("비슷함과 일치는 다르다. 박민호의 신발은 현장 자국을 설명하지 못한다.")}
    <div class="clue-found">단서 12 확보 · 박민호 신발 패턴 불일치</div>
  `,[{label:"↩ 다음 질문 선택",action:parkMinho,primary:true},{label:"🏠 수사 본부로",action:investigationHub}],"관리자 심문");
}
function countInterview(prefix){
  return Object.entries(state.interviews).filter(([key,value])=>key.startsWith(prefix) && value).length;
}

function characterInterviewHeader({name,role,image,asked,total,intro}){
  return `<div class="character-interview">
    <div class="character-interview__portrait"><img src="assets/${image}" alt="${name} 인물화"></div>
    <div class="character-interview__copy"><span>${role}</span><h2>${name}</h2><p>${intro || "확인할 질문을 선택하세요. 확보한 단서에 따라 새로운 질문이 열립니다."}</p></div>
    <div class="interview-progress"><b>${asked}/${total}</b><span>확인 완료</span></div>
  </div>`;
}

function hanYura(){
  state.visited.yura=true;
  const asked=countInterview("yura");
  const canMemo=state.clues.includes(5);
  const canRosin=state.clues.includes(3);
  setScene("yura",characterInterviewHeader({name:"한유라",role:"바이올리니스트",image:"portrait-han-yura.png",asked,total:4,intro:"흐트러짐 없는 자세지만 Ending B라는 말을 꺼내자 시선이 잠깐 굳는다. 감정과 행동을 분리해 확인해야 한다."}),[
    {label:`<span class="choice-icon">${state.interviews.yuraEnding?"✓":"?"}</span><span class="choice-copy"><span class="choice-title">Ending B를 싫어했습니까?</span><span class="choice-desc">새로운 결말에 대한 감정을 확인합니다</span></span>`,action:askYuraEnding},
    {label:`<span class="choice-icon">${state.interviews.yuraMemo?"✓":"?"}</span><span class="choice-copy"><span class="choice-title">이 메모를 쓴 사람은 누구입니까?</span><span class="choice-desc">${canMemo?"6페이지 뒤의 메모를 제시합니다":"음악실에서 메모 발견 필요"}</span></span>`,action:askYuraMemo,locked:!canMemo},
    {label:`<span class="choice-icon">${state.interviews.yuraRosin?"✓":"?"}</span><span class="choice-copy"><span class="choice-title">보관함의 흰 가루를 설명해주세요.</span><span class="choice-desc">${canRosin?"손잡이 아래의 가루를 근거로 묻습니다":"음악실 보관함의 흰 가루 발견 필요"}</span></span>`,action:askYuraRosin,locked:!canRosin},
    {label:`<span class="choice-icon">${state.interviews.yuraRecording?"✓":"?"}</span><span class="choice-copy"><span class="choice-title">20:54부터 21:00까지 무엇을 했습니까?</span><span class="choice-desc">사건 시각의 행동과 기록을 확인합니다</span></span>`,action:askYuraRecording},
    {label:'<span class="choice-icon">↩</span><span class="choice-copy"><span class="choice-title">수사 본부로</span><span class="choice-desc">다른 인물이나 장소로 이동합니다</span></span>',action:investigationHub}
  ],"용의자 심문");
}

function askYuraEnding(){
  state.interviews.yuraEnding=true;
  setScene("yura-ending",`
    <p class="scene-narration">한유라는 잠시 바이올린 활을 내려다본다. 불만을 숨기려는 기색은 없지만, 솔직함이 곧 결백을 뜻하지도 않는다.</p>
    <div class="dialogue-scene dialogue-scene--portrait" style="--portrait:url('assets/portrait-han-yura.png')">
      <p class="dialogue dialogue--detective"><span>탐정</span>Ending B를 싫어했다는 말이 사실입니까?</p>
      <p class="dialogue dialogue--suspect"><span>한유라</span>네. 원래 Ending A에 있던 바이올린 비중이 크게 줄었으니까요. 마음에 들지 않았던 건 인정합니다.</p>
    </div>
    ${detectiveThought("동기는 선명해 보인다. 하지만 불만이 행동으로 이어졌다는 증거가 없다면, 그저 눈에 띄는 감정일 뿐이다.")}
    <div class="question-unlocked">진술 기록 · Ending B에 대한 불만 인정</div>
  `,[{label:"↩ 다음 질문 선택",action:hanYura,primary:true},{label:"🏠 수사 본부로",action:investigationHub}],"한유라 심문");
}

function askYuraMemo(){
  state.interviews.yuraMemo=true; addClues([13]);
  setScene("yura-memo",`
    <p class="scene-narration">메모를 내밀자 한유라는 문장을 읽기도 전에 알아본 듯 짧게 숨을 내쉰다. 부정 대신 설명을 택한다.</p>
    <div class="dialogue-scene dialogue-scene--portrait" style="--portrait:url('assets/portrait-han-yura.png')">
      <p class="dialogue dialogue--detective"><span>탐정</span>“마지막은 원래대로.” 이 문장을 썼습니까?</p>
      <p class="dialogue dialogue--suspect"><span>한유라</span>제가 썼어요. 새 결말에 반대한다는 뜻이었지만, 악보를 가져가지는 않았습니다.</p>
    </div>
    ${detectiveThought("메모의 주인은 확인됐다. 이제 종이에 남긴 반대와 실제 페이지의 실종을 같은 사건으로 묶어도 되는지 따져봐야 한다.")}
    <div class="clue-found">단서 13 확보 · 메모 작성자는 한유라</div>
  `,[{label:"↩ 다음 질문 선택",action:hanYura,primary:true},{label:"🏠 수사 본부로",action:investigationHub}],"한유라 심문");
}

function askYuraRosin(){
  state.interviews.yuraRosin=true; addClues([14]);
  setScene("yura-rosin",`
    <p class="scene-narration">흰 가루 사진을 보여주자 한유라는 손가락 끝을 바라본다. 연주자에게 로진은 특별한 물건이 아니라 매일 손에 묻는 도구다.</p>
    <div class="dialogue-scene dialogue-scene--portrait" style="--portrait:url('assets/portrait-han-yura.png')">
      <p class="dialogue dialogue--detective"><span>탐정</span>보관함 손잡이 아래의 로진 가루는 어떻게 묻었습니까?</p>
      <p class="dialogue dialogue--suspect"><span>한유라</span>오후 리허설 때 악보를 보관함에 넣었습니다. 그때 손에 묻은 로진이 옮겨갔을 가능성이 있어요.</p>
    </div>
    ${detectiveThought("흔적의 정체는 맞아도 남겨진 시간이 다를 수 있다. 오후의 흔적을 밤의 범행으로 착각하면 수사는 엉뚱한 곡을 연주한다.")}
    <div class="clue-found">단서 14 확보 · 로진은 오후 리허설 흔적일 가능성</div>
  `,[{label:"↩ 다음 질문 선택",action:hanYura,primary:true},{label:"🏠 수사 본부로",action:investigationHub}],"한유라 심문");
}

function askYuraRecording(){
  state.interviews.yuraRecording=true; addClues([15]);
  setScene("yura-recording",`
    <p class="scene-narration">한유라가 내민 휴대폰에는 긴 녹음 파일 하나가 남아 있다. 재생 막대는 사건 시각을 끊김 없이 지나간다.</p>
    <div class="dialogue-scene dialogue-scene--portrait" style="--portrait:url('assets/portrait-han-yura.png')">
      <p class="dialogue dialogue--detective"><span>탐정</span>사건 시각의 행동을 증명할 기록이 있습니까?</p>
      <p class="dialogue dialogue--suspect"><span>한유라</span>휴대폰으로 연습을 녹음했습니다. 20:54:12부터 21:00:37까지 끊기지 않았어요. 20:50 조금 지나 로비에서 이태준 씨도 봤습니다. 그때는 카메라를 들고 있지 않았고요.</p>
    </div>
    ${detectiveThought("연속된 녹음은 그녀의 움직임을 좁히고, 20시 50분을 넘긴 로비의 목격은 다른 사람의 진술을 시험할 기준이 된다.")}
    <div class="clue-found">단서 15 확보 · 20:54~21:00 연속 연습 녹음</div>
  `,[{label:"↩ 다음 질문 선택",action:hanYura,primary:true},{label:"📷 이태준 심문",action:leeTaejun}],"한유라 심문");
}

function seoJian(){
  state.visited.jian=true;
  const asked=countInterview("jian");
  const canRequest=state.clues.includes(10);
  setScene("jian",characterInterviewHeader({name:"서지안",role:"피아니스트",image:"portrait-seo-jian.png",asked,total:4,intro:"서지안은 질문을 기다리듯 침착하다. 악보를 마지막으로 다룬 사람의 기억에는 정확한 시간이 남아 있을 것이다."}),[
    {label:`<span class="choice-icon">${state.interviews.jianEnding?"✓":"?"}</span><span class="choice-copy"><span class="choice-title">Ending B를 어떻게 생각합니까?</span><span class="choice-desc">새로운 결말에 대한 이해관계를 확인합니다</span></span>`,action:askJianEnding},
    {label:`<span class="choice-icon">${state.interviews.jianScore?"✓":"?"}</span><span class="choice-copy"><span class="choice-title">악보를 마지막으로 본 시각은?</span><span class="choice-desc">보관함에 넣은 악보의 상태를 묻습니다</span></span>`,action:askJianScore},
    {label:`<span class="choice-icon">${state.interviews.jianRequest?"✓":"?"}</span><span class="choice-copy"><span class="choice-title">Ending B를 촬영하려던 사람이 있었습니까?</span><span class="choice-desc">${canRequest?"사라진 페이지가 Ending B라는 사실을 근거로 묻습니다":"사라진 페이지의 정체 확인 필요"}</span></span>`,action:askJianRequest,locked:!canRequest},
    {label:`<span class="choice-icon">${state.interviews.jianCall?"✓":"?"}</span><span class="choice-copy"><span class="choice-title">20:55부터 21:03까지 무엇을 했습니까?</span><span class="choice-desc">사건 시각의 통화 기록을 확인합니다</span></span>`,action:askJianCall},
    {label:'<span class="choice-icon">↩</span><span class="choice-copy"><span class="choice-title">수사 본부로</span><span class="choice-desc">다른 인물이나 장소로 이동합니다</span></span>',action:investigationHub}
  ],"용의자 심문");
}

function askJianEnding(){
  state.interviews.jianEnding=true;
  setScene("jian-ending",`
    <p class="scene-narration">서지안은 질문의 의도를 곧바로 알아챈다. 새 결말이 누구에게 유리했는지부터 짚어보려는 것이다.</p>
    <div class="dialogue-scene dialogue-scene--portrait" style="--portrait:url('assets/portrait-seo-jian.png')">
      <p class="dialogue dialogue--detective"><span>탐정</span>Ending B로 바뀐 것에 불만이 있었습니까?</p>
      <p class="dialogue dialogue--suspect"><span>서지안</span>아니요. 마지막 40초가 피아노 독주 중심이라 오히려 Ending B를 더 좋아했습니다.</p>
    </div>
    ${detectiveThought("새 결말의 수혜자는 분명하다. 그러나 이익을 얻는 사람과 위험을 무릅쓴 사람은 반드시 같지 않다.")}
    <div class="question-unlocked">진술 기록 · Ending B를 선호</div>
  `,[{label:"↩ 다음 질문 선택",action:seoJian,primary:true},{label:"🏠 수사 본부로",action:investigationHub}],"서지안 심문");
}

function askJianScore(){
  state.interviews.jianScore=true; addClues([16]);
  setScene("jian-score",`
    <p class="scene-narration">서지안은 기억을 더듬지 않고 곧바로 시각을 답한다. 연주자답게 악보의 순서와 마지막 장까지 또렷이 기억하고 있다.</p>
    <div class="dialogue-scene dialogue-scene--portrait" style="--portrait:url('assets/portrait-seo-jian.png')">
      <p class="dialogue dialogue--detective"><span>탐정</span>악보 전체를 마지막으로 확인한 시각은 언제입니까?</p>
      <p class="dialogue dialogue--suspect"><span>서지안</span>20:40경입니다. Ending B까지 포함된 악보 전체를 제가 직접 보관함에 넣었습니다.</p>
    </div>
    ${detectiveThought("20시 40분에는 7페이지가 분명히 있었다. 실종이 일어난 범위가 조금 더 좁아졌다.")}
    <div class="clue-found">단서 16 확보 · 20:40 악보 전체 보관</div>
  `,[{label:"↩ 다음 질문 선택",action:seoJian,primary:true},{label:"🏠 수사 본부로",action:investigationHub}],"서지안 심문");
}

function askJianRequest(){
  state.interviews.jianRequest=true; addClues([17]);
  setScene("jian-request",`
    <p class="scene-narration">‘촬영’이라는 단어가 나오자 서지안은 한 사람의 이름을 떠올린다. 공개 전 악보를 둘러싼 실랑이는 한 번으로 끝나지 않았다.</p>
    <div class="dialogue-scene dialogue-scene--portrait" style="--portrait:url('assets/portrait-seo-jian.png')">
      <p class="dialogue dialogue--detective"><span>탐정</span>공개 전 Ending B를 촬영하려던 사람이 있었습니까?</p>
      <p class="dialogue dialogue--suspect"><span>서지안</span>이태준 씨가 두 번 요청했지만 작곡가에게 거절당했습니다. “나는 아무도 못 본 걸 찍어야지”라고도 말했어요.</p>
    </div>
    ${detectiveThought("반복된 요청은 관심을 넘어선 집착일 수 있다. 그래도 목적이 보였다고 행동까지 증명된 것은 아니다.")}
    <div class="clue-found">단서 17 확보 · 이태준의 Ending B 촬영 요청</div>
  `,[{label:"↩ 다음 질문 선택",action:seoJian,primary:true},{label:"📷 이태준 심문",action:leeTaejun}],"서지안 심문");
}

function askJianCall(){
  state.interviews.jianCall=true; addClues([18]);
  setScene("jian-call",`
    <p class="scene-narration">서지안은 휴대폰의 통화 기록을 열어 테이블 위에 놓는다. 화면에 남은 시작과 종료 시각이 그녀의 말을 받친다.</p>
    <div class="dialogue-scene dialogue-scene--portrait" style="--portrait:url('assets/portrait-seo-jian.png')">
      <p class="dialogue dialogue--detective"><span>탐정</span>사건 시각에는 어디에 있었습니까?</p>
      <p class="dialogue dialogue--suspect"><span>서지안</span>20:55부터 21:03까지 작곡가와 영상통화 중이었습니다. 통화 기록을 확인하셔도 됩니다.</p>
    </div>
    ${detectiveThought("사건 시각을 가로지르는 기록이다. 진술이 아니라 외부 기록과 맞물릴수록 알리바이는 단단해진다.")}
    <div class="clue-found">단서 18 확보 · 20:55~21:03 영상통화</div>
  `,[{label:"↩ 다음 질문 선택",action:seoJian,primary:true},{label:"🏠 수사 본부로",action:investigationHub}],"서지안 심문");
}

function leeTaejun(){
  state.visited.tae=true;
  const asked=countInterview("tae");
  const canContradict=state.interviews.taeAlibi && state.interviews.parkAbsence;
  const canShoes=state.clues.includes(9);
  const canBrush=state.clues.includes(8);
  const canPhoto=state.clues.includes(17);
  const canMemory=[15,16,17,18,19,20,21].every(n=>state.clues.includes(n)) && state.interviews.taeBrush;
  setScene("tae",characterInterviewHeader({name:"이태준",role:"공연 사진작가",image:"portrait-lee-taejun-v2.png",asked,total:5,intro:"그는 질문보다 내 손의 수첩을 먼저 살핀다. 짧은 대답보다 달라지는 진술과 먼저 튀어나오는 말에 주목해야 한다."}),[
    {label:`<span class="choice-icon">${state.interviews.taeAlibi?"✓":"?"}</span><span class="choice-copy"><span class="choice-title">20:50부터 21:05까지 어디에 있었습니까?</span><span class="choice-desc">최초 알리바이를 기록합니다</span></span>`,action:askTaeAlibi},
    {label:`<span class="choice-icon">${state.interviews.taeContradiction?"✓":"!"}</span><span class="choice-copy"><span class="choice-title">로비에서 목격됐습니다.</span><span class="choice-desc">${canContradict?"박민호의 목격 진술을 제시합니다":"최초 알리바이와 박민호의 로비 진술 필요"}</span></span>`,action:askTaeContradiction,locked:!canContradict},
    {label:`<span class="choice-icon">${state.interviews.taeShoes?"✓":"?"}</span><span class="choice-copy"><span class="choice-title">신발 자국과 밑창을 비교하겠습니다.</span><span class="choice-desc">${canShoes?"정밀 측정한 현장 자국과 대조합니다":"젖은 신발 자국 정밀 조사 필요"}</span></span>`,action:askTaeShoes,locked:!canShoes},
    {label:`<span class="choice-icon">${state.interviews.taeBrush?"✓":"?"}</span><span class="choice-copy"><span class="choice-title">렌즈 청소용 브러시를 보여주세요.</span><span class="choice-desc">${canBrush?"검은 합성섬유와 장비를 비교합니다":"검은 섬유 정밀 조사 필요"}</span></span>`,action:askTaeBrush,locked:!canBrush},
    {label:`<span class="choice-icon">${state.interviews.taePhoto?"✓":"?"}</span><span class="choice-copy"><span class="choice-title">Ending B 촬영 요청을 왜 했습니까?</span><span class="choice-desc">${canPhoto?"서지안의 증언을 근거로 묻습니다":"촬영 요청을 들은 사람의 증언 필요"}</span></span>`,action:askTaePhoto,locked:!canPhoto},
    {label:`<span class="choice-icon">💾</span><span class="choice-copy"><span class="choice-title">메모리카드 확인</span><span class="choice-desc">${canMemory?"주요 진술을 토대로 삭제 기록을 확인합니다":"관련 인물의 주요 진술과 현장 감식이 더 필요합니다"}</span></span>`,action:memoryCard,locked:!canMemory,primary:canMemory},
    {label:'<span class="choice-icon">↩</span><span class="choice-copy"><span class="choice-title">수사 본부로</span><span class="choice-desc">다른 인물이나 장소로 이동합니다</span></span>',action:investigationHub}
  ],"집중 심문");
}

function askTaeAlibi(){
  state.interviews.taeAlibi=true;
  setScene("tae-alibi",`
    <p class="scene-narration">이태준은 망설이지 않는다. 너무 짧고 매끈해서 오히려 수첩에 그대로 옮겨 적어둘 가치가 있는 대답이다.</p>
    <div class="dialogue-scene dialogue-scene--portrait" style="--portrait:url('assets/portrait-lee-taejun-v2.png')">
      <p class="dialogue dialogue--detective"><span>탐정</span>20:50부터 21:05까지 어디에 있었습니까?</p>
      <p class="dialogue dialogue--suspect"><span>이태준</span>계속 정원에 있었습니다.</p>
    </div>
    ${detectiveThought("15분 동안 ‘계속’ 정원에 있었다. 범위가 큰 진술일수록 작은 목격 하나에도 쉽게 흔들린다.")}
    <div class="question-unlocked">최초 진술 기록 · 20:50~21:05 정원</div>
  `,[{label:"↩ 다음 질문 선택",action:leeTaejun,primary:true},{label:"🏠 수사 본부로",action:investigationHub}],"이태준 심문");
}

function askTaeContradiction(){
  state.interviews.taeContradiction=true; addClues([19]);
  setScene("tae-contradiction",`
    <p class="scene-narration">목격 시각을 읽어주자 이태준의 대답 앞에 짧은 공백이 생긴다. 처음에는 없던 로비 방문이 뒤늦게 진술 속으로 들어온다.</p>
    <div class="dialogue-scene dialogue-scene--portrait" style="--portrait:url('assets/portrait-lee-taejun-v2.png')">
      <p class="dialogue dialogue--detective"><span>탐정</span>박민호는 20:52~20:53경 당신을 관리 데스크 앞에서 봤습니다.</p>
      <p class="dialogue dialogue--suspect"><span>이태준</span>…20:52경 잠깐 안으로 들어온 건 맞습니다. 하지만 곧 다시 나갔습니다.</p>
    </div>
    ${detectiveThought("거짓말이 곧 범행의 증명은 아니다. 하지만 사실을 숨긴 이유는 반드시 남는다.")}
    <div class="clue-found">단서 19 확보 · 최초 알리바이 수정</div>
  `,[{label:"↩ 다음 질문 선택",action:leeTaejun,primary:true},{label:"🏠 수사 본부로",action:investigationHub}],"이태준 심문");
}

function askTaeShoes(){
  state.interviews.taeShoes=true; addClues([20]);
  setScene("tae-shoes",`
    <p class="scene-narration">현장 사진 위에 투명한 밑창 도안을 겹친다. 사각 블록과 사선 홈이 마치 처음부터 한 장이었던 것처럼 포개진다.</p>
    <div class="dialogue-scene dialogue-scene--portrait" style="--portrait:url('assets/portrait-lee-taejun-v2.png')">
      <p class="dialogue dialogue--detective"><span>탐정</span>현장의 280mm 자국과 신발 밑창을 대조하겠습니다.</p>
      <p class="dialogue dialogue--suspect"><span>이태준</span>신발 크기가 같다는 이유만으로 저라고 할 수는 없잖습니까?</p>
    </div>
    <p class="comparison-result"><b>비교 결과</b> 크기뿐 아니라 사각 블록과 사선 홈의 밑창 패턴도 일치한다.</p>
    ${detectiveThought("크기만 같다면 우연일 수 있다. 패턴과 달라진 알리바이까지 겹치면 우연이 설 자리는 좁아진다.")}
    <div class="clue-found">단서 20 확보 · 이태준 신발과 현장 자국 일치</div>
  `,[{label:"↩ 다음 질문 선택",action:leeTaejun,primary:true},{label:"🏠 수사 본부로",action:investigationHub}],"이태준 심문");
}

function askTaeBrush(){
  state.interviews.taeBrush=true;
  setScene("tae-brush",`
    <p class="scene-narration">장비 가방에서 나온 브러시는 오래 사용한 듯 털끝이 고르지 않다. 빠진 자리와 현장의 검은 조각을 차분히 비교한다.</p>
    <div class="dialogue-scene dialogue-scene--portrait" style="--portrait:url('assets/portrait-lee-taejun-v2.png')">
      <p class="dialogue dialogue--detective"><span>탐정</span>렌즈 청소용 브러시를 보여주세요.</p>
      <p class="dialogue dialogue--suspect"><span>이태준</span>촬영 장비에 늘 넣어 다닙니다. 오래 써서 털이 조금 빠졌어요.</p>
    </div>
    <p class="comparison-result"><b>비교 결과</b> 브러시는 현장에서 발견한 것과 같은 검은 합성섬유 재질이며 일부 털이 빠져 있다.</p>
    ${detectiveThought("한 조각의 섬유와 한 자루의 브러시가 이어졌다. 이제 이 연결을 실제 시간과 행동으로 묶을 증거가 필요하다.")}
    <div class="question-unlocked">장비 비교 기록 · 현장의 검은 섬유와 연결 가능</div>
  `,[{label:"↩ 다음 질문 선택",action:leeTaejun,primary:true},{label:"🏠 수사 본부로",action:investigationHub}],"이태준 심문");
}

function askTaePhoto(){
  state.interviews.taePhoto=true; addClues([21]);
  setScene("tae-photo",`
    <p class="scene-narration">두 차례의 촬영 요청을 언급하자 이태준은 질문이 끝나기도 전에 방어적인 답을 꺼낸다. 그 한마디가 대화의 방향을 바꾼다.</p>
    <div class="dialogue-scene dialogue-scene--portrait" style="--portrait:url('assets/portrait-lee-taejun-v2.png')">
      <p class="dialogue dialogue--detective"><span>탐정</span>Ending B 촬영 요청이 두 번 거절됐다고 들었습니다.</p>
      <p class="dialogue dialogue--suspect"><span>이태준</span>제가 그 페이지를 원했다면 훔칠 필요가 없죠. <b>사진만 찍으면 되니까.</b></p>
    </div>
    <p class="comparison-result"><b>진술 유의</b> 아직 누구도 그에게 ‘촬영했을 가능성’을 먼저 언급하지 않았다.</p>
    ${detectiveThought("질문에 없던 ‘사진’이 먼저 나왔다. 사람은 때때로 숨기려는 사실의 모양대로 변명을 만든다.")}
    <div class="clue-found">단서 21 확보 · 질문보다 먼저 나온 “사진만”이라는 말</div>
  `,[{label:"↩ 다음 질문 선택",action:leeTaejun,primary:true},{label:"🏠 수사 본부로",action:investigationHub}],"이태준 심문");
}
function memoryCard(){
  state.examined.memory=true; addClues([22,23]);
  setScene("memory",`
    <h2>💾 메모리카드 조사</h2>
    <p>복구 프로그램의 진행 막대가 끝에 닿자 검게 비어 있던 미리보기 두 칸에 이미지가 떠오른다. 삭제됐지만 완전히 사라지지는 않은 파일들이다.</p>
    <p><b>20:58:36</b> · Ending B 악보가 음악실 그랜드피아노 옆에서 촬영됐다. 종이의 위치와 배경은 사진이 다른 장소에서 찍힌 것이 아님을 보여준다.</p>
    <p><b>20:58:51</b> · 악보 아래에 “Do not publish before premiere.”라는 메모가 보인다. 그리고 사진 가장자리에는 <b>파란 테두리가 있는 흰 카드</b>가 반쯤 걸쳐 있다.</p>
    <p>두 장의 사진 앞에서 이태준은 더 이상 음악실에 들어간 사실을 부정하지 못한다. 다만 악보를 훔치지는 않았다고 주장한다.</p>
    <blockquote>“복도에서 발소리가 들려서 급히 나왔습니다. 악보는 다시 넣었다고 생각했어요.”</blockquote>
    ${detectiveThought("침입 시각과 목적은 한 선으로 이어졌다. 하지만 우리가 찾는 7페이지가 왜 사라졌는지는 아직 설명되지 않는다.")}
    <div class="clue-found">단서 22, 23 확보 · 무단 침입과 촬영은 사실상 확정</div>
  `,[{label:"👂 복도에서 들은 소리 추궁",action:hallSound},{label:"↩ 수사 본부로",action:investigationHub}],"디지털 감식");
}
function hallSound(){
  state.examined.sound=true; addClues([24]);
  setScene("sound",`
    <h2>👂 20:58~20:59, 복도의 소리</h2>
    <p>이태준은 계단 쪽에서 빠르게 다가오는 발소리와 금속이 부딪히는 소리를 들었다고 진술한다. 그 소리에 놀라 촬영을 멈추고 서둘러 방을 나왔다는 설명이다.</p>
    <p>복도 동선을 다시 확인하자 마지막 빈칸에 사람이 하나 들어온다. 무대 진행 스태프 <b>최은경</b>이 20:59경 의상실 물품을 가지러 2층에 올라왔다.</p>
    <blockquote>“음악실 문 닫히는 소리를 들었고, 바닥에 종이 한 장이 떨어져 있길래 의상실 책상 위에 올려뒀어요.”</blockquote>
    <p>의상실 문을 열고 책상으로 다가간다. 종이 한 장이 다른 물품 사이에 조용히 놓여 있다.</p>
    <div class="case-closed">
      <h2>Moonlit No. 7 · Ending B</h2>
      <p>사라졌던 7페이지다.</p>
    </div>
    ${detectiveThought("사건은 ‘도난’에서 시작했지만, 종이는 훔쳐진 적이 없었다. 무단 침입과 급한 퇴장이 만든 착오가 모두의 의심을 키운 것이다.")}
    <div class="clue-found">단서 24 확보 · ‘도난’ 자체가 아니었을 가능성이 강해졌다.</div>
  `,[{label:"⚖️ 이제 사건을 해결한다",action:finalSolve,primary:true},{label:"↩ 수사 본부로",action:investigationHub}],"결정적 발견");
}

function finalSolve(){
  setScene("solve",`
    <h2>⚖️ 최종 추리</h2>
    <p class="lead">흩어져 있던 시간, 진술, 흔적을 하나의 사건으로 묶을 차례입니다. 가장 의심스러운 사람을 고르는 것이 아니라, 모든 단서를 모순 없이 설명하는 결론을 선택하세요.</p>
    ${detectiveThought("누가, 왜, 어떻게. 세 답은 같은 시간선 안에서 맞물려야 한다. 한 조각만 설명하는 결론은 정답이 아니다.")}
    <form id="solveForm" class="final-form">
      <div class="question">
        <b>1. 20:58 음악실에 무단 침입한 사람은?</b>
        <label><input type="radio" name="q1" value="park"> 박민호</label>
        <label><input type="radio" name="q1" value="yura"> 한유라</label>
        <label><input type="radio" name="q1" value="jian"> 서지안</label>
        <label><input type="radio" name="q1" value="tae"> 이태준</label>
      </div>
      <div class="question">
        <b>2. 그의 주된 목적은?</b>
        <label><input type="radio" name="q2" value="steal"> 악보를 훔치기 위해</label>
        <label><input type="radio" name="q2" value="erase"> Ending B를 없애기 위해</label>
        <label><input type="radio" name="q2" value="photo"> Ending B를 몰래 촬영하기 위해</label>
        <label><input type="radio" name="q2" value="sabotage"> 공연을 방해하기 위해</label>
      </div>
      <div class="question">
        <b>3. 7페이지가 사라진 직접 원인은?</b>
        <label><input type="radio" name="q3" value="hidden"> 한유라가 숨겼다</label>
        <label><input type="radio" name="q3" value="drop"> 이태준이 급히 나가다 떨어뜨렸고, 최은경이 옮겼다</label>
        <label><input type="radio" name="q3" value="manager"> 박민호가 회수했다</label>
        <label><input type="radio" name="q3" value="wind"> 창문 바람으로 날아갔다</label>
      </div>
      <button type="submit" class="primary">🧩 추리 제출</button>
    </form>
    <div id="solveResult"></div>
  `,[{label:"↩ 수사 본부로",action:investigationHub}],"최종 추리");
  setTimeout(()=>{
    $("#solveForm").addEventListener("submit",(e)=>{
      e.preventDefault();
      const fd=new FormData(e.target);
      const q1=fd.get("q1"), q2=fd.get("q2"), q3=fd.get("q3");
      if(!q1||!q2||!q3){
        $("#solveResult").innerHTML='<p class="result-bad">세 질문에 모두 답해주세요.</p>';
        return;
      }
      if(q1==="tae" && q2==="photo" && q3==="drop"){
        state.solved=true; saveState(); ending();
      } else {
        $("#solveResult").innerHTML='<p class="result-bad">현재 선택한 결론으로는 일부 단서가 설명되지 않습니다.</p><p>수사 기록을 다시 살피고, 세 답이 하나의 시간선으로 이어지는지 확인하세요.</p>';
      }
    });
  },0);
}

function ending(){
  setScene("ending",`
    <div class="case-closed">
      <h2>CASE CLOSED</h2>
      <p>달빛 악보 실종사건 · 해결</p>
    </div>
    <p class="scene-narration">창밖의 빗소리는 어느새 잦아들었다. 사라졌다고 믿었던 마지막 장은 처음부터 누군가의 소유물이 된 적 없이, 엉뚱한 방에서 다음 연주를 기다리고 있었다.</p>
    <h3>정답</h3>
    <p><b>무단 침입 및 촬영:</b> 이태준</p>
    <p><b>목적:</b> 공개 전 Ending B를 몰래 촬영하기 위해</p>
    <p><b>실종 원인:</b> 급히 나가는 과정에서 7페이지가 떨어졌고, 최은경이 의상실로 옮김</p>

    <h3>사건 재구성</h3>
    <p><b>20:40</b> 서지안이 Ending B까지 포함한 악보 전체를 보관함에 넣는다.</p>
    <p><b>20:50~53</b> 박민호가 로비를 비운 사이 이태준이 관리 데스크 부근에 접근한다.</p>
    <p><b>20:58</b> 비상 마스터카드로 음악실에 들어가 Ending B를 촬영한다.</p>
    <p><b>20:59 직전</b> 계단 쪽 발소리를 듣고 급히 나가며 7페이지를 떨어뜨린다.</p>
    <p><b>20:59</b> 최은경이 종이를 주워 의상실 책상 위에 올려둔다.</p>
    <p><b>21:10</b> 악보 7페이지만 보이지 않아 ‘도난사건’으로 오인된다.</p>

    <h3>붉은 청어와 핵심 단서</h3>
    <p><b>로진 + 메모</b>는 한유라를 강하게 의심하게 만들지만 범행 당시 흔적은 아니다.</p>
    <p><b>브러시 털</b>은 방향을 가리키지만 단독으로는 결정적이지 않다.</p>
    <p><b>젖은 신발 + 거짓 알리바이 + 비상 마스터카드 접근</b>이 이태준을 압박한다.</p>
    <p>결정타는 <b>20:58 삭제 사진</b>이다.</p>
    <div class="notice"><b>진짜 반전:</b> “누가 악보를 훔쳤나?”가 아니라 “악보는 정말 도난당했나?”가 사건의 핵심 질문이었다.</div>
    ${detectiveThought("좋은 추리는 가장 그럴듯한 사람을 고르는 일이 아니다. 처음 던진 질문 자체가 틀렸을 가능성까지 끝내 의심하는 일이다.")}
  `,[
    {label:"📒 전체 단서 다시 보기",action:openNotebook},
    {label:"↺ 사건 다시 플레이",action:()=>{localStorage.removeItem("moonlit_case001_bright_proto_v08b"); state=structuredClone(initialState); intro();}}
  ],"사건 종결");
}

function openNotebook(){
  const items = Object.entries(clues).map(([n,t])=>{
    const found=state.clues.includes(Number(n));
    return `<div class="note-item" style="opacity:${found?1:.35}">
      <b>단서 ${n}</b><br>${found?t:"아직 발견하지 못한 단서"}
    </div>`;
  }).join("");
  showModal(`<h2>📒 탐정수첩</h2><p>확보한 단서 ${state.clues.length}/24</p><div class="notebook-list">${items}</div>`);
}
function openSuspects(){
  const seen = state.visited;
  const data = [
    {name:"박민호",role:"관리자",motive:seen.park?"동기 약함":"미확인",alibi:seen.park?"신발 패턴 불일치":"미확인",image:"portrait-park-minho.png"},
    {name:"한유라",role:"바이올리니스트",motive:seen.yura?"동기 높음":"미확인",alibi:seen.yura?"20:54~21:00 연습 녹음":"미확인",image:"portrait-han-yura.png"},
    {name:"서지안",role:"피아니스트",motive:seen.jian?"Ending B 선호":"미확인",alibi:seen.jian?"20:55~21:03 영상통화":"미확인",image:"portrait-seo-jian.png"},
    {name:"이태준",role:"사진작가",motive:seen.tae?"촬영 욕구 확인":"미확인",alibi:seen.tae?"최초 진술 불일치":"미확인",image:"portrait-lee-taejun-v2.png"}
  ];
  showModal(`<h2>👤 용의자 현황</h2><div class="suspect-list">${
    data.map(x=>`<article class="suspect-item"><div class="suspect-portrait"><img src="assets/${x.image}" alt="${x.name} 인물화"></div><div class="suspect-detail"><b>${x.name}</b><span>${x.role}</span><div class="suspect-grid"><div>동기/관심</div><div>${x.motive}</div><div>알리바이</div><div>${x.alibi}</div></div></div></article>`).join("")
  }</div>`);
}

function openStatus(){
  const progress = Math.round((state.clues.length / 24) * 100);
  const locations = [];
  const people = [];
  if(state.visited.music) locations.push("음악실");
  if(state.visited.lobby) locations.push("로비");
  if(state.visited.park) people.push("박민호");
  if(state.visited.yura) people.push("한유라");
  if(state.visited.jian) people.push("서지안");
  if(state.visited.tae) people.push("이태준");
  const examinedCount = Object.values(state.examined).filter(Boolean).length;
  const tags = (items) => items.length
    ? items.map(item=>`<span class="status-tag">${item}</span>`).join("")
    : '<span class="status-tag status-tag--empty">아직 없음</span>';
  const summary = state.solved
    ? "사건 해결을 완료했습니다."
    : state.started
      ? "수사 기록이 자동으로 저장되고 있습니다."
      : "문라이트 하우스에 들어가면 수사가 시작됩니다.";

  showModal(`
    <h2>수사 현황</h2>
    <p>${summary}</p>
    <div class="status-overview">
      <div class="status-score"><span>확보 단서</span><b>${state.clues.length}/24</b></div>
      <div class="status-summary">
        <span>전체 진행률</span>
        <strong>${progress}% · 세부 조사 ${examinedCount}건</strong>
        <div class="status-meter" aria-label="수사 진행률 ${progress}%"><i style="width:${progress}%"></i></div>
      </div>
    </div>
    <div class="status-sections">
      <div class="status-section"><span>조사한 장소</span><div class="status-tags">${tags(locations)}</div></div>
      <div class="status-section"><span>이야기를 나눈 사람</span><div class="status-tags">${tags(people)}</div></div>
    </div>
    <p class="modal-note">● 이 브라우저에 수사 기록을 자동 저장합니다.</p>
  `,"수사 현황");
}

function openTimeline(){
  showModal(`
    <h2>사건 시간표</h2>
    <p>사건이 확인되기 전후의 주요 출입 기록입니다.</p>
    <ol class="timeline-mini">
      <li><b>20:41</b><span>음악실 잠김</span></li>
      <li><b>20:58</b><span>마스터카드로 열림</span></li>
      <li><b>20:59</b><span>다시 잠김</span></li>
      <li><b>21:10</b><span>악보 7페이지 실종 확인</span></li>
    </ol>
    <p class="modal-note">새로운 시각 정보는 조사 과정에서 수첩에 추가됩니다.</p>
  `,"사건 시간표");
}

function showModal(html, label="상세 정보"){
  $("#modalContent").innerHTML=html;
  $("#modal").setAttribute("aria-label",label);
  $("#modal").classList.remove("hidden");
}
function hideModal(){ $("#modal").classList.add("hidden"); }

$("#notebookBtn").addEventListener("click",openNotebook);
$("#suspectBtn").addEventListener("click",openSuspects);
$("#statusBtn").addEventListener("click",openStatus);
$("#timelineBtn").addEventListener("click",openTimeline);
$("#resetBtn").addEventListener("click",resetGame);
$("#modalClose").addEventListener("click",hideModal);
$(".modal-backdrop").addEventListener("click",hideModal);

function render(saved){
  if(state.solved){ ending(); return; }
  if(!state.started){ intro(); return; }
  investigationHub();
}
render();
