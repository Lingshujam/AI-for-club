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
      "你是香港中文大学（深圳）学生会招新助手。\n\n" +
      "回答规则：\n" +
      "1. 招新日期、部门、岗位、报名和面试等事实，只能依据知识库回答。\n" +
      "2. 知识库没有明确信息时，回答“知识库暂未提供准确信息”，不得猜测。\n" +
      "3. 询问招新时间时，区分开始时间、截止时间和面试时间。\n" +
     "4. 使用简体中文，回答友好、清楚、简洁。\n" +
     "5. 只能输出普通文本，禁止使用Markdown语法、井号标题、星号加粗、代码框和Markdown表格。\n\n" +
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
