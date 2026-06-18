'use client';

import { useState, useEffect, useCallback, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import { useUser } from '@clerk/nextjs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  getEmails,
  searchEmails,
  getEmailBody,
  getDrafts,
  getImportantEmails,
  getPromotionsEmails,
  getUpdatesEmails,
  getSocialEmails,
  getSentEmails,
  deleteEmail,
  deleteDraft,
  createDraft,
  sendEmail,
} from '@/app/actions/gmail';

import type { EmailPreview } from '@/utils/api/gmail/types';
import EmailBodyIframe from '@/components/email-body-iframe';
import { playSendSound, playErrorSound, playPopSound, playDeleteSound } from '@/utils/sounds';
import { ConnectButton } from './ConnectButton';

type MailTab = 'inbox' | 'important' | 'promotions' | 'updates' | 'social' | 'sent' | 'drafts' | 'compose';
type InboxSubFilter = 'all' | 'important' | 'promotions' | 'updates' | 'social';

interface DraftPreview {
  id: string;
  subject: string;
  snippet: string;
  to: string;
  date: string;
}

const categoryConfig: Record<MailTab, { label: string; icon: ReactNode; color: string }> = {
  inbox: {
    label: 'Inbox',
    color: 'text-blue-500',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M22 4L12 13L2 4" />
      </svg>
    ),
  },
  important: {
    label: 'Important',
    color: 'text-amber-500',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
  },
  promotions: {
    label: 'Promos',
    color: 'text-green-500',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    ),
  },
  updates: {
    label: 'Updates',
    color: 'text-purple-500',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
  social: {
    label: 'Social',
    color: 'text-cyan-500',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  sent: {
    label: 'Sent',
    color: 'text-emerald-500',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
      </svg>
    ),
  },
  drafts: {
    label: 'Drafts',
    color: 'text-orange-500',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
  },
  compose: {
    label: 'Compose',
    color: 'text-foreground',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
  },
};

function getInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

function getAvatarColor(name: string): string {
  const colors = [
    'bg-red-500', 'bg-emerald-500', 'bg-blue-500', 'bg-purple-500',
    'bg-amber-500', 'bg-pink-500', 'bg-cyan-500', 'bg-indigo-500',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(parseInt(dateStr) || Date.parse(dateStr));
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getPriorityLabel(labels: string[]): string {
  if (labels.includes('IMPORTANT')) return 'critical';
  if (labels.includes('CATEGORY_PERSONAL')) return 'high';
  if (labels.includes('CATEGORY_PROMOTIONS')) return 'ignore';
  if (labels.includes('CATEGORY_UPDATES')) return 'low';
  return 'low';
}

const priorityConfig: Record<string, { label: string; className: string }> = {
  critical: { label: 'Critical', className: 'bg-destructive/10 text-destructive' },
  high: { label: 'High', className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  low: { label: 'Low', className: 'bg-muted text-muted-foreground' },
  ignore: { label: 'Ignore', className: 'bg-muted text-muted-foreground/60' },
};

interface GmailPanelProps {
  isConnected: boolean;
}

export default function GmailPanel({ isConnected }: GmailPanelProps) {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<MailTab>('inbox');
  const [inboxSubFilter, setInboxSubFilter] = useState<InboxSubFilter>('all');
  const [emails, setEmails] = useState<EmailPreview[]>([]);
  const [drafts, setDrafts] = useState<DraftPreview[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [bodyCache, setBodyCache] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(false);
  const [bodyLoading, setBodyLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingDraftId, setDeletingDraftId] = useState<string | null>(null);

  const [composeTo, setComposeTo] = useState<string[]>([]);
  const [composeToInput, setComposeToInput] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [composeSending, setComposeSending] = useState(false);

  const fetchEmails = useCallback(async (query?: string) => {
    setLoading(true);
    try {
      const result = query
        ? await searchEmails(query)
        : await getEmails();
      setEmails(result);
    } catch (error) {
      playErrorSound();
      toast.error('Failed to load emails');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategoryEmails = useCallback(async (tab: MailTab, subFilter?: InboxSubFilter) => {
    setLoading(true);
    try {
      let result: EmailPreview[];
      const filter = subFilter || tab;
      switch (filter) {
        case 'important': result = await getImportantEmails(); break;
        case 'promotions': result = await getPromotionsEmails(); break;
        case 'updates': result = await getUpdatesEmails(); break;
        case 'social': result = await getSocialEmails(); break;
        case 'sent': result = await getSentEmails(); break;
        default: result = await getEmails();
      }
      setEmails(result);
    } catch (error) {
      playErrorSound();
      toast.error('Failed to load emails');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDrafts = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getDrafts();
      setDrafts(result);
    } catch (error) {
      playErrorSound();
      toast.error('Failed to load drafts');
    } finally {
      setLoading(false);
    }
  }, []);

  const isEmailTab = activeTab !== 'drafts' && activeTab !== 'compose';

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setBodyCache(new Map());
    try {
      if (isEmailTab) {
        if (activeTab === 'inbox') {
          if (inboxSubFilter === 'all') {
            await fetchEmails(searchQuery || undefined);
          } else {
            await fetchCategoryEmails(activeTab, inboxSubFilter);
          }
        } else {
          await fetchCategoryEmails(activeTab);
        }
      } else if (activeTab === 'drafts') {
        await fetchDrafts();
      }
      playPopSound();
      toast.success('Refreshed');
    } finally {
      setRefreshing(false);
    }
  }, [activeTab, isEmailTab, fetchEmails, fetchCategoryEmails, fetchDrafts, searchQuery, inboxSubFilter]);

  useEffect(() => {
    if (!isConnected) return;
    if (isEmailTab) {
      if (activeTab === 'inbox') {
        if (inboxSubFilter === 'all') {
          fetchEmails();
        } else {
          fetchCategoryEmails(activeTab, inboxSubFilter);
        }
      } else {
        fetchCategoryEmails(activeTab);
      }
    } else if (activeTab === 'drafts') {
      fetchDrafts();
    }
  }, [isConnected, activeTab, isEmailTab, fetchEmails, fetchCategoryEmails, fetchDrafts, inboxSubFilter]);

  const handleDelete = useCallback(async (emailId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this email? This cannot be undone.')) return;

    setDeletingId(emailId);
    try {
      await deleteEmail(emailId);
      setEmails((prev) => prev.filter((em) => em.id !== emailId));
      if (selectedId === emailId) {
        setSelectedId(null);
        setBodyCache((prev) => {
          const next = new Map(prev);
          next.delete(emailId);
          return next;
        });
      }
      playDeleteSound();
      toast.success('Email deleted');
    } catch (error) {
      playErrorSound();
      toast.error('Failed to delete email');
    } finally {
      setDeletingId(null);
    }
  }, [selectedId]);

  const handleDeleteDraft = useCallback(async (draftId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this draft? This cannot be undone.')) return;

    setDeletingDraftId(draftId);
    try {
      await deleteDraft(draftId);
      setDrafts((prev) => prev.filter((d) => d.id !== draftId));
      playDeleteSound();
      toast.success('Draft deleted');
    } catch (error) {
      playErrorSound();
      toast.error('Failed to delete draft');
    } finally {
      setDeletingDraftId(null);
    }
  }, []);

  const fetchBody = useCallback(async (emailId: string) => {
    if (bodyCache.has(emailId)) {
      return bodyCache.get(emailId)!;
    }

    setBodyLoading(true);
    try {
      const body = await getEmailBody(emailId);
      setBodyCache((prev) => new Map(prev).set(emailId, body));
      return body;
    } catch (error) {
      return '';
    } finally {
      setBodyLoading(false);
    }
  }, [bodyCache]);

  const handleEmailClick = useCallback(async (emailId: string) => {
    setSelectedId(emailId);
    if (!bodyCache.has(emailId)) {
      await fetchBody(emailId);
    }
  }, [bodyCache, fetchBody]);

  const handleBack = useCallback(() => {
    setSelectedId(null);
  }, []);

  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    await fetchEmails(searchQuery || undefined);
  }, [searchQuery, fetchEmails]);

  const selectedEmail = emails.find((e) => e.id === selectedId);
  const selectedBody = selectedId ? bodyCache.get(selectedId) : undefined;

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const addRecipient = useCallback((value: string) => {
    const addrs = value.split(/[,;]+/).map((e) => e.trim()).filter(Boolean);
    const valid = addrs.filter(isValidEmail);
    if (valid.length === 0 && addrs.length > 0) {
      toast.error('Invalid email format');
      return;
    }
    setComposeTo((prev) => [...prev, ...valid]);
    setComposeToInput('');
  }, []);

  const removeRecipient = useCallback((index: number) => {
    setComposeTo((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSendReply = useCallback(async () => {
    if (!selectedEmail || !replyText.trim()) return;
    try {
      await sendEmail({
        to: selectedEmail.from,
        subject: `Re: ${selectedEmail.subject}`,
        body: replyText,
      });
      playSendSound();
      toast.success('Reply sent');
      setReplyText('');
    } catch (error) {
      playErrorSound();
      toast.error('Failed to send reply');
    }
  }, [selectedEmail, replyText]);

  const handleComposeSend = useCallback(async () => {
    if (composeTo.length === 0 || !composeSubject.trim()) {
      toast.error('Recipient and subject are required');
      return;
    }
    setComposeSending(true);
    try {
      await sendEmail({ to: composeTo, subject: composeSubject, body: composeBody });
      playSendSound();
      toast.success('Email sent');
      setComposeTo([]);
      setComposeToInput('');
      setComposeSubject('');
      setComposeBody('');
      setActiveTab('inbox');
    } catch (error) {
      playErrorSound();
      toast.error('Failed to send email');
    } finally {
      setComposeSending(false);
    }
  }, [composeTo, composeSubject, composeBody]);

  const handleComposeDraft = useCallback(async () => {
    if (composeTo.length === 0) {
      toast.error('Recipient is required');
      return;
    }
    setComposeSending(true);
    try {
      await createDraft({ to: composeTo, subject: composeSubject, body: composeBody });
      playPopSound();
      toast.success('Draft saved');
      setComposeTo([]);
      setComposeToInput('');
      setComposeSubject('');
      setComposeBody('');
      setActiveTab('drafts');
    } catch (error) {
      playErrorSound();
      toast.error('Failed to save draft');
    } finally {
      setComposeSending(false);
    }
  }, [composeTo, composeSubject, composeBody]);

  const navTabs = ['inbox', 'sent', 'drafts', 'compose'] as MailTab[];

  const inboxSubFilters: Array<{
    key: InboxSubFilter;
    label: string;
    icon: ReactNode | null;
    color: string;
  }> = [
    { key: 'all', label: 'All', icon: null, color: 'text-foreground' },
    { key: 'important', label: 'Important', icon: categoryConfig.important.icon, color: 'text-amber-500' },
    { key: 'promotions', label: 'Promos', icon: categoryConfig.promotions.icon, color: 'text-green-500' },
    { key: 'updates', label: 'Updates', icon: categoryConfig.updates.icon, color: 'text-purple-500' },
    { key: 'social', label: 'Social', icon: categoryConfig.social.icon, color: 'text-cyan-500' },
  ];

  const isUserLoaded = user !== undefined;

  const renderEmailList = (list: EmailPreview[], showPriority = true) => (
    <div className="flex flex-col">
      {loading ? (
        <div className="flex flex-col">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 border-b border-border/30 px-5 py-3"
              style={{ animationDelay: `${i * 75}ms` }}
            >
              <div className="h-8 w-8 rounded-full bg-secondary/60 shrink-0 animate-shimmer" />
              <div className="min-w-0 flex-1 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="h-3 rounded-full animate-shimmer" style={{ width: `${35 + (i % 3) * 10}%` }} />
                  <div className="h-3 w-10 rounded-full animate-shimmer" />
                </div>
                <div className="h-3 rounded-full animate-shimmer" style={{ width: `${50 + (i % 2) * 15}%` }} />
                <div className="h-2.5 rounded-full animate-shimmer" style={{ width: `${60 + (i % 3) * 8}%` }} />
              </div>
              <div className="h-2.5 w-8 rounded-full animate-shimmer shrink-0" />
            </div>
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-2 opacity-40">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M22 4L12 13L2 4" />
          </svg>
          <span className="text-[0.78rem]">No emails found</span>
        </div>
      ) : (
        list.map((email) => {
          const priority = getPriorityLabel(email.labelIds);
          const config = priorityConfig[priority] || priorityConfig.low;
          const isSent = activeTab === 'sent';
          const displayName = isSent ? (email.to || 'Unknown') : email.from;

          return (
            <div
              key={email.id}
              className={`group flex items-center gap-3 border-b border-border/30 px-5 py-3 transition-all hover:bg-secondary/50 border-l-2 border-l-transparent hover:border-l-primary/50 ${
                deletingId === email.id ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              <button
                onClick={() => handleEmailClick(email.id)}
                className="flex flex-1 items-center gap-3 min-w-0 text-left"
              >
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className={`text-[0.7rem] font-medium text-white ${getAvatarColor(displayName)}`}>
                    {getInitial(displayName)}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[0.82rem] font-medium text-foreground/80 group-hover:text-foreground truncate">
                      {displayName}
                    </span>
                    {showPriority && (
                      <Badge variant="secondary" className={`text-[0.55rem] px-1.5 py-0 shrink-0 ${config.className}`}>
                        {config.label}
                      </Badge>
                    )}
                    {isSent && (
                      <Badge variant="secondary" className="text-[0.55rem] px-1.5 py-0 shrink-0 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        Sent
                      </Badge>
                    )}
                  </div>
                  <div className="mt-0.5 truncate text-[0.75rem] text-muted-foreground">
                    {email.subject}
                  </div>
                  {email.snippet && (
                    <div className="mt-0.5 truncate text-[0.7rem] text-muted-foreground/60">
                      {email.snippet}
                    </div>
                  )}
                </div>

                <span className="text-[0.65rem] text-muted-foreground/60 shrink-0">
                  {formatDate(email.date)}
                </span>
              </button>

              <button
                onClick={(e) => handleDelete(email.id, e)}
                disabled={deletingId === email.id}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                title="Delete email"
              >
                {deletingId === email.id ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                )}
              </button>
            </div>
          );
        })
      )}
    </div>
  );

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border/50 px-4 py-2.5 sm:px-5 sm:py-3">
        <div className="flex items-center gap-2">
          {selectedId ? (
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">Back</span>
            </button>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={categoryConfig[activeTab].color}>
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M22 4L12 13L2 4" />
              </svg>
              <span className="text-sm font-medium text-foreground">
                {activeTab === 'inbox' && inboxSubFilter !== 'all'
                  ? categoryConfig[inboxSubFilter].label
                  : categoryConfig[activeTab].label}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 text-[0.65rem]">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="text-muted-foreground hidden sm:inline">Auto-sorted</span>
          </div>
          {isUserLoaded && !selectedId && activeTab !== 'compose' && (
            <button
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors disabled:opacity-50"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={refreshing ? 'animate-spin' : ''}
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                <path d="M21 3v5h-5" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Loading state while user data loads */}
      {!isUserLoaded && (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-secondary/60 animate-shimmer" />
            <div className="h-3 w-32 rounded-full bg-secondary/60 animate-shimmer" />
          </div>
        </div>
      )}

      {/* Connect Button if user loaded but Gmail not connected */}
      {isUserLoaded && !isConnected && (
        <div className="flex-1 flex items-center justify-center">
          <ConnectButton type="gmail" isConnected={isConnected} />
        </div>
      )}

      {/* Category Nav — horizontal scroll on mobile, compact on desktop */}
      {isUserLoaded && !selectedId && isConnected && (
        <div className="shrink-0 border-b border-border/50">
          <div className="flex overflow-x-auto scrollbar-none gap-0.5 px-1 py-1 sm:px-2">
            {navTabs.map((tab) => {
              const cfg = categoryConfig[tab];
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setSelectedId(null);
                  }}
                  className={`flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1.5 text-[0.7rem] font-medium transition-all shrink-0 ${
                    isActive
                      ? `bg-secondary/80 ${cfg.color}`
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                  }`}
                >
                  {cfg.icon}
                  <span className="hidden xs:inline sm:inline">{cfg.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Inbox View — category panel + email list */}
      {isUserLoaded && !selectedId && activeTab === 'inbox' && (
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <aside className="flex w-[7.5rem] shrink-0 flex-col border-r border-border/40 bg-secondary/10 sm:w-32">
            <div className="shrink-0 border-b border-border/30 px-3 py-2">
              <span className="text-[0.62rem] font-semibold uppercase tracking-wider text-muted-foreground/70">
                Categories
              </span>
            </div>
            <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-1.5">
              {inboxSubFilters.map((sf) => {
                const isActive = inboxSubFilter === sf.key;
                return (
                  <button
                    key={sf.key}
                    onClick={() => {
                      setInboxSubFilter(sf.key);
                      setSelectedId(null);
                    }}
                    className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[0.7rem] font-medium transition-all ${
                      isActive
                        ? `bg-secondary/90 ${sf.color} shadow-sm`
                        : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                    }`}
                  >
                    {sf.icon && <span className="shrink-0 opacity-80">{sf.icon}</span>}
                    <span className="truncate">{sf.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <form onSubmit={handleSearch} className="shrink-0 border-b border-border/30 px-4 py-2 sm:px-5">
              <div className="relative">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search emails..."
                  className="h-9 bg-secondary/30 border-border/30 pl-9 text-[0.78rem] placeholder:text-muted-foreground/50 focus-visible:ring-1 focus-visible:ring-primary/30"
                />
              </div>
            </form>
            <div className="min-h-0 flex-1 overflow-y-auto">
              {renderEmailList(emails)}
            </div>
          </div>
        </div>
      )}

      {/* Sent View */}
      {isUserLoaded && !selectedId && activeTab === 'sent' && (
        <div className="flex-1 overflow-y-auto min-h-0">
          {renderEmailList(emails, false)}
        </div>
      )}

      {/* Drafts View */}
      {isUserLoaded && !selectedId && activeTab === 'drafts' && (
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="flex flex-col">
            {loading ? (
              <div className="flex flex-col">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 border-b border-border/30 px-5 py-3"
                    style={{ animationDelay: `${i * 75}ms` }}
                  >
                    <div className="h-8 w-8 rounded-full bg-secondary/60 shrink-0 animate-shimmer" />
                    <div className="min-w-0 flex-1 flex flex-col gap-2">
                      <div className="h-3 rounded-full animate-shimmer" style={{ width: `${40 + (i % 3) * 10}%` }} />
                      <div className="h-3 rounded-full animate-shimmer" style={{ width: `${55 + (i % 2) * 15}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : drafts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-2 opacity-40">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                <span className="text-[0.78rem]">No drafts</span>
              </div>
            ) : (
              drafts.map((draft) => (
                <div
                  key={draft.id}
                  className={`group flex items-center gap-3 border-b border-border/30 px-5 py-3 transition-all hover:bg-secondary/50 border-l-2 border-l-transparent hover:border-l-primary/50 ${
                    deletingDraftId === draft.id ? 'opacity-50 pointer-events-none' : ''
                  }`}
                >
                  <button
                    onClick={() => {
                      setComposeTo(draft.to ? [draft.to] : []);
                      setComposeToInput(draft.to || '');
                      setComposeSubject(draft.subject);
                      setComposeBody(draft.snippet);
                      setActiveTab('compose');
                    }}
                    className="flex flex-1 items-center gap-3 min-w-0 text-left"
                  >
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="text-[0.7rem] font-medium text-white bg-muted">
                        {draft.to ? getInitial(draft.to) : '?'}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[0.82rem] font-medium text-foreground/80 truncate">
                          {draft.to || 'No recipient'}
                        </span>
                        <Badge variant="secondary" className="text-[0.55rem] px-1.5 py-0 shrink-0 bg-muted text-muted-foreground">
                          Draft
                        </Badge>
                      </div>
                      <div className="mt-0.5 truncate text-[0.75rem] text-muted-foreground">
                        {draft.subject || 'No subject'}
                      </div>
                      {draft.snippet && (
                        <div className="mt-0.5 truncate text-[0.7rem] text-muted-foreground/60">
                          {draft.snippet}
                        </div>
                      )}
                    </div>

                    <span className="text-[0.65rem] text-muted-foreground/60 shrink-0">
                      {formatDate(draft.date)}
                    </span>
                  </button>

                  <button
                    onClick={(e) => handleDeleteDraft(draft.id, e)}
                    disabled={deletingDraftId === draft.id}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                    title="Delete draft"
                  >
                    {deletingDraftId === draft.id ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                      </svg>
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    )}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Compose View */}
      {isUserLoaded && !selectedId && activeTab === 'compose' && (
        <div className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-5">
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-[0.72rem] font-medium text-muted-foreground mb-1.5 block">To</label>
              <div className="flex flex-wrap items-center gap-1.5 rounded-lg bg-secondary/30 border border-border/30 px-2.5 py-2 min-h-[2.5rem] focus-within:ring-1 focus-within:ring-primary/30">
                {composeTo.map((email, i) => (
                  <span
                    key={`${email}-${i}`}
                    className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[0.72rem] font-medium text-primary"
                  >
                    {email}
                    <button
                      onClick={() => removeRecipient(i)}
                      className="ml-0.5 rounded-full hover:bg-primary/20 p-0.5"
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={composeToInput}
                  onChange={(e) => setComposeToInput(e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === 'Tab' || e.key === ',') && composeToInput.trim()) {
                      e.preventDefault();
                      addRecipient(composeToInput);
                    }
                    if (e.key === 'Backspace' && !composeToInput && composeTo.length > 0) {
                      removeRecipient(composeTo.length - 1);
                    }
                  }}
                  onBlur={() => {
                    if (composeToInput.trim()) addRecipient(composeToInput);
                  }}
                  placeholder={composeTo.length === 0 ? 'recipient@example.com' : ''}
                  className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-[0.82rem] text-foreground placeholder:text-muted-foreground/50 py-0.5"
                />
              </div>
              <p className="text-[0.65rem] text-muted-foreground/50 mt-1">Press Enter, Tab, or comma to add</p>
            </div>
            <div>
              <label className="text-[0.72rem] font-medium text-muted-foreground mb-1.5 block">Subject</label>
              <Input
                type="text"
                value={composeSubject}
                onChange={(e) => setComposeSubject(e.target.value)}
                placeholder="Email subject"
                className="h-10 bg-secondary/30 border-border/30 text-[0.82rem] placeholder:text-muted-foreground/50 focus-visible:ring-1 focus-visible:ring-primary/30"
              />
            </div>
            <div className="flex-1">
              <label className="text-[0.72rem] font-medium text-muted-foreground mb-1.5 block">Body</label>
              <textarea
                value={composeBody}
                onChange={(e) => setComposeBody(e.target.value)}
                placeholder="Write your email..."
                rows={12}
                className="w-full rounded-lg bg-secondary/30 border border-border/30 px-3 py-2.5 text-[0.82rem] text-foreground placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/30 resize-none"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleComposeSend}
                disabled={composeSending || composeTo.length === 0 || !composeSubject.trim()}
                className="flex h-10 items-center rounded-lg bg-primary px-5 text-[0.78rem] font-medium text-primary-foreground hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
              >
                {composeSending ? 'Sending...' : 'Send'}
              </button>
              <button
                onClick={handleComposeDraft}
                disabled={composeSending || composeTo.length === 0}
                className="flex h-10 items-center rounded-lg bg-secondary px-5 text-[0.78rem] font-medium text-secondary-foreground hover:bg-secondary/80 transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                {composeSending ? 'Saving...' : 'Save Draft'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Body View */}
      {selectedId && selectedEmail && (
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="animate-fade-in-up">
            <div className="sticky top-0 z-10 border-b border-border/30 bg-card px-4 py-3 sm:px-5 sm:py-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <h2 className="text-[0.95rem] font-semibold text-foreground flex-1 min-w-0">
                  {selectedEmail.subject}
                </h2>
                <button
                  onClick={(e) => handleDelete(selectedEmail.id, e)}
                  disabled={deletingId === selectedEmail.id}
                  className="flex h-8 items-center gap-1.5 rounded-lg bg-destructive/10 px-3 text-[0.72rem] font-medium text-destructive hover:bg-destructive/20 transition-colors shrink-0 disabled:opacity-50"
                >
                  {deletingId === selectedEmail.id ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  )}
                  <span className="hidden sm:inline">Delete</span>
                </button>
              </div>
              <div className="flex items-start gap-3">
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarFallback className={`text-[0.75rem] font-medium text-white ${getAvatarColor(selectedEmail.from)}`}>
                    {getInitial(selectedEmail.from)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[0.82rem] font-medium text-foreground">
                      {selectedEmail.from}
                    </span>
                    <span className="text-[0.65rem] text-muted-foreground/60">
                      {formatDate(selectedEmail.date)}
                    </span>
                  </div>
                  <div className="text-[0.7rem] text-muted-foreground/60 mt-0.5">
                    to {selectedEmail.to || 'me'}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-4 py-3 sm:px-5 sm:py-4">
              {bodyLoading && !selectedBody ? (
                <div className="flex flex-col gap-3 py-2">
                  <div className="h-3 rounded-full animate-shimmer w-3/4" />
                  <div className="h-3 rounded-full animate-shimmer w-full" />
                  <div className="h-3 rounded-full animate-shimmer w-5/6" />
                  <div className="h-3 rounded-full animate-shimmer w-2/3" />
                  <div className="h-8" />
                  <div className="h-3 rounded-full animate-shimmer w-1/2" />
                  <div className="h-3 rounded-full animate-shimmer w-4/5" />
                  <div className="h-3 rounded-full animate-shimmer w-full" />
                  <div className="h-3 rounded-full animate-shimmer w-3/5" />
                </div>
              ) : selectedBody ? (
                <EmailBodyIframe html={selectedBody} />
              ) : (
                <div className="text-[0.82rem] text-muted-foreground/60 py-4">
                  {selectedEmail.snippet || 'No content available'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reply Compose */}
      {selectedId && selectedEmail && (
        <div className="shrink-0 border-t border-border/50 px-4 py-3 sm:px-5">
          <div className="flex items-center gap-3">
            <Input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && replyText.trim()) {
                  handleSendReply();
                }
              }}
              placeholder={`Reply to ${selectedEmail.from}...`}
              className="h-10 bg-secondary/30 border-border/30 text-[0.82rem] placeholder:text-muted-foreground/50 focus-visible:ring-1 focus-visible:ring-primary/30"
            />
            <button
              onClick={handleSendReply}
              disabled={!replyText.trim()}
              className="flex h-10 items-center rounded-lg bg-primary px-4 text-[0.78rem] font-medium text-primary-foreground hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
