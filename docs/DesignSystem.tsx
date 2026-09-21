import { useState } from 'react';

// ── Section nav ────────────────────────────────────────────────────────────────
const NAV = [
  { id: 'foundations', label: '00 Foundations' },
  { id: 'colors', label: '01 Colors' },
  { id: 'typography', label: '02 Typography' },
  { id: 'spacing', label: '03 Spacing' },
  { id: 'radius', label: '04 Radius & Shadows' },
  { id: 'icons', label: '05 Icons' },
  { id: 'buttons', label: '06 Buttons' },
  { id: 'forms', label: '07 Forms' },
  { id: 'badges', label: '08 Badges & Status' },
  { id: 'cards', label: '09 Cards' },
  { id: 'navigation', label: '10 Navigation' },
  { id: 'chat', label: '11 Chat & Transaction' },
  { id: 'feedback', label: '12 Feedback' },
  { id: 'admin', label: '13 Admin Components' },
  { id: 'layout', label: '14 Layout' },
  { id: 'screens', label: '15 Screen Patterns' },
  { id: 'routes', label: '16 Route Map' },
  { id: 'state', label: '17 State Inventory' },
  { id: 'handoff', label: '18 Developer Handoff' },
  { id: 'mockdata', label: '19 Mock Data Schema' },
  { id: 'credit', label: '20 Credit Model' },
  { id: 'txstate', label: '21 Transaction State Machine' },
  { id: 'aiflow', label: '22 AI Exchange Flow' },
  { id: 'responsive', label: '23 Responsive Rules' },
  { id: 'rolematrix', label: '24 Role Access Matrix' },
  { id: 'guards', label: '25 Route Guards' },
];

// ── Tokens ─────────────────────────────────────────────────────────────────────
const COLOR_TOKENS = [
  { group: 'Brand', tokens: [
    { name: 'primary', val: '#00685F', label: 'Primary' },
    { name: 'primary-hover', val: '#008378', label: 'Primary Hover' },
    { name: 'primary-fixed', val: '#89F5E7', label: 'Primary Fixed' },
    { name: 'on-primary', val: '#FFFFFF', label: 'On Primary', dark: true },
    { name: 'secondary', val: '#9D4300', label: 'Secondary' },
    { name: 'secondary-hover', val: '#FD761A', label: 'Secondary Hover' },
    { name: 'secondary-fixed', val: '#FFDBCA', label: 'Secondary Fixed' },
  ]},
  { group: 'Surface', tokens: [
    { name: 'background', val: '#F8F9FF', label: 'Background' },
    { name: 'surface', val: '#FFFFFF', label: 'Surface', border: true },
    { name: 'surface-low', val: '#EFF4FF', label: 'Surface Low' },
    { name: 'surface-container', val: '#E5EEFF', label: 'Surface Container' },
    { name: 'surface-high', val: '#DCE9FF', label: 'Surface High' },
  ]},
  { group: 'Text', tokens: [
    { name: 'text-primary', val: '#0B1C30', label: 'Text Primary' },
    { name: 'text-secondary', val: '#3D4947', label: 'Text Secondary' },
    { name: 'text-muted', val: '#6D7A77', label: 'Text Muted' },
    { name: 'border', val: '#BCC9C6', label: 'Border' },
  ]},
  { group: 'Semantic', tokens: [
    { name: 'success', val: '#059669', label: 'Success' },
    { name: 'warning', val: '#F59E0B', label: 'Warning' },
    { name: 'error', val: '#BA1A1A', label: 'Error' },
  ]},
];

const TYPE_SCALE = [
  { name: 'Display/Large', size: 48, lh: 56, weight: 700 },
  { name: 'Heading/XL', size: 36, lh: 44, weight: 700 },
  { name: 'Heading/Large', size: 28, lh: 36, weight: 700 },
  { name: 'Heading/Medium', size: 22, lh: 28, weight: 700 },
  { name: 'Heading/Small', size: 18, lh: 24, weight: 600 },
  { name: 'Body/Large', size: 18, lh: 28, weight: 400 },
  { name: 'Body/Medium', size: 14, lh: 20, weight: 400 },
  { name: 'Body/Small', size: 12, lh: 16, weight: 400 },
  { name: 'Label/Large', size: 14, lh: 20, weight: 600 },
  { name: 'Label/Medium', size: 12, lh: 16, weight: 600 },
  { name: 'Label/Small', size: 10, lh: 14, weight: 700 },
];

const SPACING_TOKENS = [
  { token: 'space/1', px: 4 }, { token: 'space/2', px: 8 }, { token: 'space/3', px: 12 },
  { token: 'space/4', px: 16 }, { token: 'space/5', px: 20 }, { token: 'space/6', px: 24 },
  { token: 'space/8', px: 32 }, { token: 'space/10', px: 40 }, { token: 'space/12', px: 48 },
  { token: 'space/16', px: 64 },
];

const RADIUS_TOKENS = [
  { token: 'radius/sm', px: 6, usage: 'Badge, small chip' },
  { token: 'radius/md', px: 12, usage: 'Button, Input, Tag' },
  { token: 'radius/lg', px: 16, usage: 'Card, Sidebar panel' },
  { token: 'radius/xl', px: 24, usage: 'Modal, Hero section' },
  { token: 'radius/full', px: 9999, usage: 'Avatar, Pill, Toggle' },
];

const SHADOW_TOKENS = [
  { token: 'shadow/sm', css: '0 1px 2px rgba(0,0,0,0.05)', usage: 'Cards, subtle lift' },
  { token: 'shadow/md', css: '0 4px 6px rgba(0,0,0,0.10)', usage: 'Dropdowns, popovers' },
  { token: 'shadow/lg', css: '0 20px 25px rgba(0,0,0,0.10)', usage: 'Modals, dialogs' },
];

const ICON_LIST = [
  'home', 'search', 'add_box', 'cached', 'auto_awesome', 'chat', 'admin_panel_settings',
  'account_balance_wallet', 'person', 'sync_alt', 'redeem', 'location_on', 'calendar_today',
  'upload', 'edit', 'delete', 'autorenew', 'flag', 'warning', 'check_circle', 'close',
  'arrow_back', 'star', 'local_shipping', 'inventory', 'payments', 'lock', 'qr_code_2',
];

const STATUS_LIST = [
  { status: 'pending', label: 'Chờ duyệt', bg: '#FFF7ED', color: '#F59E0B' },
  { status: 'approved', label: 'Đã duyệt', bg: '#ECFDF5', color: '#059669' },
  { status: 'rejected', label: 'Từ chối', bg: '#FEF2F2', color: '#BA1A1A' },
  { status: 'expired', label: 'Hết hạn', bg: '#FFF7ED', color: '#F59E0B' },
  { status: 'removed', label: 'Đã gỡ', bg: '#F8F9FF', color: '#BCC9C6' },
  { status: 'negotiating', label: 'Đang TL', bg: '#FFDBCA', color: '#9D4300' },
  { status: 'waiting_schedule', label: 'Chờ chốt lịch', bg: '#FFF7ED', color: '#F59E0B' },
  { status: 'schedule_confirmed', label: 'Đã chốt lịch', bg: '#EFF4FF', color: '#00685F' },
  { status: 'fee_held', label: 'Đã giữ phí', bg: '#FFDBCA', color: '#9D4300' },
  { status: 'waiting_handover', label: 'Chờ giao nhận', bg: '#FFF7ED', color: '#F59E0B' },
  { status: 'confirming', label: 'Đang xác nhận', bg: '#EFF4FF', color: '#6D7A77' },
  { status: 'completed', label: 'Hoàn tất', bg: '#ECFDF5', color: '#059669' },
  { status: 'disputed', label: 'Tranh chấp', bg: '#FEF2F2', color: '#BA1A1A' },
  { status: 'cancelled', label: 'Đã hủy', bg: '#F8F9FF', color: '#BCC9C6' },
  { status: 'active', label: 'Hoạt động', bg: '#ECFDF5', color: '#059669' },
  { status: 'suspended', label: 'Tạm khóa', bg: '#FFF7ED', color: '#F59E0B' },
  { status: 'locked', label: 'Đã khóa', bg: '#FEF2F2', color: '#BA1A1A' },
];

const SCREEN_INVENTORY = [
  { name: 'Trang chủ', route: '/', role: 'Public', layout: 'AppShell', components: ['Hero', 'Search', 'CategoryGrid', 'ProductGrid', 'CommunitySection'], states: ['Logged out', 'Logged in'] },
  { name: 'Tìm đồ', route: '/browse', role: 'Public', layout: 'AppShell + SidebarLayout', components: ['FilterSidebar', 'ProductGrid', 'SearchField'], states: ['No filter', 'Filtered', 'Empty results'] },
  { name: 'Chi tiết món', route: '/product/:id', role: 'Public', layout: 'AppShell + TwoColumn', components: ['ProductImage', 'ProductDetail', 'OwnerCard', 'ActionModal'], states: ['Guest view', 'User view', 'Own item'] },
  { name: 'Đăng đồ', route: '/post', role: 'User', layout: 'AppShell + FormLayout', components: ['FormFields', 'ImageUpload', 'TypeToggle'], states: ['Empty', 'Filled', 'Submitted'] },
  { name: 'Hoạt động', route: '/activities', role: 'User', layout: 'AppShell + Tabs', components: ['ListingRow', 'TransactionRow', 'EditForm', 'ConfirmModal'], states: ['Posted tab', 'Requests tab'] },
  { name: 'Trợ lý AI', route: '/ai', role: 'Public/User', layout: 'AppShell', components: ['AIInput', 'AIIntentCard', 'AIMatchCard', 'AIExchangeComparison'], states: ['Find mode', 'Have mode', 'Results', 'Match confirmed'] },
  { name: 'Tin nhắn', route: '/messages', role: 'User', layout: 'AppShell + ChatLayout', components: ['ConversationList', 'ChatPanel', 'TransactionContext', 'HandoverCard', 'CreditHoldCard'], states: ['Negotiating', 'Schedule proposed', 'Fee held', 'Handover', 'Completed'] },
  { name: 'Hồ sơ', route: '/profile', role: 'User', layout: 'AppShell + SidebarLayout', components: ['ProfileSidebar', 'InfoForm', 'ReputationTab', 'CreditHistoryTab'], states: ['Info tab', 'Reputation tab', 'Credit tab'] },
  { name: 'Đăng nhập', route: '/login', role: 'Guest', layout: 'AppShell + FormLayout', components: ['LoginForm', 'DemoButtons'], states: ['Empty', 'Error', 'Loading'] },
  { name: 'Đăng ký', route: '/register', role: 'Guest', layout: 'AppShell + FormLayout', components: ['RegisterForm', 'OTPInput', 'StepIndicator'], states: ['Step 1 form', 'Step 2 email OTP', 'Step 3 phone OTP'] },
  { name: 'Admin', route: '/admin', role: 'Admin', layout: 'AppShell + AdminLayout', components: ['AdminSidebar', 'AdminContent', 'DataTable', 'AdminModal'], states: ['7 sections × sub-sections'] },
];

const ROUTE_MAP = {
  public: [
    { route: '/', name: 'Trang chủ', component: 'Home', layout: 'AppShell', components: 'Hero, Search, CategoryGrid, ProductGrid' },
    { route: '/browse', name: 'Tìm đồ', component: 'Browse', layout: 'AppShell + SidebarLayout', components: 'FilterSidebar, ProductGrid' },
    { route: '/product/:id', name: 'Chi tiết món', component: 'ProductDetail', layout: 'AppShell + TwoColumn', components: 'ProductImage, ProductDetail, OwnerCard' },
    { route: '/ai', name: 'Trợ lý AI', component: 'AI', layout: 'AppShell', components: 'AIInput, AIIntentCard, AIMatchCard' },
  ],
  guest: [
    { route: '/login', name: 'Đăng nhập', component: 'Login', layout: 'AppShell + FormLayout', components: 'LoginForm, DemoButtons' },
    { route: '/register', name: 'Đăng ký', component: 'Register', layout: 'AppShell + FormLayout', components: 'RegisterForm, OTPInput, StepIndicator' },
  ],
  auth: [
    { route: '/post', name: 'Đăng đồ', component: 'Post', layout: 'AppShell + FormLayout', components: 'TypeToggle, FormFields, ImageUpload' },
    { route: '/activities', name: 'Hoạt động', component: 'Activities', layout: 'AppShell + Tabs', components: 'ListingRow, TransactionRow, EditForm' },
    { route: '/messages', name: 'Tin nhắn', component: 'Messages', layout: 'AppShell + ChatLayout', components: 'ConversationList, ChatPanel, HandoverCard' },
    { route: '/profile', name: 'Hồ sơ', component: 'Profile', layout: 'AppShell + SidebarLayout', components: 'ProfileSidebar, InfoForm, CreditHistory' },
  ],
  admin: [
    { route: '/admin', name: 'Dashboard', component: 'Admin → Tổng quan', layout: 'AppShell + AdminLayout', components: 'StatCards, ActivityFeed' },
    { route: '/admin/moderation', name: 'Duyệt bài', component: 'Admin → Nội dung', layout: 'AppShell + AdminLayout', components: 'AdminTable, ModerationChecklist' },
    { route: '/admin/expired-posts', name: 'Bài hết hạn', component: 'Admin → Nội dung', layout: 'AppShell + AdminLayout', components: 'AdminTable, BulkActions' },
    { route: '/admin/categories', name: 'Danh mục', component: 'Admin → Cấu hình', layout: 'AppShell + AdminLayout', components: 'CategoryTable, InlineEdit' },
    { route: '/admin/keywords', name: 'Từ khóa cấm', component: 'Admin → Cấu hình', layout: 'AppShell + AdminLayout', components: 'KeywordList, AddKeywordForm' },
    { route: '/admin/districts', name: 'Quận/huyện', component: 'Admin → Cấu hình', layout: 'AppShell + AdminLayout', components: 'DistrictTable, InlineEdit' },
    { route: '/admin/users', name: 'Danh sách người dùng', component: 'Admin → Người dùng', layout: 'AppShell + AdminLayout', components: 'AdminTable, AdminFilterBar, UserModal' },
    { route: '/admin/users/:userId', name: 'Chi tiết người dùng', component: 'Admin → Người dùng', layout: 'AppShell + AdminLayout', components: 'UserDetail 5-tab panel, CreditHistory, TxList' },
    { route: '/admin/reputation', name: 'Uy tín & hạng', component: 'Admin → Người dùng', layout: 'AppShell + AdminLayout', components: 'ReputationTable, RankBadge, StarRating' },
    { route: '/admin/locked-users', name: 'Tài khoản bị khóa', component: 'Admin → Người dùng', layout: 'AppShell + AdminLayout', components: 'AdminTable, UnlockModal' },
    { route: '/admin/transactions', name: 'Giao dịch', component: 'Admin → Giao dịch', layout: 'AppShell + AdminLayout', components: 'AdminTable, AdminFilterBar' },
    { route: '/admin/transactions/:transactionId', name: 'Chi tiết giao dịch', component: 'Admin → Giao dịch', layout: 'AppShell + AdminLayout', components: 'TxDetail, HandoverCard, EvidencePreview' },
    { route: '/admin/disputes', name: 'Tranh chấp', component: 'Admin → Giao dịch', layout: 'AppShell + AdminLayout', components: 'DisputeTable, DisputeModal, ResolveForm' },
    { route: '/admin/alerts', name: 'Cảnh báo', component: 'Admin → Giao dịch', layout: 'AppShell + AdminLayout', components: 'AlertTable, SuspiciousFlag' },
    { route: '/admin/finance', name: 'Tổng quan tài chính', component: 'Admin → Tài chính', layout: 'AppShell + AdminLayout', components: 'FinanceStatCards, RevenueTable' },
    { route: '/admin/finance/users/:userId', name: 'Credit người dùng', component: 'Admin → Tài chính', layout: 'AppShell + AdminLayout', components: 'CreditSummary, CreditHistoryTable, AdjustModal' },
    { route: '/admin/settings/fees', name: 'Phí giao dịch', component: 'Admin → Cấu hình', layout: 'AppShell + AdminLayout', components: 'FeeConfigForm, SaveConfirm' },
    { route: '/admin/settings/ranks', name: 'Cấu hình hạng', component: 'Admin → Cấu hình', layout: 'AppShell + AdminLayout', components: 'RankConfigTable, ThresholdEdit' },
    { route: '/admin/audit-logs', name: 'Nhật ký hệ thống', component: 'Admin → Hệ thống', layout: 'AppShell + AdminLayout', components: 'AuditLogTable, FilterBar, ExportButton' },
  ],
};

const STATE_INVENTORY = [
  { group: 'auth', fields: ['currentUser: User | null', 'isLoggedIn: boolean', 'role: guest | user | admin'] },
  { group: 'user', fields: ['id', 'name', 'email', 'phone', 'district', 'credit', 'holdCredit', 'points', 'stars', 'rank', 'avatarInitials'] },
  { group: 'items', fields: ['items: Item[]', 'filteredItems: Item[]', 'selectedItem: Item | null', 'myItems: Item[]'] },
  { group: 'search', fields: ['query: string', 'filters: { types, categories, conditions, district }', 'results: Item[]'] },
  { group: 'activities', fields: ['postedItems: Item[]', 'requests: Transaction[]', 'listingStatuses: Record<id, status>'] },
  { group: 'ai', fields: ['mode: find | have', 'inputText: string', 'parsedIntent: object', 'results: Item[]', 'myItemAnalysis: object', 'matchPairs: Pair[]'] },
  { group: 'conversations', fields: ['conversations: Conversation[]', 'selectedConvId: string', 'messages: Record<convId, Message[]>'] },
  { group: 'transactions', fields: ['tx: Transaction | null', 'txFlow: TxFlow', 'handoverData: HandoverData | null', 'creditHeld: boolean', 'senderDone: boolean', 'receiverDone: boolean'] },
  { group: 'wallet', fields: ['totalCredit: number', 'availableCredit: number', 'holdCredit: number', 'topupStep: wallet | topup | qr | waiting | confirming | success | failed'] },
  { group: 'admin', fields: ['selectedSection: string', 'selectedSubSection: string', 'listingStatuses: Record<id, status>', 'userStatuses: Record<id, status>', 'feeConfig: FeeConfig'] },
];

export default function DesignSystem() {
  const [activeSection, setActiveSection] = useState('foundations');

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 120px)', background: '#F8F9FF' }}>
      {/* Sticky sidebar nav */}
      <div style={{ width: 220, flexShrink: 0, position: 'sticky', top: 60, height: 'calc(100vh - 60px)', overflowY: 'auto', background: '#fff', borderRight: '1px solid #E5EEFF', padding: '16px 10px' }}>
        <div style={{ fontWeight: 700, fontSize: 11, color: '#9D4300', padding: '0 10px', marginBottom: 12, letterSpacing: '0.08em' }}>SHARELOOP DESIGN SYSTEM</div>
        {NAV.map(n => (
          <button key={n.id} onClick={() => setActiveSection(n.id)} style={{
            width: '100%', padding: '7px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
            fontFamily: 'inherit', fontSize: 12, textAlign: 'left',
            background: activeSection === n.id ? '#EFF4FF' : 'transparent',
            color: activeSection === n.id ? '#00685F' : '#3D4947',
            fontWeight: activeSection === n.id ? 600 : 400,
          }}>{n.label}</button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '32px 40px', minWidth: 0, maxWidth: 1100 }}>

        {activeSection === 'foundations' && (
          <Section title="00 Foundations" subtitle="Core principles of the SHARELOOP Design System">
            <DSCard title="Design System Purpose">
              <p style={bodyText}>This page is the <strong>single source of truth</strong> for all SHARELOOP UI. Every screen, component and token references this system. Use it to build consistently without redesigning.</p>
            </DSCard>
            <Grid cols={3}>
              {[
                { icon: 'palette', title: 'Token-first', desc: 'Colors, spacing and typography defined as tokens — never raw values in components.' },
                { icon: 'inventory_2', title: 'Component-driven', desc: 'Reusable components for every repeating UI pattern. Build once, use everywhere.' },
                { icon: 'person', title: 'Role-aware', desc: 'Three roles: Guest · User · Admin. Each has distinct navigation and access rules.' },
              ].map(p => (
                <div key={p.title} style={{ background: '#EFF4FF', borderRadius: 16, padding: 20 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 28, color: '#00685F', display: 'block', marginBottom: 8 }}>{p.icon}</span>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#0B1C30', marginBottom: 6 }}>{p.title}</div>
                  <div style={{ fontSize: 12, color: '#6D7A77', lineHeight: '18px' }}>{p.desc}</div>
                </div>
              ))}
            </Grid>
          </Section>
        )}

        {activeSection === 'colors' && (
          <Section title="01 Colors" subtitle="Semantic color tokens — use names, not raw hex values">
            {COLOR_TOKENS.map(grp => (
              <DSCard key={grp.group} title={grp.group}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {grp.tokens.map(t => (
                    <div key={t.name} style={{ width: 140 }}>
                      <div style={{ height: 56, borderRadius: 10, background: t.val, border: ('border' in t && t.border) ? '1px solid #E5EEFF' : undefined, marginBottom: 6, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }} />
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#0B1C30' }}>{t.label}</div>
                      <div style={{ fontSize: 10, color: '#6D7A77', fontFamily: 'monospace' }}>{t.val}</div>
                      <div style={{ fontSize: 9, color: '#BCC9C6', fontFamily: 'monospace' }}>color/{t.name}</div>
                    </div>
                  ))}
                </div>
              </DSCard>
            ))}
            <DSCard title="Usage Examples">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  ['Primary button', '#00685F', '#FFFFFF', 'Background: primary · Text: on-primary'],
                  ['Secondary badge', '#FFDBCA', '#9D4300', 'Background: secondary-fixed · Text: secondary'],
                  ['Error state', '#FEF2F2', '#BA1A1A', 'Background: error/10 · Text: error'],
                  ['Success state', '#ECFDF5', '#059669', 'Background: success/10 · Text: success'],
                  ['Surface card', '#FFFFFF', '#0B1C30', 'Background: surface · Text: text-primary'],
                ].map(([name, bg, color, note]) => (
                  <div key={String(name)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, background: bg as string, border: '1px solid #E5EEFF' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: color as string, flex: 1 }}>{name}</span>
                    <span style={{ fontSize: 10, color: '#6D7A77' }}>{note}</span>
                  </div>
                ))}
              </div>
            </DSCard>
          </Section>
        )}

        {activeSection === 'typography' && (
          <Section title="02 Typography" subtitle="Be Vietnam Pro — all weights">
            <DSCard title="Type Scale">
              {TYPE_SCALE.map(t => (
                <div key={t.name} style={{ display: 'flex', alignItems: 'baseline', gap: 20, padding: '10px 0', borderBottom: '1px solid #F0F4FF' }}>
                  <div style={{ width: 130, flexShrink: 0 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#6D7A77', fontFamily: 'monospace' }}>{t.name}</div>
                    <div style={{ fontSize: 9, color: '#BCC9C6' }}>{t.size}/{t.lh} · w{t.weight}</div>
                  </div>
                  <div style={{ fontSize: t.size > 36 ? 28 : t.size, fontWeight: t.weight, lineHeight: `${t.lh}px`, color: '#0B1C30' }}>
                    {t.name.includes('Display') ? 'SHARELOOP' : t.name.includes('Heading') ? 'Trao đổi đồ cũ' : 'Kết nối cộng đồng qua món đồ'}
                  </div>
                </div>
              ))}
            </DSCard>
            <DSCard title="Usage Examples">
              <Grid cols={2}>
                {[
                  { label: 'Page Title', ex: 'Khám phá tất cả món đồ', size: 26, weight: 700 },
                  { label: 'Section Title', ex: 'Món đồ nổi bật', size: 18, weight: 700 },
                  { label: 'Card Title', ex: 'Tai nghe Sony WH-1000XM4', size: 14, weight: 600 },
                  { label: 'Body', ex: 'Còn mới 95%, mua về ít dùng. Hộp đầy đủ phụ kiện.', size: 13, weight: 400 },
                  { label: 'Form Label', ex: 'Tên món đồ *', size: 12, weight: 600 },
                  { label: 'Helper Text', ex: 'Tối đa 100 ký tự', size: 11, weight: 400 },
                  { label: 'Badge', ex: 'CHO TẶNG', size: 10, weight: 700 },
                  { label: 'Table Text', ex: 'Nguyễn Hoàng Minh', size: 13, weight: 500 },
                ].map(ex => (
                  <div key={ex.label} style={{ padding: 14, background: '#F8F9FF', borderRadius: 10 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#BCC9C6', marginBottom: 6 }}>{ex.label}</div>
                    <div style={{ fontSize: ex.size, fontWeight: ex.weight, color: '#0B1C30', lineHeight: '1.4' }}>{ex.ex}</div>
                  </div>
                ))}
              </Grid>
            </DSCard>
          </Section>
        )}

        {activeSection === 'spacing' && (
          <Section title="03 Spacing" subtitle="8px base grid — use tokens, not arbitrary values">
            <DSCard title="Spacing Scale">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {SPACING_TOKENS.map(s => (
                  <div key={s.token} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 110, fontSize: 11, fontFamily: 'monospace', color: '#6D7A77' }}>{s.token}</div>
                    <div style={{ width: 40, fontSize: 11, fontWeight: 600, color: '#0B1C30' }}>{s.px}px</div>
                    <div style={{ height: 20, background: '#00685F', opacity: 0.7, borderRadius: 3 , width: s.px }} />
                  </div>
                ))}
              </div>
            </DSCard>
          </Section>
        )}

        {activeSection === 'radius' && (
          <Section title="04 Radius & Shadows" subtitle="Consistent corner and elevation system">
            <DSCard title="Border Radius">
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                {RADIUS_TOKENS.map(r => (
                  <div key={r.token} style={{ textAlign: 'center' }}>
                    <div style={{ width: 72, height: 72, background: '#EFF4FF', border: '2px solid #00685F', borderRadius: Math.min(r.px, 36), margin: '0 auto 8px' }} />
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#0B1C30', fontFamily: 'monospace' }}>{r.token}</div>
                    <div style={{ fontSize: 10, color: '#6D7A77' }}>{r.px === 9999 ? '9999' : r.px}px</div>
                    <div style={{ fontSize: 9, color: '#BCC9C6', maxWidth: 90, margin: '0 auto' }}>{r.usage}</div>
                  </div>
                ))}
              </div>
            </DSCard>
            <DSCard title="Shadows">
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                {SHADOW_TOKENS.map(s => (
                  <div key={s.token} style={{ flex: 1, minWidth: 160 }}>
                    <div style={{ height: 64, background: '#fff', borderRadius: 12, boxShadow: s.css, marginBottom: 10 }} />
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#0B1C30', fontFamily: 'monospace' }}>{s.token}</div>
                    <div style={{ fontSize: 10, color: '#6D7A77', fontFamily: 'monospace', marginBottom: 4 }}>{s.css}</div>
                    <div style={{ fontSize: 9, color: '#BCC9C6' }}>{s.usage}</div>
                  </div>
                ))}
              </div>
            </DSCard>
          </Section>
        )}

        {activeSection === 'icons' && (
          <Section title="05 Icons" subtitle="Material Symbols Outlined — 4 standard sizes">
            <DSCard title="Size Standards">
              <div style={{ display: 'flex', gap: 32, alignItems: 'flex-end' }}>
                {[16, 20, 24, 32].map(sz => (
                  <div key={sz} style={{ textAlign: 'center' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: sz, color: '#00685F', display: 'block', marginBottom: 6 }}>home</span>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#0B1C30' }}>{sz}px</div>
                    <div style={{ fontSize: 9, color: '#6D7A77' }}>{sz === 16 ? 'Inline' : sz === 20 ? 'Button' : sz === 24 ? 'Nav' : 'Feature'}</div>
                  </div>
                ))}
              </div>
            </DSCard>
            <DSCard title="Icon Library">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                {ICON_LIST.map(icon => (
                  <div key={icon} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, width: 64, padding: '10px 4px', background: '#F8F9FF', borderRadius: 10 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 22, color: '#3D4947' }}>{icon}</span>
                    <span style={{ fontSize: 8, color: '#6D7A77', textAlign: 'center', lineHeight: '12px', fontFamily: 'monospace' }}>{icon}</span>
                  </div>
                ))}
              </div>
            </DSCard>
          </Section>
        )}

        {activeSection === 'buttons' && (
          <Section title="06 Buttons" subtitle="5 variants · 3 sizes · 6 states">
            <DSCard title="Variants">
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <button style={btnVariant('primary')}>Primary</button>
                <button style={btnVariant('secondary')}>Secondary</button>
                <button style={btnVariant('outline')}>Outline</button>
                <button style={btnVariant('ghost')}>Ghost</button>
                <button style={btnVariant('danger')}>Danger</button>
              </div>
            </DSCard>
            <DSCard title="Sizes">
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <button style={{ ...btnVariant('primary'), padding: '5px 12px', fontSize: 11, borderRadius: 8 }}>Small</button>
                <button style={{ ...btnVariant('primary'), padding: '9px 18px', fontSize: 13 }}>Medium</button>
                <button style={{ ...btnVariant('primary'), padding: '13px 28px', fontSize: 15 }}>Large</button>
              </div>
            </DSCard>
            <DSCard title="States">
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <button style={btnVariant('primary')}>Default</button>
                <button style={{ ...btnVariant('primary'), opacity: 0.8, transform: 'scale(0.98)' }}>Pressed</button>
                <button style={{ ...btnVariant('primary'), opacity: 0.4, cursor: 'not-allowed' }} disabled>Disabled</button>
                <button style={{ ...btnVariant('primary'), display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 14, animation: 'spin 1s linear infinite' }}>sync</span>
                  Loading
                </button>
              </div>
            </DSCard>
            <DSCard title="With Icons">
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button style={{ ...btnVariant('primary'), display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>Đăng đồ
                </button>
                <button style={{ ...btnVariant('outline'), display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>search</span>Tìm đồ
                </button>
                <button style={{ ...btnVariant('danger'), display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>Gỡ bài
                </button>
              </div>
            </DSCard>
          </Section>
        )}

        {activeSection === 'forms' && (
          <Section title="07 Forms" subtitle="All input components with states">
            <DSCard title="TextField States">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 400 }}>
                {[
                  { label: 'Default', value: '', placeholder: 'Tên món đồ...', border: '#BCC9C6' },
                  { label: 'Focus', value: '', placeholder: 'Đang nhập...', border: '#00685F' },
                  { label: 'Filled', value: 'Tai nghe Sony WH-1000XM4', placeholder: '', border: '#BCC9C6' },
                  { label: 'Error', value: 'abc', placeholder: '', border: '#BA1A1A', error: 'Tên phải có ít nhất 5 ký tự' },
                  { label: 'Disabled', value: '', placeholder: 'Không thể chỉnh sửa', border: '#E5EEFF' },
                ].map(f => (
                  <div key={f.label}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6D7A77', marginBottom: 4 }}>{f.label}</label>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#0B1C30', marginBottom: 4 }}>Tên món đồ *</label>
                    <input value={f.value} placeholder={f.placeholder} readOnly style={{ width: '100%', padding: '9px 12px', border: `1.5px solid ${f.border}`, borderRadius: 10, fontSize: 13, fontFamily: 'inherit', outline: 'none', background: f.label === 'Disabled' ? '#F8F9FF' : '#fff', boxSizing: 'border-box' }} />
                    {f.error && <div style={{ fontSize: 11, color: '#BA1A1A', marginTop: 3 }}>{f.error}</div>}
                  </div>
                ))}
              </div>
            </DSCard>
            <Grid cols={2}>
              <DSCard title="Select">
                <select style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #BCC9C6', borderRadius: 10, fontSize: 13, fontFamily: 'inherit', outline: 'none' }}>
                  <option>Chọn danh mục...</option>
                  <option>Nội thất</option><option>Đồ điện tử</option>
                </select>
              </DSCard>
              <DSCard title="Checkbox & Radio">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {['Cho tặng miễn phí', 'Trao đổi đồ'].map((l, i) => (
                    <label key={l} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#3D4947', cursor: 'pointer' }}>
                      <input type="checkbox" defaultChecked={i === 0} style={{ accentColor: '#00685F' }} />{l}
                    </label>
                  ))}
                  <div style={{ marginTop: 8 }} />
                  {['Gặp trực tiếp', 'Giao hàng'].map((l, i) => (
                    <label key={l} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#3D4947', cursor: 'pointer' }}>
                      <input type="radio" name="method" defaultChecked={i === 0} style={{ accentColor: '#00685F' }} />{l}
                    </label>
                  ))}
                </div>
              </DSCard>
              <DSCard title="OTP Input">
                <div style={{ display: 'flex', gap: 8 }}>
                  {['3', '7', '•', '•', '•', '•'].map((c, i) => (
                    <div key={i} style={{ width: 40, height: 48, border: `2px solid ${i < 2 ? '#00685F' : '#BCC9C6'}`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: '#0B1C30', background: i < 2 ? '#EFF4FF' : '#fff' }}>{c}</div>
                  ))}
                </div>
              </DSCard>
              <DSCard title="Search Field">
                <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #BCC9C6', borderRadius: 12, background: '#fff', overflow: 'hidden' }}>
                  <span className="material-symbols-outlined" style={{ padding: '0 12px', color: '#6D7A77', fontSize: 18 }}>search</span>
                  <input placeholder="Tìm món đồ..." style={{ flex: 1, border: 'none', outline: 'none', fontSize: 13, padding: '9px 0', fontFamily: 'inherit' }} />
                </div>
              </DSCard>
            </Grid>
          </Section>
        )}

        {activeSection === 'badges' && (
          <Section title="08 Badges & Status" subtitle="Consistent semantic status system">
            <DSCard title="All Status Badges">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {STATUS_LIST.map(s => (
                  <span key={s.status} style={{ padding: '4px 10px', borderRadius: 6, background: s.bg, color: s.color, fontSize: 11, fontWeight: 600 }}>{s.label}</span>
                ))}
              </div>
            </DSCard>
            <DSCard title="Type Badges">
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ padding: '4px 12px', borderRadius: 6, background: '#EFF4FF', color: '#00685F', fontSize: 11, fontWeight: 700 }}>CHO TẶNG</span>
                <span style={{ padding: '4px 12px', borderRadius: 6, background: '#FFDBCA', color: '#9D4300', fontSize: 11, fontWeight: 700 }}>TRAO ĐỔI</span>
              </div>
            </DSCard>
            <DSCard title="Condition Badges">
              <div style={{ display: 'flex', gap: 8 }}>
                {[['Mới', '#ECFDF5', '#059669'], ['Dùng tốt', '#EFF4FF', '#00685F'], ['Đã qua dùng', '#F8F9FF', '#6D7A77']].map(([l, bg, c]) => (
                  <span key={String(l)} style={{ padding: '3px 9px', borderRadius: 5, background: bg as string, color: c as string, fontSize: 10, fontWeight: 600 }}>{l}</span>
                ))}
              </div>
            </DSCard>
            <DSCard title="Rank Badges">
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {[['Thành viên mới', '#BCC9C6'], ['Thành viên tích cực', '#F59E0B'], ['Thành viên uy tín', '#00685F']].map(([l, c]) => (
                  <span key={String(l)} style={{ padding: '4px 12px', borderRadius: 9999, background: (c as string) + '18', color: c as string, fontSize: 11, fontWeight: 700 }}>{l}</span>
                ))}
              </div>
            </DSCard>
          </Section>
        )}

        {activeSection === 'cards' && (
          <Section title="09 Cards" subtitle="ProductCard and sub-components">
            <DSCard title="ProductCard / Grid">
              <div style={{ display: 'flex', gap: 14 }}>
                {[
                  { img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=150&fit=crop', title: 'Tai nghe Sony WH-1000XM4', type: 'trade', condition: 'Dùng tốt', district: 'Quận 3', owner: 'Thanh Nga', stars: 4.2 },
                  { img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&h=150&fit=crop', title: 'Sofa da nâu 3 chỗ', type: 'gift', condition: 'Mới', district: 'Quận 1', owner: 'Văn Hùng', stars: 5.0 },
                ].map(p => (
                  <div key={p.title} style={{ width: 200, background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #E5EEFF' }}>
                    <div style={{ position: 'relative' }}>
                      <img src={p.img} alt="" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }} />
                      <span style={{ position: 'absolute', top: 8, left: 8, padding: '2px 8px', borderRadius: 5, background: p.type === 'gift' ? '#EFF4FF' : '#FFDBCA', color: p.type === 'gift' ? '#00685F' : '#9D4300', fontSize: 9, fontWeight: 700 }}>{p.type === 'gift' ? 'CHO TẶNG' : 'TRAO ĐỔI'}</span>
                    </div>
                    <div style={{ padding: '10px 12px' }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: '#0B1C30', marginBottom: 4 }}>{p.title}</div>
                      <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
                        <span style={{ padding: '1px 6px', borderRadius: 4, background: '#ECFDF5', color: '#059669', fontSize: 9, fontWeight: 600 }}>{p.condition}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, color: '#6D7A77' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><span className="material-symbols-outlined" style={{ fontSize: 11 }}>location_on</span>{p.district}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}><span className="material-symbols-outlined icon-filled" style={{ fontSize: 11, color: '#F59E0B' }}>star</span>{p.stars}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </DSCard>
            <DSCard title="ProductCard / Horizontal">
              <div style={{ display: 'flex', gap: 12, padding: '12px', background: '#fff', borderRadius: 14, border: '1px solid #E5EEFF', maxWidth: 480 }}>
                <img src="https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=80&h=60&fit=crop" alt="" style={{ width: 80, height: 60, borderRadius: 8, objectFit: 'cover' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#0B1C30', marginBottom: 2 }}>Máy ảnh Fujifilm X-T30</div>
                  <div style={{ fontSize: 11, color: '#6D7A77', marginBottom: 4 }}>Bình Thạnh · Trao đổi</div>
                  <span style={{ padding: '2px 7px', borderRadius: 5, background: '#EFF4FF', color: '#059669', fontSize: 9, fontWeight: 600 }}>Dùng tốt</span>
                </div>
              </div>
            </DSCard>
          </Section>
        )}

        {activeSection === 'navigation' && (
          <Section title="10 Navigation" subtitle="Header variants, footer, admin sidebar">
            <DSCard title="Header / Guest">
              <div style={{ display: 'flex', alignItems: 'center', height: 52, background: '#fff', border: '1px solid #E5EEFF', borderRadius: 12, padding: '0 20px', gap: 24 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#00685F' }}>SHARELOOP</div>
                <div style={{ display: 'flex', gap: 16, flex: 1 }}>
                  {['Trang chủ', 'Tìm đồ', 'Trợ lý AI'].map(n => <span key={n} style={{ fontSize: 13, color: '#3D4947', cursor: 'pointer' }}>{n}</span>)}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={{ padding: '6px 14px', borderRadius: 8, border: '1.5px solid #BCC9C6', background: '#fff', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', color: '#3D4947' }}>Đăng nhập</button>
                  <button style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: '#00685F', color: '#fff', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', fontWeight: 600 }}>Đăng ký</button>
                </div>
              </div>
            </DSCard>
            <DSCard title="Header / User">
              <div style={{ display: 'flex', alignItems: 'center', height: 52, background: '#fff', border: '1px solid #E5EEFF', borderRadius: 12, padding: '0 20px', gap: 20 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#00685F' }}>SHARELOOP</div>
                <div style={{ display: 'flex', gap: 14, flex: 1 }}>
                  {['Trang chủ', 'Tìm đồ', 'Hoạt động', 'Trợ lý AI', 'Tin nhắn'].map(n => <span key={n} style={{ fontSize: 12, color: '#3D4947', cursor: 'pointer', whiteSpace: 'nowrap' }}>{n}</span>)}
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 9999, background: '#EFF4FF', cursor: 'pointer' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#00685F' }}>account_balance_wallet</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#00685F' }}>195 Credit</span>
                  </div>
                  <button style={{ padding: '6px 12px', borderRadius: 8, border: 'none', background: '#00685F', color: '#fff', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 13 }}>add</span>Đăng đồ
                  </button>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#00685F', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 11, cursor: 'pointer' }}>NM</div>
                </div>
              </div>
            </DSCard>
            <DSCard title="Admin Sidebar (mini)">
              <div style={{ width: 180, background: '#fff', borderRadius: 12, border: '1px solid #E5EEFF', padding: 10 }}>
                {[['dashboard', 'Tổng quan'], ['article', 'Nội dung'], ['group', 'Người dùng'], ['swap_horiz', 'Giao dịch'], ['payments', 'Tài chính'], ['settings', 'Cấu hình'], ['history', 'Hệ thống']].map(([icon, label], i) => (
                  <div key={String(label)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, background: i === 0 ? '#FFDBCA' : 'transparent', marginBottom: 2 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 15, color: i === 0 ? '#9D4300' : '#6D7A77' }}>{icon}</span>
                    <span style={{ fontSize: 12, fontWeight: i === 0 ? 700 : 400, color: i === 0 ? '#9D4300' : '#3D4947' }}>{label}</span>
                  </div>
                ))}
              </div>
            </DSCard>
          </Section>
        )}

        {activeSection === 'chat' && (
          <Section title="11 Chat & Transaction" subtitle="Chat bubbles, system messages, transaction components">
            <DSCard title="Message Bubbles">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 400 }}>
                <div style={{ display: 'flex', gap: 7 }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#00685F', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 9, fontWeight: 700, flexShrink: 0 }}>TN</div>
                  <div style={{ padding: '9px 13px', borderRadius: '14px 14px 14px 4px', background: '#fff', border: '1px solid #E5EEFF', fontSize: 13, color: '#0B1C30' }}>Bàn học mình muốn tặng cho ai cần.</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <div style={{ padding: '9px 13px', borderRadius: '14px 14px 4px 14px', background: '#00685F', fontSize: 13, color: '#fff' }}>Mình cần lắm! Bàn có thể tháo ra không?</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ display: 'inline-block', padding: '4px 14px', borderRadius: 9999, background: '#F0F4FF', fontSize: 11, color: '#6D7A77', fontWeight: 500 }}>5 Credit đã được giữ.</span>
                </div>
              </div>
            </DSCard>
            <DSCard title="HandoverScheduleCard">
              <div style={{ maxWidth: 280, background: '#fff', border: '1.5px solid #00685F', borderRadius: 16, overflow: 'hidden' }}>
                <div style={{ background: '#00685F', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#fff' }}>calendar_today</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', letterSpacing: '0.05em' }}>ĐỀ XUẤT GIAO NHẬN</span>
                </div>
                <div style={{ padding: '12px 14px' }}>
                  {[['Ngày', '25/09/2026'], ['Thời gian', '18:30'], ['Khu vực', 'Bình Thạnh'], ['Địa điểm', 'Landmark 81'], ['Phương thức', 'Gặp trực tiếp']].map(([k, v]) => (
                    <div key={String(k)} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '3px 0' }}>
                      <span style={{ color: '#6D7A77' }}>{k}</span><span style={{ fontWeight: 600, color: '#0B1C30' }}>{v}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', gap: 7, marginTop: 12 }}>
                    <button style={btnVariant('outline')}>Đề xuất lại</button>
                    <button style={{ ...btnVariant('primary'), flex: 1 }}>Đồng ý</button>
                  </div>
                </div>
              </div>
            </DSCard>
            <DSCard title="TransactionProgress">
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {['Thương lượng', 'Chốt lịch', 'Chờ giao', 'Xác nhận', 'Hoàn tất'].map((step, i, arr) => (
                  <>
                    <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: i <= 2 ? '#00685F' : '#E5EEFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {i < 2 ? <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#fff' }}>check</span> : <span style={{ fontSize: 11, fontWeight: 700, color: i <= 2 ? '#fff' : '#6D7A77' }}>{i + 1}</span>}
                      </div>
                      <span style={{ fontSize: 9, color: i <= 2 ? '#00685F' : '#BCC9C6', fontWeight: 600, textAlign: 'center', maxWidth: 48 }}>{step}</span>
                    </div>
                    {i < arr.length - 1 && <div style={{ flex: 1, height: 2, background: i < 2 ? '#00685F' : '#E5EEFF', marginBottom: 18 }} />}
                  </>
                ))}
              </div>
            </DSCard>
          </Section>
        )}

        {activeSection === 'feedback' && (
          <Section title="12 Feedback" subtitle="Toast, Alert, EmptyState, Loading, Confirm">
            <DSCard title="Toast Variants">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 360 }}>
                {[
                  { type: 'Success', icon: 'check_circle', bg: '#ECFDF5', color: '#059669', msg: 'Bài đăng đã được duyệt.' },
                  { type: 'Error', icon: 'cancel', bg: '#FEF2F2', color: '#BA1A1A', msg: 'Không thể hoàn tất giao dịch.' },
                  { type: 'Warning', icon: 'warning', bg: '#FFF7ED', color: '#F59E0B', msg: 'Credit sắp hết, hãy nạp thêm.' },
                  { type: 'Info', icon: 'info', bg: '#EFF4FF', color: '#00685F', msg: 'Lịch giao nhận đã được đề xuất.' },
                ].map(t => (
                  <div key={t.type} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12, background: t.bg, border: `1px solid ${t.color}30` }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: t.color }}>{t.icon}</span>
                    <span style={{ fontSize: 13, color: '#0B1C30', flex: 1 }}>{t.msg}</span>
                    <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#BCC9C6', cursor: 'pointer' }}>close</span>
                  </div>
                ))}
              </div>
            </DSCard>
            <DSCard title="Empty State">
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#BCC9C6', display: 'block', marginBottom: 12 }}>inventory_2</span>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#3D4947', marginBottom: 6 }}>Chưa có món đồ nào</div>
                <div style={{ fontSize: 13, color: '#6D7A77', marginBottom: 16 }}>Hãy đăng món đồ đầu tiên của bạn!</div>
                <button style={btnVariant('primary')}>Đăng đồ ngay</button>
              </div>
            </DSCard>
          </Section>
        )}

        {activeSection === 'admin' && (
          <Section title="13 Admin Components" subtitle="Reusable admin table system and stat cards">
            <DSCard title="AdminStatCard">
              <div style={{ display: 'flex', gap: 12 }}>
                {[
                  { label: 'Tổng người dùng', value: '1.248', icon: 'group', color: '#00685F' },
                  { label: 'Bài chờ duyệt', value: '18', icon: 'pending', color: '#F59E0B' },
                  { label: 'Giao dịch thành công', value: '742', icon: 'check_circle', color: '#059669' },
                ].map(s => (
                  <div key={s.label} style={{ flex: 1, background: '#fff', borderRadius: 14, padding: '16px 18px', border: '1px solid #E5EEFF' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: s.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 17, color: s.color }}>{s.icon}</span>
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#0B1C30' }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: '#6D7A77' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </DSCard>
            <DSCard title="AdminTable (mini)">
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead><tr style={{ background: '#F8F9FF' }}>
                  {['Người dùng', 'Khu vực', 'Credit', 'Trạng thái', 'Thao tác'].map(h => (
                    <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#6D7A77' }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {[['Văn Hùng', 'Quận 1', '340', 'active'], ['Thanh Nga', 'Quận 3', '55', 'active'], ['Tuấn Anh', 'Tân Bình', '15', 'locked']].map(([name, d, c, st]) => (
                    <tr key={String(name)} style={{ borderTop: '1px solid #F0F4FF' }}>
                      <td style={{ padding: '8px 10px', fontWeight: 600, color: '#0B1C30' }}>{name}</td>
                      <td style={{ padding: '8px 10px', color: '#6D7A77' }}>{d}</td>
                      <td style={{ padding: '8px 10px', fontWeight: 700, color: '#00685F' }}>{c}</td>
                      <td style={{ padding: '8px 10px' }}>
                        <span style={{ padding: '2px 7px', borderRadius: 5, background: st === 'active' ? '#ECFDF5' : '#FEF2F2', color: st === 'active' ? '#059669' : '#BA1A1A', fontSize: 10, fontWeight: 600 }}>{st === 'active' ? 'Hoạt động' : 'Đã khóa'}</span>
                      </td>
                      <td style={{ padding: '8px 10px' }}>
                        <button style={{ padding: '3px 9px', borderRadius: 6, border: 'none', background: '#F8F9FF', color: '#3D4947', cursor: 'pointer', fontSize: 10, fontFamily: 'inherit' }}>Xem</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </DSCard>
          </Section>
        )}

        {activeSection === 'layout' && (
          <Section title="14 Layout" subtitle="AppShell, content containers, layout patterns">
            <DSCard title="AppShell">
              <div style={{ background: '#F8F9FF', borderRadius: 14, padding: 16, border: '1px solid #E5EEFF' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontFamily: 'monospace', fontSize: 12, color: '#3D4947' }}>
                  {['<AppShell>', '  <Header role="user" />', '  <main> {/* page content */} </main>', '  <Footer />', '  {/* overlays: WalletModal, etc. */}', '</AppShell>'].map((l, i) => (
                    <div key={i} style={{ padding: '2px 8px', borderRadius: 4, background: l.includes('<Header') || l.includes('<Footer') ? '#ECFDF5' : l.includes('<main>') ? '#EFF4FF' : 'transparent', color: l.includes('<Header') || l.includes('<Footer') ? '#059669' : l.includes('<main>') ? '#00685F' : '#6D7A77' }}>{l}</div>
                  ))}
                </div>
              </div>
            </DSCard>
            <Grid cols={2}>
              {[
                { name: 'ContentContainer', desc: 'max-width: 1280px · centered · padding: 24px', css: 'maxWidth: 1280, margin: "0 auto", padding: "0 24px"' },
                { name: 'TwoColumnLayout', desc: 'Left: product images/detail. Right: owner card + actions', css: 'display: grid, gridTemplateColumns: "1fr 380px"' },
                { name: 'SidebarLayout', desc: 'Left: 230px filter/nav. Right: main content', css: 'display: flex, gap: 28. Sidebar: width: 230, flexShrink: 0' },
                { name: 'ChatLayout', desc: 'Left: 300px conversation list. Right: chat panel', css: 'display: flex. List: width: 300. Panel: flex: 1' },
                { name: 'AdminLayout', desc: 'Left: 200px sidebar. Right: content area', css: 'display: flex, gap: 20. Sidebar: width: 200, position: sticky' },
                { name: 'FormLayout', desc: 'Single column, max-width: 640px, centered', css: 'maxWidth: 640, margin: "0 auto"' },
              ].map(l => (
                <div key={l.name} style={{ background: '#fff', borderRadius: 14, padding: 16, border: '1px solid #E5EEFF' }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#0B1C30', marginBottom: 4 }}>{l.name}</div>
                  <div style={{ fontSize: 11, color: '#6D7A77', marginBottom: 8 }}>{l.desc}</div>
                  <code style={{ fontSize: 10, color: '#9D4300', background: '#FFF7ED', padding: '4px 8px', borderRadius: 6, display: 'block' }}>{l.css}</code>
                </div>
              ))}
            </Grid>
          </Section>
        )}

        {activeSection === 'screens' && (
          <Section title="15 Screen Patterns" subtitle="Component composition map for each screen">
            {SCREEN_INVENTORY.map(s => (
              <DSCard key={s.name} title={`${s.name} — ${s.route}`}>
                <div style={{ display: 'flex', gap: 20 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <span style={{ padding: '2px 8px', borderRadius: 5, background: s.role === 'Public' ? '#EFF4FF' : s.role === 'Admin' ? '#FFDBCA' : '#ECFDF5', color: s.role === 'Public' ? '#00685F' : s.role === 'Admin' ? '#9D4300' : '#059669', fontSize: 10, fontWeight: 700 }}>{s.role}</span>
                      <span style={{ padding: '2px 8px', borderRadius: 5, background: '#F8F9FF', color: '#6D7A77', fontSize: 10 }}>{s.layout}</span>
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#6D7A77', marginBottom: 4 }}>Components</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {s.components.map(c => <span key={c} style={{ padding: '2px 8px', borderRadius: 5, background: '#EFF4FF', color: '#00685F', fontSize: 10 }}>{c}</span>)}
                    </div>
                  </div>
                  <div style={{ minWidth: 140 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#6D7A77', marginBottom: 4 }}>States</div>
                    {s.states.map(st => <div key={st} style={{ fontSize: 10, color: '#3D4947', padding: '1px 0' }}>· {st}</div>)}
                  </div>
                </div>
              </DSCard>
            ))}
          </Section>
        )}

        {activeSection === 'routes' && (
          <Section title="16 Route Map" subtitle="All routes organized by access level — with layouts and components">
            {(['PUBLIC ROUTES', 'GUEST ROUTES', 'AUTHENTICATED ROUTES', 'ADMIN ROUTES'] as const).map(label => {
              const key = label === 'PUBLIC ROUTES' ? 'public' : label === 'GUEST ROUTES' ? 'guest' : label === 'AUTHENTICATED ROUTES' ? 'auth' : 'admin';
              const routes = ROUTE_MAP[key];
              return (
                <DSCard key={label} title={label}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                    <thead><tr style={{ background: '#F8F9FF' }}>
                      {['Route', 'Screen', 'Layout', 'Key Components'].map(h => (
                        <th key={h} style={{ padding: '6px 10px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#6D7A77', borderBottom: '1px solid #E5EEFF' }}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {routes.map(r => (
                        <tr key={r.route} style={{ borderBottom: '1px solid #F0F4FF' }}>
                          <td style={{ padding: '7px 10px' }}><code style={{ fontSize: 10, color: '#9D4300', background: '#FFF7ED', padding: '2px 5px', borderRadius: 4, fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{r.route}</code></td>
                          <td style={{ padding: '7px 10px', color: '#0B1C30', fontWeight: 600 }}>{r.name}</td>
                          <td style={{ padding: '7px 10px', color: '#6D7A77', fontSize: 10 }}>{r.layout}</td>
                          <td style={{ padding: '7px 10px', color: '#3D4947', fontSize: 10 }}>{r.components}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </DSCard>
              );
            })}
          </Section>
        )}

        {activeSection === 'state' && (
          <Section title="17 State Inventory" subtitle="UI state groups — what each screen needs">
            {STATE_INVENTORY.map(s => (
              <DSCard key={s.group} title={s.group}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {s.fields.map(f => (
                    <code key={f} style={{ fontSize: 11, color: '#00685F', background: '#EFF4FF', padding: '3px 9px', borderRadius: 6, fontFamily: 'monospace' }}>{f}</code>
                  ))}
                </div>
              </DSCard>
            ))}
            <DSCard title="TxFlow State Machine">
              <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#3D4947', lineHeight: '20px', background: '#F8F9FF', padding: 16, borderRadius: 10 }}>
                {`type TxFlow =
  | 'negotiating'       // initial
  | 'schedule_proposed' // handover card sent
  | 'schedule_agreed'   // partner clicked Đồng ý
  | 'fee_held'          // credit locked
  | 'waiting_handover'  // (alias: fee_held)
  | 'sender_done'       // sender confirmed delivery
  | 'receiver_done'     // receiver confirmed receipt
  | 'completed'         // both confirmed → hold → fee`}
              </div>
            </DSCard>
          </Section>
        )}

        {activeSection === 'handoff' && (
          <Section title="18 Developer Handoff" subtitle="Token → code mapping and component specs">
            <DSCard title="CSS / Tailwind Token Mapping">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 11, color: '#6D7A77', marginBottom: 8 }}>COLORS</div>
                  <code style={{ fontSize: 10, fontFamily: 'monospace', color: '#3D4947', display: 'block', lineHeight: '18px', whiteSpace: 'pre', background: '#F8F9FF', padding: 12, borderRadius: 8 }}>{`primary:     #00685F
secondary:   #9D4300
background:  #F8F9FF
surface:     #FFFFFF
textPrimary: #0B1C30
textMuted:   #6D7A77
border:      #BCC9C6
success:     #059669
warning:     #F59E0B
error:       #BA1A1A`}</code>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 11, color: '#6D7A77', marginBottom: 8 }}>RADIUS</div>
                  <code style={{ fontSize: 10, fontFamily: 'monospace', color: '#3D4947', display: 'block', lineHeight: '18px', whiteSpace: 'pre', background: '#F8F9FF', padding: 12, borderRadius: 8 }}>{`sm:   6px
md:   12px
lg:   16px
xl:   24px
full: 9999px`}</code>
                  <div style={{ fontWeight: 700, fontSize: 11, color: '#6D7A77', margin: '12px 0 8px' }}>SHADOWS</div>
                  <code style={{ fontSize: 10, fontFamily: 'monospace', color: '#3D4947', display: 'block', lineHeight: '18px', whiteSpace: 'pre', background: '#F8F9FF', padding: 12, borderRadius: 8 }}>{`sm: 0 1px 2px rgba(0,0,0,.05)
md: 0 4px 6px rgba(0,0,0,.10)
lg: 0 20px 25px rgba(0,0,0,.10)`}</code>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 11, color: '#6D7A77', marginBottom: 8 }}>SPACING</div>
                  <code style={{ fontSize: 10, fontFamily: 'monospace', color: '#3D4947', display: 'block', lineHeight: '18px', whiteSpace: 'pre', background: '#F8F9FF', padding: 12, borderRadius: 8 }}>{`1:  4px
2:  8px
3:  12px
4:  16px
5:  20px
6:  24px
8:  32px
10: 40px
12: 48px
16: 64px`}</code>
                </div>
              </div>
            </DSCard>
            <DSCard title="ProductCard Spec">
              <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#3D4947', lineHeight: '18px', background: '#F8F9FF', padding: 16, borderRadius: 10, whiteSpace: 'pre' }}>{`COMPONENT: ProductCard

Props:
  image: string (URL)       // Unsplash or upload
  title: string             // max 60 chars
  type: 'gift' | 'trade'
  condition: 'new' | 'good' | 'used'
  status: ListingStatus
  category: string
  district: string
  owner: { name, avatarInitials, rating }
  description?: string
  exchangeWish?: string     // trade only

Layouts: grid | horizontal | compact
Image ratio: 4:3
Radius: radius/lg (16px)
Shadow: shadow/sm

Used on: Home, Browse, AI Results, Activities, Admin`}</div>
            </DSCard>
            <DSCard title="Button Spec">
              <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#3D4947', lineHeight: '18px', background: '#F8F9FF', padding: 16, borderRadius: 10, whiteSpace: 'pre' }}>{`COMPONENT: Button

Variants: primary | secondary | outline | ghost | danger
Sizes:
  sm: padding 5px 12px, fontSize 11, radius 8
  md: padding 9px 18px, fontSize 13, radius 12
  lg: padding 13px 28px, fontSize 15, radius 14

States: default | hover | pressed | disabled | loading

Token usage:
  primary bg:   color/primary (#00685F)
  primary text: color/on-primary (#FFFFFF)
  danger bg:    color/error (#BA1A1A)
  outline border: color/border (#BCC9C6)
  disabled:     opacity 0.4, cursor not-allowed`}</div>
            </DSCard>
            <DSCard title="Naming Conventions">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  ['Button/Primary/Medium', 'Primary button, md size'],
                  ['Input/Text/Default', 'TextField in default state'],
                  ['Card/Product/Grid', 'ProductCard grid layout'],
                  ['Badge/Transaction/Completed', 'Completed status badge'],
                  ['Modal/Transaction/Schedule', 'Handover scheduling modal'],
                  ['Navigation/Header/Guest', 'Header for unauthenticated'],
                  ['Navigation/Header/User', 'Header for authenticated user'],
                  ['Chat/Message/Outgoing', 'Sent message bubble'],
                  ['Admin/Table/User', 'User management table'],
                  ['Admin/StatCard', 'Dashboard metric card'],
                ].map(([name, desc]) => (
                  <div key={String(name)} style={{ display: 'flex', gap: 12, padding: '5px 0', borderBottom: '1px solid #F0F4FF' }}>
                    <code style={{ fontSize: 11, color: '#9D4300', fontFamily: 'monospace', minWidth: 220 }}>{name}</code>
                    <span style={{ fontSize: 12, color: '#6D7A77' }}>{desc}</span>
                  </div>
                ))}
              </div>
            </DSCard>
          </Section>
        )}

        {activeSection === 'mockdata' && (
          <Section title="19 Mock Data Schema" subtitle="Entity definitions for frontend mock data — no backend API yet">
            {[
              { name: 'User', fields: [
                ['id', 'string', '"user_001"'],
                ['name', 'string', '"Nguyễn Hoàng Minh"'],
                ['email', 'string', '"minh@example.com"'],
                ['phone', 'string', '"0912345678"'],
                ['district', 'string', '"Quận 3"'],
                ['avatarInitials', 'string', '"NM"'],
                ['totalCredit', 'number', '200'],
                ['availableCredit', 'number', '195'],
                ['holdCredit', 'number', '5'],
                ['rewardPoints', 'number', '480'],
                ['reputationStars', 'number', '4.2'],
                ['rank', 'string', '"Thành viên tích cực"'],
                ['status', 'active | suspended | locked', '"active"'],
                ['role', 'user | admin', '"user"'],
                ['joinedAt', 'string (ISO)', '"2024-03-15"'],
                ['totalTx', 'number', '12'],
              ], rel: 'owns Items, participates in Transactions, has Wallet' },
              { name: 'Item', fields: [
                ['id', 'string', '"item_001"'],
                ['ownerId', 'string → User.id', '"user_001"'],
                ['title', 'string', '"Tai nghe Sony WH-1000XM4"'],
                ['description', 'string', '"Còn mới 95%..."'],
                ['type', 'gift | trade', '"trade"'],
                ['category', 'string', '"Đồ điện tử"'],
                ['condition', 'new | good | used', '"good"'],
                ['district', 'string', '"Quận 3"'],
                ['image', 'string (URL)', '"https://..."'],
                ['tradeFor', 'string?', '"Máy ảnh, đồ điện tử"'],
                ['status', 'pending | approved | rejected | expired | removed', '"approved"'],
                ['postedAt', 'string (ISO)', '"2026-08-01"'],
                ['expiresAt', 'string (ISO)', '"2026-09-01"'],
              ], rel: 'belongs to User; can be part of Transaction' },
              { name: 'Transaction', fields: [
                ['id', 'string', '"tx_001"'],
                ['itemId', 'string → Item.id', '"item_001"'],
                ['requesterId', 'string → User.id', '"user_002"'],
                ['ownerId', 'string → User.id', '"user_001"'],
                ['type', 'gift | trade', '"trade"'],
                ['flow', 'TxFlow', '"fee_held"'],
                ['handoverId', 'string? → Handover.id', '"ho_001"'],
                ['creditHeld', 'number', '5'],
                ['senderConfirmed', 'boolean', 'false'],
                ['receiverConfirmed', 'boolean', 'false'],
                ['completedAt', 'string?', 'null'],
                ['cancelledAt', 'string?', 'null'],
                ['disputeId', 'string?', 'null'],
                ['createdAt', 'string', '"2026-09-10"'],
              ], rel: 'links 2 Users + 1 Item; has Handover, Evidence, Conversation' },
              { name: 'Handover', fields: [
                ['id', 'string', '"ho_001"'],
                ['transactionId', 'string → Transaction.id', '"tx_001"'],
                ['date', 'string', '"2026-09-25"'],
                ['time', 'string', '"18:30"'],
                ['district', 'string', '"Bình Thạnh"'],
                ['address', 'string', '"Landmark 81"'],
                ['method', 'Gặp trực tiếp | Giao hàng', '"Gặp trực tiếp"'],
                ['note', 'string?', '"Nhắn tin trước 30 phút"'],
                ['proposedBy', 'string → User.id', '"user_002"'],
                ['agreedBy', 'string?', '"user_001"'],
                ['status', 'proposed | confirmed', '"confirmed"'],
              ], rel: 'belongs to Transaction' },
              { name: 'Evidence', fields: [
                ['id', 'string', '"ev_001"'],
                ['transactionId', 'string → Transaction.id', '"tx_001"'],
                ['uploadedBy', 'string → User.id', '"user_001"'],
                ['files', 'string[]', '["url1","url2"]'],
                ['type', 'image | video', '"image"'],
                ['side', 'sender | receiver', '"sender"'],
                ['uploadedAt', 'string', '"2026-09-25T19:10:00"'],
              ], rel: 'belongs to Transaction' },
              { name: 'Conversation', fields: [
                ['id', 'string', '"conv_001"'],
                ['transactionId', 'string → Transaction.id', '"tx_001"'],
                ['participantIds', 'string[]', '["user_001","user_002"]'],
                ['itemId', 'string → Item.id', '"item_001"'],
                ['lastMessage', 'string', '"Mình đồng ý lịch này"'],
                ['lastMessageAt', 'string', '"2026-09-20T14:22:00"'],
                ['unreadCount', 'number', '2'],
              ], rel: 'links 2 Users; contains Messages' },
              { name: 'Message', fields: [
                ['id', 'string', '"msg_001"'],
                ['convId', 'string → Conversation.id', '"conv_001"'],
                ['sender', 'string → User.id | "system"', '"user_001"'],
                ['type', 'chat | system | handover_card', '"chat"'],
                ['text', 'string?', '"Bàn học còn dùng tốt không?"'],
                ['handoverData', 'HandoverData?', 'null'],
                ['confirmed', 'boolean?', 'false'],
                ['time', 'string', '"14:22"'],
              ], rel: 'belongs to Conversation' },
              { name: 'Wallet', fields: [
                ['userId', 'string → User.id', '"user_001"'],
                ['totalCredit', 'number', '200'],
                ['availableCredit', 'number', '195'],
                ['holdCredit', 'number', '5'],
                ['rewardPoints', 'number', '480'],
              ], rel: '1:1 with User' },
              { name: 'CreditHistory', fields: [
                ['id', 'string', '"ch_001"'],
                ['userId', 'string → User.id', '"user_001"'],
                ['type', 'TOPUP | TRANSACTION_FEE | AI_FEE | HOLD | RELEASE_HOLD | REFUND | ADMIN_ADJUSTMENT', '"HOLD"'],
                ['amount', 'number (positive=in, negative=out)', '-5'],
                ['balance', 'number (after)', '195'],
                ['ref', 'string?', '"tx_001"'],
                ['note', 'string', '"Giữ phí giao dịch"'],
                ['createdAt', 'string', '"2026-09-20T14:30:00"'],
              ], rel: 'belongs to User' },
              { name: 'Topup', fields: [
                ['id', 'string', '"top_001"'],
                ['userId', 'string → User.id', '"user_001"'],
                ['amount', 'number (Credit)', '50'],
                ['vnd', 'number', '50000'],
                ['method', 'string', '"QR Banking"'],
                ['status', 'pending | confirming | success | failed', '"success"'],
                ['qrCode', 'string?', '"data:image/png;base64,..."'],
                ['createdAt', 'string', '"2026-09-18T10:00:00"'],
                ['confirmedAt', 'string?', '"2026-09-18T10:03:00"'],
              ], rel: 'belongs to User' },
              { name: 'AIAnalysis', fields: [
                ['id', 'string', '"ai_001"'],
                ['userId', 'string → User.id', '"user_001"'],
                ['itemImage', 'string (URL)', '"https://..."'],
                ['category', 'string', '"Nước hoa"'],
                ['generatedDescription', 'string', '"Nước hoa vẫn còn khá nhiều..."'],
                ['editedDescription', 'string', '"Nước hoa còn khoảng 70%..."'],
                ['createdAt', 'string', '"2026-09-20"'],
              ], rel: 'belongs to User; leads to AIMatch' },
              { name: 'AIMatch', fields: [
                ['id', 'string', '"aim_001"'],
                ['analysisId', 'string → AIAnalysis.id', '"ai_001"'],
                ['matchedItemId', 'string → Item.id', '"item_005"'],
                ['reason', 'string (Vietnamese)', '"Cả hai đều là đồ điện tử..."'],
                ['createdAt', 'string', '"2026-09-20"'],
              ], rel: 'links AIAnalysis to Item' },
              { name: 'Dispute', fields: [
                ['id', 'string', '"disp_001"'],
                ['transactionId', 'string → Transaction.id', '"tx_001"'],
                ['reporterId', 'string → User.id', '"user_002"'],
                ['reason', 'string', '"Đồ không đúng mô tả"'],
                ['status', 'open | reviewing | resolved | closed', '"open"'],
                ['resolution', 'string?', 'null'],
                ['adminNote', 'string?', 'null'],
                ['createdAt', 'string', '"2026-09-21"'],
              ], rel: 'belongs to Transaction' },
              { name: 'AdminAuditLog', fields: [
                ['id', 'string', '"log_001"'],
                ['adminId', 'string → User.id (admin)', '"admin_001"'],
                ['action', 'string', '"approve_listing"'],
                ['targetType', 'user | item | transaction | dispute | setting', '"item"'],
                ['targetId', 'string', '"item_042"'],
                ['detail', 'string', '"Duyệt bài đăng: Bàn học gỗ"'],
                ['createdAt', 'string', '"2026-09-21T09:15:00"'],
              ], rel: 'belongs to Admin User' },
              { name: 'SystemSetting', fields: [
                ['key', 'string', '"tx_fee_credit"'],
                ['value', 'string | number', '5'],
                ['label', 'string', '"Phí giao dịch (Credit)"'],
                ['updatedAt', 'string', '"2026-09-01"'],
                ['updatedBy', 'string → User.id', '"admin_001"'],
              ], rel: 'global; no owner' },
            ].map(entity => (
              <DSCard key={entity.name} title={`Entity: ${entity.name}`}>
                <div style={{ display: 'flex', gap: 20 }}>
                  <div style={{ flex: 1, overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                      <thead><tr>
                        {['Field', 'Type', 'Example'].map(h => <th key={h} style={{ padding: '4px 10px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#6D7A77', borderBottom: '1px solid #E5EEFF' }}>{h}</th>)}
                      </tr></thead>
                      <tbody>
                        {entity.fields.map(([f, t, ex]) => (
                          <tr key={f} style={{ borderBottom: '1px solid #F8F9FF' }}>
                            <td style={{ padding: '4px 10px' }}><code style={{ fontSize: 10, color: '#00685F', fontFamily: 'monospace' }}>{f}</code></td>
                            <td style={{ padding: '4px 10px', fontSize: 10, color: '#9D4300', fontFamily: 'monospace' }}>{t}</td>
                            <td style={{ padding: '4px 10px', fontSize: 10, color: '#6D7A77', fontFamily: 'monospace' }}>{ex}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ minWidth: 200, background: '#F8F9FF', borderRadius: 10, padding: 12, fontSize: 11 }}>
                    <div style={{ fontWeight: 700, color: '#6D7A77', marginBottom: 4 }}>Relationships</div>
                    <div style={{ color: '#3D4947', lineHeight: '16px' }}>{entity.rel}</div>
                  </div>
                </div>
              </DSCard>
            ))}
          </Section>
        )}

        {activeSection === 'credit' && (
          <Section title="20 Credit Model" subtitle="1 Credit = 1,000đ · Four distinct scoring concepts">
            <DSCard title="Credit Balance Formula">
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {[
                  { label: 'totalCredit', val: '200', color: '#0B1C30', desc: 'All credit ever added' },
                  { label: '=', val: '', color: '#BCC9C6', desc: '' },
                  { label: 'availableCredit', val: '195', color: '#059669', desc: 'Spendable right now' },
                  { label: '+', val: '', color: '#BCC9C6', desc: '' },
                  { label: 'holdCredit', val: '5', color: '#F59E0B', desc: 'Locked in active tx' },
                ].map((p, i) => p.val ? (
                  <div key={i} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 28, fontWeight: 700, color: p.color }}>{p.val}</div>
                    <code style={{ fontSize: 10, color: p.color, fontFamily: 'monospace' }}>{p.label}</code>
                    <div style={{ fontSize: 9, color: '#6D7A77', maxWidth: 90, margin: '2px auto 0' }}>{p.desc}</div>
                  </div>
                ) : (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', paddingBottom: 20 }}>
                    <span style={{ fontSize: 24, fontWeight: 300, color: '#BCC9C6' }}>{p.label}</span>
                  </div>
                ))}
              </div>
            </DSCard>
            <DSCard title="Credit Movement Rules">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { rule: 'Opening modal / viewing transaction', effect: 'No credit movement', ok: true },
                  { rule: 'User confirms payment in modal', effect: 'AVAILABLE → HOLD (5 Credit)', ok: true },
                  { rule: 'Both parties confirm delivery', effect: 'HOLD → SPENT (fee deducted)', ok: true },
                  { rule: 'Valid cancellation before handover', effect: 'HOLD → AVAILABLE (refunded)', ok: true },
                  { rule: 'Admin refund', effect: 'Logged as REFUND, AVAILABLE increases', ok: true },
                  { rule: 'Deduct credit before payment confirmed', effect: '⚠ FORBIDDEN — never do this', ok: false },
                  { rule: 'One-party confirmation triggers payout', effect: '⚠ FORBIDDEN — both must confirm', ok: false },
                ].map(r => (
                  <div key={r.rule} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: 10, background: r.ok ? '#F8F9FF' : '#FEF2F2', border: `1px solid ${r.ok ? '#E5EEFF' : '#FCA5A5'}` }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16, color: r.ok ? '#059669' : '#BA1A1A', flexShrink: 0 }}>{r.ok ? 'check_circle' : 'cancel'}</span>
                    <span style={{ flex: 1, fontSize: 12, color: '#0B1C30' }}>{r.rule}</span>
                    <span style={{ fontSize: 11, color: r.ok ? '#059669' : '#BA1A1A', fontWeight: 600 }}>{r.effect}</span>
                  </div>
                ))}
              </div>
            </DSCard>
            <DSCard title="CreditHistory Types">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {[
                  { type: 'TOPUP', desc: 'User nạp tiền', color: '#059669' },
                  { type: 'HOLD', desc: 'Phí bị giữ khi xác nhận giao dịch', color: '#F59E0B' },
                  { type: 'RELEASE_HOLD', desc: 'Trả lại khi hủy hợp lệ', color: '#059669' },
                  { type: 'TRANSACTION_FEE', desc: 'Phí chính thức sau hoàn tất', color: '#9D4300' },
                  { type: 'AI_FEE', desc: 'Phí phân tích AI (nếu có)', color: '#6D7A77' },
                  { type: 'REFUND', desc: 'Admin hoàn tiền thủ công', color: '#00685F' },
                  { type: 'ADMIN_ADJUSTMENT', desc: 'Admin điều chỉnh số dư', color: '#6D7A77' },
                ].map(t => (
                  <div key={t.type} style={{ padding: '8px 14px', borderRadius: 10, background: t.color + '10', border: `1px solid ${t.color}30` }}>
                    <code style={{ fontSize: 11, fontWeight: 700, color: t.color, fontFamily: 'monospace' }}>{t.type}</code>
                    <div style={{ fontSize: 10, color: '#6D7A77', marginTop: 2 }}>{t.desc}</div>
                  </div>
                ))}
              </div>
            </DSCard>
            <DSCard title="Four Separate Concepts — Never Merge">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
                {[
                  { name: 'Credit', icon: 'account_balance_wallet', color: '#00685F', bg: '#EFF4FF', desc: 'Virtual currency. 1 Credit = 1,000đ. Used for transaction fees.' },
                  { name: 'Reward Points', icon: 'redeem', color: '#9D4300', bg: '#FFDBCA', desc: 'Earned from activity. Used for discounts or unlocking features.' },
                  { name: 'Member Rank', icon: 'military_tech', color: '#F59E0B', bg: '#FFF7ED', desc: 'Thành viên mới / Tích cực / Uy tín. Based on tx count + reputation.' },
                  { name: 'Reputation Stars', icon: 'star', color: '#059669', bg: '#ECFDF5', desc: 'Average rating from completed transactions. 1–5 scale.' },
                ].map(c => (
                  <div key={c.name} style={{ background: c.bg, borderRadius: 14, padding: 16, textAlign: 'center' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 24, color: c.color, display: 'block', marginBottom: 8 }}>{c.icon}</span>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#0B1C30', marginBottom: 6 }}>{c.name}</div>
                    <div style={{ fontSize: 10, color: '#6D7A77', lineHeight: '14px' }}>{c.desc}</div>
                  </div>
                ))}
              </div>
            </DSCard>
          </Section>
        )}

        {activeSection === 'txstate' && (
          <Section title="21 Transaction State Machine" subtitle="Full flow with triggers — credit only moves on explicit confirmation">
            <DSCard title="State Flow Diagram">
              <div style={{ fontFamily: 'monospace', fontSize: 11, lineHeight: '22px', background: '#F8F9FF', padding: 20, borderRadius: 12 }}>
                {[
                  { state: 'NEGOTIATING', color: '#6D7A77', trigger: '(initial — conversation opened)' },
                  { arrow: '↓ Requester sends HandoverScheduleCard' },
                  { state: 'SCHEDULE_PROPOSED', color: '#F59E0B', trigger: 'submitHandover()' },
                  { arrow: '↓ Owner clicks "Đồng ý" on HandoverCard' },
                  { state: 'SCHEDULE_CONFIRMED', color: '#00685F', trigger: 'agreeHandover(cardId)' },
                  { arrow: '↓ Either party clicks "Xác nhận phí" → modal → confirms' },
                  { state: 'CREDIT_HELD', color: '#9D4300', trigger: 'holdFee() — 5 Credit: AVAILABLE → HOLD' },
                  { arrow: '↓ Both arrive at exchange location' },
                  { state: 'WAITING_HANDOVER', color: '#F59E0B', trigger: '(alias for CREDIT_HELD; no separate trigger)' },
                  { arrow: '↓ Sender uploads evidence → confirms delivery' },
                  { state: 'SENDER_CONFIRMED', color: '#3D4947', trigger: 'confirmDeliver() — sets senderDone = true' },
                  { arrow: '↓ Receiver uploads evidence → confirms receipt (can happen in any order)' },
                  { state: 'RECEIVER_CONFIRMED', color: '#3D4947', trigger: 'confirmReceive() — sets receiverDone = true' },
                  { arrow: '↓ Both confirmed → finalizeComplete()' },
                  { state: 'COMPLETED', color: '#059669', trigger: 'finalizeComplete() — HOLD → SPENT, reward points added' },
                ].map((item, i) => 'arrow' in item ? (
                  <div key={i} style={{ color: '#BCC9C6', paddingLeft: 20, fontSize: 10 }}>{item.arrow}</div>
                ) : (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 6, background: item.color + '18', color: item.color, fontWeight: 700, minWidth: 180, textAlign: 'center' }}>{item.state}</span>
                    <span style={{ color: '#6D7A77', fontSize: 10 }}>{item.trigger}</span>
                  </div>
                ))}
              </div>
            </DSCard>
            <Grid cols={2}>
              <DSCard title="Alternative States">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { state: 'CANCELLED', from: 'Any state before CREDIT_HELD', trigger: 'Either party cancels', credit: 'No credit held → no action' },
                    { state: 'CANCELLED (after hold)', from: 'CREDIT_HELD or WAITING_HANDOVER', trigger: 'Admin cancels with valid reason', credit: 'HOLD → AVAILABLE (refunded)' },
                    { state: 'DISPUTED', from: 'Any state after CREDIT_HELD', trigger: 'Either party files report', credit: 'Hold frozen pending admin review' },
                  ].map(s => (
                    <div key={s.state} style={{ padding: 12, background: '#FEF2F2', borderRadius: 10, border: '1px solid #FCA5A5' }}>
                      <div style={{ fontWeight: 700, fontSize: 12, color: '#BA1A1A', marginBottom: 4 }}>{s.state}</div>
                      <div style={{ fontSize: 11, color: '#6D7A77' }}>From: {s.from}</div>
                      <div style={{ fontSize: 11, color: '#6D7A77' }}>Trigger: {s.trigger}</div>
                      <div style={{ fontSize: 11, color: '#9D4300', marginTop: 4, fontWeight: 600 }}>Credit: {s.credit}</div>
                    </div>
                  ))}
                </div>
              </DSCard>
              <DSCard title="Key Safety Rules">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[
                    ['Opening the fee modal does NOT hold credit', true],
                    ['Holding credit requires explicit user confirmation', true],
                    ['Only one HOLD per transaction — prevent double-charge', true],
                    ['COMPLETED requires BOTH senderDone AND receiverDone', true],
                    ['If one party confirmed and other disputes, freeze hold', true],
                    ['Admin is the only actor who can force-resolve disputed hold', true],
                  ].map(([rule, ok]) => (
                    <div key={String(rule)} style={{ display: 'flex', gap: 8, fontSize: 11, color: '#0B1C30', padding: '4px 0', borderBottom: '1px solid #F0F4FF' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 14, color: ok ? '#059669' : '#BA1A1A', flexShrink: 0 }}>check_circle</span>
                      {rule}
                    </div>
                  ))}
                </div>
              </DSCard>
            </Grid>
            <DSCard title="User Action → State Transition Table">
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                <thead><tr style={{ background: '#F8F9FF' }}>
                  {['Actor', 'Action', 'Current State', 'Next State', 'Credit Effect'].map(h => (
                    <th key={h} style={{ padding: '6px 10px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#6D7A77', borderBottom: '1px solid #E5EEFF' }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {[
                    ['Requester', 'Gửi đề xuất lịch', 'NEGOTIATING', 'SCHEDULE_PROPOSED', 'None'],
                    ['Owner', 'Đồng ý lịch', 'SCHEDULE_PROPOSED', 'SCHEDULE_CONFIRMED', 'None'],
                    ['Owner', 'Đề xuất lại lịch', 'SCHEDULE_PROPOSED', 'SCHEDULE_PROPOSED', 'None'],
                    ['Either', 'Xác nhận phí', 'SCHEDULE_CONFIRMED', 'CREDIT_HELD', 'AVAILABLE − 5 → HOLD'],
                    ['Sender', 'Xác nhận giao đồ', 'CREDIT_HELD', 'SENDER_CONFIRMED', 'None'],
                    ['Receiver', 'Xác nhận nhận đồ', 'CREDIT_HELD / SENDER_CONFIRMED', 'RECEIVER_CONFIRMED', 'None'],
                    ['System', 'Cả hai đã xác nhận', 'BOTH CONFIRMED', 'COMPLETED', 'HOLD → SPENT'],
                    ['Either', 'Hủy (trước hold)', 'NEGOTIATING / PROPOSED', 'CANCELLED', 'None'],
                    ['Admin', 'Hủy có lý do hợp lệ', 'After CREDIT_HELD', 'CANCELLED', 'HOLD → AVAILABLE'],
                    ['Either', 'Báo cáo tranh chấp', 'After CREDIT_HELD', 'DISPUTED', 'Hold frozen'],
                  ].map(row => (
                    <tr key={row[1] + row[2]} style={{ borderBottom: '1px solid #F0F4FF' }}>
                      {row.map((cell, i) => (
                        <td key={i} style={{ padding: '6px 10px', color: i === 4 ? (cell === 'None' ? '#BCC9C6' : '#9D4300') : '#3D4947', fontWeight: i === 4 && cell !== 'None' ? 600 : 400 }}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </DSCard>
          </Section>
        )}

        {activeSection === 'aiflow' && (
          <Section title="22 AI Exchange Flow" subtitle="Full user journey through AI item analysis and match confirmation">
            <DSCard title="Complete AI Flow">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {[
                  { step: 1, label: 'User opens Trợ lý AI', detail: 'Selects mode: "Tôi muốn tìm đồ" or "Tôi có món muốn đổi"' },
                  { step: 2, label: 'Upload & Describe', detail: 'User uploads photo + selects category → AI generates natural Vietnamese description' },
                  { step: 3, label: 'AI Analysis', detail: 'System generates AIAnalysis — title, condition, description in natural language' },
                  { step: 4, label: 'User Confirms Description', detail: 'User reads and edits generated description if needed → confirms' },
                  { step: 5, label: 'AI Finds Matches', detail: 'System searches approved items → returns 3–5 AIMatch results' },
                  { step: 6, label: 'Browse Matches', detail: 'User reviews matched items with natural Vietnamese reason text' },
                  { step: 7, label: 'Compare Items', detail: 'User selects a match → side-by-side comparison (MÓN CỦA BẠN ⇄ MÓN CỦA ĐỐI PHƯƠNG)' },
                  { step: 8, label: 'Send Proposal', detail: 'User clicks "Đề xuất trao đổi" → creates Transaction + Conversation' },
                  { step: 9, label: 'Navigate to Messages', detail: 'navigate(\'/messages\') with the new conversation pre-selected → TxFlow starts at NEGOTIATING' },
                ].map(s => (
                  <div key={s.step} style={{ display: 'flex', gap: 14, padding: '10px 0', borderBottom: '1px solid #F0F4FF' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#EFF4FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 700, fontSize: 11, color: '#00685F' }}>{s.step}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: '#0B1C30', marginBottom: 2 }}>{s.label}</div>
                      <div style={{ fontSize: 11, color: '#6D7A77' }}>{s.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </DSCard>
            <Grid cols={2}>
              <DSCard title="AI Description Rules">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ padding: 10, background: '#ECFDF5', borderRadius: 8, border: '1px solid #BBF7D0' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#059669', marginBottom: 4 }}>GOOD — Natural Vietnamese</div>
                    <div style={{ fontSize: 12, color: '#0B1C30', fontStyle: 'italic' }}>"Nước hoa vẫn còn khá nhiều, chai được giữ tốt và hạn sử dụng còn xa."</div>
                  </div>
                  <div style={{ padding: 10, background: '#ECFDF5', borderRadius: 8, border: '1px solid #BBF7D0' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#059669', marginBottom: 4 }}>GOOD — Honest observation</div>
                    <div style={{ fontSize: 12, color: '#0B1C30', fontStyle: 'italic' }}>"Bàn học còn chắc chắn, có vài vết xước nhỏ ở mặt trên nhưng không ảnh hưởng sử dụng."</div>
                  </div>
                  <div style={{ padding: 10, background: '#FEF2F2', borderRadius: 8, border: '1px solid #FCA5A5' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#BA1A1A', marginBottom: 4 }}>BAD — Fake percentages</div>
                    <div style={{ fontSize: 12, color: '#BA1A1A', fontStyle: 'italic', textDecoration: 'line-through' }}>"AI đánh giá 87% phù hợp."</div>
                  </div>
                  <div style={{ padding: 10, background: '#FEF2F2', borderRadius: 8, border: '1px solid #FCA5A5' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#BA1A1A', marginBottom: 4 }}>BAD — Generic non-description</div>
                    <div style={{ fontSize: 12, color: '#BA1A1A', fontStyle: 'italic', textDecoration: 'line-through' }}>"Item detected. Category: Electronics. Condition: used."</div>
                  </div>
                </div>
              </DSCard>
              <DSCard title="Match Reason Rules">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontSize: 11, color: '#6D7A77', marginBottom: 4 }}>Match reason must explain WHY the items are compatible in conversational Vietnamese.</div>
                  {[
                    { ok: true, text: '"Cả hai đều thuộc danh mục đồ điện tử và đang trong tình trạng dùng tốt, phù hợp để trao đổi."' },
                    { ok: true, text: '"Người dùng muốn đổi đồ gia dụng — chiếc quạt này rất phù hợp với mong muốn đó."' },
                    { ok: false, text: '"Match score: 92.4%. Semantic similarity: 0.87."' },
                  ].map((m, i) => (
                    <div key={i} style={{ padding: 10, background: m.ok ? '#ECFDF5' : '#FEF2F2', borderRadius: 8, border: `1px solid ${m.ok ? '#BBF7D0' : '#FCA5A5'}` }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 12, color: m.ok ? '#059669' : '#BA1A1A' }}>{m.ok ? 'check' : 'close'}</span>
                      <span style={{ fontSize: 11, color: '#0B1C30', marginLeft: 6, fontStyle: 'italic' }}>{m.text}</span>
                    </div>
                  ))}
                </div>
              </DSCard>
            </Grid>
            <DSCard title="AIExchangeComparison Layout">
              <div style={{ display: 'flex', gap: 16, maxWidth: 540 }}>
                <div style={{ flex: 1, background: '#EFF4FF', borderRadius: 14, padding: 16, textAlign: 'center' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#00685F', marginBottom: 8, letterSpacing: '0.06em' }}>MÓN CỦA BẠN</div>
                  <div style={{ width: '100%', aspectRatio: '4/3', background: '#DCE9FF', borderRadius: 10, marginBottom: 8 }} />
                  <div style={{ fontWeight: 600, fontSize: 12, color: '#0B1C30' }}>Nước hoa Chanel</div>
                  <div style={{ fontSize: 10, color: '#6D7A77' }}>Quận 3 · Dùng tốt</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', fontSize: 22, color: '#BCC9C6', fontWeight: 300 }}>⇄</div>
                <div style={{ flex: 1, background: '#FFDBCA', borderRadius: 14, padding: 16, textAlign: 'center' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#9D4300', marginBottom: 8, letterSpacing: '0.06em' }}>MÓN ĐỐI PHƯƠNG</div>
                  <div style={{ width: '100%', aspectRatio: '4/3', background: '#FFD4B0', borderRadius: 10, marginBottom: 8 }} />
                  <div style={{ fontWeight: 600, fontSize: 12, color: '#0B1C30' }}>Tai nghe Sony</div>
                  <div style={{ fontSize: 10, color: '#6D7A77' }}>Bình Thạnh · Dùng tốt</div>
                </div>
              </div>
            </DSCard>
          </Section>
        )}

        {activeSection === 'responsive' && (
          <Section title="23 Responsive Rules" subtitle="Mobile 375px · Tablet 768px · Desktop 1280px+">
            <DSCard title="Breakpoints">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
                {[
                  { label: 'Mobile', bp: '375px', icon: 'smartphone', rules: ['Single column', 'Stacked nav', 'Full-width cards', 'Drawer modals', 'Horizontal-scroll tables'] },
                  { label: 'Tablet', bp: '768px', icon: 'tablet', rules: ['2-column grids', 'Compact sidebar', 'Reduced padding', 'Collapsible filters', 'Responsive modals'] },
                  { label: 'Desktop', bp: '1280px+', icon: 'desktop_mac', rules: ['3–4 column grids', 'Full sidebar', '24px padding', 'Side-by-side layouts', 'Sticky sidebar'] },
                ].map(b => (
                  <div key={b.label} style={{ background: '#F8F9FF', borderRadius: 14, padding: 16 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#00685F', display: 'block', marginBottom: 8 }}>{b.icon}</span>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#0B1C30' }}>{b.label}</div>
                    <code style={{ fontSize: 10, color: '#9D4300' }}>{b.bp}</code>
                    <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {b.rules.map(r => <div key={r} style={{ fontSize: 11, color: '#6D7A77' }}>· {r}</div>)}
                    </div>
                  </div>
                ))}
              </div>
            </DSCard>
            <DSCard title="Component Responsive Behavior">
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                <thead><tr style={{ background: '#F8F9FF' }}>
                  {['Component', 'Mobile (375px)', 'Tablet (768px)', 'Desktop (1280px+)'].map(h => (
                    <th key={h} style={{ padding: '6px 10px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#6D7A77', borderBottom: '1px solid #E5EEFF' }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {[
                    ['AppHeader', 'Hamburger menu, logo only, hide nav links', 'Compact nav, hide long items', 'Full nav ONE LINE — no wrapping'],
                    ['AppFooter', 'Stacked columns, full width', 'Two columns', 'Four columns horizontal'],
                    ['ProductGrid', '1 column', '2 columns', '3–4 columns'],
                    ['ProductDetail', 'Stacked: image → info', 'Stacked with larger image', 'Two-column: image left, info right'],
                    ['Forms', 'Full width fields, stacked', 'Max 600px centered', 'Max 640px centered'],
                    ['AI Results', 'Stacked cards', '2-column match grid', '3-column match grid + sidebar'],
                    ['Messages', 'Conv list → tap → chat detail', 'Split 40/60 with back button', 'Split 300px / flex-1'],
                    ['Transaction flow', 'Bottom sheet modals', 'Centered modals', 'Centered modals, wider'],
                    ['AdminSidebar', 'Drawer (slide-in overlay)', 'Collapsible icon sidebar', 'Full 200px sticky sidebar'],
                    ['AdminTable', 'Horizontal scroll (min-width on table)', 'Horizontal scroll', 'Full table, all columns visible'],
                    ['Modal', 'Full-screen bottom sheet', 'Centered, 90% width', 'Centered, fixed max-width'],
                  ].map(row => (
                    <tr key={row[0]} style={{ borderBottom: '1px solid #F0F4FF' }}>
                      {row.map((cell, i) => (
                        <td key={i} style={{ padding: '7px 10px', fontWeight: i === 0 ? 600 : 400, color: i === 0 ? '#0B1C30' : '#6D7A77', fontSize: i === 0 ? 12 : 11 }}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </DSCard>
            <DSCard title="Header One-Line Rule (Desktop)">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ padding: 10, background: '#ECFDF5', borderRadius: 8, border: '1px solid #BBF7D0', fontSize: 11, color: '#059669' }}>
                  ✓ Logo · Nav links · [Credit pill] · [Đăng đồ button] · [Avatar] — all on one row
                </div>
                <div style={{ padding: 10, background: '#FEF2F2', borderRadius: 8, border: '1px solid #FCA5A5', fontSize: 11, color: '#BA1A1A' }}>
                  ✗ DO NOT let nav links wrap to second line — shorten labels or hide secondary links before breaking
                </div>
                <div style={{ padding: 10, background: '#FEF2F2', borderRadius: 8, border: '1px solid #FCA5A5', fontSize: 11, color: '#BA1A1A' }}>
                  ✗ DO NOT put full name + email + credit balance directly in header — use ProfileMenu dropdown
                </div>
              </div>
            </DSCard>
          </Section>
        )}

        {activeSection === 'rolematrix' && (
          <Section title="24 Role Access Matrix" subtitle="What each role can see and do">
            <DSCard title="Feature Access Matrix">
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 600 }}>
                  <thead><tr style={{ background: '#F8F9FF' }}>
                    <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6D7A77', borderBottom: '1px solid #E5EEFF', minWidth: 180 }}>Feature</th>
                    {['Guest', 'User', 'Admin'].map(r => (
                      <th key={r} style={{ padding: '8px 16px', textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#6D7A77', borderBottom: '1px solid #E5EEFF' }}>{r}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {[
                      { feature: 'Trang chủ', g: 'view', u: 'view', a: 'view' },
                      { feature: 'Tìm đồ (Browse)', g: 'view', u: 'view', a: 'view' },
                      { feature: 'Chi tiết món đồ', g: 'view', u: 'view + request', a: 'view + manage' },
                      { feature: 'Trợ lý AI', g: 'view', u: 'full', a: 'full' },
                      { feature: 'Đăng đồ', g: '✗ redirect /login', u: 'full', a: 'full' },
                      { feature: 'Hoạt động', g: '✗ redirect /login', u: 'own listings only', a: 'view all' },
                      { feature: 'Tin nhắn', g: '✗ redirect /login', u: 'own convs only', a: 'view all' },
                      { feature: 'Hồ sơ', g: '✗ redirect /login', u: 'own profile', a: 'own + manage others' },
                      { feature: 'Credit / Wallet', g: '✗ not visible', u: 'own wallet', a: 'view all wallets' },
                      { feature: 'Admin Dashboard', g: '✗ redirect /', u: '✗ redirect /', a: 'full' },
                      { feature: 'Duyệt nội dung', g: '✗', u: '✗', a: 'full' },
                      { feature: 'Quản lý người dùng', g: '✗', u: '✗', a: 'full' },
                      { feature: 'Quản lý giao dịch', g: '✗', u: '✗', a: 'full' },
                      { feature: 'Tài chính', g: '✗', u: '✗', a: 'full' },
                      { feature: 'Cấu hình hệ thống', g: '✗', u: '✗', a: 'full' },
                      { feature: 'Nhật ký audit', g: '✗', u: '✗', a: 'full' },
                    ].map(row => (
                      <tr key={row.feature} style={{ borderBottom: '1px solid #F0F4FF' }}>
                        <td style={{ padding: '8px 12px', fontWeight: 600, color: '#0B1C30' }}>{row.feature}</td>
                        {[row.g, row.u, row.a].map((cell, i) => (
                          <td key={i} style={{ padding: '8px 16px', textAlign: 'center' }}>
                            <span style={{
                              fontSize: 11, fontWeight: 500,
                              color: cell.startsWith('✗') ? '#BA1A1A' : cell === 'full' ? '#059669' : cell.includes('view') ? '#00685F' : '#F59E0B',
                            }}>{cell}</span>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </DSCard>
            <DSCard title="Hidden from Guest">
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['Đăng đồ nav link', 'Hoạt động nav link', 'Tin nhắn nav link', 'Credit pill in header', 'Quản trị nav link', 'Wallet modal', 'Request/Exchange buttons'].map(item => (
                  <span key={item} style={{ padding: '4px 10px', borderRadius: 6, background: '#FEF2F2', color: '#BA1A1A', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 12 }}>visibility_off</span>{item}
                  </span>
                ))}
              </div>
            </DSCard>
          </Section>
        )}

        {activeSection === 'guards' && (
          <Section title="25 Route Guards" subtitle="Redirect logic for each access level">
            <DSCard title="Guard Types">
              <Grid cols={2}>
                {[
                  { name: 'PublicRoute', color: '#059669', bg: '#ECFDF5', desc: 'No auth required. All roles can access. No redirect.', routes: ['/', '/browse', '/product/:id', '/ai'] },
                  { name: 'GuestOnlyRoute', color: '#F59E0B', bg: '#FFF7ED', desc: 'Only for unauthenticated users. If logged in → redirect /.', routes: ['/login', '/register'] },
                  { name: 'ProtectedRoute', color: '#00685F', bg: '#EFF4FF', desc: 'Requires logged-in user (any role). Guest → redirect /login.', routes: ['/post', '/activities', '/messages', '/profile'] },
                  { name: 'AdminRoute', color: '#9D4300', bg: '#FFDBCA', desc: 'Requires role=admin. User (non-admin) → redirect /. Guest → redirect /login.', routes: ['/admin', '/admin/*'] },
                ].map(g => (
                  <div key={g.name} style={{ background: g.bg, borderRadius: 14, padding: 16 }}>
                    <code style={{ fontSize: 12, fontWeight: 700, color: g.color, fontFamily: 'monospace' }}>{g.name}</code>
                    <div style={{ fontSize: 11, color: '#3D4947', margin: '8px 0' }}>{g.desc}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#6D7A77', marginBottom: 4 }}>Applies to:</div>
                    {g.routes.map(r => <code key={r} style={{ display: 'block', fontSize: 10, color: g.color, fontFamily: 'monospace', marginBottom: 2 }}>{r}</code>)}
                  </div>
                ))}
              </Grid>
            </DSCard>
            <DSCard title="Redirect Scenarios">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  ['Guest opens /post', '→ /login', 'ProtectedRoute'],
                  ['Guest opens /messages', '→ /login', 'ProtectedRoute'],
                  ['Guest opens /admin', '→ /login', 'AdminRoute'],
                  ['User (role=user) opens /admin', '→ /', 'AdminRoute'],
                  ['Logged-in user opens /login', '→ /', 'GuestOnlyRoute'],
                  ['Logged-in user opens /register', '→ /', 'GuestOnlyRoute'],
                  ['Admin opens /post', '✓ allowed', 'ProtectedRoute'],
                  ['Guest opens /browse', '✓ allowed', 'PublicRoute'],
                ].map(([scenario, result, guard]) => (
                  <div key={scenario} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '7px 12px', borderRadius: 9, background: result.startsWith('✓') ? '#ECFDF5' : '#FFF7ED', border: `1px solid ${result.startsWith('✓') ? '#BBF7D0' : '#FDE68A'}` }}>
                    <span style={{ flex: 2, fontSize: 12, color: '#0B1C30' }}>{scenario}</span>
                    <span style={{ fontWeight: 700, fontSize: 12, color: result.startsWith('✓') ? '#059669' : '#F59E0B' }}>{result}</span>
                    <code style={{ fontSize: 10, color: '#6D7A77', fontFamily: 'monospace' }}>{guard}</code>
                  </div>
                ))}
              </div>
            </DSCard>
            <DSCard title="Implementation Pattern">
              <div style={{ fontFamily: 'monospace', fontSize: 11, lineHeight: '20px', background: '#F8F9FF', padding: 16, borderRadius: 10, color: '#3D4947', whiteSpace: 'pre' }}>{`// Current implementation uses module-level store + useEffect
// In each protected page:

useEffect(() => {
  if (!currentUser) navigate('/login');     // ProtectedRoute
}, [currentUser]);

useEffect(() => {
  if (!currentUser) navigate('/login');
  else if (currentUser.role !== 'admin') navigate('/');  // AdminRoute
}, [currentUser]);

// Guest-only (Login, Register):
useEffect(() => {
  if (currentUser) navigate('/');           // GuestOnlyRoute
}, [currentUser]);

// Always return null before render if guard not yet resolved:
if (!currentUser) return null;`}</div>
            </DSCard>
          </Section>
        )}

      </div>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function Section({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: '#0B1C30', margin: '0 0 4px' }}>{title}</h2>
        <p style={{ fontSize: 13, color: '#6D7A77', margin: 0 }}>{subtitle}</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>{children}</div>
    </div>
  );
}

function DSCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #E5EEFF' }}>
      <div style={{ fontWeight: 700, fontSize: 13, color: '#0B1C30', marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid #F0F4FF' }}>{title}</div>
      {children}
    </div>
  );
}

function Grid({ cols, children }: { cols: number; children: React.ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 16 }}>{children}</div>;
}

const bodyText: React.CSSProperties = { fontSize: 14, color: '#3D4947', lineHeight: '22px', margin: 0 };

function btnVariant(variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'): React.CSSProperties {
  const map: Record<string, React.CSSProperties> = {
    primary: { background: '#00685F', color: '#fff', border: 'none' },
    secondary: { background: '#9D4300', color: '#fff', border: 'none' },
    outline: { background: '#fff', color: '#3D4947', border: '1.5px solid #BCC9C6' },
    ghost: { background: 'transparent', color: '#3D4947', border: 'none' },
    danger: { background: '#BA1A1A', color: '#fff', border: 'none' },
  };
  return { ...map[variant], padding: '8px 16px', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 13, fontFamily: 'inherit' };
}
