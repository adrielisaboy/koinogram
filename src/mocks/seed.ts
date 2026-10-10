import type { AppSnapshot, Post, User } from '../types/domain';

const assets = {
  gathering: '/assets/outdoor-gathering.jpg',
  discussion: '/assets/outdoor-discussion.jpg',
  water: '/assets/friends-by-water.jpg',
};

export const seedUsers: User[] = [
  { id: 'u-amara', displayName: 'Amara James', handle: 'amarajames', bio: 'Learning to notice grace in the ordinary. Community, coffee, and Colossians.', tradition: 'Anglican', interests: ['Scripture', 'Community', 'Worship'], following: false, isCurrentUser: true },
  { id: 'u-lena', displayName: 'Lena Brooks', handle: 'lenabrooks', bio: 'Youth mentor, garden enthusiast, slowly reading through the Psalms.', location: 'Bristol', tradition: 'Baptist', interests: ['Prayer', 'Creation care', 'Scripture'], following: true },
  { id: 'u-jordan', displayName: 'Jordan Ellis', handle: 'jordane', bio: 'Making space for honest questions and hopeful beginnings.', location: 'Manchester', tradition: 'Methodist', interests: ['Faith & work', 'Music', 'Service'], following: true },
  { id: 'u-mina', displayName: 'Mina Park', handle: 'minapark', bio: 'Piano, Sunday lunch, and the little ways people show up.', location: 'London', tradition: 'Presbyterian', interests: ['Worship', 'Prayer', 'Community'], following: false },
  { id: 'u-naomi', displayName: 'Naomi Carter', handle: 'naomicarter', bio: 'Finding steadiness in Scripture, one day at a time.', tradition: 'Other', interests: ['Bible study', 'Wellbeing'], following: false },
];

const demoComment = { id: 'c-1', authorId: 'u-jordan', body: 'Thank you for sharing this. Praying with you.', createdAt: new Date(Date.now() - 1000 * 60 * 28).toISOString() };

export const seedPosts: Post[] = [
  { id: 'p-prayer', type: 'prayer', authorId: 'u-lena', createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(), visibility: 'followers', communityId: 'c-prayer', text: 'My dad has an appointment tomorrow and our family is carrying a lot of worry. If you have a moment, please pray for peace and good news. Thank you for being here.', responseCount: 18, prayedByMe: false, audienceLabel: 'Followers only', amenCount: 3, amenedByMe: false, savedByMe: false, comments: [demoComment] },
  { id: 'p-verse', type: 'verse', authorId: 'u-mina', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), visibility: 'public', communityId: 'c-scripture', text: 'A line I keep coming back to when the week feels loud.', reference: 'Psalm 46:10', translation: 'NRSVUE', amenCount: 34, amenedByMe: false, savedByMe: true, comments: [] },
  { id: 'p-garden', type: 'image', authorId: 'u-jordan', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), visibility: 'public', text: 'After our gathering we stayed outside and talked about what it means to keep showing up for each other. I left with a few new friends and a lot of hope.', imageUrl: assets.discussion, imageAlt: 'Friends sitting together outdoors during an evening conversation', amenCount: 42, amenedByMe: true, savedByMe: false, comments: [] },
  { id: 'p-testimony', type: 'testimony', authorId: 'u-naomi', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString(), visibility: 'public', text: 'I spent a long time thinking that asking for help meant I had run out of faith. A friend sat with me last month and didn’t try to fix anything. I’m grateful for the kind of hope that makes room for honest days.', topic: 'A story of being carried', amenCount: 57, amenedByMe: false, savedByMe: false, comments: [] },
  { id: 'p-text', type: 'text', authorId: 'u-amara', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(), visibility: 'public', text: 'A small reminder for today: you don’t have to have the perfect words to begin again. Sometimes “help me” is already a prayer.', amenCount: 29, amenedByMe: false, savedByMe: false, comments: [] },
  { id: 'p-video', type: 'video', authorId: 'u-lena', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 42).toISOString(), visibility: 'public', text: 'A quiet minute from our evening walk by the water.', thumbnailUrl: assets.water, duration: '0:42', amenCount: 12, amenedByMe: false, savedByMe: false, comments: [] },
];

export const seedSnapshot: AppSnapshot = {
  currentUserId: 'u-amara',
  users: seedUsers,
  posts: seedPosts,
  communities: [
    { id: 'c-scripture', name: 'Scripture & the Everyday', description: 'A gentle space to read, ask questions, and share what a passage is stirring in daily life.', rules: ['Curiosity is welcome; no question is too small.', 'Share interpretations with humility.', 'Protect personal stories shared here.'], memberCount: 842, category: 'Bible study', joined: true },
    { id: 'c-prayer', name: 'The Prayer Room', description: 'A quiet corner for prayer requests, gratitude, and faithful presence.', rules: ['Ask before sharing someone else’s request.', 'Respect every visibility choice.', 'Respond with care, not certainty.'], memberCount: 1260, category: 'Prayer', joined: true },
    { id: 'c-young', name: 'Young & Rooted', description: 'Young adults making room for faith, friendship, and the questions along the way.', rules: ['Be kind across traditions.', 'No unsolicited debate.', 'Make space for everyone.'], memberCount: 2314, category: 'Community', joined: false },
    { id: 'c-creation', name: 'Small Acts, Shared Earth', description: 'Practical encouragement for tending the places and people around us.', rules: ['Keep suggestions practical and welcoming.', 'Celebrate small steps.', 'Credit community resources.'], memberCount: 617, category: 'Service', joined: false },
  ],
  notifications: [
    { id: 'n1', kind: 'prayer', actorId: 'u-jordan', message: 'is praying with you and Lena', createdAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(), read: false, href: '/app' },
    { id: 'n2', kind: 'amen', actorId: 'u-mina', message: 'said Amen to your reflection', createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), read: false, href: '/app' },
    { id: 'n3', kind: 'community', actorId: 'u-lena', message: 'shared a new thought in Scripture & the Everyday', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), read: true, href: '/app/communities' },
    { id: 'n4', kind: 'comment', actorId: 'u-jordan', message: 'left a kind word on your post', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(), read: true, href: '/app' },
  ],
  blockedUserIds: [],
  mutedUserIds: [],
  reports: [],
  profileVisibility: 'public',
  emailNotifications: true,
  appearance: 'light',
  prayerDefaultVisibility: 'followers',
};
