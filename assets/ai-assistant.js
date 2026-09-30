(() => {
  const body = document.body;
  const panel = document.querySelector('.ai-panel');
  const openers = document.querySelectorAll('.ai-open');
  const closers = document.querySelectorAll('[data-ai-close]');
  const form = document.querySelector('[data-ai-form]');
  const input = document.querySelector('[data-ai-input]');
  const messages = document.querySelector('[data-ai-messages]');
  const status = document.querySelector('[data-ai-status]');
  const sendButton = form?.querySelector('.ai-send');
  if (!panel || !form || !input || !messages) return;

  const endpoint = (body.dataset.aiEndpoint || '').trim();
  const model = (body.dataset.aiModel || 'DeepSeek V4-FLASH').trim();
  const contextTitle = body.dataset.aiTitle || 'PENGIEE 学习笔记';
  const contextCategory = body.dataset.aiCategory || '个人知识库';
  const article = document.querySelector('.prose');
  const fallbackContext = document.querySelector('.collection-heading');
  const contextText = (article || fallbackContext)?.innerText?.trim().slice(0, 9000) || '';
  const conversation = [];

  const setOpen = (open) => {
    body.classList.toggle('ai-open', open);
    panel.setAttribute('aria-hidden', String(!open));
    if (open) window.setTimeout(() => input.focus(), 180);
  };

  const addMessage = (role, text, extraClass = '') => {
    const item = document.createElement('div');
    item.className = `ai-message ai-message-${role}${extraClass ? ` ${extraClass}` : ''}`;
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    item.appendChild(paragraph);
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
    return item;
  };

  const setStatus = (text) => {
    if (status) status.textContent = text;
  };

  const systemPrompt = `你是 PENGIEE 电子与嵌入式学习助手。请用简洁、准确的中文回答，优先解释原理、假设、公式和验证步骤。只能把当前笔记作为主要上下文，不要声称看到了未提供的资料；不确定时明确说明。当前页面标题：${contextTitle}；分类：${contextCategory}。当前笔记摘录：\n${contextText}`;

  openers.forEach((button) => button.addEventListener('click', () => setOpen(true)));
  closers.forEach((button) => button.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && body.classList.contains('ai-open')) setOpen(false);
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const question = input.value.trim();
    if (!question || sendButton?.disabled) return;
    input.value = '';
    addMessage('user', question);
    conversation.push({ role: 'user', content: question });

    if (!endpoint) {
      addMessage('error', 'AI 服务尚未配置。请先部署服务端代理，并在 _config.yml 的 ai_endpoint 中填写接口地址。API 密钥不要放进网站前端。');
      setStatus(`待配置 · ${model}`);
      return;
    }

    const loading = addMessage('assistant', '正在整理当前笔记…', 'ai-message-loading');
    if (sendButton) sendButton.disabled = true;
    setStatus('正在请求模型…');
    try {
      const recentConversation = conversation.slice(-10);
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: [{ role: 'system', content: systemPrompt }, ...recentConversation],
          context: { title: contextTitle, category: contextCategory, excerpt: contextText }
        })
      });
      const raw = await response.text();
      let data;
      try { data = JSON.parse(raw); } catch { data = { content: raw }; }
      if (!response.ok) throw new Error(data?.error?.message || data?.error || `服务返回 HTTP ${response.status}`);
      const answer = data?.choices?.[0]?.message?.content || data?.answer || data?.content;
      if (!answer) throw new Error('服务返回内容为空');
      loading.remove();
      addMessage('assistant', String(answer));
      conversation.push({ role: 'assistant', content: String(answer) });
      setStatus(`已连接 · ${model}`);
    } catch (error) {
      loading.remove();
      addMessage('error', `暂时无法连接 AI：${error.message || '未知错误'}。请检查代理地址、跨域设置和模型 ID。`);
      setStatus('连接失败');
    } finally {
      if (sendButton) sendButton.disabled = false;
      input.focus();
    }
  });
})();
