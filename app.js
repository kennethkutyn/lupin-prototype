const sampleConversations = [
  {
    name: 'Fam',
    message: 'Cant wait to see you this summer',
    time: '09:15',
    unread: 3,
    color: '#60a5fa',
  },
];

const threadGroups = [
  {
    id: 'primary',
    weekLabel: 'Week 1',
    contactName: 'Alex Carter',
    contactColor: '#facc15',
    videoSrc: 'vid1.MOV',
    photos: ['image1.png', 'image2.png', 'image3.png', 'image1.png'],
    summary:
      'AI summary: The clip shows a quick walkthrough of the studio space. Key beats include the lighting change at 0:22, the new corridor reveal at 0:45, and the voiceover cue that lands just after the product shot. Audience sentiment expected: upbeat and curious; recommended pull quote: “Feels polished but still friendly.”',
    summaryPoints: [
      '"I took the dog for a walk and it rained"',
      '"I went to the gym and lifted weights"',
      '"I went to the store and bought groceries"'
    ],
    replies: [
      {
        id: 'r1',
        author: 'Jamie',
        avatar: '#60a5fa',
        text: 'Loved the energy at 0:45 — the transition feels crisp.',
        time: '12:01',
        emoji: '🔥',
      },
      {
        id: 'r2',
        author: 'Sam',
        avatar: '#f472b6',
        text: 'The corridor shot works; could we lift mids slightly?',
        time: '12:05',
        emoji: '👍',
      },
      {
        id: 'r3',
        author: 'Jamie',
        avatar: '#60a5fa',
        text: 'Agree with Sam, a subtle LUT bump should do it.',
        time: '12:07',
        replyTo: 'r2',
      },
      {
        id: 'r4',
        author: 'Priya',
        avatar: '#10b981',
        text: 'Can we get a slowed cut for social with captions baked in?',
        time: '12:10',
      },
      {
        id: 'r5',
        author: 'Alex Carter',
        avatar: '#facc15',
        text: 'Awww thanks for sharing!! <3',
        time: '12:12',
        replyTo: 'r4',
        emoji: '✅',
      },
    ],
  },
  {
    id: 'alt',
    weekLabel: 'Week 2',
    contactName: 'Riley',
    contactColor: '#22d3ee',
    videoSrc: 'vid1.MOV',
    photos: ['image3.png', 'image2.png', 'image1.png', 'image2.png'],
    summary: 'Alt cut focus: slower pacing with heavier captions for social.',
    summaryPoints: [
      'Opening beat extends by 4s to breathe.',
      'Captions baked in for mobile-first playback.',
      'Softer grade; lifts mids slightly for faces.',
    ],
    replies: [
      {
        id: 'r1-alt',
        author: 'Riley',
        avatar: '#22d3ee',
        text: 'this always happens to me too :D',
        time: '10:18',
      },
    ],
  },
];

let currentThreadGroup = threadGroups[0];

const threadMessages = [
  { id: 'd1', type: 'divider', label: 'Week 1' },
  {
    id: 'm1',
    type: 'text',
    author: 'Alex Carter',
    avatar: '#facc15',
    time: 'Yesterday',
    text: 'Hey fam! how are you doing this week?',
  },
  { id: 't1', type: 'tile', groupId: 'primary' },
  {
    id: 'm2',
    type: 'text',
    author: 'Priya',
    avatar: '#10b981',
    time: 'Yesterday',
    text: ' Such a funny story; wish i was there lol',
  },
  { id: 'd2', type: 'divider', label: 'Week 2' },
  { id: 't2', type: 'tile', groupId: 'alt' },
  {
    id: 'm3',
    type: 'text',
    author: 'Riley',
    avatar: '#22d3ee',
    time: 'Today',
    text: 'you gotta send more pics of this.',
  },
];

const initials = (name = '') => {
  const parts = name.split(' ').filter(Boolean);
  if (!parts.length) return '?';
  const first = parts[0][0] || '';
  const last = parts[1]?.[0] || '';
  return (first + last).toUpperCase();
};

const createConversationRow = (conversation) => {
  const { name, message, time, unread, color } = conversation;
  const badge = unread > 0 ? `<span class="badge">${unread}</span>` : '';
  const unreadDot = unread > 0 ? '<span class="unread-dot"></span>' : '';

  return `
    <article class="conversation" role="listitem">
      <div class="avatar" style="background:${color}">${initials(name)}</div>
      <div class="conversation-info">
        <div class="name-row">
          <span class="name">${name}</span>
          ${unreadDot}
        </div>
        <p class="message">${message}</p>
      </div>
      <div class="meta">
        <span class="time">${time}</span>
        ${badge}
      </div>
    </article>
  `;
};

const renderConversations = (list = []) => {
  const container = document.getElementById('conversation-list');
  if (!container) return;
  container.innerHTML = list.map(createConversationRow).join('');
};

const renderPhotos = (photos = [], targetId = 'photos-grid') => {
  const grid = document.getElementById(targetId);
  if (!grid) return;
  grid.innerHTML = photos
    .map(
      (src) =>
        `<div class="photo" role="img" aria-label="Photo" style="background-image:url('${src}')"></div>`
    )
    .join('');
};

const renderReplies = (
  replies = [],
  targetId = 'replies-list',
  includeReplyAction = false,
  latestOnly = false
) => {
  const container = document.getElementById(targetId);
  if (!container) return;

  const createdAtFor = (reply, idx) =>
    typeof reply.createdAt === 'number' ? reply.createdAt : idx;

  const latestReply =
    latestOnly && replies.length
      ? replies.reduce((latest, reply, idx) => {
          const createdAt = createdAtFor(reply, idx);
          if (!latest || createdAt > latest.createdAt) {
            return { reply, createdAt };
          }
          return latest;
        }, null)?.reply
      : null;

  const sourceReplies = latestReply ? [latestReply] : replies;

  const childCount = sourceReplies.reduce((acc, reply) => {
    if (reply.replyTo) {
      acc[reply.replyTo] = (acc[reply.replyTo] || 0) + 1;
    }
    return acc;
  }, {});

  const lookup = sourceReplies.reduce((acc, reply) => {
    acc[reply.id] = reply;
    return acc;
  }, {});

  const rows = sourceReplies.map((reply) => {
    const parent = reply.replyTo ? lookup[reply.replyTo] : null;
    const replyClass = parent ? 'reply nested' : 'reply';
    const emoji = reply.emoji ? `<span class="emoji">${reply.emoji}</span>` : '';
    const hasChildren = (childCount[reply.id] || 0) > 0;
    const actions = includeReplyAction && !hasChildren
      ? `<div class="reply-actions"><button class="reply-button" data-reply-id="${reply.id}">Reply</button></div>`
      : '';

    return `
      <div class="${replyClass}">
        <div class="avatar-sm" style="background:${reply.avatar}">${initials(
      reply.author
    )}</div>
        <div class="reply-body">
          <div class="reply-header">
            <span class="reply-name">${reply.author}</span>
            <span class="reply-time">${reply.time}</span>
          </div>
          <div class="bubble">
            <span>${reply.text}</span>
            ${emoji}
          </div>
          ${actions}
        </div>
      </div>
    `;
  });

  container.innerHTML = rows.join('');
};

const renderSummaryPoints = (items = [], targetId) => {
  const node = document.getElementById(targetId);
  if (!node) return;
  node.innerHTML = items.map((item) => `<li>${item}</li>`).join('');
};

let currentView = 'list'; // list | thread | media
let currentConversation = null;

const setView = (view) => {
  currentView = view;
  const views = {
    list: document.getElementById('list-screen'),
    thread: document.getElementById('thread-screen'),
    media: document.getElementById('media-screen'),
  };
  Object.keys(views).forEach((key) => {
    views[key]?.classList.toggle('hidden', key !== view);
  });

  const backButton = document.querySelector('.back-button');
  const topTitle = document.getElementById('top-title');
  const newMessageButton = document.getElementById('new-message-button');

  if (view === 'list') {
    topTitle.textContent = 'Messages';
    backButton?.classList.add('hidden');
  } else {
    topTitle.textContent = currentConversation?.name ?? 'Thread';
    backButton?.classList.remove('hidden');
  }

  if (view === 'media') {
    newMessageButton?.classList.add('hidden');
  } else {
    newMessageButton?.classList.remove('hidden');
  }
};

const buildTileHTML = (group, messageId, index) => {
  const photoId = `photos-${messageId}`;
  const repliesId = `replies-${messageId}`;
  const contactName = group.contactName ?? 'Contact';
  const contactColor = group.contactColor ?? '#22d3ee';
  return `
    <article class="thread-tile" data-group-id="${group.id}" aria-label="Thread option ${index + 1}">
      <div class="tile-header">
        <div class="tile-contact">
          <div class="avatar-sm" style="background:${contactColor}">${initials(contactName)}</div>
          <span class="tile-contact-name">${contactName}</span>
        </div>
      </div>
      <div class="thread-media">
        <div class="video-card">
          <video src="${group.videoSrc}" playsinline muted></video>
          <div class="video-label">Video</div>
        </div>
        <div class="photos-grid" id="${photoId}"></div>
      </div>
      <section class="replies-block">
        <p class="section-label">Replies</p>
        <div id="${repliesId}" class="replies-list"></div>
      </section>
    </article>
  `;
};

const renderThreadFeed = () => {
  const container = document.getElementById('thread-feed');
  if (!container) return;

  const html = threadMessages
    .map((message, index) => {
      if (message.type === 'text') {
        const author = message.author || 'Contact';
        const avatar = message.avatar || '#22d3ee';
        const time = message.time || '';
        return `
          <article class="text-message" data-message-id="${message.id}">
            <div class="avatar-sm" style="background:${avatar}">${initials(author)}</div>
            <div class="text-body">
              <div class="text-meta">
                <span class="reply-name">${author}</span>
                <span class="reply-time">${time}</span>
              </div>
              <div class="text-bubble">${message.text || ''}</div>
            </div>
          </article>
        `;
      }
      if (message.type === 'divider') {
        const label = message.label || '';
        return `
          <div class="thread-divider" data-message-id="${message.id}">
            <span>${label}</span>
          </div>
        `;
      }
      if (message.type === 'tile') {
        const group = threadGroups.find((g) => g.id === message.groupId) || threadGroups[0];
        return buildTileHTML(group, message.id, index + 1);
      }
      return '';
    })
    .join('');

  container.innerHTML = html;

  threadMessages.forEach((message) => {
    if (message.type !== 'tile') return;
    const group = threadGroups.find((g) => g.id === message.groupId);
    if (!group) return;
    renderPhotos(group.photos, `photos-${message.id}`);
    renderReplies(group.replies, `replies-${message.id}`, false, true);
  });
};

const showThread = (conversation) => {
  currentConversation = conversation;
  currentThreadGroup = threadGroups[0];
  const contactName = document.getElementById('contact-name');

  contactName.textContent = conversation.name;

  renderThreadFeed();

  setView('thread');
};

const showList = () => {
  currentConversation = null;
  setView('list');
};

const renderMediaCarousel = () => {
  const carousel = document.getElementById('media-carousel');
  if (!carousel) return;

  const slides = [
    { type: 'video', src: currentThreadGroup.videoSrc },
    ...currentThreadGroup.photos.map((src) => ({ type: 'image', src })),
  ];

  const html = slides
    .map((item) => {
      if (item.type === 'video') {
        return `
          <div class="slide">
            <div class="video-card">
              <video class="media-video" src="${item.src}" muted playsinline controls></video>
              <div class="reaction-track" id="reaction-track"></div>
              <div class="reaction-float-layer" id="reaction-float-layer"></div>
            </div>
          </div>
        `;
      }
      return `
        <div class="slide">
          <div class="photo" style="background-image:url('${item.src}')"></div>
        </div>
      `;
    })
    .join('');

  carousel.innerHTML = html;

  const firstVideo = carousel.querySelector('.media-video');
  if (firstVideo) {
    firstVideo.currentTime = 0;
    firstVideo.play().catch(() => {});
  }
};

const showMedia = () => {
  const nameNode = document.getElementById('media-contact-name');
  const avatarNode = document.getElementById('media-contact-avatar');
  const contactName = currentThreadGroup.contactName || currentConversation?.name || 'Thread';
  const contactColor = currentThreadGroup.contactColor || '#334155';
  nameNode.textContent = contactName;
  if (avatarNode) {
    avatarNode.textContent = initials(contactName);
    avatarNode.style.background = contactColor;
  }

  const threadVideo = document.getElementById('thread-video');
  if (threadVideo) {
    threadVideo.pause();
    threadVideo.currentTime = 0;
  }

  renderMediaCarousel();
  renderReplies(currentThreadGroup.replies, 'replies-list-media', true);
  renderSummaryPoints(currentThreadGroup.summaryPoints, 'summary-bullets-media');
  renderReactionMarkers();

  reactionMarks = reactionMarks.map((m) => ({ ...m, triggered: false }));

  setView('media');

  const mediaVideo = document.querySelector('.media-video');
  if (mediaVideo) {
    mediaVideo.addEventListener('timeupdate', handleFloatingReactions);
    mediaVideo.addEventListener('seeked', () => {
      reactionMarks = reactionMarks.map((m) => ({ ...m, triggered: false }));
      handleFloatingReactions();
    });
    mediaVideo.addEventListener('play', handleFloatingReactions);
    mediaVideo.addEventListener('loadedmetadata', () => {
      renderReactionMarkers();
      handleFloatingReactions();
    });
  }
};

let replyTargetId = null;
let reactionMarks = [];

const renderReactionMarkers = () => {
  const track = document.getElementById('reaction-track');
  const video = document.querySelector('.media-video');
  if (!track || !video || !video.duration || Number.isNaN(video.duration)) {
    return;
  }
  const html = reactionMarks
    .map((mark) => {
      const percent =
        typeof mark.time === 'number' && video.duration
          ? (mark.time / video.duration) * 100
          : typeof mark.percent === 'number'
            ? mark.percent
            : 0;
      const left = Math.min(100, Math.max(0, percent));
      return `<div class="reaction-marker" style="left:${left}%">${mark.emoji}</div>`;
    })
    .join('');
  track.innerHTML = html;
};

const spawnFloatingEmoji = (emoji, left) => {
  const layer = document.getElementById('reaction-float-layer');
  if (!layer) return;
  const node = document.createElement('div');
  node.className = 'floating-emoji';
  node.style.left = `${left}%`;
  node.textContent = emoji;
  node.addEventListener('animationend', () => node.remove());
  layer.appendChild(node);
};

const handleFloatingReactions = () => {
  const video = document.querySelector('.media-video');
  if (!video || !video.duration || Number.isNaN(video.duration)) return;

  reactionMarks.forEach((mark) => {
    const time =
      typeof mark.time === 'number'
        ? mark.time
        : typeof mark.percent === 'number'
          ? (mark.percent / 100) * video.duration
          : 0;
    mark.time = time;
    const left = Math.min(100, Math.max(0, (time / video.duration) * 100));
    if (!mark.triggered && video.currentTime >= time) {
      mark.triggered = true;
      spawnFloatingEmoji(mark.emoji, left);
    }
  });
};

const handleEmojiReaction = (emoji) => {
  const video = document.querySelector('.media-video');
  if (!video) return;
  const duration = video.duration && !Number.isNaN(video.duration) ? video.duration : 1;
  const percent = (video.currentTime / duration) * 100;
  reactionMarks.push({ emoji, percent, time: video.currentTime, triggered: false });
  renderReactionMarkers();
};

const sendReply = (inputOrEvent = 'reply-input') => {
  const inputId = typeof inputOrEvent === 'string' ? inputOrEvent : 'reply-input';
  const input = document.getElementById(inputId);
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;

  const isThreadComposer = inputId === 'reply-input-thread';

  if (isThreadComposer) {
    threadMessages.push({
      id: `m${Date.now()}`,
      type: 'text',
      author: 'You',
      avatar: '#22d3ee',
      time: 'Now',
      text,
    });
    input.value = '';
    replyTargetId = null;
    input.placeholder = 'Reply to the conversation...';
    renderThreadFeed();
    return;
  }

  const newReply = {
    id: `r${Date.now()}`,
    author: 'You',
    avatar: '#22d3ee',
    text,
    time: 'Now',
    createdAt: Date.now(),
    replyTo: replyTargetId || undefined,
  };

  const replies = currentThreadGroup.replies;
  if (replyTargetId) {
    const parentIndex = replies.findIndex((r) => r.id === replyTargetId);
    if (parentIndex >= 0) {
      replies.splice(parentIndex + 1, 0, newReply);
    } else {
      replies.push(newReply);
    }
  } else {
    replies.push(newReply);
  }
  input.value = '';
  replyTargetId = null;
  input.placeholder = 'Reply to the conversation...';

  renderReplies(currentThreadGroup.replies, 'replies-list-media', true);
  renderThreadFeed();
};

document.addEventListener('DOMContentLoaded', () => {
  renderConversations(sampleConversations);

  const container = document.getElementById('conversation-list');
  const backButton = document.querySelector('.back-button');
  const threadFeed = document.getElementById('thread-feed');
  const repliesMedia = document.getElementById('replies-list-media');
  const sendButton = document.getElementById('send-reply-button');
  const input = document.getElementById('reply-input');
  const sendButtonThread = document.getElementById('send-reply-button-thread');
  const inputThread = document.getElementById('reply-input-thread');
  const emojiPicker = document.getElementById('emoji-picker');

  container?.addEventListener('click', (event) => {
    const article = event.target.closest('.conversation');
    if (!article) return;
    const index = Array.from(container.children).indexOf(article);
    const conversation = sampleConversations[index];
    if (conversation) {
      showThread(conversation);
    }
  });

  backButton?.addEventListener('click', () => {
    if (currentView === 'media') {
      setView('thread');
    } else {
      showList();
    }
  });

  threadFeed?.addEventListener('click', (e) => {
    const tile = e.target.closest('.thread-tile');
    if (!tile) return;
    const id = tile.dataset.groupId;
    const group = threadGroups.find((g) => g.id === id);
    if (group) {
      currentThreadGroup = group;
      showMedia();
    }
  });

  repliesMedia?.addEventListener('click', (e) => {
    const btn = e.target.closest('.reply-button');
    if (!btn) return;
    replyTargetId = btn.dataset.replyId || null;
    if (input) {
      const targetReply = currentThreadGroup.replies.find((r) => r.id === replyTargetId);
      input.focus();
      input.placeholder = targetReply
        ? `Replying to ${targetReply.author}...`
        : 'Reply to the conversation...';
    }
  });

  sendButton?.addEventListener('click', () => sendReply());
  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendReply();
    }
  });

  sendButtonThread?.addEventListener('click', () => sendReply('reply-input-thread'));
  inputThread?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendReply('reply-input-thread');
    }
  });

  emojiPicker?.addEventListener('click', (e) => {
    const btn = e.target.closest('.emoji-btn');
    if (!btn) return;
    const val = btn.dataset.emoji;
    if (val === '+') {
      const picked = window.prompt('Pick an emoji to add:', '🙂');
      if (picked) {
        handleEmojiReaction(picked.trim());
      }
    } else {
      handleEmojiReaction(val);
    }
  });
});
