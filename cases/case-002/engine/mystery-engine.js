(function(){
  "use strict";

  const game = window.MYSTERY_CASE;
  if(!game) throw new Error("MYSTERY_CASE 데이터가 없습니다. case-data.js를 먼저 불러오세요.");

  const $ = (selector) => document.querySelector(selector);
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const clueIds = Object.keys(game.clues || {});
  const defaults = {
    started:false,
    solved:false,
    scene:game.entryScene || "intro",
    clues:[],
    flags:{},
    visited:[]
  };

  let state = loadState();

  function loadState(){
    try{
      const saved = JSON.parse(localStorage.getItem(game.meta.storageKey) || "{}");
      return {
        ...clone(defaults),
        ...saved,
        clues:Array.isArray(saved.clues) ? saved.clues.filter(id=>clueIds.includes(id)) : [],
        flags:{...(saved.flags || {})},
        visited:Array.isArray(saved.visited) ? saved.visited : []
      };
    }catch(error){
      return clone(defaults);
    }
  }

  function saveState(){
    localStorage.setItem(game.meta.storageKey, JSON.stringify(state));
    updateTools();
  }

  function resetGame(){
    if(!confirm("수사 기록을 모두 지우고 처음부터 시작할까요?")) return;
    localStorage.removeItem(game.meta.storageKey);
    state = clone(defaults);
    renderScene(state.scene);
  }

  function tokenValue(name){
    const axes = game.progressAxes || [];
    const progressCount = axes.filter(axis=>meets(axis.requires)).length;
    const progressTotal = axes.length || clueIds.length;
    const values = {
      clueCount:state.clues.length,
      clueTotal:clueIds.length,
      progressCount:axes.length ? progressCount : state.clues.length,
      progressTotal,
      progress:progressTotal ? Math.round(((axes.length ? progressCount : state.clues.length) / progressTotal) * 100) : 0,
      caseTitle:game.meta.title,
      caseId:game.meta.id,
      version:game.meta.version
    };
    return values[name] ?? "";
  }

  function fill(value=""){
    return String(value).replace(/\{\{\s*([\w]+)\s*\}\}/g,(_,name)=>tokenValue(name));
  }

  function assetUrl(value){
    return value ? new URL(value,document.baseURI).href : "";
  }

  function meets(requirements={}){
    const allClues = requirements.allClues || [];
    const anyClues = requirements.anyClues || [];
    const allFlags = requirements.allFlags || [];
    const anyFlags = requirements.anyFlags || [];
    if(allClues.some(id=>!state.clues.includes(id))) return false;
    if(anyClues.length && !anyClues.some(id=>state.clues.includes(id))) return false;
    if(allFlags.some(id=>!state.flags[id])) return false;
    if(anyFlags.length && !anyFlags.some(id=>state.flags[id])) return false;
    if(requirements.minClues && state.clues.length < requirements.minClues) return false;
    return true;
  }

  function applyEffects(effects={}){
    (effects.addClues || []).forEach(id=>{
      if(clueIds.includes(id) && !state.clues.includes(id)) state.clues.push(id);
    });
    (effects.setFlags || []).forEach(id=>{ state.flags[id] = true; });
    (effects.clearFlags || []).forEach(id=>{ state.flags[id] = false; });
    if(effects.started !== undefined) state.started = Boolean(effects.started);
    if(effects.solved !== undefined) state.solved = Boolean(effects.solved);
    state.clues.sort((a,b)=>clueIds.indexOf(a)-clueIds.indexOf(b));
  }

  function runAction(action){
    if(!meets(action.requires)) return;
    applyEffects(action.effects);
    if(action.goto) renderScene(action.goto);
    else saveState();
  }

  function renderBlock(block){
    if(block.requires && !meets(block.requires)) return "";
    const html = fill(block.html || block.text || "");
    switch(block.type){
      case "heading": return `<h2>${html}</h2>`;
      case "subheading": return `<h3>${html}</h3>`;
      case "lead": return `<p class="lead">${html}</p>`;
      case "paragraph": return `<p class="scene-narration">${html}</p>`;
      case "thought": return `<aside class="detective-thought"><span>${fill(block.label || "탐정의 생각")}</span><p>${html}</p></aside>`;
      case "callout": return `<div class="case-hook case-hook--${block.tone || "coral"}"><span>${block.icon || "!"}</span><div>${block.title?`<b>${fill(block.title)}</b><br>`:""}${html}</div></div>`;
      case "clue": return `<div class="clue-found">${html}</div>`;
      case "record": return `<div class="question-unlocked">${html}</div>`;
      case "comparison": return `<p class="comparison-result">${block.title?`<b>${fill(block.title)}</b>`:""}${html}</p>`;
      case "quote": return `<blockquote>${html}</blockquote>`;
      case "closed": return `<div class="case-closed"><h2>${fill(block.title || "CASE CLOSED")}</h2><p>${html}</p></div>`;
      case "roomBrief": {
        const found=(block.clues || []).filter(id=>state.clues.includes(id)).length;
        const total=(block.clues || []).length;
        return `<div class="room-brief"><div><span class="room-brief__eyebrow">${fill(block.eyebrow || "INTERACTIVE SCENE")}</span><h2>${fill(block.title)}</h2><p>${html}</p>${block.guide?`<p class="room-brief__guide">${fill(block.guide)}</p>`:""}</div><div class="room-progress" aria-label="${fill(block.progressLabel || "조사 진행")} ${found}/${total}"><strong>${found}<small>/${total}</small></strong><span>${fill(block.unit || "단서")}</span></div></div>`;
      }
      case "dialogue": return renderDialogue(block);
      case "progress": return `<div class="hub-progress"><b>${game.progressAxes?.length?"수사 축":"단서"} ${tokenValue("progressCount")}/${tokenValue("progressTotal")}</b><span class="hub-progress__bar" aria-hidden="true"><i style="width:${tokenValue("progress")}%"></i></span><span>${tokenValue("progress")}%</span></div>`;
      default: return html;
    }
  }

  function renderDialogue(block){
    const suspect = game.suspects.find(item=>item.id===block.suspect);
    const suspectPortrait = suspect?.portrait ? `url('${assetUrl(suspect.portrait)}')` : "none";
    const detectivePortrait = game.assets?.detective ? `url('${assetUrl(game.assets.detective)}')` : "none";
    const lines = (block.lines || []).map(line=>{
      const side=line.speaker==="detective" ? "detective" : "suspect";
      const name=side==="detective" ? (game.labels?.detective || "탐정") : (suspect?.name || line.name || "인물");
      return `<p class="dialogue dialogue--${side}"><span>${name}</span>${fill(line.text)}</p>`;
    }).join("");
    return `<div class="dialogue-scene dialogue-scene--portrait" style="--portrait:${suspectPortrait};--detective-portrait:${detectivePortrait}">${lines}</div>`;
  }

  function renderInterviewHeader(scene){
    const person=game.suspects.find(item=>item.id===scene.interview.person);
    if(!person) return "";
    const flags=scene.interview.progressFlags || [];
    const asked=flags.filter(id=>state.flags[id]).length;
    return `<div class="character-interview"><div class="character-interview__portrait"><img src="${person.portrait}" alt="${person.name} 인물화"></div><div class="character-interview__copy"><span>${person.role}</span><h2>${person.name}</h2><p>${fill(scene.interview.intro || "확인할 질문을 선택하세요. 확보한 단서에 따라 새로운 질문이 열립니다.")}</p></div><div class="interview-progress"><b>${asked}/${flags.length}</b><span>확인 완료</span></div></div>`;
  }

  function renderActionLabel(action){
    if(!action.title) return fill(action.label || "계속");
    return `<span class="choice-icon">${action.icon || "→"}</span><span class="choice-copy"><span class="choice-title">${fill(action.title)}</span>${action.description?`<span class="choice-desc">${fill(action.description)}</span>`:""}</span>`;
  }

  function renderActions(actions=[]){
    const host=$("#choices");
    host.innerHTML="";
    let group="";
    actions.forEach(action=>{
      if(action.group && action.group!==group){
        const heading=document.createElement("div");
        heading.className=`choice-group-heading choice-group-heading--${action.groupKey || "default"}`;
        heading.innerHTML=`<span aria-hidden="true">${action.groupIcon || ""}</span><div><b>${fill(action.group)}</b>${action.groupDescription?`<small>${fill(action.groupDescription)}</small>`:""}</div>`;
        host.appendChild(heading);
        group=action.group;
      }
      const button=document.createElement("button");
      const unlocked=meets(action.requires);
      button.innerHTML=renderActionLabel(action);
      button.className=`choice--${action.kind || "action"}${action.primary?" primary":""}${unlocked?"":" locked"}`;
      button.disabled=!unlocked;
      if(!unlocked && action.lockedDescription && action.title){
        button.innerHTML=renderActionLabel({...action,description:action.lockedDescription});
      }
      button.addEventListener("click",()=>runAction(action));
      host.appendChild(button);
    });
  }

  function renderHotspots(scene){
    const layer=$("#hotspotLayer");
    layer.innerHTML="";
    const points=scene.hotspots || [];
    layer.hidden=!points.length;
    points.forEach(point=>{
      const found=(point.foundClues || []).every(id=>state.clues.includes(id));
      const button=document.createElement("button");
      button.type="button";
      button.className=`hotspot${found?" hotspot--found":""}`;
      button.style.setProperty("--x",`${point.x}%`);
      button.style.setProperty("--y",`${point.y}%`);
      button.setAttribute("aria-label",`${fill(point.label)} ${found?"다시 보기":"조사하기"}`);
      button.innerHTML=`<span class="hotspot__pin" aria-hidden="true">${found?"✓":"+"}</span><span class="hotspot__label">${fill(point.label)}</span>`;
      button.addEventListener("click",()=>runAction(point));
      layer.appendChild(button);
    });
  }

  function updateVisual(scene){
    const visual={...(game.visual || {}),...(scene.visual || {})};
    document.body.dataset.scene=scene.id;
    document.body.dataset.layout=scene.layout || "detail";
    $("#chapterLabel").textContent=fill(scene.label || "수사 기록");
    $("#sceneKicker").textContent=fill(visual.kicker || game.meta.id);
    $("#sceneTitle").innerHTML=fill(visual.title || scene.title || game.meta.title);
    $("#sceneLocation").textContent=fill(visual.location || game.meta.location || "");
    $("#sceneVisual").style.backgroundImage=visual.image ? `url('${visual.image}')` : "none";
    $("#sceneVisual").style.backgroundPosition=visual.position || "center";
  }

  function renderScene(id){frameRender(id);}

  function renderSolve(scene){
    const solve=scene.solve;
    const foundEvidence=state.clues.map(id=>({id,...game.clues[id]}));
    const evidenceOptions=foundEvidence.map(item=>`<option value="${item.id}">${item.title}</option>`).join("");
    const questions=solve.questions.map((question,index)=>`<fieldset class="question"><legend>${index+1}. ${fill(question.prompt)}</legend><div class="answer-options">${question.options.map(option=>`<label><input type="radio" name="${question.id}" value="${option.value}"> ${fill(option.label)}</label>`).join("")}</div><div class="question-evidence"><label for="evidence_${question.id}">이 판단의 핵심 근거 1개</label><select id="evidence_${question.id}" name="evidence_${question.id}"><option value="">${foundEvidence.length?"확보한 단서 중 선택":"먼저 단서를 조사하세요"}</option>${evidenceOptions}</select><p class="question-evidence__detail" aria-live="polite">${foundEvidence.length?"선택한 단서의 내용을 여기서 확인할 수 있습니다.":"아직 확보한 단서가 없습니다."}</p></div></fieldset>`).join("");
    $("#story").innerHTML=(scene.blocks || []).map(renderBlock).join("")+`<form id="solveForm" class="final-form">${questions}<button type="submit" class="primary">${fill(solve.submitLabel || "추리 제출")}</button></form><div id="solveResult" aria-live="polite"></div>`;
    renderActions(scene.actions || []);
    const form=$("#solveForm");
    form.addEventListener("change",()=>{
      $("#solveResult").textContent="선택을 변경했습니다. 다시 제출하면 판정을 확인할 수 있습니다.";
    });
    form.querySelectorAll(".question-evidence select").forEach(select=>select.addEventListener("change",()=>{
      select.nextElementSibling.textContent=game.clues[select.value]?.summary || "선택한 단서의 내용을 여기서 확인할 수 있습니다.";
    }));
    form.addEventListener("submit",event=>{
      event.preventDefault();
      const data=new FormData(form);
      const results=solve.questions.map((question,index)=>{
        const answer=data.get(question.id);
        const evidence=data.get(`evidence_${question.id}`);
        const answerOK=answer===question.answer;
        const evidenceOK=question.acceptedEvidence.includes(evidence);
        const passed=answerOK && evidenceOK;
        let message, hint="";
        if(!answer || !evidence){
          message=!answer && !evidence?"답과 근거를 선택해주세요.":!answer?"답을 선택해주세요.":"근거를 선택해주세요.";
        }else if(!answerOK){
          message="답을 다시 검토하세요. 답을 고친 뒤 근거와의 연결도 확인해주세요.";
          hint=solve.hints?.[question.id]?.answer || "선택한 결론이 확보한 단서를 설명하는지 살펴보세요.";
        }else if(!evidenceOK){
          message="답은 맞습니다. 근거를 다시 확인하세요.";
          hint=solve.hints?.[question.id]?.evidence || "이 결론을 직접 뒷받침하는 단서를 찾아보세요.";
        }else{
          message="답과 근거가 모두 맞습니다.";
        }
        return {passed,html:`<div class="solve-feedback ${passed?"solve-feedback--pass":"solve-feedback--retry"}"><strong>${index+1}. ${fill(question.prompt)}</strong><p>${message}</p>${hint?`<p class="solve-feedback__hint">힌트 · ${fill(hint)}</p>`:""}</div>`};
      });
      const correct=results.every(result=>result.passed);
      if(correct){
        state.solved=true;
        saveState();
        renderScene(solve.successScene);
      }else{
        const resultElement=$("#solveResult");
        resultElement.innerHTML=`<h3>추리 점검</h3>${results.map(result=>result.html).join("")}<p>선택한 내용은 유지됩니다. 필요한 부분을 바꾼 뒤 다시 제출하세요.</p>`;
        resultElement.scrollIntoView({block:"nearest"});
      }
    });
  }

  function updateTools(){
    $("#clueCount").textContent=`${state.clues.length}/${clueIds.length}`;
    $("#statusBadge").textContent=state.solved?"완료":state.started?"진행":"대기";
  }

  function showModal(html,label){
    $("#modalContent").innerHTML=html;
    $("#modal").setAttribute("aria-label",label);
    $("#modal").classList.remove("hidden");
  }

  function hideModal(){ $("#modal").classList.add("hidden"); }

  function openNotebook(){
    TheatreUI.openBook("단서"); return;
    const items=clueIds.map((id,index)=>{
      const found=state.clues.includes(id);
      const clue=game.clues[id];
      return `<div class="note-item" style="opacity:${found?1:.35}"><b>단서 ${index+1} · ${found?clue.title:"미발견"}</b><br>${found?(clue.detail || clue.summary):"아직 발견하지 못한 단서"}</div>`;
    }).join("");
    showModal(`<h2>📒 탐정수첩</h2><p>확보한 단서 ${state.clues.length}/${clueIds.length}</p><div class="notebook-list">${items}</div>`,"탐정수첩");
  }

  function openSuspects(){
    TheatreUI.openBook("인물"); return;
    const cards=(game.suspects || []).map(person=>{
      const status=(person.status || []).map(item=>`<div>${item.label}</div><div>${!item.whenFlag || state.flags[item.whenFlag]?fill(item.value):(item.unknown || "미확인")}</div>`).join("");
      return `<article class="suspect-item"><div class="suspect-portrait"><img src="${person.portrait}" alt="${person.name} 인물화"></div><div class="suspect-detail"><b>${person.name}</b><span>${person.role}</span><div class="suspect-grid">${status}</div></div></article>`;
    }).join("");
    showModal(`<h2>👤 용의자 현황</h2><div class="suspect-list">${cards}</div>`,"용의자 현황");
  }

  function openStatus(){
    TheatreUI.openBook("장소"); return;
    const visitedLabels=state.visited.map(id=>game.scenes[id]?.shortLabel).filter(Boolean);
    const tags=visitedLabels.length?visitedLabels.map(label=>`<span class="status-tag">${label}</span>`).join(""):'<span class="status-tag status-tag--empty">아직 없음</span>';
    showModal(`<h2>수사 현황</h2><p>${state.solved?"사건 해결을 완료했습니다.":"수사 기록이 이 브라우저에 자동 저장되고 있습니다."}</p><div class="status-overview"><div class="status-score"><span>확보 단서</span><b>${state.clues.length}/${clueIds.length}</b></div><div class="status-summary"><span>${game.progressAxes?.length?"수사 축":"전체 진행률"}</span><strong>${tokenValue("progressCount")}/${tokenValue("progressTotal")}</strong><div class="status-meter"><i style="width:${tokenValue("progress")}%"></i></div></div></div><div class="status-section"><span>방문한 장면</span><div class="status-tags">${tags}</div></div>`,"수사 현황");
  }

  function openTimeline(){
    TheatreUI.openBook("시간선"); return;
    const rows=(game.timeline || []).filter(item=>meets(item.requires)).sort((a,b)=>a.time.localeCompare(b.time)).map(item=>`<li><b>${item.time}</b><span>${fill(item.text)}</span></li>`).join("");
    showModal(`<h2>사건 시간표</h2><p>${fill(game.labels?.timelineIntro || "확인된 주요 시각입니다.")}</p><ol class="timeline-mini">${rows}</ol>`,"사건 시간표");
  }

  function bindShell(){
    document.title=`${game.meta.id} · ${game.meta.title}`;
    $("#brandEyebrow").textContent="둥둥 추리극장";
    $("#brandCase").textContent=game.meta.id+" · "+game.meta.title;
    $("#footerCase").textContent=`${game.meta.series || "MYSTERY FILE"} · ${game.meta.id}`;
    $("#footerVersion").textContent=`${game.meta.title} v${game.meta.version}`;
    $("#notebookBtn").addEventListener("click",openNotebook);
    $("#suspectBtn").addEventListener("click",openSuspects);
    $("#statusBtn").addEventListener("click",openStatus);
    $("#timelineBtn").addEventListener("click",openTimeline);
    $("#resetBtn").addEventListener("click",resetGame);
    $("#modalClose").addEventListener("click",hideModal);
    $(".modal-backdrop").addEventListener("click",hideModal);
    $("#brandLink").addEventListener("click",event=>{
      event.preventDefault();
      renderScene(state.started?(game.hubScene || "hub"):(game.entryScene || "intro"));
    });
  }

// View-only adapter. meets(), applyEffects(), runAction() and renderSolve() remain authoritative.
const roomEntries=Object.entries(game.scenes).filter(([,s])=>(s.blocks||[]).some(b=>b.type==='roomBrief'));
function frameLocations(){return roomEntries.map(([id,s])=>({id,name:s.shortLabel,image:s.visual.image,run:()=>renderScene(id),visited:state.visited.includes(id),clueIds:s.blocks.find(b=>b.type==='roomBrief').clues,description:s.blocks.find(b=>b.type==='roomBrief').text}));}
function frameAnswer(scene){const dialogue=scene.blocks.find(b=>b.type==='dialogue');const answer=(dialogue?.lines||[]).filter(l=>l.speaker!=='detective').map(l=>fill(l.text)).join('<br>');const thought=scene.blocks.filter(b=>b.type==='paragraph'||b.type==='thought'||b.type==='comparison').map(b=>fill(b.html||b.text)).join('<br>');return `<p class="answer-text">${answer}</p><aside class="detective-thought"><span>탐정의 생각</span><p>${thought}</p></aside>`;}
function frameRender(id){const scene=game.scenes[id];if(!scene)throw new Error('장면을 찾을 수 없습니다: '+id);scene.id=id;state.scene=id;if(!state.visited.includes(id))state.visited.push(id);applyEffects(scene.effects);
 let display=scene,inline=null,result=null;const dialogue=scene.blocks?.find(b=>b.type==='dialogue');if(dialogue){const parentId=scene.actions[0].goto;display=game.scenes[parentId];display.id=parentId;inline={key:id,html:frameAnswer(scene)};}else if(scene.blocks?.some(b=>b.type==='clue')&&roomEntries.some(([rid])=>rid===scene.actions?.[0]?.goto)){const parentId=scene.actions[0].goto;display=game.scenes[parentId];display.id=parentId;result=scene.blocks;}
 const visual={...game.visual,...display.visual};const room=frameLocations().find(p=>p.id===display.id)||frameLocations().find(p=>p.image===visual.image);const title=display.interview?game.suspects.find(p=>p.id===display.interview.person).name:roomEntries.some(([rid])=>rid===display.id)?display.shortLabel:display.blocks?.find(b=>b.type==='heading')?.text||visual.title;
 const choice=a=>{const target=game.scenes[a.goto];const flags=target?.effects?.setFlags||[];const isQuestion=!!display.interview&&!!target?.blocks?.find(b=>b.type==='dialogue');const photo=frameLocations().find(p=>p.id===a.goto)||game.suspects.find(p=>a.goto==='interview_'+p.id);return {label:renderActionLabel(!meets(a.requires)&&a.lockedDescription?{...a,description:a.lockedDescription}:a),key:a.goto,run:()=>runAction(a),locked:!meets(a.requires),done:isQuestion&&flags.length>0&&flags.every(f=>state.flags[f]),kind:isQuestion?'question':a.kind,primary:a.primary,group:a.group,image:id==='hub'?photo?.image||photo?.portrait:null};};
 TheatreUI.render({id,state,label:display.label,kind:id==='hub'?'hub':display.interview?'interview':display.layout,title,html:[...(display.blocks||[]).filter(block=>!result||block.type!=='thought'),...(result||[])].map(renderBlock).join(''),person:display.interview?renderInterviewHeader(display):null,answer:inline,choices:(result?scene.actions:display.actions||[]).map(choice),image:visual.image,position:visual.position,placeId:display.interview?null:room?.id,spots:(display.hotspots||[]).map(p=>({...p,run:()=>runAction(p),done:(p.foundClues||[]).every(c=>state.clues.includes(c)),key:p.goto,locked:!meets(p.requires)})),objective:display.hotspots?.length?'현장에 남은 기록을 직접 확인하세요.':null});
 updateVisual(scene);if(scene.solve){$('#sceneVisual').hidden=true;renderSolve(scene);TheatreUI.enhanceSolve();}saveState();
}
function frameRecords(){const e=TheatreUI.escape;const known=state.clues.map(id=>({id,name:game.clues[id].title,text:game.clues[id].detail||game.clues[id].summary}));const statements=Object.entries(game.scenes).filter(([,s])=>s.blocks?.some(b=>b.type==='dialogue')&&(s.effects?.setFlags||[]).length&&(s.effects.setFlags).every(f=>state.flags[f])).map(([id,s])=>{const b=s.blocks.find(b=>b.type==='dialogue'),p=game.suspects.find(p=>p.id===b.suspect);return {name:p?.name||'인물',question:fill(b.lines.find(l=>l.speaker==='detective').text),html:frameAnswer(s)};});return {clues:known,people:game.suspects.map(p=>({name:p.name,role:p.role,image:p.portrait,html:'<dl>'+p.status.map(s=>`<dt>${e(s.label)}</dt><dd>${!s.whenFlag||state.flags[s.whenFlag]?fill(s.value):e(s.unknown||'미확인')}</dd>`).join('')+'</dl>'+statements.filter(s=>s.name===p.name).map(s=>`<div class="linked-clue"><b>${s.question}</b>${s.html}</div>`).join('')})),places:frameLocations().map(p=>({...p,role:p.visited?'방문한 장소':'조사 가능한 장소',html:`<p>${e(p.description)}</p>`+known.filter(c=>p.clueIds.includes(c.id)).map(c=>`<div class="linked-clue"><b>${e(c.name)}</b><small>${e(c.text)}</small></div>`).join('')})),statements,timeline:game.timeline.filter(t=>meets(t.requires)).sort((a,b)=>a.time.localeCompare(b.time)).map(t=>({time:t.time,text:fill(t.text)}))};}
TheatreUI.setup({caseId:game.meta.id,title:game.meta.title,detective:game.assets.detective,locations:frameLocations,people:()=>game.suspects.map(person=>({...person,image:person.portrait,run:()=>renderScene('interview_'+person.id)})),records:frameRecords,hub:()=>renderScene('hub'),solve:()=>renderScene('solve')});

  bindShell();
  const startScene=state.solved && game.endingScene ? game.endingScene : (game.scenes[state.scene]?state.scene:(game.entryScene || "intro"));
  renderScene(startScene);
})();
