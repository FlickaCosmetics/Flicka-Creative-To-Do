import React, { useState } from 'react';
import {
  Shield,
  Clock,
  ArrowRight,
  UserPlus,
  LogIn,
  AlertCircle,
  CheckCircle2,
  Lock,
  Mail,
  User,
  Crown,
  Eye,
  EyeOff,
} from 'lucide-react';
import { UserAccount, TeamRole } from '../types';

interface AuthScreenProps {
  users: UserAccount[];
  onLogin: (user: UserAccount) => void;
  onRegister: (newUser: Omit<UserAccount, 'id' | 'createdAt' | 'status' | 'isAdmin'>) => {
    success: boolean;
    message: string;
    isFirstAdmin?: boolean;
    account?: UserAccount;
  };
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  users,
  onLogin,
  onRegister,
}) => {
  const hasAdmin = users.some((u) => u.isAdmin);
  const isFirstUserSetup = users.length === 0 || !hasAdmin;

  // Default to signup if no users/admin exist yet, otherwise signin
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>(
    isFirstUserSetup ? 'signup' : 'signin'
  );

  // Sign in form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [pendingAccountNotice, setPendingAccountNotice] = useState<UserAccount | null>(null);

  // Sign up form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<TeamRole>(isFirstUserSetup ? 'team_lead' : 'video_editor');
  const [regDepartment, setRegDepartment] = useState(
    isFirstUserSetup ? 'Creative Strategy & Operations' : 'Video Production'
  );
  const [regRoleTitle, setRegRoleTitle] = useState(
    isFirstUserSetup ? 'Creative Director & Super Admin' : 'Video Editor & Animator'
  );
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccessMessage, setRegSuccessMessage] = useState<string | null>(null);
  const [firstAdminSuccess, setFirstAdminSuccess] = useState<UserAccount | null>(null);

  const roleOptions: { role: TeamRole; title: string; dept: string; label: string }[] = [
    {
      role: 'team_lead',
      title: 'Creative Director & Admin',
      dept: 'Creative Operations',
      label: '👑 Creative Director / Team Lead',
    },
    {
      role: 'video_editor',
      title: 'Video Editor & Animator',
      dept: 'Video Production',
      label: '🎬 Video Editor / Animator',
    },
    {
      role: 'graphic_designer',
      title: 'Graphic & Visual Designer',
      dept: 'Brand & Creative Design',
      label: '🎨 Graphic & Visual Designer',
    },
    {
      role: 'performance_marketer',
      title: 'Growth & Ads Specialist',
      dept: 'Performance Marketing',
      label: '📈 Performance Marketer / Media Buyer',
    },
    {
      role: 'ugc_creator',
      title: 'UGC Content Specialist',
      dept: 'Social & Influencer Marketing',
      label: '📱 UGC Creator / Social Content',
    },
    {
      role: 'copywriter',
      title: 'Creative Copywriter & Scriptwriter',
      dept: 'Content & Strategy',
      label: '✍️ Copywriter / Scriptwriter',
    },
  ];

  const handleRoleSelect = (opt: typeof roleOptions[0]) => {
    setRegRole(opt.role);
    setRegRoleTitle(opt.title);
    setRegDepartment(opt.dept);
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setPendingAccountNotice(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanEmail) {
      setLoginError('Please enter your work email address.');
      return;
    }

    if (users.length === 0) {
      setLoginError('No accounts exist in the system yet. Please create the first Super Admin account.');
      setActiveTab('signup');
      return;
    }

    // Find user by email
    const user = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      setLoginError('No account found with this email. Please check your spelling or register an account.');
      return;
    }

    // Check password if set
    if (user.password && cleanPass && user.password !== cleanPass) {
      setLoginError('Incorrect password. Please try again.');
      return;
    }

    // Check account approval status
    if (user.status === 'pending') {
      setPendingAccountNotice(user);
      return;
    }

    if (user.status === 'rejected') {
      setLoginError(
        user.rejectionReason
          ? `Access Denied: Your registration was not approved. Reason: "${user.rejectionReason}".`
          : 'Access Denied: Your registration request was rejected by an Administrator.'
      );
      return;
    }

    // Success login
    onLogin(user);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setRegSuccessMessage(null);
    setFirstAdminSuccess(null);

    if (!regName.trim()) {
      setRegError('Please enter your full name.');
      return;
    }

    if (!regEmail.trim() || !regEmail.includes('@')) {
      setRegError('Please provide a valid work email address.');
      return;
    }

    if (regPassword.length > 0 && regPassword.length < 3) {
      setRegError('Password must be at least 3 characters.');
      return;
    }

    const initials = regName
      .trim()
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const colors = [
      'bg-purple-600',
      'bg-indigo-600',
      'bg-amber-600',
      'bg-teal-600',
      'bg-rose-600',
      'bg-blue-600',
      'bg-emerald-600',
    ];
    const randomBg = isFirstUserSetup ? 'bg-purple-600' : colors[Math.floor(Math.random() * colors.length)];

    const result = onRegister({
      name: regName.trim(),
      email: regEmail.trim().toLowerCase(),
      password: regPassword.trim() || 'flicka123',
      role: isFirstUserSetup ? 'admin' : regRole,
      roleTitle: regRoleTitle.trim() || (isFirstUserSetup ? 'Creative Director & Super Admin' : 'Creative Specialist'),
      department: regDepartment.trim() || (isFirstUserSetup ? 'Creative Strategy & Operations' : 'Creative Studio'),
      initials: initials || 'TM',
      avatarBg: randomBg,
      avatarText: 'text-white',
    });

    if (!result.success) {
      setRegError(result.message);
    } else {
      if (result.isFirstAdmin && result.account) {
        setFirstAdminSuccess(result.account);
      } else {
        setRegSuccessMessage(result.message);
        setEmail(regEmail.trim().toLowerCase());
        setPassword(regPassword.trim());
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
      {/* Brand Top Header */}
      <div className="w-full max-w-md mb-6 text-center">
        <div className="inline-flex items-center justify-center gap-2 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-2xs mb-3">
          <span className="text-xl text-blue-600 font-bold select-none">✦</span>
          <span className="font-bold text-slate-900 text-sm tracking-wide">FLICKA PERFORMANCE STUDIO</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Creative Task Management
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Internal Creative Operations, Video Briefs & Deliverable Approvals
        </p>
      </div>

      {/* Main Authentication Card */}
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        {/* First User Setup Top Banner */}
        {isFirstUserSetup && (
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-3.5 px-5 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 font-medium">
              <Crown className="w-4 h-4 text-amber-300 shrink-0" />
              <span>
                <strong>Initial Setup Mode:</strong> The first registered user will automatically become the <strong>Super Admin</strong>.
              </span>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-100 bg-slate-50/70 p-1.5 gap-1.5">
          <button
            id="tab-auth-signin"
            onClick={() => {
              setActiveTab('signin');
              setLoginError(null);
              setPendingAccountNotice(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'signin'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>

          <button
            id="tab-auth-signup"
            onClick={() => {
              setActiveTab('signup');
              setRegError(null);
              setRegSuccessMessage(null);
              setFirstAdminSuccess(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'signup'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{isFirstUserSetup ? 'Create First Account (Admin)' : 'Create Account / Request Access'}</span>
          </button>
        </div>

        {/* Tab 1: SIGN IN */}
        {activeTab === 'signin' && (
          <div className="p-6 sm:p-7 space-y-5">
            {/* If 0 users in system */}
            {users.length === 0 && (
              <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-purple-950 space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <Crown className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-purple-900">
                      No Users Registered Yet
                    </h2>
                    <p className="text-xs text-purple-800 mt-1">
                      Be the first to register! The first created account will be configured as the <strong>Super Admin</strong> with full permissions.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('signup')}
                  className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition-all mt-1"
                >
                  Create Super Admin Account &rarr;
                </button>
              </div>
            )}

            {/* Pending Account Notice */}
            {pendingAccountNotice && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 bg-amber-100 rounded-lg text-amber-700 mt-0.5">
                    <Clock className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                      Account Pending Admin Approval
                    </h2>
                    <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                      Hello <strong>{pendingAccountNotice.name}</strong>! Your registration request for{' '}
                      <span className="font-mono bg-amber-100/80 px-1 py-0.5 rounded text-[11px]">
                        {pendingAccountNotice.email}
                      </span>{' '}
                      ({pendingAccountNotice.department}) has been recorded.
                    </p>
                    <p className="text-xs text-amber-700 mt-2 font-medium">
                      🔒 An Admin must approve your account before you can log in.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {loginError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">{loginError}</div>
              </div>
            )}

            {/* Sign In Form */}
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Work Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@flickacosmetics.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                id="btn-submit-signin"
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-black text-white text-sm font-semibold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* Tab 2: CREATE ACCOUNT / REGISTER */}
        {activeTab === 'signup' && (
          <div className="p-6 sm:p-7 space-y-5">
            {/* First Admin Created Immediate Success Screen */}
            {firstAdminSuccess ? (
              <div className="p-5 rounded-2xl bg-purple-50 border border-purple-200 text-purple-950 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-600 text-white rounded-xl shadow-xs shrink-0 mt-0.5">
                    <Crown className="w-6 h-6 text-amber-300" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-purple-950">
                      Super Admin Account Created!
                    </h2>
                    <p className="text-xs text-purple-800 mt-1 leading-relaxed">
                      Welcome, <strong>{firstAdminSuccess.name}</strong>! As the very first user, you have been designated as the <strong>Studio Super Admin</strong>.
                    </p>
                    <div className="mt-2.5 p-3 bg-white/80 rounded-xl border border-purple-200/70 text-[11px] text-purple-900 space-y-1">
                      <div><strong>Email:</strong> {firstAdminSuccess.email}</div>
                      <div><strong>Role:</strong> {firstAdminSuccess.roleTitle || 'Creative Director & Admin'}</div>
                      <div><strong>Privileges:</strong> Full access to assign tasks & review user registrations.</div>
                    </div>
                  </div>
                </div>

                <button
                  id="btn-first-admin-enter"
                  onClick={() => onLogin(firstAdminSuccess)}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md"
                >
                  <span>Enter Studio Dashboard as Admin</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : regSuccessMessage ? (
              /* Regular Subsequent User Registration Notice */
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-100 rounded-xl text-emerald-700 shrink-0 mt-0.5">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-emerald-950">
                      Registration Submitted!
                    </h2>
                    <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                      {regSuccessMessage}
                    </p>
                    <p className="text-xs text-emerald-700 mt-2 font-medium">
                      An Admin has received your request. Once approved, you will be able to log in with your work email.
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-emerald-200 flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => {
                      setActiveTab('signin');
                      setRegSuccessMessage(null);
                    }}
                    className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold text-center cursor-pointer transition-all"
                  >
                    Go to Sign In Screen
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Information Callout */}
                {isFirstUserSetup ? (
                  <div className="bg-purple-50 border border-purple-200/80 rounded-xl p-3.5 text-xs text-purple-950 flex items-start gap-2.5">
                    <Crown className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-semibold text-purple-950">First Account Setup:</strong> You are creating the very first account. This account will automatically have <strong>Super Admin privileges</strong> and will not require external approval.
                    </div>
                  </div>
                ) : (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-900 flex items-start gap-2.5">
                    <Shield className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-semibold">Approval Policy:</strong> All team registrations are held in a pending queue until approved by an Admin.
                    </div>
                  </div>
                )}

                {regError && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>{regError}</div>
                  </div>
                )}

                <form onSubmit={handleSignUp} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="input-signup-name"
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="e.g. Priyanka Paliwal"
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Work Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="input-signup-email"
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="name@flickacosmetics.com"
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="input-signup-password"
                        type="password"
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Create a password"
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                      />
                    </div>
                  </div>

                  {/* Role and Department Selection */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Select Role & Specialization *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {roleOptions.map((opt) => {
                        const isSelected = regRole === opt.role;
                        return (
                          <button
                            key={`${opt.role}-${opt.dept}`}
                            type="button"
                            onClick={() => handleRoleSelect(opt)}
                            className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? 'border-purple-600 bg-purple-50/70 text-purple-950 font-semibold ring-1 ring-purple-600'
                                : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                            }`}
                          >
                            <span className="truncate">{opt.label}</span>
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0 ml-1" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Department
                      </label>
                      <input
                        type="text"
                        value={regDepartment}
                        onChange={(e) => setRegDepartment(e.target.value)}
                        placeholder="e.g. Creative Strategy"
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-purple-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Job Title
                      </label>
                      <input
                        type="text"
                        value={regRoleTitle}
                        onChange={(e) => setRegRoleTitle(e.target.value)}
                        placeholder="e.g. Creative Director"
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-purple-600"
                      />
                    </div>
                  </div>

                  <button
                    id="btn-submit-signup"
                    type="submit"
                    className={`w-full py-2.5 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer mt-3 ${
                      isFirstUserSetup
                        ? 'bg-purple-600 hover:bg-purple-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {isFirstUserSetup ? (
                      <>
                        <Crown className="w-4 h-4 text-amber-300" />
                        <span>Create Super Admin Account & Finish Setup</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>Submit Registration for Admin Approval</span>
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-6 text-center text-xs text-slate-400">
        Flicka Cosmetics &copy; 2026 · Secure Internal Workspace · Admin Approval Required for Access
      </div>
    </div>
  );
};
