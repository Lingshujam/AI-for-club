export default async function handler(request) {
  if (request.method !== "POST") {
    return Response.json(
      {
        ok: false,
        error: "只支持 POST 请求"
      },
      {
        status: 405
      }
    );
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    return Response.json(
      {
        ok: false,
        error: "服务端尚未配置 DeepSeek API Key"
      },
      {
        status: 500
      }
    );
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      {
        ok: false,
        error: "请求内容不是正确的 JSON"
      },
      {
        status: 400
      }
    );
  }

  const messages = Array.isArray(body.messages)
    ? body.messages
        .filter(function(message) {
          return (
            (message.role === "user" || message.role === "assistant") &&
            typeof message.content === "string"
          );
        })
        .slice(-10)
    : [];

  if (messages.length === 0) {
    return Response.json(
      {
        ok: false,
        error: "没有收到有效问题"
      },
      {
        status: 400
      }
    );
  }

  try {
    const deepSeekResponse = await fetch(
      "https://api.deepseek.com/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + apiKey
        },
        body: JSON.stringify({
          model: "deepseek-v4-flash",
          messages: [
            {
              role: "system",
              content:
                "你是香港中文大学（深圳）学生会的招新助手。语气友好、清晰、简洁。目前尚未接入正式知识库，因此不得编造部门、岗位、日期、人数、报名流程等具体事实。遇到缺少资料的问题，请明确说明暂时没有可靠信息。"
            }
          ].concat(messages),
          temperature: 0.2,
          max_tokens: 800,
          stream: false
        })
      }
    );

    if (!deepSeekResponse.ok) {
      console.error(
        "DeepSeek API 请求失败，状态码：",
        deepSeekResponse.status
      );

      return Response.json(
        {
          ok: false,
          error: "大模型服务暂时不可用"
        },
        {
          status: 502
        }
      );
    }

    const data = await deepSeekResponse.json();
    const reply = data?.choices?.[0]?.message?.content;

    if (!reply) {
      return Response.json(
        {
          ok: false,
          error: "大模型没有返回有效回答"
        },
        {
          status: 502
        }
      );
    }

    return Response.json({
      ok: true,
      reply: reply
    });
  } catch (error) {
    console.error("调用 DeepSeek 时发生错误：", error.message);

    return Response.json(
      {
        ok: false,
        error: "服务器暂时无法连接大模型"
      },
      {
        status: 500
      }
    );
  }
}
