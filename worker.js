import { onRequest as handleChat } from "./functions/api/chat.js";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/api/chat" || url.pathname === "/api/chat/") {
      return handleChat({
        request,
        env,
        waitUntil: ctx.waitUntil.bind(ctx)
      });
    }

    return env.ASSETS.fetch(request);
  }
};
