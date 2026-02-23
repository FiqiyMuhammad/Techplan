"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { getUsageStats, updateProfile, deleteAllUserData } from "@/lib/actions/user-actions";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  UserIcon, 
  CameraIcon, 
  MailIcon, 
  Settings2Icon, 
  DownloadIcon,
  Trash2Icon,
  FolderIcon,
  FileTextIcon,
  TrendingUpIcon,
  CodeIcon,
  BookOpenIcon,
  SparklesIcon,
  Loader2
} from "lucide-react";
import Image from "next/image";
import ConfirmModal from "@/components/elements/ConfirmModal";

interface ExtendedUser {
  id: string;
  name: string;
  email: string;
  firstName?: string;
  lastName?: string;
  image?: string;
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="p-6 flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
      <SettingsContent />
    </Suspense>
  );
}

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabParam || "user-setting");
  const { data: session, isPending } = authClient.useSession();
  const [isUpdating, setIsUpdating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  
  // Local state for form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [image, setImage] = useState("");
  const [stats, setStats] = useState<{ 
    projects: number; 
    documents: number; 
    subscription: {
      plan: string;
      creditsTotal: number;
      creditsUsed: number;
      expiresAt: Date | null;
    };
    recentWorkflows?: { id: string; title: string; type: string; createdAt: Date }[];
    recentDocuments?: { id: string; title: string; type: string; createdAt: Date }[];
    recentScripts?: { id: string; title: string; type: string; createdAt: Date }[];
  } | null>(null);

  // Fetch usage stats
  useEffect(() => {
    if (session?.user?.id) {
      getUsageStats().then(res => {
        if (res.success && res.data) {
          setStats(res.data as typeof stats);
        }
      });
    }
  }, [session?.user?.id]);

  // Sync tab with URL param
  useEffect(() => {
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabParam]);

  // Sync session data to local state once loaded
  useEffect(() => {
    if (session?.user) {
      const user = session.user as ExtendedUser;
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setImage(user.image || "");
    }
  }, [session?.user]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;
    
    setIsUpdating(true);
    try {
      // Prioritize server action for database persistence
      const res = await updateProfile(session.user.id, {
        firstName,
        lastName,
        image,
      });

      if (res.success) {
        // Force client-side session update
        await authClient.getSession();
        toast.success("Profile updated successfully, please refresh page");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update profile");
      }
    } catch (error) {
      toast.error("Failed to update profile");
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size must be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      setImage(base64String);
      
      if (!session?.user?.id) return;

      try {
        setIsUpdating(true);
        const res = await updateProfile(session.user.id, {
          image: base64String,
        });
        
        if (res.success) {
          // Force client-side session update
          await authClient.getSession();
          toast.success("Profile picture updated");
          router.refresh();
        } else {
          toast.error(res.error || "Failed to update profile picture");
        }
      } catch (error) {
        toast.error("Failed to update profile picture");
        console.error(error);
      } finally {
        setIsUpdating(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteAllData = async () => {
    setIsDeletingAll(true);
    try {
      const res = await deleteAllUserData();
      if (res.success) {
        toast.success("All data has been permanently deleted");
        
        // Refresh local stats
        getUsageStats().then(res => {
          if (res.success && res.data) {
            setStats(res.data as typeof stats);
          }
        });
        
        setShowDeleteConfirm(false);
      } else {
        toast.error(res.error || "Failed to delete data");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error(error);
    } finally {
      setIsDeletingAll(false);
    }
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleImageChange} 
      />
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white font-aspekta">Account Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium font-geist">Manage your account preferences, data, and subscriptions.</p>
      </div>

      <Tabs 
        value={activeTab} 
        onValueChange={(value) => {
          setActiveTab(value);
          router.push(`/dashboard/settings?tab=${value}`, { scroll: false });
        }} 
        className="w-full"
      >
        <div className="flex justify-center mb-10 md:mb-16">
            <TabsList className="bg-gray-100/80 dark:bg-gray-800/50 p-1.5 md:p-2 rounded-[22px] w-full md:w-fit flex md:inline-flex gap-1.5 md:gap-2 h-auto border-none shadow-none md:scale-110 overflow-x-auto no-scrollbar">
              <TabsTrigger 
                value="user-setting" 
                className="rounded-[18px] px-4 md:px-12 py-2.5 md:py-3.5 text-[13px] md:text-base font-bold transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=active]:shadow-xl border-none text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 whitespace-nowrap"
              >
                User Setting
              </TabsTrigger>
              <TabsTrigger 
                value="data-usage" 
                className="rounded-[18px] px-4 md:px-12 py-2.5 md:py-3.5 text-[13px] md:text-base font-bold transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=active]:shadow-xl border-none text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 whitespace-nowrap"
              >
                Files setting
              </TabsTrigger>
              <TabsTrigger 
                value="subscription" 
                className="rounded-[18px] px-4 md:px-12 py-2.5 md:py-3.5 text-[13px] md:text-base font-bold transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=active]:shadow-xl border-none text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 whitespace-nowrap"
              >
                Subscription
              </TabsTrigger>
            </TabsList>
        </div>

        {/* Tab 1: User Setting */}
        <TabsContent value="user-setting" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-6">
              <Card className="border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-white">
                    <UserIcon className="w-5 h-5 text-blue-600" />
                    Profile Picture
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                  <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <div className="w-32 h-32 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 overflow-hidden relative transition-all group-hover:border-blue-500">
                      {image ? (
                        <Image src={image} alt="Profile" fill className="object-cover" />
                      ) : (
                        <UserIcon className="w-12 h-12 text-gray-400" />
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <CameraIcon className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400 max-w-[200px]">Click to upload a new photo. Max size 2MB.</p>
                  </div>
                </CardContent>
              </Card>


            </div>

            <div className="md:col-span-2 space-y-6">
              <Card className="border-gray-200 dark:border-gray-800 shadow-sm bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <Settings2Icon className="w-5 h-5 text-blue-600" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>Update your personal details here.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdate} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input 
                          id="firstName" 
                          value={firstName} 
                          onChange={(e) => setFirstName(e.target.value)}
                          className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input 
                          id="lastName" 
                          value={lastName} 
                          onChange={(e) => setLastName(e.target.value)}
                          className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800"
                        />
                      </div>
                    </div>



                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <MailIcon className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <Input 
                          id="email" 
                          type="email" 
                          value={session?.user?.email || ""} 
                          disabled 
                          className="pl-10 bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-400 opacity-70 cursor-not-allowed"
                        />
                      </div>
                      <p className="text-[10px] text-gray-400 italic">Email cannot be changed currently.</p>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <Button type="submit" disabled={isUpdating} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 shadow-lg shadow-blue-500/20">
                        {isUpdating ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <PasswordForm />
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Data Usage */}
        <TabsContent value="data-usage" className="mt-0 space-y-8">
          <div className="text-center space-y-1 mb-8">
             <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-aspekta">Files setting</h2>
             <p className="text-gray-500 dark:text-gray-400 font-medium">View your usage statistics and data limits</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <Card className="border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900">
                <CardContent className="p-8">
                    <div className="flex justify-between items-start">
                        <div className="space-y-2">
                            <p className="text-base font-semibold text-gray-400">Total Projects</p>
                            <h3 className="text-6xl font-bold text-gray-900 dark:text-white">{stats?.projects || 0}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center">
                            <FolderIcon className="w-6 h-6" />
                        </div>
                    </div>

                </CardContent>
             </Card>

             <Card className="border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900">
                <CardContent className="p-8">
                    <div className="flex justify-between items-start">
                        <div className="space-y-2">
                            <p className="text-base font-semibold text-gray-400">Total Documents</p>
                            <h3 className="text-6xl font-bold text-gray-900 dark:text-white">{stats?.documents || 0}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center">
                            <FileTextIcon className="w-6 h-6" />
                        </div>
                    </div>

                </CardContent>
             </Card>
          </div>

          <div className="space-y-6">
             <Card className="border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900 overflow-hidden">
                <CardHeader className="pb-2 border-b border-gray-50 dark:border-gray-800">
                    <CardTitle className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <FolderIcon className="w-5 h-5 text-blue-600" />
                        Files Summary
                    </CardTitle>
                    <CardDescription>Recent projects and documents created on your account.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {!stats?.recentWorkflows?.length && !stats?.recentDocuments?.length && !stats?.recentScripts?.length ? (
                        <div className="py-20 flex flex-col items-center justify-center text-center">
                           <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center mb-4 border border-gray-100 dark:border-gray-800 shadow-sm">
                              <FolderIcon className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                           </div>
                           <p className="text-sm font-bold text-gray-400 dark:text-gray-500 tracking-tight">No files created yet</p>
                           <p className="text-xs text-gray-300 dark:text-gray-600 mt-1 italic font-medium">Your collection is currently empty.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50 dark:divide-gray-800 max-h-[400px] overflow-y-auto custom-scrollbar">
                            {[...(stats?.recentWorkflows || []), ...(stats?.recentDocuments || []), ...(stats?.recentScripts || [])]
                                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                .map((item) => (
                                <div key={item.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-default group">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                            item.type === 'workflow' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600' : 
                                            item.type === 'script' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' :
                                            'bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                                        }`}>
                                            {item.type === 'workflow' ? <SparklesIcon className="w-5 h-5" /> : 
                                             item.type === 'script' ? <CodeIcon className="w-5 h-5" /> :
                                             <BookOpenIcon className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">{item.title}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">{item.type} • {format(new Date(item.createdAt), "MMM d, yyyy")}</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-gray-300 group-hover:text-blue-600">
                                        View Details
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
             </Card>



              <Card className="border-red-100 dark:border-red-900/20 shadow-sm bg-red-50/10 dark:bg-red-900/5">
                <CardContent className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/20 text-red-600 flex items-center justify-center">
                            <Trash2Icon className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-bold text-red-600">Delete All Data</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium font-geist">Permanently delete all your projects and documents</p>
                        </div>
                    </div>
                    <Button 
                      variant="destructive" 
                      className="rounded-lg font-bold gap-2 bg-red-500 hover:bg-red-600"
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                        <Trash2Icon className="w-4 h-4" /> Delete All
                    </Button>
                </CardContent>
             </Card>

             <ConfirmModal 
                isOpen={showDeleteConfirm} 
                onClose={() => setShowDeleteConfirm(false)} 
                onConfirm={handleDeleteAllData}
                title="Are you sure?"
                description="This action is permanent and will delete all your projects, documents, brainstorms, and scripts. You cannot undo this."
                confirmText={isDeletingAll ? "Deleting..." : "Yes, Delete All Files"}
                cancelText="No, Keep My Data"
             />
          </div>
        </TabsContent>

        {/* Tab 3: Subscription */}
        <TabsContent value="subscription" className="mt-0 space-y-8">
           <div className="text-center space-y-1 mb-8">
             <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-aspekta">Subscription Plans</h2>
             <p className="text-gray-500 dark:text-gray-400 font-medium">Manage your billing and subscription plans</p>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Credits Usage</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               {/* Overall Usage Doughnut */}
               <Card className="border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900">
                  <CardContent className="p-8 flex flex-col items-center">
                      <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-8">Overall Usage</h4>
                      
                      <div className="relative w-48 h-48 flex items-center justify-center mb-8">
                         <svg className="w-full h-full -rotate-90">
                            <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="16" fill="transparent" className="text-gray-100 dark:text-gray-800" />
                            <circle 
                              cx="96" 
                              cy="96" 
                              r="80" 
                              stroke="#365B80" 
                              strokeWidth="16" 
                              fill="transparent" 
                              strokeDasharray="502.6" 
                              strokeDashoffset={502.6 - (502.6 * (stats?.subscription?.creditsUsed || 0)) / (stats?.subscription?.creditsTotal || 100)} 
                              strokeLinecap="round" 
                              className="transition-all duration-1000 ease-in-out" 
                            />
                         </svg>
                         <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-5xl font-bold text-gray-900 dark:text-white leading-none">{stats?.subscription?.creditsUsed || 0}</span>
                            <span className="text-sm font-bold text-gray-400 dark:text-gray-500 mt-2">/ {stats?.subscription?.creditsTotal || 100}</span>
                         </div>
                      </div>

                      <div className="text-center space-y-1">
                         <p className="text-sm font-bold text-gray-900 dark:text-white">
                            {((stats?.subscription?.creditsUsed || 0) / (stats?.subscription?.creditsTotal || 100) * 100).toFixed(1)}% of monthly limit used
                         </p>
                         <div className="flex gap-4 items-center justify-center text-xs font-bold text-gray-400 uppercase tracking-tighter">
                            <span>Credits remaining: {(stats?.subscription?.creditsTotal || 100) - (stats?.subscription?.creditsUsed || 0)}</span>
                         </div>
                      </div>
                  </CardContent>
               </Card>

               {/* Usage Breakdown Bar */}
               <Card className="border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900">
                  <CardContent className="p-8">
                      <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">Usage Breakdown</h4>
                      <p className="text-xs text-gray-400 font-bold mb-12 text-center uppercase tracking-widest">Docs Generation vs Softwarev2</p>
                      
                      <div className="flex flex-col items-center justify-center py-12">
                         <div className="relative w-40 h-40 flex items-center justify-center">
                            <div className="absolute inset-0 border-[12px] border-gray-100 dark:border-gray-800 rounded-full" />
                            <div className="absolute inset-[30px] border-[12px] border-gray-100 dark:border-gray-800 rounded-full" />
                            <div className="text-center">
                               <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.subscription?.creditsUsed || 0}</p>
                               <p className="text-[10px] text-gray-400 font-bold uppercase">credits</p>
                            </div>
                         </div>
                      </div>

                      <div className="space-y-4">
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                               <div className="w-3 h-3 rounded-full bg-blue-600" />
                               <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Docs Generation</span>
                               <span className="text-[10px] text-gray-400 font-bold">ⓘ</span>
                            </div>
                            <span className="text-sm font-bold text-gray-500">0 (0%)</span>
                         </div>
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                               <div className="w-3 h-3 rounded-full bg-amber-500" />
                               <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Softwarev2 Usage</span>
                               <span className="text-[10px] text-gray-400 font-bold">ⓘ</span>
                            </div>
                            <span className="text-sm font-bold text-gray-500">0 (0%)</span>
                         </div>
                      </div>
                  </CardContent>
               </Card>
            </div>

            <Card className="border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-950 overflow-hidden">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold text-blue-600 flex items-center gap-2">
                        <TrendingUpIcon className="w-4 h-4" /> Usage Limits
                    </CardTitle>
                    <CardDescription className="text-xs font-semibold uppercase tracking-widest">Track your usage of free tier resources.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pb-8">
                    <div className="space-y-3">
                        <div className="flex justify-between items-end">
                            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Free Tier Projects</p>
                            {stats?.projects && stats.projects >= 1 ? (
                              <span className="px-3 py-1 bg-red-500 text-white text-[10px] font-black rounded-lg uppercase">Limit Reached</span>
                            ) : (
                              <span className="px-3 py-1 bg-green-500 text-white text-[10px] font-black rounded-lg uppercase">Available</span>
                            )}
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between text-[11px] font-bold text-gray-400">
                                <span>{stats?.projects || 0} of 1 projects used</span>
                                <span>{((stats?.projects || 0) / 1 * 100).toFixed(0)}%</span>
                            </div>
                            <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${Math.min(((stats?.projects || 0) / 1 * 100), 100)}%` }} />
                            </div>
                        </div>
                    </div>
                    
                    {stats?.projects && stats.projects >= 1 && (
                      <div className="p-4 bg-red-50/50 dark:bg-red-900/5 border border-red-100 dark:border-red-900/20 rounded-xl text-center">
                          <p className="text-xs font-bold text-red-600">
                             Lifetime project limit reached. <span className="text-blue-600 cursor-pointer underline">Upgrade to Premium</span> to unlock unlimited projects.
                          </p>
                      </div>
                    )}
                </CardContent>
            </Card>

            <div className="space-y-4 pt-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Current Plan</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Manage your subscription plan and billing details.</p>
                <Card className="border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900 relative overflow-hidden">
                    {/* Subtle BG Pattern */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
                    
                    <CardContent className="p-8 flex flex-col sm:flex-row items-center justify-between gap-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <h4 className="text-3xl font-black text-gray-900 dark:text-white">Free Plan</h4>
                                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs font-bold rounded-full">Active</span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md font-medium font-geist">
                                You are currently on the free tier. Upgrade to the Pro plan to unlock unlimited codespace tasks and premium features.
                            </p>
                        </div>
                        <Button className="h-10 px-6 bg-[#365B80] hover:bg-[#2d4d6d] text-white font-semibold text-sm rounded-xl shadow-lg shrink-0 border-none">
                           Upgrade to Pro
                        </Button>
                    </CardContent>
                </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [revokeSessions, setRevokeSessions] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsUpdating(true);
    await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: revokeSessions,
    }, {
      onSuccess: () => {
        toast.success("Password updated successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setIsUpdating(false);
      },
      onError: (ctx) => {
        toast.error(ctx.error.message || "Failed to update password");
        setIsUpdating(false);
      }
    });
  };

  return (
    <Card className="border-gray-200 dark:border-gray-800 shadow-sm bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm overflow-hidden">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Password</CardTitle>
        <CardDescription>Ensure your account is secure by setting a strong password.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handlePasswordChange} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input 
              id="currentPassword" 
              type="password" 
              placeholder="********"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 shadow-none border-gray-100"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input 
                id="newPassword" 
                type="password" 
                placeholder="********"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 shadow-none border-gray-100"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input 
                id="confirmPassword" 
                type="password" 
                placeholder="********"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 shadow-none border-gray-100"
                required
              />
            </div>
          </div>

          <div className="flex items-center space-x-3 py-2">
            <div className="relative flex items-center">
              <input 
                type="checkbox" 
                id="revoke" 
                checked={revokeSessions}
                onChange={(e) => setRevokeSessions(e.target.checked)}
                className="w-5 h-5 rounded-md border-gray-200 bg-white dark:bg-gray-800 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer accent-blue-600"
              />
            </div>
            <Label htmlFor="revoke" className="text-sm font-semibold text-gray-600 dark:text-gray-400 cursor-pointer">
              Sign out of all other devices
            </Label>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isUpdating} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 shadow-lg shadow-blue-500/20 h-10">
              {isUpdating ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
