import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '../layouts/AppShell';
import { LandingPage, FaithPage, GuidelinesPage } from '../pages/PublicPages';
import { LoginPage, SignupPage, ResetPasswordPage, OnboardingPage } from '../pages/AuthPages';
import { FeedPage, ComposerPage } from '../pages/FeedPages';
import { ExplorePage } from '../pages/ExplorePage';
import { ProfilePage } from '../pages/ProfilePage';
import { CommunitiesPage, CommunityPage } from '../pages/CommunityPages';
import { NotificationsPage, SavedPage } from '../pages/PersonalPages';
import { SettingsPage, PrivacyPage, SafetyPage, ModerationPage } from '../pages/SettingsPages';
import { NotFoundPage } from '../pages/NotFoundPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/faith" element={<FaithPage />} />
      <Route path="/guidelines" element={<GuidelinesPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/app" element={<AppShell />}>
        <Route index element={<FeedPage />} />
        <Route path="create" element={<ComposerPage />} />
        <Route path="explore" element={<ExplorePage />} />
        <Route path="people/:userId" element={<ProfilePage />} />
        <Route path="communities" element={<CommunitiesPage />} />
        <Route path="community/:communityId" element={<CommunityPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="saved" element={<SavedPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="settings/privacy" element={<PrivacyPage />} />
        <Route path="safety" element={<SafetyPage />} />
        <Route path="moderation" element={<ModerationPage />} />
      </Route>
      <Route path="/demo" element={<Navigate to="/app" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
