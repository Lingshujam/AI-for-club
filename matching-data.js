// 学生会岗位匹配数据
// 所有岗位统一使用8个评分维度，避免因关键词数量不同造成偏差。


var MATCH_DIMENSIONS = [
  "communication",
  "creativity",
  "writing",
  "visual",
  "execution",
  "detail",
  "service",
  "time"
];

var MATCH_DIMENSION_LABELS = {
  communication: "沟通社交",
  creativity: "创意策划",
  writing: "文字表达",
  visual: "视觉创作",
  execution: "组织执行",
  detail: "细致管理",
  service: "服务研究",
  time: "时间投入"
};

var MATCH_QUIZ = [
  {
    type: "trait",
    question: "面对一项刚接到的新任务，你通常更自然地会先做什么？",
    options: [
      {
        label: "先把目标、资料和注意事项整理清楚",
        scores: { detail: 2, execution: 1 }
      },
      {
        label: "先想想有没有更新颖、有趣的实现方式",
        scores: { creativity: 2, execution: 1 }
      },
      {
        label: "先和相关的人聊一聊，了解大家的想法",
        scores: { communication: 2, service: 1 }
      },
      {
        label: "先判断这件事能为参与者解决什么问题",
        scores: { service: 2, detail: 1 }
      }
    ]
  },
  {
    type: "trait",
    question: "在团队合作中，你最容易进入哪种状态？",
    options: [
      {
        label: "梳理步骤、时间和分工，让事情顺利推进",
        scores: { execution: 2, detail: 1 }
      },
      {
        label: "观察表达是否清楚，帮助调整文字和信息",
        scores: { writing: 2, detail: 1 }
      },
      {
        label: "留意整体呈现，让成果更加直观和有吸引力",
        scores: { visual: 2, creativity: 1 }
      },
      {
        label: "关注成员之间的沟通，帮助大家达成一致",
        scores: { communication: 2, service: 1 }
      }
    ]
  },
  {
    type: "trait",
    question: "计划执行过程中突然出现问题，你更可能怎么处理？",
    options: [
      {
        label: "迅速调整安排，先保证事情能够继续推进",
        scores: { execution: 2, creativity: 1 }
      },
      {
        label: "找相关人员沟通，尽快协调资源",
        scores: { communication: 2, execution: 1 }
      },
      {
        label: "了解问题产生的原因，避免只处理表面现象",
        scores: { service: 2, detail: 1 }
      },
      {
        label: "记录问题和处理过程，为下次留下参考",
        scores: { detail: 2, writing: 1 }
      }
    ]
  },
  {
    type: "trait",
    question: "完成一项任务时，什么最容易给你带来满足感？",
    options: [
      {
        label: "原本的想法最终真正落地",
        scores: { creativity: 2, execution: 1 }
      },
      {
        label: "复杂的信息被整理得准确、清楚",
        scores: { detail: 2, writing: 1 }
      },
      {
        label: "大家在合作中形成了良好的连接",
        scores: { communication: 2, service: 1 }
      },
      {
        label: "最终成果在表达和呈现上很完整",
        scores: { visual: 2, creativity: 1 }
      }
    ]
  },
  {
    type: "trait",
    question: "如果有一段可以自由支配的时间，你更愿意做哪类事情？",
    options: [
      {
        label: "记录、整理或分享自己的观察",
        scores: { writing: 2, detail: 1 }
      },
      {
        label: "尝试制作图片、视频或其他视觉内容",
        scores: { visual: 2, creativity: 1 }
      },
      {
        label: "组织朋友一起完成一件事情",
        scores: { communication: 2, execution: 1 }
      },
      {
        label: "了解某个问题，并尝试找到改进方式",
        scores: { service: 2, detail: 1 }
      }
    ]
  },
  {
    type: "trait",
    question: "下面哪种工作节奏让你感觉更舒服？",
    options: [
      {
        label: "有相对明确的规则，可以持续细致完成",
        scores: { detail: 2, execution: 1 }
      },
      {
        label: "有变化和探索空间，可以不断尝试新方法",
        scores: { creativity: 2, execution: 1 }
      },
      {
        label: "经常与不同的人接触，在互动中推进事情",
        scores: { communication: 2, service: 1 }
      },
      {
        label: "可以深入理解需求，逐步解决实际问题",
        scores: { service: 2, detail: 1 }
      }
    ]
  },
  {
    type: "time",
    question: "你比较能够接受怎样的时间投入？",
    options: [
      {
        label: "每周3小时以内，希望任务相对轻量",
        timeValue: 0
      },
      {
        label: "每周约3～5小时，可以保持稳定投入",
        timeValue: 1
      },
      {
        label: "每周约5～7小时，可以承担阶段性忙碌",
        timeValue: 2
      },
      {
        label: "时间比较灵活，活动期可以投入更多",
        timeValue: 3
      }
    ]
  },
  {
    type: "growth",
    question: "加入学生会后，你最希望提升哪方面的能力？",
    options: [
      {
        label: "沟通表达和人际协作",
        growth: "communication"
      },
      {
        label: "创意构思和活动策划",
        growth: "creativity"
      },
      {
        label: "写作、文案和信息表达",
        growth: "writing"
      },
      {
        label: "设计、摄影或视频制作",
        growth: "visual"
      },
      {
        label: "项目管理、组织和执行",
        growth: "execution"
      },
      {
        label: "财务、资料整理和细致管理",
        growth: "detail"
      },
      {
        label: "校园服务、调查研究和问题解决",
        growth: "service"
      },
      {
        label: "目前还不确定，希望多探索",
        growth: "explore"
      }
    ]
  }
];

function createProfile(
  department,
  position,
  family,
  values,
  growth,
  skillNotice
) {
  return {
    department: department,
    position: position,
    id: department + "-" + position,
    family: family,
    scores: {
      communication: values[0],
      creativity: values[1],
      writing: values[2],
      visual: values[3],
      execution: values[4],
      detail: values[5],
      service: values[6],
      time: values[7]
    },
    growth: growth,
    skillNotice: skillNotice || ""
  };
}

// values顺序：沟通、创意、文字、视觉、执行、细致、服务、时间
var POSITION_PROFILES = [
  // ==================== 活动部 ====================
  createProfile(
    "活动部",
    "活动运营",
    "operations",
    [2, 3, 2, 0, 3, 2, 1, 3],
    ["creativity", "execution", "communication"],
    ""
  ),
  createProfile(
    "活动部",
    "财务运营",
    "administration",
    [1, 0, 1, 0, 2, 3, 0, 2],
    ["detail", "execution"],
    ""
  ),
  createProfile(
    "活动部",
    "宣发运营",
    "content",
    [2, 2, 3, 1, 2, 2, 0, 2],
    ["writing", "creativity", "communication"],
    ""
  ),
  createProfile(
    "活动部",
    "秘书",
    "administration",
    [2, 0, 3, 0, 1, 3, 1, 1],
    ["writing", "detail", "communication"],
    ""
  ),
  createProfile(
    "活动部",
    "美术设计",
    "visual",
    [1, 3, 1, 3, 2, 2, 0, 2],
    ["visual", "creativity", "execution"],
    "建议进一步确认是否需要设计基础或作品展示。"
  ),

  // ==================== 文宣部 ====================
  createProfile(
    "文宣部",
    "编导",
    "media",
    [2, 3, 3, 2, 2, 1, 0, 2],
    ["creativity", "writing", "visual"],
    "具备脚本或视频制作经验会更有帮助。"
  ),
  createProfile(
    "文宣部",
    "摄影",
    "media",
    [1, 2, 0, 3, 2, 2, 0, 2],
    ["visual", "creativity", "execution"],
    "建议确认摄影设备、基础技能及作品要求。"
  ),
  createProfile(
    "文宣部",
    "剪辑",
    "media",
    [0, 2, 0, 3, 2, 2, 0, 2],
    ["visual", "creativity", "execution"],
    "建议确认是否需要剪辑软件基础或作品展示。"
  ),
  createProfile(
    "文宣部",
    "设计",
    "visual",
    [0, 3, 0, 3, 2, 2, 0, 2],
    ["visual", "creativity", "execution"],
    "建议确认是否需要绘画、设计软件基础或作品展示。"
  ),
  createProfile(
    "文宣部",
    "秘书",
    "administration",
    [2, 0, 3, 0, 1, 3, 1, 1],
    ["writing", "detail", "communication"],
    ""
  ),
  createProfile(
    "文宣部",
    "财务",
    "administration",
    [2, 0, 1, 0, 2, 3, 0, 1],
    ["detail", "execution", "communication"],
    ""
  ),
  createProfile(
    "文宣部",
    "公众号运营",
    "content",
    [1, 2, 3, 2, 2, 3, 1, 2],
    ["writing", "visual", "detail"],
    "具备文案、排版或公众号编辑经验会更有帮助。"
  ),

  // ==================== 权益部 ====================
  createProfile(
    "权益部",
    "运营",
    "service",
    [2, 2, 1, 0, 3, 3, 3, 2],
    ["service", "execution", "detail"],
    ""
  ),
  createProfile(
    "权益部",
    "文编",
    "content",
    [1, 2, 3, 0, 2, 2, 2, 1],
    ["writing", "service", "creativity"],
    ""
  ),
  createProfile(
    "权益部",
    "美编",
    "visual",
    [1, 3, 1, 3, 2, 2, 1, 1],
    ["visual", "creativity", "execution"],
    "具备排版或视觉设计基础会更有帮助。"
  ),
  createProfile(
    "权益部",
    "秘书",
    "administration",
    [2, 0, 3, 0, 1, 3, 2, 1],
    ["writing", "detail", "communication"],
    ""
  ),

  // ==================== 学术部 ====================
  createProfile(
    "学术部",
    "活动运营",
    "operations",
    [2, 3, 1, 0, 3, 2, 3, 2],
    ["execution", "creativity", "service"],
    ""
  ),
  createProfile(
    "学术部",
    "文编",
    "content",
    [1, 2, 3, 0, 1, 2, 2, 1],
    ["writing", "creativity", "service"],
    ""
  ),
  createProfile(
    "学术部",
    "美编",
    "visual",
    [1, 3, 1, 3, 2, 2, 1, 1],
    ["visual", "creativity", "execution"],
    "具备排版或视觉设计基础会更有帮助。"
  ),
  createProfile(
    "学术部",
    "秘书",
    "administration",
    [1, 0, 3, 0, 1, 3, 1, 1],
    ["writing", "detail"],
    ""
  ),

  // ==================== 社联部 ====================
  createProfile(
    "社联部",
    "策划",
    "operations",
    [2, 3, 2, 0, 3, 2, 1, 3],
    ["creativity", "execution", "communication"],
    ""
  ),
  createProfile(
    "社联部",
    "公关",
    "outreach",
    [3, 1, 1, 0, 2, 2, 2, 2],
    ["communication", "service", "execution"],
    ""
  ),
  createProfile(
    "社联部",
    "社团规划",
    "service",
    [2, 1, 1, 1, 2, 3, 2, 2],
    ["detail", "service", "communication"],
    ""
  ),
  createProfile(
    "社联部",
    "行政",
    "administration",
    [2, 0, 1, 0, 2, 3, 1, 1],
    ["detail", "execution", "communication"],
    ""
  ),
  createProfile(
    "社联部",
    "秘书",
    "administration",
    [1, 0, 3, 0, 1, 3, 1, 1],
    ["writing", "detail"],
    ""
  ),
  createProfile(
    "社联部",
    "文美编",
    "content",
    [1, 2, 3, 2, 2, 2, 1, 1],
    ["writing", "visual", "creativity"],
    "具备文案、排版或图片编辑基础会更有帮助。"
  ),

  // ==================== 外联部 ====================
  createProfile(
    "外联部",
    "内外联",
    "outreach",
    [3, 2, 1, 0, 3, 1, 1, 2],
    ["communication", "execution", "creativity"],
    ""
  ),
  createProfile(
    "外联部",
    "文编",
    "content",
    [1, 2, 3, 0, 2, 2, 1, 1],
    ["writing", "creativity", "execution"],
    ""
  ),
  createProfile(
    "外联部",
    "美编",
    "visual",
    [1, 3, 1, 3, 2, 2, 1, 1],
    ["visual", "creativity", "execution"],
    "具备公众号制作或视觉设计基础会更有帮助。"
  ),
  createProfile(
    "外联部",
    "秘书",
    "administration",
    [2, 0, 3, 0, 1, 3, 1, 1],
    ["writing", "detail", "communication"],
    ""
  ),
  createProfile(
    "外联部",
    "财务",
    "administration",
    [1, 0, 1, 0, 2, 3, 0, 1],
    ["detail", "execution"],
    ""
  )
];