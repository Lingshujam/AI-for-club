function jsonResponse(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}

export default async function onRequest(context) {
  var request = context.request;

  if (request.method !== "POST") {
    return jsonResponse(
      {
        ok: false,
        error: "只支持 POST 请求"
      },
      405
    );
  }

  var apiKey = context.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    return jsonResponse(
      {
        ok: false,
        error: "服务器没有读取到 DEEPSEEK_API_KEY"
      },
      500
    );
  }

  try {
    var body = await request.json();
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

    var knowledgeUrl = new URL("/knowledge.md", request.url);
    var knowledgeResponse = await fetch(knowledgeUrl.toString());

    if (!knowledgeResponse.ok) {
      return jsonResponse(
        {
          ok: false,
          error:
            "读取 knowledge.md 失败，状态码：" +
            knowledgeResponse.status
        },
        500
      );
    }

    var knowledge = await knowledgeResponse.text();

    var systemPrompt =
  "你是香港中文大学（深圳）学生会招新助手，像一位耐心、可靠的学生会学长或学姐一样回答新生的问题。\n\n" +
  "回答规则：\n" +
  "1. 招新日期、部门、岗位、报名和面试等事实，只能依据知识库回答。\n" +
  "2. 知识库没有明确信息时，不得猜测，可以简洁说明目前没有确定信息，并建议关注正式通知。\n" +
  "3. 询问招新时间时，准确区分开始时间、截止时间和面试时间。\n" +
  "4. 使用简体中文，回答自然、友好、清楚。\n" +
  "5. 只输出普通文本，不使用Markdown标题、星号加粗、代码框或表格。\n" +
  "6. 直接回答问题，不使用“根据知识库”“根据资料”“知识库显示”等开场语。\n" +
  "7. 用户询问每周投入时间、工作量或忙不忙时，不得虚构具体小时数。统一说明：学生会的时间投入没有固定标准，平时以日常任务为主；活动筹备、宣传和现场执行期间任务会更加集中，需要投入更多时间。不同部门和岗位的节奏不同，具体安排以当届部门通知为准。\n" +
  "8. 回答要像学长学姐与新生交流，避免生硬、机械或报告式的表达。\n" +
  "9. 除非用户要求详细介绍，否则优先使用2至4句话直接回答，不机械罗列所有部门。\n\n" +
  "知识库内容：\n" +
  knowledge;

    var aiMessages = [
      {
        role: "system",
        content: systemPrompt
      }
    ].concat(messages);

    var deepseekResponse = await fetch(
      "https://api.deepseek.com/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + apiKey
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: aiMessages,
          temperature: 0.2,
          max_tokens: 1000,
          stream: false
        })
      }
    );

    if (!deepseekResponse.ok) {
      return jsonResponse(
        {
          ok: false,
          error:
            "DeepSeek 请求失败，状态码：" +
            deepseekResponse.status
        },
        502
      );
    }

    var result = await deepseekResponse.json();
    var reply = "";

    if (
      result &&
      result.choices &&
      result.choices[0] &&
      result.choices[0].message
    ) {
      reply = result.choices[0].message.content;
    }
    reply = reply
    .replace(/```/g, "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^\s*[-*+]\s+/gm, "• ")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1（$2）");
    if (!reply) {
      return jsonResponse(
        {
          ok: false,
          error: "DeepSeek 没有返回有效内容"
        },
        502
      );
    }

    return jsonResponse({
      ok: true,
      reply: reply
    });
  } catch (error) {
    return jsonResponse(
      {
        ok: false,
        error:
          "服务器处理失败：" +
          (error && error.message ? error.message : "未知错误")
      },
      500
    );
  }
}
