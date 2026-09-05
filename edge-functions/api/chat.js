function jsonResponse(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}

function cleanTextReply(reply) {
  return String(reply || "")
    .replace(/```/g, "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^\s*[-*+]\s+/gm, "• ")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1（$2）")
    .trim();
}

function clampScore(value) {
  var number = Number(value);

  if (!Number.isFinite(number)) {
    return 1.5;
  }

  return Math.max(0, Math.min(3, number));
}

function normalizeMatchingResult(result) {
  var allowedDimensions = [
    "communication",
    "creativity",
    "writing",
    "visual",
    "execution",
    "detail",
    "service"
  ];

  var allowedGrowth = allowedDimensions.concat(["explore"]);
  var traits = {};
  var sourceTraits =
    result && result.traits ? result.traits : {};

  for (var i = 0; i < allowedDimensions.length; i++) {
    var key = allowedDimensions[i];
    traits[key] = clampScore(sourceTraits[key]);
  }

  var time = result ? result.time : null;

  if (
    time !== null &&
    time !== undefined &&
    Number.isFinite(Number(time))
  ) {
    time = Math.max(0, Math.min(3, Number(time)));
  } else {
    time = null;
  }

  var growth =
    result &&
    allowedGrowth.indexOf(result.growth) !== -1
      ? result.growth
      : "explore";

  var matchedDimensions = [];

  if (result && Array.isArray(result.matchedDimensions)) {
    for (var j = 0; j < result.matchedDimensions.length; j++) {
      var dimension = result.matchedDimensions[j];

      if (
        allowedDimensions.indexOf(dimension) !== -1 &&
        matchedDimensions.indexOf(dimension) === -1
      ) {
        matchedDimensions.push(dimension);
      }
    }
  }

  return {
    traits: traits,
    time: time,
    growth: growth,
    matchedDimensions: matchedDimensions
  };
}

async function callDeepSeek(apiKey, messages, maxTokens) {
  var response = await fetch(
    "https://api.deepseek.com/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + apiKey
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: messages,
        temperature: 0.1,
        max_tokens: maxTokens || 1000,
        stream: false
      })
    }
  );

  if (!response.ok) {
    throw new Error(
      "DeepSeek请求失败，状态码：" + response.status
    );
  }

  var result = await response.json();

  if (
    !result ||
    !result.choices ||
    !result.choices[0] ||
    !result.choices[0].message
  ) {
    throw new Error("DeepSeek没有返回有效内容");
  }

  return result.choices[0].message.content;
}

export default async function onRequest(context) {
  var request = context.request;

  if (request.method !== "POST") {
    return jsonResponse(
      {
        ok: false,
        error: "只支持POST请求"
      },
      405
    );
  }

  var apiKey = context.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    return jsonResponse(
      {
        ok: false,
        error: "服务器没有读取到DEEPSEEK_API_KEY"
      },
      500
    );
  }

  try {
    var body = await request.json();

    // ==========================================
    // 自由描述理解模式
    // ==========================================
    if (body.mode === "matching") {
      var description = String(body.description || "").trim();

      if (!description) {
        return jsonResponse(
          {
            ok: false,
            error: "没有收到自由描述"
          },
          400
        );
      }

      var matchingPrompt =
        "你负责理解学生对自身特点的自由描述。" +
        "你只负责提取特征，不负责推荐具体部门或岗位。" +
        "请区分用户当前具备的特点和用户希望未来提升的能力。" +
        "不要因为用户想学习某项能力，就认为用户现在已经擅长这项能力。" +
        "没有提到的维度统一设为1.5，表示中性或未知。" +
        "明确不擅长的维度可以设为0至0.8。" +
        "明确喜欢或擅长的维度可以设为2.2至3。" +
        "每个维度的分值范围都是0至3。" +
        "维度包括：" +
        "communication表示沟通协作，" +
        "creativity表示创意策划，" +
        "writing表示文字表达，" +
        "visual表示视觉设计、摄影或视频，" +
        "execution表示组织执行，" +
        "detail表示细致管理，" +
        "service表示服务意识和问题研究。" +
        "time表示时间投入偏好，0表示希望轻量，" +
        "1表示稳定投入，2表示可以接受阶段性忙碌，" +
        "3表示时间较灵活，无法判断时使用null。" +
        "growth只能是communication、creativity、writing、" +
        "visual、execution、detail、service或explore。" +
        "matchedDimensions只列出用户明确提到的当前特点维度。" +
        "只输出一个JSON对象，不要输出Markdown、解释或其他文字。" +
        "JSON格式必须是：" +
        '{"traits":{"communication":1.5,"creativity":1.5,' +
        '"writing":1.5,"visual":1.5,"execution":1.5,' +
        '"detail":1.5,"service":1.5},' +
        '"time":null,"growth":"explore",' +
        '"matchedDimensions":[]}';

      var matchingReply = await callDeepSeek(
        apiKey,
        [
          {
            role: "system",
            content: matchingPrompt
          },
          {
            role: "user",
            content: description
          }
        ],
        500
      );

      var jsonText = String(matchingReply)
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      var parsedMatchingResult;

      try {
        parsedMatchingResult = JSON.parse(jsonText);
      } catch (error) {
        return jsonResponse(
          {
            ok: false,
            error: "无法解析自由描述识别结果"
          },
          502
        );
      }

      return jsonResponse({
        ok: true,
        mode: "matching",
        match: normalizeMatchingResult(
          parsedMatchingResult
        )
      });
    }

    // ==========================================
    // 普通知识问答模式
    // ==========================================
    var messages = Array.isArray(body.messages)
      ? body.messages.slice(-10)
      : [];

    if (messages.length === 0) {
      return jsonResponse(
        {
          ok: false,
          error: "没有收到问题"
        },
        400
      );
    }

    var knowledgeUrl = new URL(
      "/knowledge.md",
      request.url
    );

    var knowledgeResponse = await fetch(
      knowledgeUrl.toString()
    );

    if (!knowledgeResponse.ok) {
      return jsonResponse(
        {
          ok: false,
          error:
            "读取knowledge.md失败，状态码：" +
            knowledgeResponse.status
        },
        500
      );
    }

    var knowledge = await knowledgeResponse.text();

    var systemPrompt =
      "你是香港中文大学（深圳）学生会招新助手，" +
      "请像一位耐心、可靠的学长或学姐一样回答问题。\n\n" +
      "回答规则：\n" +
      "1. 招新日期、部门、岗位、报名和面试等事实，只能依据知识库回答。\n" +
      "2. 知识库没有明确资料时不得猜测，应简洁说明目前没有确定信息。\n" +
      "3. 准确区分报名时间、截止时间、面试时间和岗位时间投入。\n" +
      "4. 不使用“根据知识库”“根据资料”等开场语。\n" +
      "5. 用户询问工作量时，不得虚构具体小时数。" +
      "说明平时以日常任务为主，活动筹备、宣传和现场执行期间会更加集中，" +
      "具体节奏因部门和岗位而异。\n" +
      "6. 回答自然、友好、简洁，通常控制在2至4句话。\n" +
      "7. 只输出普通文本，不使用Markdown标题、加粗、代码框或表格。\n\n" +
      "知识库内容：\n" +
      knowledge;

    var reply = await callDeepSeek(
      apiKey,
      [
        {
          role: "system",
          content: systemPrompt
        }
      ].concat(messages),
      1000
    );

    reply = cleanTextReply(reply);

    if (!reply) {
      return jsonResponse(
        {
          ok: false,
          error: "DeepSeek没有返回有效回答"
        },
        502
      );
    }

    return jsonResponse({
      ok: true,
      mode: "chat",
      reply: reply
    });
  } catch (error) {
    return jsonResponse(
      {
        ok: false,
        error:
          "服务器处理失败：" +
          (
            error && error.message
              ? error.message
              : "未知错误"
          )
      },
      500
    );
  }
}
