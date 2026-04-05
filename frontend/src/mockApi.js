const users = [
  { id: 1, name: 'Admin User', email: 'admin@smartcivic.com', password: 'AdminPass123', role: 'admin' },
  { id: 2, name: 'Jane Doe', email: 'jane@example.com', password: 'Password123', role: 'user' },
];

const issues = [
  {
    issue_id: 1,
    title: 'Large pothole on Elm Street',
    description: 'A major pothole is damaging vehicles and making the road unsafe during rain.',
    category: 'Roads',
    location: 'Elm Street, Downtown',
    status: 'Pending',
    votes: 17,
    author: { id: 2, name: 'Jane Doe', email: 'jane@example.com' },
    image_data: '',
    video_data: '',
  },
  {
    issue_id: 2,
    title: 'Overflowing trash bins near the park',
    description: 'The bin area is not being emptied regularly, causing litter and odors for neighbors.',
    category: 'Garbage',
    location: 'Riverside Park',
    status: 'In Progress',
    votes: 23,
    author: { id: 2, name: 'Jane Doe', email: 'jane@example.com' },
    image_data: '',
    video_data: '',
  },
  {
    issue_id: 3,
    title: 'Streetlights out on Maple Avenue',
    description: 'Several streetlights have been dark for weeks, creating a safety risk at night.',
    category: 'Electric',
    location: 'Maple Avenue',
    status: 'Resolved',
    votes: 31,
    author: { id: 1, name: 'Admin User', email: 'admin@smartcivic.com' },
    image_data: '',
    video_data: '',
  },
];

const votes = {
  2: new Set([3]),
};

let nextIssueId = 4;

function delay(ms = 250) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  const stored = window.localStorage.getItem('smartcivic_user');
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

function createError(message, status = 400) {
  const error = new Error(message);
  error.response = { data: { error: message }, status };
  return error;
}

export async function loginUser(credentials) {
  await delay();
  const email = credentials.email?.trim().toLowerCase();
  const password = credentials.password || '';
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) {
    throw createError('Invalid login credentials.', 401);
  }
  return {
    token: `mock-token-${user.id}`,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
}

export async function registerUser(details) {
  await delay();
  const name = details.name?.trim();
  const email = details.email?.trim().toLowerCase();
  const password = details.password || '';

  if (!name || !email || !password) {
    throw createError('Name, email and password are required.', 400);
  }
  if (users.some((u) => u.email === email)) {
    throw createError('Email already registered.', 409);
  }

  const newUser = {
    id: users.length + 1,
    name,
    email,
    password,
    role: 'user',
  };
  users.push(newUser);

  return {
    token: `mock-token-${newUser.id}`,
    user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
  };
}

export async function loadIssues(filters = {}) {
  await delay();
  let result = [...issues];

  if (filters.user_id) {
    result = result.filter((issue) => issue.author?.id === Number(filters.user_id));
  }
  if (filters.category) {
    result = result.filter((issue) => issue.category === filters.category);
  }
  if (filters.status) {
    result = result.filter((issue) => issue.status === filters.status);
  }
  if (filters.search) {
    const term = filters.search.toLowerCase();
    result = result.filter((issue) =>
      issue.title.toLowerCase().includes(term) ||
      issue.description.toLowerCase().includes(term) ||
      issue.location.toLowerCase().includes(term)
    );
  }

  return { issues: result };
}

export async function createIssue(payload) {
  await delay();
  const user = getCurrentUser();
  if (!user) {
    throw createError('Authentication required to submit an issue.', 401);
  }

  const title = payload.title?.trim();
  const description = payload.description?.trim();
  const category = payload.category || 'Roads';
  const location = payload.location?.trim() || 'Unknown location';

  if (!title || !description) {
    throw createError('Title and description are required.', 400);
  }

  const newIssue = {
    issue_id: nextIssueId++,
    title,
    description,
    category,
    location,
    status: 'Pending',
    votes: 0,
    author: { id: user.id, name: user.name, email: user.email },
    image_data: payload.imageData || '',
    video_data: payload.videoData || '',
  };

  issues.unshift(newIssue);
  return { issue: newIssue };
}

export async function voteIssue(issueId) {
  await delay();
  const user = getCurrentUser();
  if (!user) {
    throw createError('Please sign in to vote.', 401);
  }

  const issue = issues.find((item) => item.issue_id === issueId);
  if (!issue) {
    throw createError('Issue not found.', 404);
  }

  votes[user.id] = votes[user.id] || new Set();
  if (votes[user.id].has(issueId)) {
    return { votes: issue.votes };
  }

  votes[user.id].add(issueId);
  issue.votes += 1;
  return { votes: issue.votes };
}

export async function updateIssueStatus(issueId, status) {
  await delay();
  const issue = issues.find((item) => item.issue_id === issueId);
  if (!issue) {
    throw createError('Issue not found.', 404);
  }
  issue.status = status;
  return { issue };
}
