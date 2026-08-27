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

  const messages = Array.isArray(body.messages) ? body.messages : [];
  const lastMessage = messages[messages.length - 1];
  const question = lastMessage?.content || "没有收到问题";

  return Response.json({
    ok: true,
    reply: `接口测试成功！我收到了你的问题：${question}`
  });
}
