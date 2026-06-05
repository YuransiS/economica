'use client';

import { useState, useEffect, Fragment } from 'react';
import { useAuth } from '../useAuth';
import { 
  getAdminSubmissions, 
  saveHomeworkReview, 
  AdminSubmissionItem,
  getAllStudentsWithProgress, 
  deleteStudentUser, 
  toggleUserLockout,
  getLessonsConfig, 
  updateLessonConfig
} from '../supabase';
import { HomeworkStatus, MinicourseUser, MinicourseLessonConfig, StudentWithProgress } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, ClipboardCheck, Award, LogOut, Search, Filter, 
  ExternalLink, Check, MessageSquare, Send, CheckCircle2, AlertTriangle, AlertCircle, HelpCircle,
  Settings, Lock, Unlock, Trash2, Save, BookOpen, ShieldAlert, ChevronDown, ChevronUp
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  // Enforce admin role check
  const { user, loading, logout } = useAuth(true);
  
  // Navigation tabs state
  const [activeTab, setActiveTab] = useState<'submissions' | 'students' | 'lessons'>('submissions');
  
  // Data states
  const [submissions, setSubmissions] = useState<AdminSubmissionItem[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(true);
  
  const [students, setStudents] = useState<StudentWithProgress[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);
  
  const [lessons, setLessons] = useState<MinicourseLessonConfig[]>([]);
  const [lessonsLoading, setLessonsLoading] = useState(true);
  
  // Filter/Search states
  const [hwFilterStatus, setHwFilterStatus] = useState<HomeworkStatus | 'all'>('all');
  const [hwSearchQuery, setHwSearchQuery] = useState('');
  
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [studentFilterPaid, setStudentFilterPaid] = useState<'all' | 'paid' | 'unpaid'>('all');
  
  // Action/Review modal states
  const [selectedSub, setSelectedSub] = useState<AdminSubmissionItem | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [savingReview, setSavingReview] = useState(false);
  
  // Lesson Save notifications state
  const [lessonSaveStatus, setLessonSaveStatus] = useState<{ [key: number]: 'idle' | 'saving' | 'success' | 'error' }>({});
  
  // Utility states
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch all homework submissions
  const fetchSubmissions = async () => {
    try {
      setSubmissionsLoading(true);
      const data = await getAdminSubmissions();
      setSubmissions(data);
    } catch (err) {
      console.error("Error fetching submissions:", err);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  // Fetch all students directory
  const fetchStudents = async () => {
    try {
      setStudentsLoading(true);
      const data = await getAllStudentsWithProgress();
      setStudents(data);
    } catch (err) {
      console.error("Error fetching students:", err);
    } finally {
      setStudentsLoading(false);
    }
  };

  // Fetch dynamic lesson configurations
  const fetchLessons = async () => {
    try {
      setLessonsLoading(true);
      const data = await getLessonsConfig();
      setLessons(data);
    } catch (err) {
      console.error("Error fetching lesson configs:", err);
    } finally {
      setLessonsLoading(false);
    }
  };

  // Load datasets on mount/auth success
  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchSubmissions();
      fetchStudents();
      fetchLessons();
    }
  }, [user]);

  // Open single submission for review modal
  const handleOpenReview = (sub: AdminSubmissionItem) => {
    setSelectedSub(sub);
    setReviewComment(sub.hwComment || '');
  };

  // Run homework review status submission
  const handleReviewAction = async (status: 'accepted' | 'needs_improvement') => {
    if (!selectedSub) return;

    setSavingReview(true);
    try {
      await saveHomeworkReview(
        selectedSub.userId, 
        selectedSub.lessonId, 
        status, 
        reviewComment.trim()
      );
      
      // Look up student to get their telegram_chat_id
      const student = students.find(s => s.id === selectedSub.userId);
      if (student && student.telegram_chat_id) {
        // Trigger notification asynchronously
        fetch('/api/minicourse/bot/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chatId: student.telegram_chat_id,
            messageType: status === 'accepted' ? 'hw_accepted' : 'hw_needs_improvement',
            templateData: {
              userName: student.name,
              lessonId: selectedSub.lessonId,
              comment: reviewComment.trim(),
              actionUrl: `${window.location.origin}/minicourse`
            }
          })
        }).catch(err => console.error("Failed to trigger homework review telegram notification:", err));

        // If homework accepted and it's not the last lesson, notify about the newly unlocked lesson
        if (status === 'accepted' && selectedSub.lessonId < 3) {
          const nextLessonId = selectedSub.lessonId + 1;
          const nextConfig = lessons.find(l => l.lesson_id === nextLessonId);
          
          setTimeout(() => {
            fetch('/api/minicourse/bot/notify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chatId: student.telegram_chat_id,
                messageType: 'new_lesson_unlocked',
                templateData: {
                  userName: student.name,
                  lessonId: nextLessonId,
                  lessonTitle: nextConfig?.title || `Ефір ${nextLessonId}`,
                  actionUrl: `${window.location.origin}/minicourse`
                }
              })
            }).catch(err => console.error("Failed to trigger new lesson telegram notification:", err));
          }, 2000);
        }
      }
      
      setSelectedSub(null);
      // Hot reload stats & directory
      await fetchSubmissions();
      await fetchStudents();
    } catch (err) {
      console.error("Error updating homework status:", err);
      alert("Не вдалося оновити статус домашнього завдання.");
    } finally {
      setSavingReview(false);
    }
  };

  // Toggle blocking/lockout security status for student
  const handleToggleBlock = async (studentId: string, currentlyBlocked: boolean) => {
    const actionText = currentlyBlocked ? 'розблокувати' : 'заблокувати';
    if (!confirm(`Ви дійсно бажаєте ${actionText} цього студента?`)) return;

    try {
      await toggleUserLockout(studentId, !currentlyBlocked);
      // Reload lists
      await fetchStudents();
      await fetchSubmissions();
    } catch (err) {
      console.error("Error toggling lockout state:", err);
      alert("Помилка зміни статусу блокування.");
    }
  };

  // Delete student completely
  const handleDeleteStudent = async (studentId: string, studentName: string) => {
    if (!confirm(`⚠️ УВАГА! Ви дійсно бажаєте ВИДАЛИТИ користувача "${studentName}"?\nЦе безповоротно видалить усі дані профілю та історію прогресу!`)) {
      return;
    }

    try {
      await deleteStudentUser(studentId);
      // Reload lists
      await fetchStudents();
      await fetchSubmissions();
    } catch (err) {
      console.error("Error deleting student profile:", err);
      alert("Не вдалося видалити профіль учня.");
    }
  };

  // Update dynamic lesson settings configurations
  const handleSaveLessonConfig = async (lessonId: number, configForm: Partial<MinicourseLessonConfig>) => {
    setLessonSaveStatus(prev => ({ ...prev, [lessonId]: 'saving' }));
    try {
      await updateLessonConfig(lessonId, configForm);
      setLessonSaveStatus(prev => ({ ...prev, [lessonId]: 'success' }));
      
      // Refresh configurations state
      await fetchLessons();
      
      // Clear success notification indicator after 3 seconds
      setTimeout(() => {
        setLessonSaveStatus(prev => ({ ...prev, [lessonId]: 'idle' }));
      }, 3000);
    } catch (err) {
      console.error("Error updating lesson settings:", err);
      setLessonSaveStatus(prev => ({ ...prev, [lessonId]: 'error' }));
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#1A0000] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#81D8D0] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="font-narrow text-[#81D8D0] uppercase tracking-widest text-sm">Завантаження панелі адміна...</p>
        </div>
      </div>
    );
  }

  // Stats Calculations
  const pendingCount = submissions.filter(s => s.hwStatus === 'pending').length;
  const acceptedCount = submissions.filter(s => s.hwStatus === 'accepted').length;
  const totalStudentsCount = students.length;
  const blockedStudentsCount = students.filter(s => s.status === 'under_investigation').length;
  const activePaidCount = students.filter(s => s.is_paid || s.payment_status === 'paid').length;

  // Filtered Homework Submissions list
  const filteredSubmissions = submissions.filter(sub => {
    const matchesStatus = hwFilterStatus === 'all' || sub.hwStatus === hwFilterStatus;
    const matchesSearch = 
      sub.userName.toLowerCase().includes(hwSearchQuery.toLowerCase()) ||
      sub.userEmail.toLowerCase().includes(hwSearchQuery.toLowerCase()) ||
      (sub.userTelegram && sub.userTelegram.toLowerCase().includes(hwSearchQuery.toLowerCase()));
    
    return matchesStatus && matchesSearch;
  });

  // Filtered Students list
  const filteredStudents = students.filter(student => {
    const isPaid = student.is_paid || student.payment_status === 'paid';
    const matchesPaid = 
      studentFilterPaid === 'all' ||
      (studentFilterPaid === 'paid' && isPaid) ||
      (studentFilterPaid === 'unpaid' && !isPaid);
      
    const matchesSearch = 
      student.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
      (student.telegram && student.telegram.toLowerCase().includes(studentSearchQuery.toLowerCase())) ||
      (student.phone && student.phone.includes(studentSearchQuery));

    return matchesPaid && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#1A0000] text-white font-montserrat flex flex-col pb-16">
      
      {/* Background Neon Gradients */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#4E0000]/30 rounded-full blur-[180px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-[#81D8D0]/5 rounded-full blur-[150px] pointer-events-none"></div>

      {/* Sticky Premium Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-[#81D8D0]/10 border border-[#81D8D0]/30 flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5 text-[#81D8D0]" />
            </div>
            <span className="font-bold text-lg tracking-wider uppercase">Sofia <span className="text-[#81D8D0]">CRM</span></span>
            <span className="text-[9px] font-bold text-purple-300 border border-purple-500/20 bg-purple-950/20 px-2 py-0.5 rounded uppercase font-narrow ml-2">Minicourse Admin</span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-[#81D8D0]">Панель Управління</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest">{user.name}</p>
            </div>
            <button 
              onClick={logout}
              className="p-2.5 rounded-xl border border-white/10 hover:border-red-500/30 text-gray-400 hover:text-red-400 transition-all bg-white/5 hover:bg-white/10"
              title="Вийти з панелі"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Panel Container */}
      <main className="max-w-6xl mx-auto px-4 py-8 w-full space-y-8 relative z-10 flex-1">
        
        {/* Navigation Tabs Header */}
        <section className="bg-white/5 border border-white/10 rounded-3xl p-2.5 backdrop-blur-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex bg-black/40 rounded-2xl p-1.5 border border-white/5 w-full md:w-auto overflow-x-auto gap-1">
            <button
              onClick={() => setActiveTab('submissions')}
              className={`flex items-center space-x-2 px-5 py-3 rounded-xl font-bold text-xs uppercase transition-all whitespace-nowrap ${
                activeTab === 'submissions'
                  ? 'bg-[#81D8D0] text-[#1A0000] shadow-[0_0_15px_rgba(129,216,208,0.3)]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>📋 Перевірка ДЗ ({pendingCount})</span>
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`flex items-center space-x-2 px-5 py-3 rounded-xl font-bold text-xs uppercase transition-all whitespace-nowrap ${
                activeTab === 'students'
                  ? 'bg-[#81D8D0] text-[#1A0000] shadow-[0_0_15px_rgba(129,216,208,0.3)]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>👥 Студенти ({totalStudentsCount})</span>
            </button>
            <button
              onClick={() => setActiveTab('lessons')}
              className={`flex items-center space-x-2 px-5 py-3 rounded-xl font-bold text-xs uppercase transition-all whitespace-nowrap ${
                activeTab === 'lessons'
                  ? 'bg-[#81D8D0] text-[#1A0000] shadow-[0_0_15px_rgba(129,216,208,0.3)]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>⚙️ Налаштування Уроків</span>
            </button>
          </div>

          <div className="hidden md:flex items-center space-x-2 text-xs text-gray-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="font-narrow uppercase tracking-wider text-[10px]">Система онлайн та синхронізована</span>
          </div>
        </section>

        {/* TAB 1: SUBMISSIONS REVIEW */}
        {activeTab === 'submissions' && (
          <div className="space-y-6">
            {/* Quick stats for Submissions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest font-narrow">Надіслано домашніх робіт</span>
                  <h4 className="text-2xl font-black text-white mt-1">{submissions.length}</h4>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400">
                  <BookOpen className="w-5 h-5" />
                </div>
              </div>
              <div className="bg-white/5 border border-[#81D8D0]/30 rounded-2xl p-5 backdrop-blur-sm flex items-center justify-between shadow-[0_0_15px_rgba(129,216,208,0.05)]">
                <div>
                  <span className="text-[10px] text-[#81D8D0] uppercase tracking-widest font-narrow font-bold">Очікують оцінки Софії</span>
                  <h4 className="text-2xl font-black text-[#81D8D0] mt-1">{pendingCount}</h4>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#81D8D0]/10 flex items-center justify-center text-[#81D8D0]">
                  <HelpCircle className="w-5 h-5" />
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest font-narrow">Успішно складено (Зараховано)</span>
                  <h4 className="text-2xl font-black text-white mt-1">{acceptedCount}</h4>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-green-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Filter and Search Bar for submissions */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-5 backdrop-blur-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:max-w-md">
                <Search className="absolute left-4 top-3.5 h-4 w-4 text-gray-500" />
                <input 
                  type="text"
                  value={hwSearchQuery}
                  onChange={(e) => setHwSearchQuery(e.target.value)}
                  placeholder="Шукати домашку за ім'ям або TG..."
                  className="w-full pl-11 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-[#81D8D0] focus:ring-1 focus:ring-[#81D8D0] outline-none text-xs font-arimo text-white transition-all placeholder-gray-500"
                />
              </div>

              <div className="flex items-center space-x-3 w-full md:w-auto overflow-x-auto">
                <Filter className="w-4 h-4 text-gray-500 hidden sm:block" />
                <div className="flex bg-black/20 rounded-xl p-1 border border-white/5 w-full md:w-auto">
                  {[
                    { value: 'all', label: 'Усі' },
                    { value: 'pending', label: 'Черга ⏳' },
                    { value: 'accepted', label: 'Прийняті 🎉' },
                    { value: 'needs_improvement', label: 'На доопрацюванні ⚠️' }
                  ].map(tab => (
                    <button
                      key={tab.value}
                      onClick={() => setHwFilterStatus(tab.value as any)}
                      className={`px-3 py-2 rounded-lg font-bold text-xs uppercase transition-all whitespace-nowrap ${
                        hwFilterStatus === tab.value
                          ? 'bg-[#81D8D0] text-[#1A0000] shadow-[0_0_10px_rgba(129,216,208,0.2)]'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Submissions Directory Grid Table */}
            <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-white/10 bg-black/30 font-narrow text-[10px] uppercase tracking-wider text-gray-400">
                      <th className="p-4 pl-6">Студент</th>
                      <th className="p-4">Урок</th>
                      <th className="p-4">Посилання на звіт</th>
                      <th className="p-4">Час подачі</th>
                      <th className="p-4">Статус</th>
                      <th className="p-4 pr-6 text-right">Дія</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs">
                    {submissionsLoading ? (
                      <tr>
                        <td colSpan={6} className="p-12 text-center">
                          <div className="w-8 h-8 border-3 border-[#81D8D0] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                          <p className="text-xs text-gray-500 font-narrow uppercase tracking-widest">Завантаження робіт...</p>
                        </td>
                      </tr>
                    ) : filteredSubmissions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-12 text-center text-gray-500">
                          Жодних домашніх робіт не знайдено
                        </td>
                      </tr>
                    ) : (
                      filteredSubmissions.map(sub => {
                        const rowId = `${sub.userId}-${sub.lessonId}`;
                        let statusLabel = "Очікує";
                        let statusStyle = "text-[#81D8D0] bg-[#81D8D0]/10 border-[#81D8D0]/20";
                        let statusIcon = <HelpCircle className="w-3.5 h-3.5" />;

                        if (sub.hwStatus === 'accepted') {
                          statusLabel = "Зараховано 🎉";
                          statusStyle = "text-green-400 bg-green-950/20 border-green-500/20";
                          statusIcon = <CheckCircle2 className="w-3.5 h-3.5" />;
                        } else if (sub.hwStatus === 'needs_improvement') {
                          statusLabel = "Допрацювання ⚠️";
                          statusStyle = "text-amber-400 bg-amber-950/20 border-amber-500/20";
                          statusIcon = <AlertTriangle className="w-3.5 h-3.5" />;
                        }

                        return (
                          <tr key={rowId} className="hover:bg-white/5 transition-colors">
                            <td className="p-4 pl-6 space-y-1">
                              <p className="font-bold text-white">{sub.userName}</p>
                              <div className="flex items-center space-x-2 text-[10px] text-gray-400 font-arimo">
                                {sub.userTelegram && (
                                  <span 
                                    onClick={() => copyToClipboard(`@${sub.userTelegram}`, `${rowId}-tg`)}
                                    className="hover:text-white cursor-pointer transition-colors text-[#81D8D0]"
                                  >
                                    @{sub.userTelegram}
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="p-4">
                              <span className="font-bold text-xs uppercase bg-[#81D8D0]/5 border border-[#81D8D0]/10 px-2.5 py-1 rounded">
                                Ефір {sub.lessonId}
                              </span>
                            </td>

                            <td className="p-4">
                              <a 
                                href={sub.hwUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-[#81D8D0] hover:underline flex items-center space-x-1 max-w-[200px] truncate font-arimo"
                              >
                                <span>Відкрити таблицю</span>
                                <ExternalLink className="w-3 h-3 flex-shrink-0" />
                              </a>
                            </td>

                            <td className="p-4 text-gray-400 font-narrow">
                              {new Date(sub.hwSubmittedAt).toLocaleDateString('uk-UA')} {new Date(sub.hwSubmittedAt).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}
                            </td>

                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded border text-[10px] font-bold uppercase flex items-center space-x-1.5 w-max ${statusStyle}`}>
                                {statusIcon}
                                <span>{statusLabel}</span>
                              </span>
                            </td>

                            <td className="p-4 pr-6 text-right">
                              <button 
                                onClick={() => handleOpenReview(sub)}
                                className="px-3.5 py-2 bg-[#81D8D0] hover:bg-[#97e3db] text-[#1A0000] font-bold text-[10px] uppercase rounded-lg shadow-[0_0_10px_rgba(129,216,208,0.1)] transition-all cursor-pointer"
                              >
                                Перевірити
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: STUDENTS DIRECTORY & MANAGEMENT */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            {/* Student Accounts Stat Counters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest font-narrow">Зареєстровано учнів</span>
                  <h4 className="text-2xl font-black text-white mt-1">{totalStudentsCount}</h4>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#81D8D0]">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest font-narrow">Оплачений доступ (Активні)</span>
                  <h4 className="text-2xl font-black text-green-400 mt-1">{activePaidCount}</h4>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-green-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <div className="bg-white/5 border border-red-500/20 rounded-2xl p-5 backdrop-blur-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-red-300 uppercase tracking-widest font-narrow">Заблоковані учні (Security Alert)</span>
                  <h4 className="text-2xl font-black text-red-400 mt-1">{blockedStudentsCount}</h4>
                </div>
                <div className="w-10 h-10 rounded-xl bg-red-950/20 flex items-center justify-center text-red-400">
                  <Lock className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Filter and Search Bar for student directory */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-5 backdrop-blur-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:max-w-md">
                <Search className="absolute left-4 top-3.5 h-4 w-4 text-gray-500" />
                <input 
                  type="text"
                  value={studentSearchQuery}
                  onChange={(e) => setStudentSearchQuery(e.target.value)}
                  placeholder="Шукати учня за ім'ям, TG або телефоном..."
                  className="w-full pl-11 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-[#81D8D0] focus:ring-1 focus:ring-[#81D8D0] outline-none text-xs font-arimo text-white transition-all placeholder-gray-500"
                />
              </div>

              <div className="flex items-center space-x-3 w-full md:w-auto">
                <span className="text-xs text-gray-500 font-narrow uppercase tracking-wider font-bold">Оплата:</span>
                <div className="flex bg-black/20 rounded-xl p-1 border border-white/5 w-full md:w-auto">
                  {[
                    { value: 'all', label: 'Усі' },
                    { value: 'paid', label: 'Тільки Оплачені' },
                    { value: 'unpaid', label: 'Неоплачені / Помилки' }
                  ].map(tab => (
                    <button
                      key={tab.value}
                      onClick={() => setStudentFilterPaid(tab.value as any)}
                      className={`px-4 py-2 rounded-lg font-bold text-xs uppercase transition-all whitespace-nowrap ${
                        studentFilterPaid === tab.value
                          ? 'bg-[#81D8D0] text-[#1A0000]'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Students List Table */}
            <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-white/10 bg-black/30 font-narrow text-[10px] uppercase tracking-wider text-gray-400">
                      <th className="p-4 pl-6">Учень / Контакти</th>
                      <th className="p-4">Доступ (Сплачено)</th>
                      <th className="p-4 text-center">Прогрес</th>
                      <th className="p-4">Активні пристрої</th>
                      <th className="p-4">Дата реєстрації</th>
                      <th className="p-4">Безпека (Статус)</th>
                      <th className="p-4 pr-6 text-right">Деталі</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs">
                    {studentsLoading ? (
                      <tr>
                        <td colSpan={7} className="p-12 text-center">
                          <div className="w-8 h-8 border-3 border-[#81D8D0] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                          <p className="text-xs text-gray-500 font-narrow uppercase tracking-widest">Завантаження профілів учнів...</p>
                        </td>
                      </tr>
                    ) : filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-12 text-center text-gray-500">
                          Немає учнів за вказаними параметрами пошуку
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map(student => {
                        const isPaid = student.is_paid || student.payment_status === 'paid';
                        const deviceCount = student.device_uuids?.length || 0;
                        const isBlocked = student.status === 'under_investigation';
                        const isExpanded = expandedStudentId === student.id;
                        const progressPercent = student.progress?.progressPercent || 0;

                        return (
                          <Fragment key={student.id}>
                            <tr className="hover:bg-white/5 transition-colors border-b border-white/5">
                              {/* Profile details */}
                              <td className="p-4 pl-6 space-y-1">
                                <p className="font-bold text-white">{student.name}</p>
                                <div className="space-y-0.5 text-[10px] text-gray-400 font-arimo">
                                  <p className="flex items-center space-x-2">
                                    {student.telegram && (
                                      <>
                                        <span className="text-gray-500">TG:</span>
                                        <span className="text-[#81D8D0]">@{student.telegram}</span>
                                      </>
                                    )}
                                    {student.phone && (
                                      <>
                                        <span className="text-gray-500">• Тел:</span>
                                        <span className="text-gray-300">{student.phone}</span>
                                      </>
                                    )}
                                  </p>
                                </div>
                              </td>

                              {/* Access/payment state */}
                              <td className="p-4">
                                <span className={`px-2.5 py-1 rounded border text-[9px] font-bold uppercase ${
                                  isPaid 
                                    ? 'text-green-400 bg-green-950/20 border-green-500/20' 
                                    : 'text-red-400 bg-red-950/20 border-red-500/20'
                                }`}>
                                  {isPaid ? 'Доступ дозволено 🟢' : 'Неоплачено / Блоковано 🔴'}
                                </span>
                              </td>

                              {/* Miniature Progress Timeline */}
                              <td className="p-4">
                                <div className="flex flex-col items-center space-y-1.5">
                                  <span className="font-bold text-[#81D8D0] text-xs">{progressPercent}%</span>
                                  <div className="flex space-x-1.5">
                                    {[1, 2, 3].map(lessonId => {
                                      const lesson = student.progress?.lessons[lessonId as 1 | 2 | 3];
                                      if (!lesson) {
                                        return <div key={lessonId} className="w-2.5 h-2.5 rounded-full bg-gray-800" title={`Ефір ${lessonId}: Закрито`} />;
                                      }
                                      
                                      let color = "bg-gray-800";
                                      let title = `Ефір ${lessonId}: Заблоковано`;

                                      if (lesson.unlocked) {
                                        color = "bg-blue-600";
                                        title = `Ефір ${lessonId}: Відкрито (перегляд відео)`;
                                        
                                        if (lesson.videoCompleted) {
                                          color = "bg-green-600";
                                          title = `Ефір ${lessonId}: Відео переглянуто`;
                                        }

                                        if (lesson.hwStatus === 'pending') {
                                          color = "bg-amber-500 animate-pulse";
                                          title = `Ефір ${lessonId}: ДЗ на перевірці`;
                                        } else if (lesson.hwStatus === 'accepted') {
                                          color = "bg-emerald-500";
                                          title = `Ефір ${lessonId}: ДЗ прийнято`;
                                        } else if (lesson.hwStatus === 'needs_improvement') {
                                          color = "bg-red-500";
                                          title = `Ефір ${lessonId}: ДЗ потребує доопрацювання`;
                                        } else if (lesson.hwStatus === 'expired_not_submitted') {
                                          color = "bg-red-950 border border-red-500/30";
                                          title = `Ефір ${lessonId}: ДЗ не здано вчасно`;
                                        }
                                      }
                                      
                                      return (
                                        <div 
                                          key={lessonId} 
                                          className={`w-2.5 h-2.5 rounded-full ${color}`} 
                                          title={title}
                                        />
                                      );
                                    })}
                                  </div>
                                </div>
                              </td>

                              {/* Devices list and count */}
                              <td className="p-4">
                                <div className="flex items-center space-x-2">
                                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold font-narrow ${
                                    deviceCount >= 4 
                                      ? 'bg-red-950/30 text-red-400 border border-red-500/30' 
                                      : deviceCount > 1 
                                      ? 'bg-amber-950/30 text-amber-300 border border-amber-500/20' 
                                      : 'bg-white/5 text-gray-400'
                                  }`}>
                                    {deviceCount} / 4 пристроїв
                                  </span>
                                </div>
                              </td>

                              {/* Registered date */}
                              <td className="p-4 text-gray-400 font-narrow">
                                {student.created_at ? new Date(student.created_at).toLocaleDateString('uk-UA') : 'Дані відсутні'}
                              </td>

                              {/* Safety state */}
                              <td className="p-4">
                                {isBlocked ? (
                                  <span className="px-2.5 py-1 rounded-lg bg-red-950/20 border border-red-500/30 text-red-400 font-bold text-[9px] uppercase flex items-center space-x-1.5 w-max animate-pulse">
                                    <ShieldAlert className="w-3 h-3" />
                                    <span>Блокування пристроїв 🚫</span>
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-1 rounded-lg bg-green-950/20 border border-green-500/20 text-green-400 font-bold text-[9px] uppercase flex items-center space-x-1.5 w-max">
                                    <Check className="w-3 h-3" />
                                    <span>Безпечно (Активний)</span>
                                  </span>
                                )}
                              </td>

                              {/* Action details expander */}
                              <td className="p-4 pr-6 text-right">
                                <button
                                  onClick={() => setExpandedStudentId(isExpanded ? null : student.id)}
                                  className="p-2 border border-white/5 hover:border-[#81D8D0]/40 hover:bg-[#81D8D0]/10 text-gray-400 hover:text-[#81D8D0] rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ml-auto"
                                  title="Показати детальний прогрес"
                                >
                                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                  <span className="font-narrow text-[10px] uppercase font-bold">Деталі</span>
                                </button>
                              </td>
                            </tr>

                            {/* Collapsible Details Drawer */}
                            {isExpanded && (
                              <tr className="bg-black/30">
                                <td colSpan={7} className="p-6 border-b border-white/10">
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {[1, 2, 3].map(lessonId => {
                                      const lesson = student.progress?.lessons[lessonId as 1 | 2 | 3];
                                      const hasVideoProgress = lesson && lesson.videoDurationSec && lesson.videoWatchedSec !== undefined;
                                      const watchedPercent = hasVideoProgress ? Math.min(100, Math.round((lesson.videoWatchedSec! / lesson.videoDurationSec!) * 100)) : 0;
                                      
                                      let hwStatusText = 'Не розпочато';
                                      let hwStatusColor = 'text-gray-500';
                                      
                                      if (lesson) {
                                        if (lesson.hwStatus === 'pending') {
                                          hwStatusText = 'Очікує перевірки ⏳';
                                          hwStatusColor = 'text-amber-400';
                                        } else if (lesson.hwStatus === 'accepted') {
                                          hwStatusText = 'Зараховано 🎉';
                                          hwStatusColor = 'text-emerald-400';
                                        } else if (lesson.hwStatus === 'needs_improvement') {
                                          hwStatusText = 'На доопрацюванні ⚠️';
                                          hwStatusColor = 'text-red-400';
                                        } else if (lesson.hwStatus === 'expired_not_submitted') {
                                          hwStatusText = 'Не здано вчасно ⏱️';
                                          hwStatusColor = 'text-red-500 font-bold';
                                        } else if (lesson.hwSubmitted) {
                                          hwStatusText = 'Надіслано';
                                          hwStatusColor = 'text-blue-400';
                                        }
                                      }

                                      const formatTime = (secs?: number) => {
                                        if (secs === undefined) return '0:00';
                                        const m = Math.floor(secs / 60);
                                        const s = Math.floor(secs % 60);
                                        return `${m}:${s < 10 ? '0' : ''}${s}`;
                                      };

                                      return (
                                        <div key={lessonId} className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
                                          <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                            <span className="font-bold text-xs uppercase tracking-wider text-[#81D8D0]">Ефір {lessonId}</span>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${lesson?.unlocked ? 'bg-blue-950 text-blue-400' : 'bg-gray-800 text-gray-400'}`}>
                                              {lesson?.unlocked ? 'Відкрито' : 'Закрито'}
                                            </span>
                                          </div>
                                          
                                          <div className="space-y-2 text-xs">
                                            {/* Video Info */}
                                            <div>
                                              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-narrow mb-1">Перегляд відео:</p>
                                              {lesson?.unlocked ? (
                                                <div className="space-y-1">
                                                  <div className="flex justify-between text-[11px] font-arimo">
                                                    <span className="text-gray-300">
                                                      {hasVideoProgress ? `${formatTime(lesson.videoWatchedSec)} / ${formatTime(lesson.videoDurationSec)}` : '0:00 / --:--'}
                                                    </span>
                                                    <span className="text-[#81D8D0] font-bold">{watchedPercent}%</span>
                                                  </div>
                                                  <div className="w-full bg-black/40 rounded-full h-1.5 overflow-hidden">
                                                    <div 
                                                      className={`h-full rounded-full transition-all duration-500 ${lesson.videoCompleted ? 'bg-emerald-500' : 'bg-[#81D8D0]'}`}
                                                      style={{ width: `${watchedPercent}%` }}
                                                    ></div>
                                                  </div>
                                                  {lesson.videoCompleted && (
                                                    <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-narrow uppercase mt-1">
                                                      <Check className="w-3 h-3" /> Відео зараховано (&ge;80%)
                                                    </p>
                                                  )}
                                                </div>
                                              ) : (
                                                <p className="text-gray-500 italic font-arimo">Доступ до відео заблоковано</p>
                                              )}
                                            </div>

                                            {/* Homework Info */}
                                            <div className="pt-1">
                                              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-narrow mb-1">Домашнє завдання:</p>
                                              {lesson?.unlocked ? (
                                                <div className="space-y-1">
                                                  <p className={`font-bold ${hwStatusColor}`}>{hwStatusText}</p>
                                                  {lesson.hwUrl && (
                                                    <a 
                                                      href={lesson.hwUrl} 
                                                      target="_blank" 
                                                      rel="noopener noreferrer" 
                                                      className="text-[#81D8D0] hover:underline flex items-center gap-1 mt-1 font-arimo"
                                                    >
                                                      <span>Посилання на звіт</span>
                                                      <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                  )}
                                                </div>
                                              ) : (
                                                <p className="text-gray-500 italic font-arimo">Доступ до ДЗ заблоковано</p>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>

                                  {/* Admin Actions inside expanded panel */}
                                  <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-4 border-t border-white/5">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-gray-400">ID користувача:</span>
                                      <code className="text-[10px] bg-black/50 px-2.5 py-1 rounded text-gray-300 font-mono select-all">{student.id}</code>
                                    </div>
                                    
                                    <div className="flex items-center space-x-3">
                                      {isBlocked ? (
                                        <button
                                          onClick={() => handleToggleBlock(student.id, true)}
                                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-black font-montserrat font-bold text-[10px] uppercase rounded-xl flex items-center space-x-1.5 transition-all shadow-[0_4px_12px_rgba(34,197,94,0.2)] cursor-pointer"
                                          title="Розблокувати та повністю обнулити ліміт пристроїв"
                                        >
                                          <Unlock className="w-3.5 h-3.5" />
                                          <span>Розблокувати</span>
                                        </button>
                                      ) : (
                                        <button
                                          onClick={() => handleToggleBlock(student.id, false)}
                                          className="px-4 py-2 border border-red-500/20 hover:border-red-500/40 text-red-400 hover:text-red-300 font-montserrat font-bold text-[10px] uppercase rounded-xl flex items-center space-x-1.5 bg-red-950/10 transition-all cursor-pointer"
                                          title="Заблокувати доступ до практикуму"
                                        >
                                          <Lock className="w-3.5 h-3.5" />
                                          <span>Заблокувати</span>
                                        </button>
                                      )}
                                      
                                      <button
                                        onClick={() => handleDeleteStudent(student.id, student.name)}
                                        className="px-4 py-2 border border-white/5 hover:border-red-500/40 hover:bg-red-500/10 text-gray-500 hover:text-red-400 rounded-xl transition-all cursor-pointer flex items-center space-x-1.5"
                                        title="Видалити користувача назавжди"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        <span>Видалити учня</span>
                                      </button>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DYNAMIC LESSON CONFIGURATIONS EDITOR */}
        {activeTab === 'lessons' && (
          <div className="space-y-8">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm">
              <h3 className="font-montserrat font-black uppercase text-base text-white flex items-center space-x-2">
                <Settings className="w-5 h-5 text-[#81D8D0]" />
                <span>Редагування Конфігурацій Навчальних Ефірів</span>
              </h3>
              <p className="text-xs text-gray-400 font-arimo mt-2 leading-relaxed">
                Тут ви можете миттєво змінювати назви, детальні описи, посилання на майнд-карти, конспекти, гугл-таблиці та відео з YouTube для будь-якого з 3-х уроків. Всі зміни відразу відобразяться в кабінетах студентів.
              </p>
            </div>

            {lessonsLoading ? (
              <div className="py-24 text-center">
                <div className="w-10 h-10 border-4 border-[#81D8D0] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-xs text-gray-500 font-narrow uppercase tracking-widest">Завантаження налаштувань...</p>
              </div>
            ) : (
              <div className="space-y-12">
                {lessons.map(lesson => (
                  <LessonFormCard 
                    key={lesson.lesson_id} 
                    lesson={lesson} 
                    saveStatus={lessonSaveStatus[lesson.lesson_id] || 'idle'}
                    onSave={handleSaveLessonConfig} 
                  />
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* DETAILED FEEDBACK REVIEW MODAL (TAB 1) */}
      <AnimatePresence>
        {selectedSub && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-[#1A0000] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-xl w-full relative shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#81D8D0]/5 rounded-full blur-2xl pointer-events-none"></div>

              <h3 className="font-montserrat font-black text-xl uppercase text-white mb-2">
                Рецензування Завдання
              </h3>
              <p className="text-xs text-[#81D8D0] font-narrow font-bold uppercase tracking-widest mb-6">
                Ефір {selectedSub.lessonId} • {selectedSub.userName}
              </p>

              <div className="space-y-6">
                {/* Clickable spreadsheet link card */}
                <div className="bg-black/35 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                  <div className="space-y-1 overflow-hidden pr-2">
                    <p className="text-[9px] text-gray-500 uppercase tracking-widest font-narrow">Посилання на виконане ДЗ:</p>
                    <a 
                      href={selectedSub.hwUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#81D8D0] font-arimo hover:underline truncate block max-w-full"
                    >
                      {selectedSub.hwUrl}
                    </a>
                  </div>
                  <a 
                    href={selectedSub.hwUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-[#81D8D0] hover:bg-[#97e3db] text-[#1A0000] flex items-center justify-center shadow-[0_0_10px_rgba(129,216,208,0.2)] flex-shrink-0"
                    title="Відкрити таблицю у новій вкладці"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                {/* Review Text comment */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#81D8D0] font-narrow">
                    Коментар / Поради для учня (Софія може написати що виправити)
                  </label>
                  <textarea
                    rows={5}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Чудова робота! Все заповнено абсолютно вірно, наступний ефір відкрито..."
                    className="w-full p-4 bg-black/50 border border-white/10 rounded-xl focus:border-[#81D8D0] focus:ring-1 focus:ring-[#81D8D0] outline-none text-xs text-white transition-all font-arimo placeholder-gray-700 resize-none"
                  ></textarea>
                </div>

                {/* Explicit Action Buttons */}
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      disabled={savingReview}
                      onClick={() => handleReviewAction('accepted')}
                      className="py-4 px-4 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-black font-montserrat font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center space-x-2 transition-all shadow-[0_4px_15px_rgba(34,197,94,0.3)] cursor-pointer"
                    >
                      <CheckCircle2 className="w-4.5 h-4.5" />
                      <span>Зарахувати та відкрити наступний</span>
                    </button>
                    
                    <button
                      type="button"
                      disabled={savingReview}
                      onClick={() => handleReviewAction('needs_improvement')}
                      className="py-4 px-4 border border-amber-500 hover:bg-amber-950/20 disabled:opacity-50 text-amber-400 font-montserrat font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center space-x-2 transition-all shadow-[0_4px_15px_rgba(245,158,11,0.1)] cursor-pointer"
                    >
                      <AlertTriangle className="w-4.5 h-4.5" />
                      <span>Відхилити (Потребує доопрацювання)</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedSub(null)}
                    className="w-full py-3.5 border border-white/10 hover:border-white/20 text-gray-400 hover:text-white font-montserrat font-bold text-xs uppercase rounded-xl transition-all block text-center bg-black/10 cursor-pointer"
                  >
                    Скасувати
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

// NESTED INDIVIDUAL FORM CARD COMPONENT FOR TAB 3
interface LessonFormCardProps {
  lesson: MinicourseLessonConfig;
  saveStatus: 'idle' | 'saving' | 'success' | 'error';
  onSave: (lessonId: number, configForm: Partial<MinicourseLessonConfig>) => Promise<void>;
}

function LessonFormCard({ lesson, saveStatus, onSave }: LessonFormCardProps) {
  const [title, setTitle] = useState(lesson.title);
  const [description, setDescription] = useState(lesson.description);
  const [youtubeId, setYoutubeId] = useState(lesson.youtube_id);
  const [mindmapUrl, setMindmapUrl] = useState(lesson.mindmap_url || '');
  const [hwSpreadsheetUrl, setHwSpreadsheetUrl] = useState(lesson.hw_spreadsheet_url || '');
  const [notionUrl, setNotionUrl] = useState(lesson.notion_url || '');
  const [hwInstructions, setHwInstructions] = useState(lesson.hw_instructions);
  const [bonusVideoTitle, setBonusVideoTitle] = useState(lesson.bonus_video_title || '');
  const [bonusVideoYoutubeId, setBonusVideoYoutubeId] = useState(lesson.bonus_video_youtube_id || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(lesson.lesson_id, {
      title: title.trim(),
      description: description.trim(),
      youtube_id: youtubeId.trim(),
      mindmap_url: mindmapUrl.trim() || undefined,
      hw_spreadsheet_url: hwSpreadsheetUrl.trim() || undefined,
      notion_url: notionUrl.trim() || undefined,
      hw_instructions: hwInstructions.trim(),
      bonus_video_title: bonusVideoTitle.trim() || undefined,
      bonus_video_youtube_id: bonusVideoYoutubeId.trim() || undefined
    });
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-sm space-y-6 relative overflow-hidden transition-all hover:border-white/15"
    >
      <div className="absolute top-0 right-0 p-6 font-bold text-5xl opacity-5 text-white select-none">
        0{lesson.lesson_id}
      </div>

      <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <span className="text-[10px] text-[#81D8D0] font-bold uppercase tracking-widest font-narrow">Навчальний Модуль</span>
          <h4 className="text-xl font-black text-white mt-0.5">Ефір {lesson.lesson_id}: {lesson.title}</h4>
        </div>
        
        <div className="text-xs font-narrow font-bold text-gray-500">
          Останнє оновлення: {new Date(lesson.updated_at).toLocaleDateString('uk-UA')}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left column fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 font-narrow">
              Назва ефіру *
            </label>
            <input 
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-[#81D8D0] focus:ring-1 focus:ring-[#81D8D0] outline-none text-xs font-arimo text-white transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 font-narrow">
              Короткий опис ефіру *
            </label>
            <input 
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-[#81D8D0] focus:ring-1 focus:ring-[#81D8D0] outline-none text-xs font-arimo text-white transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 font-narrow">
              YouTube Video ID (наприклад: SnyxALmvvnE) *
            </label>
            <input 
              type="text"
              required
              value={youtubeId}
              onChange={(e) => setYoutubeId(e.target.value)}
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-[#81D8D0] focus:ring-1 focus:ring-[#81D8D0] outline-none text-xs font-arimo text-white transition-all font-mono"
            />
            <p className="text-[9px] text-gray-500 mt-1 font-arimo">Тільки ідентифікатор відео після v= в посиланні YouTube</p>
          </div>
        </div>

        {/* Right column fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 font-narrow">
              Посилання на Майнд-карту MindMeister (необов'язково)
            </label>
            <input 
              type="url"
              value={mindmapUrl}
              onChange={(e) => setMindmapUrl(e.target.value)}
              placeholder="https://mm.tt/map/..."
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-[#81D8D0] focus:ring-1 focus:ring-[#81D8D0] outline-none text-xs font-arimo text-white transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 font-narrow">
              Посилання на Шаблон Google Таблиці для ДЗ (необов'язково)
            </label>
            <input 
              type="url"
              value={hwSpreadsheetUrl}
              onChange={(e) => setHwSpreadsheetUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/..."
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-[#81D8D0] focus:ring-1 focus:ring-[#81D8D0] outline-none text-xs font-arimo text-white transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 font-narrow">
              Посилання на Інструкції Notion (необов'язково)
            </label>
            <input 
              type="url"
              value={notionUrl}
              onChange={(e) => setNotionUrl(e.target.value)}
              placeholder="https://notion.site/..."
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-[#81D8D0] focus:ring-1 focus:ring-[#81D8D0] outline-none text-xs font-arimo text-white transition-all"
            />
          </div>
        </div>

      </div>

      {/* Bonus video fields section */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-4">
        <h5 className="text-xs font-bold text-[#81D8D0] uppercase tracking-wider font-narrow flex items-center gap-1.5">
          🎁 Бонусне відео до ефіру (необов&apos;язково)
        </h5>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 font-narrow">
              Назва бонусного відео
            </label>
            <input 
              type="text"
              value={bonusVideoTitle}
              onChange={(e) => setBonusVideoTitle(e.target.value)}
              placeholder="Покрокова інструкція, як придбати першу акцію"
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-[#81D8D0] focus:ring-1 focus:ring-[#81D8D0] outline-none text-xs font-arimo text-white transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 font-narrow">
              YouTube Video ID бонусного відео (наприклад: BB0EeSsSM4s)
            </label>
            <input 
              type="text"
              value={bonusVideoYoutubeId}
              onChange={(e) => setBonusVideoYoutubeId(e.target.value)}
              placeholder="BB0EeSsSM4s"
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-[#81D8D0] focus:ring-1 focus:ring-[#81D8D0] outline-none text-xs font-arimo text-white transition-all font-mono"
            />
          </div>
        </div>
      </div>

      {/* Instructions field */}
      <div className="space-y-2">
        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 font-narrow">
          Вказівки / Інструкція до домашнього завдання *
        </label>
        <textarea
          rows={6}
          required
          value={hwInstructions}
          onChange={(e) => setHwInstructions(e.target.value)}
          className="w-full p-4 bg-black/40 border border-white/10 rounded-xl focus:border-[#81D8D0] focus:ring-1 focus:ring-[#81D8D0] outline-none text-xs text-white transition-all font-mono"
        ></textarea>
        <p className="text-[9px] text-gray-500 font-arimo">Підтримується звичайний текст з переносом рядків</p>
      </div>

      {/* Save panel */}
      <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4">
        <div>
          {saveStatus === 'success' && (
            <span className="text-xs text-green-400 font-bold uppercase tracking-wider flex items-center space-x-1.5 font-narrow">
              <CheckCircle2 className="w-4 h-4" />
              <span>Зміни збережено в базу! 🎉</span>
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="text-xs text-red-400 font-bold uppercase tracking-wider flex items-center space-x-1.5 font-narrow">
              <AlertCircle className="w-4 h-4" />
              <span>Помилка збереження! ❌</span>
            </span>
          )}
          {saveStatus === 'saving' && (
            <span className="text-xs text-[#81D8D0] font-bold uppercase tracking-wider flex items-center space-x-1.5 font-narrow animate-pulse">
              <div className="w-3.5 h-3.5 border-2 border-[#81D8D0] border-t-transparent rounded-full animate-spin"></div>
              <span>Запис змін...</span>
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={saveStatus === 'saving'}
          className="px-6 py-3.5 bg-[#81D8D0] hover:bg-[#97e3db] text-[#1A0000] font-montserrat font-bold text-xs uppercase tracking-wider rounded-xl flex items-center space-x-2 transition-all shadow-[0_0_15px_rgba(129,216,208,0.2)] disabled:opacity-50 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Зберегти ефір {lesson.lesson_id}</span>
        </button>
      </div>
    </form>
  );
}
