async function getTenantAccessToken(appId, appSecret) {
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

  if (
    !response.ok ||
    data.code !== 0 ||
    !data.tenant_access_token
  ) {
    throw new Error(
      "飞书身份认证失败：" + (data.msg || response.status)
    );
  }

  return data.tenant_access_token;
}

export default async function handler() {
  const appId = process.env.FEISHU_APP_ID;
  const appSecret = process.env.FEISHU_APP_SECRET;
  const spaceId = process.env.FEISHU_SPACE_ID;

  if (!appId || !appSecret || !spaceId) {
    return Response.json(
      {
        ok: false,
        error: "缺少飞书环境变量"
      },
      {
        status: 500
      }
    );
  }

  try {
    const token = await getTenantAccessToken(
      appId,
      appSecret
    );

    const url =
      "https://open.feishu.cn/open-apis/wiki/v2/spaces/" +
      encodeURIComponent(spaceId) +
      "/nodes?page_size=50";

    const response = await fetch(url, {
      headers: {
        Authorization: "Bearer " + token
      }
    });

    const data = await response.json();

    if (!response.ok || data.code !== 0) {
      console.error(
        "读取飞书知识空间失败：",
        data.code,
        data.msg
      );

      return Response.json(
        {
          ok: false,
          error: "无法读取知识空间",
          feishuCode: data.code,
          message: data.msg
        },
        {
          status: 502
        }
      );
    }

    const items = Array.isArray(data.data?.items)
      ? data.data.items
      : [];

    return Response.json({
      ok: true,
      message: "已成功读取知识空间目录",
      count: items.length,
      hasMore: Boolean(data.data?.has_more),
      nodes: items.map(function (item) {
        return {
          title: item.title || "未命名",
          objectType: item.obj_type || "unknown",
          hasChild: Boolean(item.has_child)
        };
      })
    });
  } catch (error) {
    console.error(
      "测试飞书知识空间时发生错误：",
      error.message
    );

    return Response.json(
      {
        ok: false,
        error: "服务器暂时无法读取飞书知识空间"
      },
      {
        status: 500
      }
    );
  }
}

export const config = {
  path: "/api/feishu-wiki-test"
};
