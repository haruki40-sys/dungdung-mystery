/* CASE 002 · 봉인된 심사표 */
(function(){
  "use strict";

  const visuals={
    hall:{image:"assets/location-competition-hall.webp",position:"center 54%"},
    judges:{image:"assets/location-judges-room.webp",position:"center 55%"},
    desk:{image:"assets/location-production-desk.webp",position:"center 52%"},
    lounge:{image:"assets/location-waiting-lounge.webp",position:"center 54%"}
  };

  function clueScene({label,shortLabel,visual,title,paragraph,thought,clue,flags=[],back}){
    return {
      label:"현장 조사",layout:"detail",shortLabel,visual:{...visual,title},
      effects:{addClues:[clue],setFlags:flags},
      blocks:[
        {type:"heading",text:title},
        {type:"paragraph",text:paragraph},
        {type:"thought",text:thought},
        {type:"clue",text:`단서 확보 · ${label}`}
      ],
      actions:[
        {kind:"investigate",icon:"⌕",title:`${label} 다시 살펴보기`,description:"관찰 내용을 다시 확인합니다",goto:back},
        {kind:"navigate",icon:"⌂",title:"수사 본부로",description:"다른 장소나 인물을 선택합니다",goto:"hub"}
      ]
    };
  }

  function answerScene({person,shortLabel,visual,title,question,answer,after,flags=[],clues=[],back}){
    return {
      label:"인물 심문",layout:"detail",shortLabel,visual:{...visual,title},
      effects:{setFlags:flags,addClues:clues},
      blocks:[
        {type:"paragraph",text:after},
        {type:"dialogue",suspect:person,lines:[
          {speaker:"detective",text:question},
          {speaker:"suspect",text:answer}
        ]},
        {type:"record",text:`진술 기록 · ${shortLabel}`}
      ],
      actions:[
        {kind:"question",icon:"↩",title:"다음 질문 선택",description:"확인할 질문 목록으로 돌아갑니다",goto:back},
        {kind:"navigate",icon:"⌂",title:"수사 본부로",description:"다른 장소나 인물을 선택합니다",goto:"hub"}
      ]
    };
  }

  window.MYSTERY_CASE={
    meta:{
      id:"CASE 002",title:"봉인된 심사표",version:"0.2.1",series:"DUNGDUNG MYSTERY",
      location:"테이블 원 파이널 · 결승 심사 현장",storageKey:"ddmystery_case002_save_v1"
    },
    labels:{
      detective:"탐정",timelineIntro:"확인된 기록만 시간순으로 정리합니다. 새로운 단서가 생기면 항목이 추가됩니다."
    },
    assets:{detective:"assets/portrait-detective.webp"},
    entryScene:"intro",hubScene:"hub",endingScene:"ending",
    visual:{
      kicker:"FINAL ROUND · 17:08",title:"봉인은 멀쩡했다.<br>그런데 점수는 달라졌다.",
      location:"요리 경연 〈테이블 원 파이널〉",...visuals.hall
    },
    progressAxes:[
      {id:"progress_document_integrity",requires:{allClues:["clue_seal_condition","clue_ink_pressure_continuity"]}},
      {id:"progress_score_mismatch",requires:{allClues:["clue_score_sheet_columns"],anyClues:["clue_baek_scratch_card","clue_choi_tasting_notebook"]}},
      {id:"progress_file_origin",requires:{allClues:["clue_print_job_log","clue_pdf_export_metadata","clue_reprint_request_note"]}},
      {id:"progress_motive",requires:{allClues:["clue_advisory_agreement"]}}
    ],
    timeline:[
      {time:"15:47",text:"두 참가자의 결승 요리 제출 완료"},
      {time:"15:58",text:"정상 서식 v3 출력",requires:{allClues:["clue_print_job_log"]}},
      {time:"16:09",text:"최종본 교체 요청",requires:{allClues:["clue_reprint_request_note"]}},
      {time:"16:11",text:"교체 파일 v4 생성",requires:{allClues:["clue_pdf_export_metadata"]}},
      {time:"16:14",text:"v4 세 페이지 출력",requires:{allClues:["clue_print_job_log"]}},
      {time:"16:32",text:"최종 점수 기입 시작",requires:{anyFlags:["statement_nari_process","statement_baek_score_memory"]}},
      {time:"16:42",text:"세 장의 심사표 봉인",requires:{allFlags:["statement_nari_process"]}},
      {time:"17:00",text:"임하루 우승 발표"},
      {time:"17:08",text:"봉투 공개 개봉과 점수 불일치 확인"}
    ],
    clues:{
      clue_seal_condition:{title:"봉투 봉인 상태",summary:"접착선 전체가 균일하며 재봉인 흔적이 없다.",detail:"공개 개봉 전 촬영본과 현재 봉투를 비교했다. 접착선과 종이 섬유가 자연스럽게 이어져 봉인 뒤 심사표가 바뀌었을 가능성은 낮다."},
      clue_score_sheet_columns:{title:"심사표의 열 배열",summary:"일부 페이지에서 참가자 이름 순서만 반대다.",detail:"첫 페이지와 달리 두 번째와 세 번째 페이지는 참가자 이름 열의 좌우 순서가 뒤집혀 있다. 색상 띠와 평가 항목, 합계 칸의 위치는 같다."},
      clue_template_version_mark:{title:"하단 버전 표식",summary:"실제 사용본은 v4로 표시돼 있다.",detail:"세 페이지 아래쪽의 미세한 출력 표식은 모두 v4다. 최초 준비됐다는 v3이 아니라 같은 시점에 출력된 교체본 묶음이다."},
      clue_ink_pressure_continuity:{title:"필기 압력과 잉크 연속성",summary:"숫자와 서명에 지우거나 덧쓴 흔적이 없다.",detail:"획의 눌림과 잉크 농도가 자연스럽게 이어진다. 각 심사위원의 필기 습관과도 일치해 숫자나 서명이 사후 위조된 정황은 없다."},
      clue_baek_scratch_card:{title:"백미숙의 개인 채점 카드",summary:"최종 심사표와 다른 대상별 점수가 적혀 있다.",detail:"시식 직후 계산한 개인 카드에는 참가자 이름과 총점이 함께 적혀 있다. 숫자 형태는 최종 심사표에 옮겨 적힌 필체와 일치한다."},
      clue_choi_tasting_notebook:{title:"최건의 시식 수첩",summary:"이름과 점수가 연속된 기록 속에 남아 있다.",detail:"날짜별 수첩의 해당 페이지에 두 참가자의 이름과 총점이 따로 적혀 있다. 앞뒤 기록과 잉크 상태가 이어져 사후 작성 가능성은 낮다."},
      clue_clipboard_cover_pattern:{title:"이름 행을 가리는 클립보드",summary:"고정판이 심사표 첫 행을 정확히 덮는다.",detail:"심사표를 실제처럼 끼우면 참가자 이름은 금속 고정판 아래로 숨고, 색상 띠와 점수 칸만 보인다."},
      clue_prior_round_layout:{title:"이전 라운드 심사표",summary:"색상과 좌우 배치가 모든 앞선 심사에서 고정됐다.",detail:"이전 라운드 서식은 늘 초록색이 왼쪽, 주황색이 오른쪽이다. 심사위원들이 이름보다 색과 위치를 먼저 인식할 만한 반복이었다."},
      clue_print_job_log:{title:"프린터 작업 기록",summary:"같은 날 두 버전이 다른 시각에 출력됐다.",detail:"15시 58분 v3, 16시 14분 v4가 출력됐다. 작업 계정은 진행 담당자의 관리자 계정이지만 기록은 파일을 누가 만들었는지 보여주지 않는다."},
      clue_pdf_export_metadata:{title:"v4 파일 생성 정보",summary:"작성 장치 정보가 특정 노트북 프로필과 일치한다.",detail:"16시 11분 생성된 v4의 작성자 태그와 장치 식별 정보가 행사에 등록된 한 노트북 프로필과 일치한다."},
      clue_reprint_request_note:{title:"재출력 요청 메모",summary:"교체 파일의 전달자와 요청 시각이 적혀 있다.",detail:"진행 체크리스트에는 16시 9분, 협찬사 로고 수정을 이유로 교체본을 전달받았다는 손글씨 메모가 남아 있다."},
      clue_advisory_agreement:{title:"성과 연동 자문 계약 요약본",summary:"경연 결과와 연결된 성공 보수 조항이 있다.",detail:"비공개 계약 원본이 아닌 행사 운영 측 내부 검토용 요약본이다. 프레스 자료와 함께 출력된 뒤 편철 과정에서 일반 자료 묶음에 잘못 포함됐다."},
      clue_lounge_video_timestamps:{title:"대기 라운지 촬영 타임코드",summary:"두 참가자의 모습이 핵심 시간대에 연속적으로 남아 있다.",detail:"결승 요리 제출 뒤부터 심사표 작성이 끝날 때까지 두 참가자는 인터뷰 영상에 거의 끊김 없이 등장한다."},
      clue_seoa_complaint_email:{title:"윤서아의 사전 항의 메일",summary:"결과 발표 전날 심사 절차 개선을 요구했다.",detail:"메일은 경연 전날 발송됐다. 서식 가독성과 점수 공개 원칙을 묻는 내용이며 특정 결과나 심사위원을 압박하는 표현은 없다."},
      clue_haru_message_thread:{title:"임하루의 매니지먼트 대화",summary:"자문 관계는 있지만 조작을 공유한 흔적은 없다.",detail:"홍보 자문 계약에 관한 대화는 존재하지만 성공 보수 세부 조항이나 심사표 교체, 점수 조작을 암시하는 내용은 없다."}
    },
    suspects:[
      {id:"yoon_seoa",name:"윤서아",role:"결승 진출자 · 오너 셰프",portrait:"assets/portrait-yoon-seoa.webp",status:[
        {label:"초기 정황",value:"점수 공개를 요구한 이의 제기자"},
        {label:"절차 문제",value:"경연 전날 문제를 제기함",whenFlag:"seoa_email_found"},
        {label:"핵심 시간대",value:"라운지 영상으로 확인",whenFlag:"lounge_video_found"}
      ]},
      {id:"lim_haru",name:"임하루",role:"결승 진출자 · 팝업 셰프",portrait:"assets/portrait-lim-haru.webp",status:[
        {label:"초기 정황",value:"예상 밖 결과의 직접 수혜자"},
        {label:"외부 관계",value:"자문사 연결 확인",whenFlag:"statement_haru_admits_consulting"},
        {label:"공모 정황",value:"직접 근거 확인되지 않음",whenFlag:"haru_messages_found"}
      ]},
      {id:"seo_insu",name:"서인수",role:"수석 심사위원 · 외식 자문가",portrait:"assets/portrait-seo-insu.webp",status:[
        {label:"초기 정황",value:"심사 절차와 합계 검토 책임자"},
        {label:"교체본",value:"전달 관련 진술 확인",whenFlag:"statement_seo_admits_logo_request"},
        {label:"이해관계",value:"경제적 관계 확인",whenFlag:"statement_seo_denies_financial_tie"}
      ]},
      {id:"baek_misook",name:"백미숙",role:"심사위원 · 조리 교육자",portrait:"assets/portrait-baek-misook.webp",status:[
        {label:"초기 정황",value:"기억과 심사표가 다름"},
        {label:"개인 기록",value:"의도한 점수 확인",whenFlag:"baek_card_found"},
        {label:"작성 환경",value:"이름 행 미확인",whenFlag:"statement_baek_admits_header_unseen"}
      ]},
      {id:"choi_geon",name:"최건",role:"심사위원 · 음식 평론가",portrait:"assets/portrait-choi-geon.webp",status:[
        {label:"초기 정황",value:"개인 수첩 공개를 망설임"},
        {label:"개인 기록",value:"의도한 점수 확인",whenFlag:"choi_notebook_found"},
        {label:"작성 환경",value:"색과 위치를 기준으로 작성",whenFlag:"statement_choi_admits_header_unseen"}
      ]},
      {id:"han_nari",name:"한나리",role:"경연 진행 담당자",portrait:"assets/portrait-han-nari.webp",status:[
        {label:"초기 정황",value:"출력과 봉인 관리 책임자"},
        {label:"출력 기록",value:"관리자 계정 사용",whenFlag:"print_log_found"},
        {label:"절차 책임",value:"교체본 대조 누락",whenFlag:"statement_nari_skipped_crosscheck"}
      ]}
    ],
    scenes:{
      intro:{
        label:"사건 브리핑",layout:"intro",shortLabel:"사건 브리핑",visual:{...visuals.hall},
        blocks:[
          {type:"heading",text:"봉인을 뜯자, 두 사람의 기억이 틀렸다고 적혀 있었다."},
          {type:"lead",text:"소규모 요리 경연 〈테이블 원 파이널〉의 결승. 세 장의 심사표는 서명 직후 한 봉투에 들어갔고, 여러 사람 앞에서 봉인됐다."},
          {type:"paragraph",text:"결과 발표 직후 예상 밖의 순위에 항의가 이어졌다. 결국 봉투는 공개적으로 개봉됐다. 접착선도, 서명도, 적힌 숫자도 멀쩡했다. 그런데 심사위원 두 명은 자신이 기억하는 점수와 종이에 적힌 참가자별 점수가 다르다고 주장했다."},
          {type:"callout",tone:"coral",icon:"?",title:"첫 번째 의문",text:"봉인된 문서가 바뀐 것인가, 계산이 잘못된 것인가, 아니면 사람들의 기억이 틀린 것인가?"},
          {type:"thought",text:"문서가 거짓말을 하지 않는다는 믿음부터 잠시 내려놓자. 종이가 진짜여도, 종이가 설명하는 대상까지 진짜라는 보장은 없다."}
        ],
        actions:[{kind:"decision",primary:true,icon:"→",title:"결승 심사 현장을 조사한다",description:"네 장소와 여섯 인물을 원하는 순서로 확인합니다",goto:"hub",effects:{started:true}}]
      },
      hub:{
        label:"자유 수사",layout:"hub",shortLabel:"수사 본부",
        visual:{...visuals.hall,kicker:"FREE INVESTIGATION",title:"점수는 언제부터<br>다른 사람의 것이 되었을까?",location:"현장과 인물을 원하는 순서로 조사하세요"},
        blocks:[
          {type:"heading",text:"기억, 종이, 기록을 따로 확인하세요."},
          {type:"lead",text:"처음에는 모두가 조금씩 수상합니다. 발견한 단서는 새 질문을 열고, 서로 다른 기록을 연결할수록 사건의 윤곽이 선명해집니다."},
          {type:"progress"}
        ],
        actions:[
          {group:"현장 조사",groupKey:"scene",groupIcon:"⌕",groupDescription:"문서와 도구에 남은 사실을 확인합니다",kind:"investigate",icon:"⌕",title:"경연장 조사",description:"개봉 봉투와 공개된 심사표",goto:"competition_hall"},
          {kind:"investigate",icon:"⌕",title:"심사위원실 조사",description:"개인 기록과 실제 작성 환경",goto:"judges_room"},
          {kind:"investigate",icon:"⌕",title:"제작 데스크 조사",description:"서식·파일·출력 절차",goto:"production_desk"},
          {kind:"investigate",icon:"⌕",title:"대기 라운지 조사",description:"참가자 동선과 이해관계 자료",goto:"waiting_lounge"},
          {group:"인물 심문",groupKey:"interview",groupIcon:"♙",groupDescription:"각자의 기억과 숨긴 사정을 비교합니다",kind:"question",icon:"♙",title:"윤서아 심문",description:"점수 공개를 요구한 결승 진출자",goto:"interview_yoon_seoa"},
          {kind:"question",icon:"♙",title:"임하루 심문",description:"예상 밖 결과의 수혜자",goto:"interview_lim_haru"},
          {kind:"question",icon:"♙",title:"서인수 심문",description:"심사 절차와 합계를 확인한 수석 심사위원",goto:"interview_seo_insu"},
          {kind:"question",icon:"♙",title:"백미숙 심문",description:"자신의 점수를 분명히 기억하는 심사위원",goto:"interview_baek_misook"},
          {kind:"question",icon:"♙",title:"최건 심문",description:"별도의 시식 수첩을 가진 심사위원",goto:"interview_choi_geon"},
          {kind:"question",icon:"♙",title:"한나리 심문",description:"출력부터 발표까지 관리한 진행 담당자",goto:"interview_han_nari"},
          {group:"최종 판단",groupKey:"solve",groupIcon:"⚖",groupDescription:"결론과 근거를 함께 제출합니다",kind:"decision",primary:true,icon:"⚖",title:"사건 해결에 도전",description:"현재 확보한 단서로 사건을 재구성합니다",goto:"solve"}
        ]
      },

      competition_hall:{
        label:"현장 조사",layout:"investigation",shortLabel:"경연장",visual:{...visuals.hall,title:"모두가 지켜본 봉투"},
        blocks:[{type:"roomBrief",title:"개봉된 심사 자료를 조사하세요.",text:"박수와 항의가 모두 사라진 경연장에는 결과 화면만 희미하게 빛난다. 심사 테이블 위 봉투와 세 장의 종이가 이 소동의 유일한 물증처럼 놓여 있다.",guide:"빛나는 지점을 눌러 봉인, 서식, 필기를 각각 확인하세요.",clues:["clue_seal_condition","clue_score_sheet_columns","clue_template_version_mark","clue_ink_pressure_continuity"],unit:"확인 항목"}],
        hotspots:[
          {label:"봉투 접착선",x:80,y:70,goto:"find_seal",foundClues:["clue_seal_condition"]},
          {label:"참가자 이름 열",x:65,y:78,goto:"find_columns",foundClues:["clue_score_sheet_columns"]},
          {label:"하단 인쇄 표식",x:53,y:86,goto:"find_version",foundClues:["clue_template_version_mark"]},
          {label:"숫자와 서명",x:90,y:83,goto:"find_ink",foundClues:["clue_ink_pressure_continuity"]}
        ],
        actions:[{kind:"navigate",icon:"⌂",title:"수사 본부로",description:"다른 장소나 인물을 선택합니다",goto:"hub"}]
      },
      find_seal:clueScene({label:"봉투",shortLabel:"봉투 봉인",visual:visuals.hall,title:"뜯긴 자리보다 붙어 있던 자리를 본다",paragraph:"개봉 장면을 찍은 영상과 현재 봉투를 한 프레임씩 맞춘다. 접착선은 처음 뜯길 때 생긴 종이 섬유의 들뜸 외에는 일정하다. 억지로 벌렸다 다시 붙였다면 남았을 광택 차이나 열 자국도 없다.",thought:"봉인은 멀쩡하다. 그렇다면 두 갈래다. 안의 종이는 처음부터 문제였거나, 봉인을 건드리지 않고 결과가 달라졌거나.",clue:"clue_seal_condition",flags:["seal_checked"],back:"competition_hall"}),
      find_columns:clueScene({label:"심사표",shortLabel:"열 배열",visual:visuals.hall,title:"같은 서식에서 이름만 자리를 바꿨다",paragraph:"세 장을 모서리에 맞춰 겹친 뒤 빛에 비춘다. 평가 항목과 합계 칸, 색상 띠는 완전히 포개진다. 그러나 두 장에서만 참가자 이름이 서로 반대 열에 인쇄돼 있다.",thought:"숫자를 고치지 않고도 점수의 주인을 바꿀 수 있다. 문제는 작성자가 이 차이를 왜 보지 못했느냐다.",clue:"clue_score_sheet_columns",flags:["sheet_columns_found"],back:"competition_hall"}),
      find_version:clueScene({label:"하단 표식",shortLabel:"서식 버전",visual:visuals.hall,title:"눈에 띄지 않는 두 글자, v4",paragraph:"페이지 아래쪽 인쇄 관리 표식은 세 장 모두 v4다. 진행 문서에는 애초 v3을 준비했다고 적혀 있으니, 심사 직전 다른 묶음이 공식 서식이 됐다는 뜻이다.",thought:"교체 자체가 잘못은 아니다. 누가 어떤 이유로 새 파일을 만들었는지가 중요하다.",clue:"clue_template_version_mark",flags:["version_found"],back:"competition_hall"}),
      find_ink:clueScene({label:"필기",shortLabel:"필적과 잉크",visual:visuals.hall,title:"숫자는 지워지지도, 덧쓰이지도 않았다",paragraph:"확대경 아래에서 획의 눌림과 잉크가 번진 방향을 비교한다. 각 숫자는 한 번에 적혔고, 서명까지 같은 펜의 흐름이 이어진다. 평소 필체와도 어긋나지 않는다.",thought:"위조된 숫자가 아니라면 심사위원들은 정말 저 위치에 점수를 썼다. 기억과 종이를 동시에 참으로 만드는 설명이 필요하다.",clue:"clue_ink_pressure_continuity",flags:["ink_checked"],back:"competition_hall"}),

      judges_room:{
        label:"현장 조사",layout:"investigation",shortLabel:"심사위원실",visual:{...visuals.judges,title:"세 사람의 자리, 두 개의 다른 기억"},
        blocks:[{type:"roomBrief",title:"심사위원들이 점수를 정리한 방입니다.",text:"반쯤 식은 차와 접힌 냅킨, 급히 덮인 수첩이 각 자리의 주인을 말해준다. 벽면 선반에는 최종 심사 때 사용한 것과 같은 클립보드가 포개져 있다.",guide:"개인 기록과 공용 도구를 함께 살펴보세요.",clues:["clue_baek_scratch_card","clue_choi_tasting_notebook","clue_clipboard_cover_pattern"],unit:"확인 항목"}],
        hotspots:[
          {label:"접힌 채점 카드",x:49,y:58,goto:"find_baek_card",foundClues:["clue_baek_scratch_card"]},
          {label:"시식 수첩",x:68,y:58,goto:"find_choi_notebook",foundClues:["clue_choi_tasting_notebook"]},
          {label:"공용 클립보드",x:91,y:34,goto:"find_clipboard",foundClues:["clue_clipboard_cover_pattern"]}
        ],
        actions:[{kind:"navigate",icon:"⌂",title:"수사 본부로",description:"다른 장소나 인물을 선택합니다",goto:"hub"}]
      },
      find_baek_card:clueScene({label:"백미숙 자리",shortLabel:"개인 채점 카드",visual:visuals.judges,title:"종이를 접은 자리에 계산이 남아 있다",paragraph:"작은 카드에는 참가자 이름 옆으로 항목별 점수와 총점이 적혀 있다. 공개 심사표의 필체와 비교하면 숫자 모양은 같지만 그 숫자가 붙은 이름은 다르다.",thought:"기억만의 주장이 아니다. 이 기록은 최종 심사표보다 먼저 쓰였고, 숫자의 의도를 보존하고 있다.",clue:"clue_baek_scratch_card",flags:["baek_card_found"],back:"judges_room"}),
      find_choi_notebook:clueScene({label:"최건 자리",shortLabel:"시식 수첩",visual:visuals.judges,title:"공개를 꺼린 수첩은 오히려 지나치게 정직했다",paragraph:"날짜와 메뉴, 향과 식감에 관한 짧은 문장이 앞뒤 페이지에 이어진다. 결승 항목 아래에는 참가자 이름과 총점이 또렷하게 구분돼 있다. 잉크가 마른 정도도 주변 기록과 같다.",thought:"두 심사위원이 각자 남긴 기록이 같은 방향을 가리킨다. 우연히 같은 기억을 꾸며냈다고 보기는 어렵다.",clue:"clue_choi_tasting_notebook",flags:["choi_notebook_found"],back:"judges_room"}),
      find_clipboard:clueScene({label:"클립보드",shortLabel:"작성 시야",visual:visuals.judges,title:"작성자는 이름을 보지 못했다",paragraph:"심사표를 클립보드에 끼우자 금속 고정판이 첫 번째 행을 정확히 덮는다. 참가자 이름은 사라지고 색상 띠와 점수 칸만 남는다. 숫자를 적고 합계를 확인하는 데는 불편이 없을 만큼 교묘한 가림이다.",thought:"틀린 기억이 아니라 익숙한 배치에 의존한 작성. 누군가 그 습관을 알고 있었다면, 이름만 바꿔도 손은 평소처럼 움직였을 것이다.",clue:"clue_clipboard_cover_pattern",flags:["clipboard_found"],back:"judges_room"}),

      production_desk:{
        label:"기록 조사",layout:"investigation",shortLabel:"제작 데스크",visual:{...visuals.desk,title:"파일은 만들어지고, 출력되고, 전달됐다"},
        blocks:[{type:"roomBrief",title:"한 번의 출력 작업을 단계별로 나눠보세요.",text:"행사장 한쪽의 임시 운영 공간이다. 프린터와 두 대의 노트북, 서식 파일함, 낙서투성이 체크리스트가 좁은 책상을 차지하고 있다.",guide:"출력한 계정과 파일을 만든 사람을 같은 것으로 단정하지 마세요.",clues:["clue_prior_round_layout","clue_print_job_log","clue_pdf_export_metadata","clue_reprint_request_note"],unit:"확인 항목"}],
        hotspots:[
          {label:"이전 서식 파일함",x:20,y:48,goto:"find_prior_layout",foundClues:["clue_prior_round_layout"]},
          {label:"프린터 작업 기록",x:44,y:61,goto:"find_print_log",foundClues:["clue_print_job_log"]},
          {label:"v4 파일 정보",x:68,y:43,goto:"find_metadata",foundClues:["clue_pdf_export_metadata"]},
          {label:"진행 체크리스트",x:82,y:70,goto:"find_reprint_note",foundClues:["clue_reprint_request_note"]}
        ],
        actions:[{kind:"navigate",icon:"⌂",title:"수사 본부로",description:"다른 장소나 인물을 선택합니다",goto:"hub"}]
      },
      find_prior_layout:clueScene({label:"서식 파일함",shortLabel:"이전 라운드 서식",visual:visuals.desk,title:"반복된 배치는 사람의 눈보다 빠르게 습관이 된다",paragraph:"예선부터 준결승까지 사용한 서식은 모두 같은 규칙을 따른다. 초록색 칸은 왼쪽, 주황색 칸은 오른쪽. 참가자 이름이 바뀌어도 해당 결승 진출자의 색과 위치는 하루 종일 유지됐다.",thought:"한두 번이면 확인했을 것이다. 반복은 확인을 생략하게 만든다. 이번 사건에서 습관은 잠금장치가 아니라 열쇠였다.",clue:"clue_prior_round_layout",flags:["prior_layout_found"],back:"production_desk"}),
      find_print_log:clueScene({label:"프린터 기록",shortLabel:"출력 기록",visual:visuals.desk,title:"프린터는 두 번 움직였다",paragraph:"작업 목록에는 v3과 v4가 서로 다른 시각에 남아 있다. 마지막 출력은 진행 담당자의 관리자 계정으로 실행됐다. 그러나 이 기록만으로는 파일 작성자까지 알 수 없다.",thought:"버튼을 누른 사람과 내용을 만든 사람을 섞으면 누군가에게 편리한 결론이 된다. 출력과 생성을 분리해서 보자.",clue:"clue_print_job_log",flags:["print_log_found"],back:"production_desk"}),
      find_metadata:clueScene({label:"파일 정보",shortLabel:"v4 생성 정보",visual:visuals.desk,title:"파일 안에는 만든 장치의 버릇이 남는다",paragraph:"v4의 생성 시각은 16시 11분. 작성자 태그와 문서 내보내기 환경은 행사에 등록된 특정 노트북 프로필과 일치한다. 관리자 계정의 프린터 기록과는 다른 출처다.",thought:"이 기록 하나만으로 사람을 단정할 수는 없다. 그러나 거짓 진술과 전달 경로가 겹치면 우연의 자리는 빠르게 줄어든다.",clue:"clue_pdf_export_metadata",flags:["metadata_found"],back:"production_desk"}),
      find_reprint_note:clueScene({label:"체크리스트",shortLabel:"재출력 요청",visual:visuals.desk,title:"급한 메모는 정식 기록보다 솔직하다",paragraph:"‘16:09 로고 잘림—교체 파일 전달받음’이라는 문장 옆에 요청자의 이름이 적혀 있다. 이후 검수 칸은 비어 있고, 출력 완료 표시만 급하게 두 번 그어져 있다.",thought:"교체 이유와 교체 내용은 같은 말이 아니다. 로고를 고친다는 설명이 다른 변경까지 허락한 것은 아니다.",clue:"clue_reprint_request_note",flags:["reprint_note_found"],back:"production_desk"}),

      waiting_lounge:{
        label:"현장 조사",layout:"investigation",shortLabel:"대기 라운지",visual:{...visuals.lounge,title:"수혜자와 실행자는 같은 사람일까"},
        blocks:[{type:"roomBrief",title:"참가자들의 동선과 관계를 확인하세요.",text:"인터뷰 조명은 아직 켜져 있고 촬영 모니터에는 긴 영상 파일이 멈춰 있다. 참가자용 태블릿과 공동 자료함도 정리되지 않은 채 남아 있다.",guide:"누가 이익을 얻었는지와 누가 실행할 수 있었는지를 구분하세요.",clues:["clue_lounge_video_timestamps","clue_seoa_complaint_email","clue_advisory_agreement","clue_haru_message_thread"],unit:"확인 항목"}],
        hotspots:[
          {label:"촬영 모니터",x:24,y:45,goto:"find_lounge_video",foundClues:["clue_lounge_video_timestamps"]},
          {label:"안내 태블릿",x:54,y:62,goto:"find_seoa_email",foundClues:["clue_seoa_complaint_email"]},
          {label:"프레스 자료함",x:79,y:42,goto:"find_agreement",foundClues:["clue_advisory_agreement"]}
        ],
        actions:[{kind:"navigate",icon:"⌂",title:"수사 본부로",description:"다른 장소나 인물을 선택합니다",goto:"hub"}]
      },
      find_lounge_video:clueScene({label:"촬영 영상",shortLabel:"라운지 타임코드",visual:visuals.lounge,title:"영상은 화려했지만 쓸모 있는 것은 구석의 시계였다",paragraph:"두 참가자는 요리 제출 뒤 인터뷰와 정리 촬영에 계속 등장한다. 카메라가 바뀌는 짧은 순간에도 배경 거울과 보조 화면에 모습이 남아 핵심 시간대의 공백을 찾기 어렵다.",thought:"결과의 수혜자라는 사실은 기회까지 증명하지 않는다. 적어도 파일이 만들어지고 출력된 시간의 동선은 좁혀졌다.",clue:"clue_lounge_video_timestamps",flags:["lounge_video_found"],back:"waiting_lounge"}),
      find_seoa_email:clueScene({label:"안내 태블릿",shortLabel:"사전 항의 메일",visual:visuals.lounge,title:"항의는 결과보다 먼저 도착했다",paragraph:"발송함에는 경연 전날 보낸 메일이 남아 있다. 글은 날카롭지만 요구한 것은 서식의 가독성과 점수 공개 기준이다. 오늘 결과를 예견하거나 특정 심사위원을 압박한 내용은 없다.",thought:"불만은 동기가 될 수 있다. 하지만 이 메일은 패배 뒤 꾸민 변명이 아니라 결과를 모를 때 남긴 기록이다.",clue:"clue_seoa_complaint_email",flags:["seoa_email_found"],back:"waiting_lounge"}),
      find_agreement:clueScene({label:"프레스 자료",shortLabel:"계약 요약본",visual:visuals.lounge,title:"일반 자료 사이에 끼어든 한 장",paragraph:"프레스 자료 묶음 한가운데 행사 운영 측 내부 검토용 계약 요약본이 잘못 철해져 있다. 출력 대기 기록을 보면 일반 자료와 같은 시각에 인쇄됐고, 분류 과정에서 섞인 것으로 보인다. 문서에는 경연 결과와 연동된 보수 조항이 표시돼 있다.",thought:"우연히 발견됐다고 해서 문서가 말하는 이해관계까지 우연인 것은 아니다. 위험을 감수할 구체적인 보상이 사건 전부터 존재했다.",clue:"clue_advisory_agreement",flags:["agreement_found"],back:"waiting_lounge"}),

      interview_yoon_seoa:{label:"인물 심문",layout:"detail",shortLabel:"윤서아 심문",visual:{...visuals.lounge,title:"패배보다 점수표를 의심한 사람"},interview:{person:"yoon_seoa",intro:"그녀는 억울함보다 절차를 먼저 말한다. 감정과 확인 가능한 사실을 분리해 듣자.",progressFlags:["statement_seoa_score_objection","statement_seoa_explains_complaint","statement_seoa_denies_access","statement_seoa_rival_view"]},actions:[
        {id:"question_seoa_initial_score",kind:"question",icon:"?",title:"발표된 점수에서 무엇이 이상했습니까?",description:"이의를 제기한 직접 이유를 확인합니다",goto:"answer_seoa_initial"},
        {id:"question_seoa_prior_complaint",kind:"question",icon:"?",title:"전날 심사 방식에 항의한 이유는 무엇입니까?",description:"메일의 의도를 확인합니다",lockedDescription:"사전 항의 메일을 먼저 확인해야 합니다",requires:{allClues:["clue_seoa_complaint_email"]},goto:"answer_seoa_complaint"},
        {id:"question_seoa_desk_access",kind:"question",icon:"?",title:"최종본 출력 때 제작 데스크에 갔습니까?",description:"핵심 시간대 동선을 확인합니다",lockedDescription:"대기 라운지 촬영 기록이 필요합니다",requires:{allClues:["clue_lounge_video_timestamps"]},goto:"answer_seoa_access"},
        {id:"question_seoa_view_of_haru",kind:"question",icon:"?",title:"임하루가 결과를 미리 알았다고 봅니까?",description:"경쟁자의 현장 반응을 묻습니다",goto:"answer_seoa_haru"},
        {kind:"navigate",icon:"⌂",title:"수사 본부로",description:"다른 장소나 인물을 선택합니다",goto:"hub"}
      ]},
      answer_seoa_initial:answerScene({person:"yoon_seoa",shortLabel:"점수 이의",visual:visuals.lounge,title:"예상과 달랐다는 말의 무게",question:"발표된 점수에서 무엇이 이상했습니까?",answer:"백미숙 심사위원은 시식 직후 제 장점을 구체적으로 짚었습니다. 그런데 공개 점수는 정반대였고, 한 사람의 평가 차이라고 보기엔 총점 차이도 컸어요.",after:"윤서아는 순위를 바꿔달라고 요구한 것이 아니라, 먼저 심사표 공개를 요구했다고 강조한다.",flags:["statement_seoa_score_objection"],back:"interview_yoon_seoa"}),
      answer_seoa_complaint:answerScene({person:"yoon_seoa",shortLabel:"사전 항의 설명",visual:visuals.lounge,title:"결과 전에 보낸 항의",question:"전날 심사 방식에 항의한 이유는 무엇입니까?",answer:"작은 글씨와 색만으로 참가자를 구분하는 방식이 불안했습니다. 결과가 어떻든 점수는 공개해야 한다고도 했고요. 누군가를 압박하려던 메일은 아닙니다.",after:"메일의 시각과 내용은 그녀의 설명과 일치한다. 공격적으로 보일까 숨겼지만, 사후 조작의 증거는 아니다.",flags:["statement_seoa_explains_complaint"],back:"interview_yoon_seoa"}),
      answer_seoa_access:answerScene({person:"yoon_seoa",shortLabel:"윤서아 동선",visual:visuals.lounge,title:"카메라 밖으로 나가지 않은 참가자",question:"최종본이 출력될 때 제작 데스크에 간 적이 있습니까?",answer:"없습니다. 요리를 낸 뒤로 계속 인터뷰 구역에 있었어요. 제작 데스크가 어느 복도에 있는지도 오늘 처음 들었습니다.",after:"촬영 타임코드를 펼쳐놓자 윤서아는 짧게 고개를 끄덕인다. 반박할 공백 자체가 보이지 않는다.",flags:["statement_seoa_denies_access"],back:"interview_yoon_seoa"}),
      answer_seoa_haru:answerScene({person:"yoon_seoa",shortLabel:"경쟁자에 대한 관찰",visual:visuals.lounge,title:"수혜자를 곧 공범으로 부를 수는 없다",question:"임하루가 결과를 미리 알고 있었다고 보십니까?",answer:"아니요. 발표 순간 그 사람도 당황했어요. 제가 이의를 제기했을 때 화내기보다 점수부터 보자고 했고요. 적어도 알고 있던 사람의 반응 같지는 않았습니다.",after:"경쟁자의 진술이라 더 조심스럽지만, 현장의 첫 반응을 설명하는 참고가 된다.",flags:["statement_seoa_rival_view"],back:"interview_yoon_seoa"}),

      interview_lim_haru:{label:"인물 심문",layout:"detail",shortLabel:"임하루 심문",visual:{...visuals.lounge,title:"기뻐하지 못한 우승자"},interview:{person:"lim_haru",intro:"그는 결과의 수혜자라는 시선을 의식한다. 알고 있던 관계와 알지 못했던 조건을 나눠 물어보자.",progressFlags:["statement_haru_reaction","statement_haru_admits_consulting","statement_haru_denies_success_fee","statement_haru_denies_access"]},actions:[
        {id:"question_haru_initial_result",kind:"question",icon:"?",title:"우승 발표 때 왜 바로 기뻐하지 않았습니까?",description:"발표 순간의 반응을 확인합니다",goto:"answer_haru_reaction"},
        {id:"question_haru_consulting",kind:"question",icon:"?",title:"서인수의 자문사와 관계가 있습니까?",description:"외부 관계를 확인합니다",goto:"answer_haru_consulting"},
        {id:"question_haru_success_fee",kind:"question",icon:"?",title:"우승 성공 보수 조항을 알고 있었습니까?",description:"계약 내용의 인지 여부를 확인합니다",lockedDescription:"계약 자료와 자문 관계 진술이 필요합니다",requires:{allClues:["clue_advisory_agreement"],allFlags:["statement_haru_admits_consulting"]},goto:"answer_haru_fee"},
        {id:"question_haru_desk_access",kind:"question",icon:"?",title:"16시 11분부터 14분 사이 어디에 있었습니까?",description:"파일 생성·출력 시각의 동선을 확인합니다",lockedDescription:"대기 라운지 촬영 기록이 필요합니다",requires:{allClues:["clue_lounge_video_timestamps"]},goto:"answer_haru_access"},
        {kind:"navigate",icon:"⌂",title:"수사 본부로",description:"다른 장소나 인물을 선택합니다",goto:"hub"}
      ]},
      answer_haru_reaction:answerScene({person:"lim_haru",shortLabel:"발표 순간 반응",visual:visuals.lounge,title:"뜻밖의 승리는 때로 패배보다 곤란하다",question:"우승 발표를 들었을 때 왜 바로 기뻐하지 않았습니까?",answer:"시식 반응만 보면 제가 근소하게 질 거라고 생각했습니다. 그런데 큰 점수 차이로 이겼다고 하니… 제가 웃으면 모두가 이상하게 볼 것 같았어요.",after:"임하루의 대답은 빠르지만 승리를 자랑하지 않는다. 결과가 이상하다고 느낀 사람은 패자만이 아니었다.",flags:["statement_haru_reaction"],back:"interview_lim_haru"}),
      answer_haru_consulting:answerScene({person:"lim_haru",shortLabel:"자문 관계",visual:visuals.lounge,title:"알고 있던 관계, 몰랐다는 조건",question:"서인수의 자문사와 관계가 있습니까?",answer:"제 매니지먼트가 홍보 자문을 받습니다. 그 사실은 알아요. 하지만 계약서는 회사끼리 체결했고 세부 조건은 전달받지 못했습니다.",after:"관계 자체는 숨기지 않는다. 다만 계약의 구체적인 보상 구조에는 선을 긋는다.",flags:["statement_haru_admits_consulting"],back:"interview_lim_haru"}),
      answer_haru_fee:answerScene({person:"lim_haru",shortLabel:"성공 보수 인지",visual:visuals.lounge,title:"메시지에 없는 한 문장",question:"우승 성공 보수 조항을 알고 있었습니까?",answer:"처음 봅니다. 믿기 어렵다면 제 매니지먼트 대화를 확인하세요. 행사 준비와 홍보 얘기는 있지만 그런 조건은 받은 적이 없습니다.",after:"그가 내민 대화 화면에는 자문 관계가 드러나지만, 성공 보수나 심사표를 암시하는 말은 없다.",flags:["statement_haru_denies_success_fee","haru_messages_found"],clues:["clue_haru_message_thread"],back:"interview_lim_haru"}),
      answer_haru_access:answerScene({person:"lim_haru",shortLabel:"임하루 동선",visual:visuals.lounge,title:"파일이 만들어질 때 카메라 앞에 있었다",question:"16시 11분부터 16시 14분 사이 어디에 있었습니까?",answer:"여기서 라이브 인터뷰 중이었습니다. 중간 광고 때도 자리를 옮기지 않았어요. 원본 영상을 보면 끊김 없이 나올 겁니다.",after:"영상 속 임하루는 해당 시간 내내 서로 다른 각도의 카메라에 잡힌다.",flags:["statement_haru_denies_access"],back:"interview_lim_haru"}),

      interview_seo_insu:{label:"인물 심문",layout:"detail",shortLabel:"서인수 심문",visual:{...visuals.judges,title:"문서를 믿으라는 수석 심사위원"},interview:{person:"seo_insu",intro:"그는 기억보다 서명된 문서가 우선이라고 말한다. 기록이 늘어날 때마다 설명이 어떻게 달라지는지 보자.",progressFlags:["statement_seo_process_claim","statement_seo_minimizes_reprint","statement_seo_calls_template_error","statement_seo_denies_file_author","statement_seo_admits_logo_request","statement_seo_denies_financial_tie"]},actions:[
        {id:"question_seo_initial_process",kind:"question",icon:"?",title:"최종 심사표는 어떤 절차로 준비됐습니까?",description:"처음 설명을 기록합니다",goto:"answer_seo_process"},
        {id:"question_seo_reprint_time",kind:"question",icon:"?",title:"16시 14분의 두 번째 출력은 왜 필요했습니까?",description:"재출력 이유를 확인합니다",lockedDescription:"프린터 작업 기록이 필요합니다",requires:{allClues:["clue_print_job_log"]},goto:"answer_seo_reprint"},
        {id:"question_seo_page_difference",kind:"question",icon:"?",title:"왜 두 페이지의 이름 순서만 다릅니까?",description:"서식 차이에 대한 설명을 듣습니다",lockedDescription:"심사표의 열 배열을 먼저 비교해야 합니다",requires:{allClues:["clue_score_sheet_columns"]},goto:"answer_seo_columns"},
        {id:"question_seo_file_author",kind:"question",icon:"?",title:"v4 작성 정보가 본인의 노트북과 일치합니다.",description:"파일 작성자를 추궁합니다",lockedDescription:"v4 파일 생성 정보가 필요합니다",requires:{allClues:["clue_pdf_export_metadata"]},goto:"answer_seo_author"},
        {id:"question_seo_logo_request",kind:"question",icon:"?",title:"교체 파일을 직접 전달했다는 메모가 있습니다.",description:"교체 요청을 확인합니다",lockedDescription:"재출력 요청 메모가 필요합니다",requires:{allClues:["clue_reprint_request_note"]},goto:"answer_seo_logo"},
        {id:"question_seo_financial_tie",kind:"question",icon:"?",title:"결과 연동 보수 계약을 왜 밝히지 않았습니까?",description:"경제적 이해관계를 확인합니다",lockedDescription:"관련 계약 자료가 필요합니다",requires:{allClues:["clue_advisory_agreement"]},goto:"answer_seo_finance"},
        {kind:"navigate",icon:"⌂",title:"수사 본부로",description:"다른 장소나 인물을 선택합니다",goto:"hub"}
      ]},
      answer_seo_process:answerScene({person:"seo_insu",shortLabel:"심사 절차 설명",visual:visuals.judges,title:"처음에는 모든 책임이 다른 곳을 향했다",question:"최종 심사표는 어떤 절차로 준비됐습니까?",answer:"한나리 담당자가 표준 파일을 출력했습니다. 저는 심사 뒤 점수와 합계를 확인했을 뿐입니다. 서명된 원본보다 기억을 앞세울 수는 없지요.",after:"서인수는 질문이 끝나기 전에 절차를 정리한다. 단정적인 설명일수록 처음 형태를 그대로 기록할 가치가 있다.",flags:["statement_seo_process_claim"],back:"interview_seo_insu"}),
      answer_seo_reprint:answerScene({person:"seo_insu",shortLabel:"재출력 축소 진술",visual:visuals.judges,title:"관여하지 않았다는 두 번째 출력",question:"16시 14분의 두 번째 출력은 왜 필요했습니까?",answer:"협찬사 로고가 잘렸다고 들었습니다. 단순 재출력이었고, 그 과정에 제가 관여한 일은 없습니다.",after:"처음 설명에는 없던 교체본이 등장했지만, 그는 자신의 역할을 여전히 최종 확인으로 제한한다.",flags:["statement_seo_minimizes_reprint"],back:"interview_seo_insu"}),
      answer_seo_columns:answerScene({person:"seo_insu",shortLabel:"서식 오류 주장",visual:visuals.judges,title:"오류의 책임을 작성자에게 돌린다",question:"왜 두 페이지에서 참가자 이름 순서만 다릅니까?",answer:"자동 편집 과정에서 생긴 템플릿 오류겠지요. 심사위원이 이름을 확인했다면 문제가 없었을 겁니다. 서식만으로 의도를 말할 수는 없습니다.",after:"그는 차이를 부정하지 않고 우연한 오류라고 이름 붙인다. 그러나 같은 오류가 필요한 두 페이지에만 생겼다는 설명은 아직 없다.",flags:["statement_seo_calls_template_error"],back:"interview_seo_insu"}),
      answer_seo_author:answerScene({person:"seo_insu",shortLabel:"파일 작성 부인",visual:visuals.judges,title:"공유 템플릿이라는 방패",question:"v4 작성자 정보가 본인의 노트북과 일치합니다.",answer:"예전에 제 템플릿을 공유한 적이 있습니다. 태그가 남을 수 있어요. 당일 파일은 한나리 담당자가 만들었을 겁니다.",after:"이제 그는 재출력에 관여하지 않았다는 말에서 한 걸음 물러나, 메타데이터의 흔적만 과거 탓으로 돌린다.",flags:["statement_seo_denies_file_author"],back:"interview_seo_insu"}),
      answer_seo_logo:answerScene({person:"seo_insu",shortLabel:"교체본 전달 인정",visual:visuals.judges,title:"부정하던 관여가 로고 수정으로 좁아졌다",question:"교체 파일을 직접 전달했다는 메모가 있습니다.",answer:"로고 수정본을 건넨 사실은 인정합니다. 다만 내용은 확인하지 않았습니다. 참가자 배열까지 제가 책임질 일은 아니지요.",after:"관여하지 않았다는 처음 진술은 교체본을 직접 전달했지만 내용을 몰랐다는 설명으로 바뀌었다.",flags:["statement_seo_admits_logo_request"],back:"interview_seo_insu"}),
      answer_seo_finance:answerScene({person:"seo_insu",shortLabel:"경제적 관계 진술",visual:visuals.judges,title:"법인 뒤로 물러선 이해관계",question:"특정 참가자가 우승하면 성공 보수를 받는 계약을 왜 밝히지 않았습니까?",answer:"자문사 법인과 매니지먼트 사이의 계약입니다. 제 개인 심사와는 무관합니다. 사업 계약을 모두 공개할 의무는 없습니다.",after:"계약의 존재는 부정하지 않는다. 대신 법인과 개인을 갈라 심사에 영향을 주지 않았다고 주장한다.",flags:["statement_seo_denies_financial_tie"],back:"interview_seo_insu"}),

      interview_baek_misook:{label:"인물 심문",layout:"detail",shortLabel:"백미숙 심문",visual:{...visuals.judges,title:"점수를 기억하지만 이름은 보지 못한 사람"},interview:{person:"baek_misook",intro:"확신에 찬 기억과 확인을 생략한 순간이 함께 존재할 수 있는지 물어보자.",progressFlags:["statement_baek_score_memory","statement_baek_color_habit","statement_baek_admits_header_unseen"]},actions:[
        {id:"question_baek_initial_memory",kind:"question",icon:"?",title:"기억하는 최종 점수는 몇 점입니까?",description:"구체적인 숫자를 기록합니다",goto:"answer_baek_memory"},
        {id:"question_baek_column_order",kind:"question",icon:"?",title:"공개 심사표에서는 숫자 위치가 반대입니다.",description:"작성 기준을 확인합니다",lockedDescription:"심사표 열 배열을 먼저 비교해야 합니다",requires:{allClues:["clue_score_sheet_columns"]},goto:"answer_baek_columns"},
        {id:"question_baek_hidden_header",kind:"question",icon:"?",title:"점수를 적을 때 참가자 이름이 보였습니까?",description:"실제 작성 시야를 재현합니다",lockedDescription:"공용 클립보드 구조를 확인해야 합니다",requires:{allClues:["clue_clipboard_cover_pattern"]},goto:"answer_baek_header"},
        {kind:"navigate",icon:"⌂",title:"수사 본부로",description:"다른 장소나 인물을 선택합니다",goto:"hub"}
      ]},
      answer_baek_memory:answerScene({person:"baek_misook",shortLabel:"백미숙 점수 기억",visual:visuals.judges,title:"숫자는 망설임 없이 나왔다",question:"기억하는 최종 점수는 몇 점입니까?",answer:"윤서아 92점, 임하루 86점입니다. 항목별로 계산한 뒤 옮겼기 때문에 틀릴 수 없습니다.",after:"백미숙은 두 점수를 즉시 말한다. 자신감만으로 증거가 되지는 않지만 개인 카드와 비교할 기준이 생겼다.",flags:["statement_baek_score_memory"],back:"interview_baek_misook"}),
      answer_baek_columns:answerScene({person:"baek_misook",shortLabel:"색상 배치 습관",visual:visuals.judges,title:"이름보다 먼저 손을 이끈 색",question:"공개된 심사표에서는 두 숫자의 위치가 반대입니다.",answer:"하루 종일 초록색 왼쪽이 윤서아, 주황색 오른쪽이 임하루였어요. 최종 심사도 같은 줄 알고 그 위치에 옮겨 적었습니다.",after:"그녀는 이름이 아니라 반복된 색상과 위치를 기준으로 썼다고 설명한다.",flags:["statement_baek_color_habit"],back:"interview_baek_misook"}),
      answer_baek_header:answerScene({person:"baek_misook",shortLabel:"이름 행 미확인",visual:visuals.judges,title:"확인은 숫자에서 멈췄다",question:"점수를 적을 때 참가자 이름 행이 보였습니까?",answer:"고정판에 가려져 있었습니다. 그래도 배치가 바뀔 거라고는 생각하지 못했어요. 제출 전에도 숫자와 합계만 확인했습니다.",after:"백미숙은 잠시 불쾌한 표정을 짓다가 자신의 확인 부족을 인정한다. 거짓 기억이 아니라 잘못된 전제였다.",flags:["statement_baek_admits_header_unseen"],back:"interview_baek_misook"}),

      interview_choi_geon:{label:"인물 심문",layout:"detail",shortLabel:"최건 심문",visual:{...visuals.judges,title:"기록을 숨겼지만 기록을 바꾸지는 않은 사람"},interview:{person:"choi_geon",intro:"그는 사실과 추정을 조심스럽게 구분한다. 공개를 망설인 수첩이 무엇을 보존했는지 확인하자.",progressFlags:["statement_choi_score_memory","statement_choi_color_habit","statement_choi_admits_header_unseen"]},actions:[
        {id:"question_choi_initial_memory",kind:"question",icon:"?",title:"개인 수첩에는 어떤 점수를 적었습니까?",description:"사전 기록을 확인합니다",goto:"answer_choi_memory"},
        {id:"question_choi_column_order",kind:"question",icon:"?",title:"최종 심사표에서 대상이 바뀐 이유를 짐작합니까?",description:"배치에 관한 습관을 확인합니다",lockedDescription:"심사표 열 배열을 먼저 비교해야 합니다",requires:{allClues:["clue_score_sheet_columns"]},goto:"answer_choi_columns"},
        {id:"question_choi_hidden_header",kind:"question",icon:"?",title:"클립보드가 이름 행을 가렸습니까?",description:"제출 전 확인 범위를 묻습니다",lockedDescription:"공용 클립보드 구조를 확인해야 합니다",requires:{allClues:["clue_clipboard_cover_pattern"]},goto:"answer_choi_header"},
        {kind:"navigate",icon:"⌂",title:"수사 본부로",description:"다른 장소나 인물을 선택합니다",goto:"hub"}
      ]},
      answer_choi_memory:answerScene({person:"choi_geon",shortLabel:"최건 점수 기록",visual:visuals.judges,title:"비공개 수첩 속 공개되지 않은 점수",question:"개인 수첩에는 어떤 점수를 적었습니까?",answer:"윤서아 89점, 임하루 87점입니다. 기사 초고에 쓸 평가라 공개를 망설였지만, 기록 시각은 확인해도 좋습니다.",after:"수첩 앞뒤에는 시식 순서에 따른 기록이 연속돼 있다. 점수만 나중에 끼워 넣은 흔적은 없다.",flags:["statement_choi_score_memory"],back:"interview_choi_geon"}),
      answer_choi_columns:answerScene({person:"choi_geon",shortLabel:"최건의 배치 습관",visual:visuals.judges,title:"바뀌지 않을 것이라는 전제",question:"최종 심사표에서 두 점수의 대상이 바뀐 이유를 짐작합니까?",answer:"이전 라운드부터 색과 위치가 고정돼 있었습니다. 최종에도 같다고 전제했고, 이름을 다시 읽지 않았습니다.",after:"두 심사위원은 서로 다른 개인 기록을 가졌지만 최종 심사표를 읽는 방식은 같았다.",flags:["statement_choi_color_habit"],back:"interview_choi_geon"}),
      answer_choi_header:answerScene({person:"choi_geon",shortLabel:"최건의 작성 시야",visual:visuals.judges,title:"보이지 않는 이름보다 보이는 합계를 확인했다",question:"클립보드가 이름 행을 가렸다는 사실을 기억합니까?",answer:"그렇습니다. 상단 고정판 아래에 이름이 있었어요. 제출 직전에도 숫자와 합계만 다시 확인했습니다.",after:"관찰력이 좋은 사람도 무엇을 확인해야 한다고 생각했는지에 따라 보지 못하는 것이 생긴다.",flags:["statement_choi_admits_header_unseen"],back:"interview_choi_geon"}),

      interview_han_nari:{label:"인물 심문",layout:"detail",shortLabel:"한나리 심문",visual:{...visuals.desk,title:"출력한 사람과 만든 사람 사이"},interview:{person:"han_nari",intro:"관리자 계정과 검수 누락은 분명한 책임이다. 하지만 고의와 과실을 같은 단어로 부르지 말자.",progressFlags:["statement_nari_process","statement_nari_reprint","statement_nari_file_source","statement_nari_skipped_crosscheck"]},actions:[
        {id:"question_nari_initial_process",kind:"question",icon:"?",title:"출력부터 봉인까지 누가 무엇을 했습니까?",description:"전체 절차를 시간순으로 확인합니다",goto:"answer_nari_process"},
        {id:"question_nari_second_print",kind:"question",icon:"?",title:"정상본을 출력한 뒤 왜 다시 출력했습니까?",description:"교체 경위를 확인합니다",lockedDescription:"프린터 작업 기록이 필요합니다",requires:{allClues:["clue_print_job_log"]},goto:"answer_nari_reprint"},
        {id:"question_nari_file_source",kind:"question",icon:"?",title:"v4 파일은 어디에서 왔습니까?",description:"파일 출처를 확인합니다",lockedDescription:"v4 파일 생성 정보가 필요합니다",requires:{allClues:["clue_pdf_export_metadata"]},goto:"answer_nari_source"},
        {id:"question_nari_verification",kind:"question",icon:"?",title:"교체본 내용을 원본과 대조했습니까?",description:"검수 절차를 확인합니다",lockedDescription:"재출력에 관한 진술을 먼저 들어야 합니다",requires:{allFlags:["statement_nari_reprint"]},goto:"answer_nari_check"},
        {kind:"navigate",icon:"⌂",title:"수사 본부로",description:"다른 장소나 인물을 선택합니다",goto:"hub"}
      ]},
      answer_nari_process:answerScene({person:"han_nari",shortLabel:"출력과 봉인 절차",visual:visuals.desk,title:"한 사람이 설명하는 다섯 단계",question:"심사표 출력부터 봉인까지 누가 무엇을 했습니까?",answer:"제가 출력하고 클립보드에 끼워 배부했습니다. 세 분이 점수와 서명을 마친 뒤 제 앞에서 한 봉투에 넣었고, 서인수 위원과 함께 봉인을 확인했습니다.",after:"한나리는 작성·배부·봉인·집계를 시간순으로 나눈다. 봉인 뒤의 동선에는 뚜렷한 틈이 보이지 않는다.",flags:["statement_nari_process"],back:"interview_han_nari"}),
      answer_nari_reprint:answerScene({person:"han_nari",shortLabel:"두 번째 출력",visual:visuals.desk,title:"급한 교체가 검수를 앞질렀다",question:"정상본을 출력한 뒤 왜 다시 출력했습니까?",answer:"서인수 위원이 협찬사 로고가 잘렸다고 했습니다. 교체 파일을 건네받았고 시간이 촉박해서 새 파일을 바로 출력해 사용했습니다.",after:"프린터 기록과 설명은 일치한다. 문제는 재출력의 존재가 아니라 새 파일을 어떻게 믿게 됐는지다.",flags:["statement_nari_reprint"],back:"interview_han_nari"}),
      answer_nari_source:answerScene({person:"han_nari",shortLabel:"교체 파일 출처",visual:visuals.desk,title:"출력 계정은 파일의 출생지를 말하지 않는다",question:"v4 파일은 어디에서 왔습니까?",answer:"제가 만든 파일이 아닙니다. 서인수 위원이 자신의 노트북에서 수정했다며 USB로 전달했습니다. 저는 제 관리자 계정으로 출력만 했어요.",after:"관리자 계정 때문에 한나리가 작성자처럼 보였지만, 파일의 생성 정보와 전달 경로는 다른 사람을 가리킨다.",flags:["statement_nari_file_source"],back:"interview_han_nari"}),
      answer_nari_check:answerScene({person:"han_nari",shortLabel:"교체본 검수 누락",visual:visuals.desk,title:"고의가 아니어도 책임은 남는다",question:"교체본 내용을 원본과 대조했습니까?",answer:"하지 못했습니다. 원래는 두 사람이 대조해야 합니다. 로고와 페이지 수만 보고 넘겼어요. 제 실수입니다.",after:"한나리는 변명보다 먼저 책임을 인정한다. 검수 누락은 사건을 가능하게 했지만, 조작 의도까지 증명하지는 않는다.",flags:["statement_nari_skipped_crosscheck"],back:"interview_han_nari"}),

      solve:{
        label:"최종 추리",layout:"detail",shortLabel:"최종 추리",visual:{...visuals.hall,title:"숫자가 아니라 숫자의 주인을 추적한다"},
        blocks:[
          {type:"heading",text:"⚖ 최종 추리"},
          {type:"lead",text:"세 가지 결론을 각각 고른 뒤, 각 판단을 뒷받침할 근거 단서를 바로 아래에서 하나씩 선택하세요."},
          {type:"thought",text:"수혜자, 출력한 사람, 파일을 만든 사람은 서로 다를 수 있다. 각 결론과 그 근거가 직접 연결되는지 하나씩 확인하자."}
        ],
        solve:{
          hints:{
            culprit:{answer:"우승으로 이득을 본 사람, 출력한 사람, 파일을 만든 사람을 구분해 보세요. 조작된 파일을 누가 만들었는지 추적해야 합니다.",evidence:"파일을 전달했다는 기록만으로는 작성자를 확정할 수 없습니다. 파일 자체에 남은 작성·내보내기 흔적을 살펴보세요."},
            purpose:{answer:"경연 결과에 따라 누가 어떤 이익을 얻는지 살펴보세요. 그 이익이 발생하는 조건도 중요합니다.",evidence:"행동의 목적을 설명하려면 이해관계를 보여주는 자료가 필요합니다. 경연 결과와 보상 조건을 연결해 보세요."},
            method:{answer:"숫자와 합계가 정확해도 점수의 주인이 달라질 수 있습니다. 심사 전에 서식에서 달라진 부분을 비교해 보세요.",evidence:"서식의 어느 부분이 바뀌었는지, 또는 교체본이 실제 심사에 사용되기까지의 경로를 보여주는 단서를 찾아보세요."}
          },
          questions:[
            {id:"culprit",prompt:"심사 결과를 의도적으로 왜곡한 사람은?",answer:"seo_insu",acceptedEvidence:["clue_pdf_export_metadata"],options:[
              {value:"yoon_seoa",label:"윤서아"},{value:"lim_haru",label:"임하루"},{value:"seo_insu",label:"서인수"},{value:"baek_misook",label:"백미숙"},{value:"choi_geon",label:"최건"},{value:"han_nari",label:"한나리"}
            ]},
            {id:"purpose",prompt:"그 행동의 목적은?",answer:"purpose_secure_success_fee",acceptedEvidence:["clue_advisory_agreement"],options:[
              {value:"purpose_reverse_unfair_loss",label:"불공정한 패배를 되돌리기 위해"},
              {value:"purpose_create_publicity_scandal",label:"경연을 논란에 빠뜨려 관심을 얻기 위해"},
              {value:"purpose_hide_scoring_mistake",label:"자신의 단순 채점 실수를 감추기 위해"},
              {value:"purpose_secure_success_fee",label:"특정 참가자의 우승으로 성공 보수를 받기 위해"}
            ]},
            {id:"method",prompt:"점수의 귀속을 바꾼 방법은?",answer:"method_reverse_name_columns_before_scoring",acceptedEvidence:["clue_score_sheet_columns","clue_reprint_request_note"],options:[
              {value:"method_replace_sheets_after_sealing",label:"봉인을 복원해 심사표를 바꿔 넣었다"},
              {value:"method_alter_digits_with_erasable_ink",label:"지워지는 잉크로 숫자 일부를 고쳤다"},
              {value:"method_change_totals_during_calculation",label:"집계 단계에서 합계만 다르게 입력했다"},
              {value:"method_reverse_name_columns_before_scoring",label:"심사 전에 일부 페이지의 참가자 이름 열을 뒤집었다"}
            ]}
          ],
          submitLabel:"🧩 추리 제출",
          incompleteMessage:"세 가지 결론과 각 결론의 근거 단서를 하나씩 모두 선택해주세요.",
          wrongMessage:"현재 추리에는 사건의 일부를 충분히 설명하지 못하는 부분이 있습니다. 선택한 결론과 근거 사이의 연결을 다시 검토해보세요.",
          successScene:"ending"
        },
        actions:[{kind:"navigate",icon:"⌂",title:"수사 본부로",description:"조사를 계속합니다",goto:"hub"}]
      },
      ending:{
        label:"사건 종결",layout:"detail",shortLabel:"사건 종결",visual:{...visuals.hall,title:"봉인은 진실을 지켰다. 이미 바뀐 진실을."},
        blocks:[
          {type:"closed",title:"CASE CLOSED",text:"《봉인된 심사표》 해결"},
          {type:"paragraph",text:"서인수는 심사 전에 최종 서식을 다시 만들면서 백미숙과 최건에게 배정된 페이지의 참가자 이름 열만 뒤집었다. 두 심사위원은 하루 종일 반복된 색과 위치, 이름 행을 가린 클립보드 때문에 자신이 의도한 점수를 반대 참가자 칸에 적었다."},
          {type:"paragraph",text:"숫자와 서명은 진짜였고 계산도 정확했다. 그러나 계산에 들어간 이름의 배열이 조작돼 있었다. v4 파일의 생성 정보와 교체본 전달 기록이 실행자를, 성과 연동 계약이 목적을 밝혔다."},
          {type:"comparison",title:"정상 점수 재집계",text:"윤서아 269점 · 임하루 263점. 윤서아의 우승이 확정되고 임하루는 잘못 주어진 결과를 반납했다."},
          {type:"paragraph",text:"한나리의 교체본 미대조는 절차상 과실로 남았다. 경연 측은 이후 모든 심사 문서를 두 사람이 원본과 대조하도록 규정을 바꿨다."},
          {type:"thought",text:"가장 단단한 봉인도 그 안에 들어가는 문서가 정직하다는 보증은 아니다. 절차는 마지막 단계가 아니라 처음부터 끝까지 이어질 때만 사람을 지킨다."}
        ],
        actions:[{kind:"navigate",icon:"⌂",title:"수사 기록 다시 보기",description:"확보한 단서와 인물 진술을 돌아봅니다",goto:"hub"}]
      }
    }
  };
})();
