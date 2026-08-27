export default async function handler() {
  const appId = process.env.FEISHU_APP_ID;
  const appSecret = process.env.FEISHU_APP_SECRET;

  if (!appId || !appSecret) {
    return Response.json(
      {
        ok: false,
        error: "Netlify 尚未读取到飞书环境变量"
      },
      {
        status: 500
      }
    );
  }

  try {
    const response = await fetch(
      "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          app_id: appId,
          app_secret: appSecret
        })
      }
    );

    const data = await response.json();

    if (!response.ok || data.code !== 0 || !data.tenant_access_token) {
      console.error(
        "飞书身份认证失败：",
        data.code,
        data.msg
      );

      return Response.json(
        {
          ok: false,
          error: "飞书身份认证失败",
          feishuCode: data.code,
          message: data.msg
        },
        {
          status: 502
        }
      );
    }

    return Response.json({
      ok: true,
      message: "飞书身份认证成功",
      expiresIn: data.expire
    });
  } catch (error) {
    console.error("连接飞书时发生错误：", error.message);

    return Response.json(
      {
        ok: false,
        error: "服务器暂时无法连接飞书"
      },
      {
        status: 500
      }
    );
  }
}

export const config = {
  path: "/api/feishu-test"
};
