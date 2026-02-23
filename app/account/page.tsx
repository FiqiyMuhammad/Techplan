"use client";

import * as React from "react";
import { 
  UserCircleIcon, 
  CreditCardIcon, 
  CircleStackIcon,
  ChevronRightIcon,
  PlusIcon,
  ArrowLeftIcon,
  ArrowUpTrayIcon,
  TrashIcon,
  EnvelopeIcon,
  ArrowLeftOnRectangleIcon,
  CheckBadgeIcon,
  FolderIcon,
  DocumentIcon
} from "@heroicons/react/24/outline";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import Link from "next/link";
import { updateProfile } from "@/lib/actions/user-actions";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner"; // Assuming sonner is available or similar toast

interface ExtendedUser {
  id: string;
  name: string;
  email: string;
  firstName?: string;
  lastName?: string;
  image?: string;
  emailVerified?: boolean;
}

export default function AccountSettingsPage() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [image, setImage] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (session?.user) {
      const user = session.user as ExtendedUser;
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setImage(user.image || "");
    }
  }, [session]);

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
      
      try {
        await authClient.updateUser({
          image: base64String
        });
        toast.success("Profile picture updated");
      } catch (error) {
        toast.error("Failed to update profile picture");
        console.error(error);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      if (!session?.user?.id) return;
      
      const result = await updateProfile(session.user.id, {
        firstName,
        lastName,
      });
      
      if (result.success) {
        toast.success("Profile updated successfully");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update profile");
      }
    } catch (error) {
      toast.error("Failed to update profile");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/");
  };

  if (isPending) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!session) {
    router.push("/sign-in");
    return null;
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 transition-colors duration-300 font-geist">
        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleImageChange} 
        />
        
        {/* Compact Header */}
        <header className="py-4 border-b border-gray-100 dark:border-gray-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-slate-100 [mask-image:radial-gradient(ellipse_at_center,black,transparent)] opacity-40 dark:opacity-10" />
          
          <div className="max-w-6xl mx-auto px-8 flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div className="flex flex-col">
              <h1 className="text-2xl font-semibold font-aspekta tracking-tighter text-black dark:text-white leading-tight">
                Account Settings
              </h1>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 font-medium italic">
                Manage your personal information and preferences.
              </p>
            </div>

            <Link 
              href="/dashboard" 
              className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black dark:hover:text-white transition-all group px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm"
            >
              <ArrowLeftIcon className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Back to Dashboard
            </Link>
          </div>
        </header>

        <main className="max-w-6xl mx-auto py-4 px-8">
          <Tabs defaultValue="account" orientation="vertical" className="flex flex-col md:flex-row gap-5 lg:gap-8">
            {/* Professional Sidebar Tabs List - Larger Size */}
            <TabsList className="bg-transparent h-fit w-full md:w-64 lg:w-72 flex flex-col items-start gap-1 p-0 sticky top-24">
               <TabsTrigger 
                 value="account" 
                 className="w-full justify-start gap-4 px-4 py-3 rounded-xl font-medium text-lg data-[state=active]:bg-gray-900 dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black data-[state=active]:shadow-lg transition-all group"
               >
                  <UserCircleIcon className="w-10 h-10 opacity-40 group-data-[state=active]:opacity-100" />
                  Account
               </TabsTrigger>
               <TabsTrigger 
                 value="plans" 
                 className="w-full justify-start gap-4 px-4 py-3 rounded-xl font-medium text-lg data-[state=active]:bg-gray-900 dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black data-[state=active]:shadow-lg transition-all group"
               >
                  <CreditCardIcon className="w-10 h-10 opacity-40 group-data-[state=active]:opacity-100" />
                  Plans
               </TabsTrigger>
               <TabsTrigger 
                 value="data" 
                 className="w-full justify-start gap-4 px-4 py-3 rounded-xl font-medium text-lg data-[state=active]:bg-gray-900 dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black data-[state=active]:shadow-lg transition-all group"
               >
                  <CircleStackIcon className="w-10 h-10 opacity-40 group-data-[state=active]:opacity-100" />
                  Data
               </TabsTrigger>
            </TabsList>

            <div className="flex-1 space-y-4">
                {/* Account Settings Tab */}
                <TabsContent value="account" className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {/* Personal Information */}
                    <Card className="border-gray-100 dark:border-gray-800/80 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-gray-900">
                        <CardHeader className="p-5 pb-1">
                            <CardTitle className="text-xl font-semibold font-aspekta tracking-tight">Personal Information</CardTitle>
                            <CardDescription className="text-sm text-gray-400 font-medium">Update your personal details and public profile.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-5 pt-3 space-y-5">
                            <div className="flex items-center gap-5">
                                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                    <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden flex items-center justify-center text-xl font-bold text-gray-300">
                                        {image ? (
                                            <img src={image} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            firstName ? firstName[0] : (session.user.name ? session.user.name[0] : "U")
                                        )}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gray-900 dark:bg-white rounded-full flex items-center justify-center text-white dark:text-black shadow-lg hover:scale-110 transition-transform">
                                        <ArrowUpTrayIcon className="w-4 h-4" />
                                    </div>
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-base font-medium text-gray-900 dark:text-white">Profile Photo</p>
                                    <p className="text-xs text-gray-400 font-medium italic">Click the icon to update your avatar.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-500 tracking-tight">First name</label>
                                    <Input 
                                      value={firstName} 
                                      onChange={(e) => setFirstName(e.target.value)}
                                      className="h-11 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 border-gray-100 dark:border-gray-800 font-medium px-4 focus:ring-0 transition-all shadow-sm" 
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-500 tracking-tight">Last name</label>
                                    <Input 
                                      value={lastName} 
                                      onChange={(e) => setLastName(e.target.value)}
                                      className="h-11 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 border-gray-100 dark:border-gray-800 font-medium px-4 focus:ring-0 transition-all shadow-sm" 
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button 
                                  onClick={handleSaveChanges}
                                  disabled={isSaving}
                                  className="bg-gray-900 dark:bg-white text-white dark:text-black font-semibold h-11 px-8 rounded-xl shadow-md hover:opacity-90 transition-all"
                                >
                                    {isSaving ? "Saving..." : "Save Changes"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Email Addresses */}
                    <Card className="border-gray-100 dark:border-gray-800/80 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-gray-900">
                        <CardHeader className="p-5 pb-1">
                            <CardTitle className="text-xl font-semibold font-aspekta tracking-tight">Email Addresses</CardTitle>
                            <CardDescription className="text-sm text-gray-400 font-medium">Manage your associated email addresses.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-5 pt-3 space-y-3">
                            <div className="p-4 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 flex items-center justify-between shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 flex items-center justify-center text-gray-400 shadow-sm">
                                        <EnvelopeIcon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-base font-medium text-gray-900 dark:text-white">{session.user.email}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <Badge className="px-2 py-0.5 text-[11px] font-semibold bg-gray-900/10 dark:bg-white/10 text-gray-900 dark:text-white">Primary</Badge>
                                            {session.user.emailVerified && (
                                              <Badge className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 flex items-center gap-1">
                                                  <CheckBadgeIcon className="w-3.5 h-3.5" />
                                                  Verified
                                              </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <Button variant="outline" className="w-full h-11 border-dashed border-2 border-gray-100 dark:border-gray-800 text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium gap-2 rounded-xl transition-all text-sm">
                                <PlusIcon className="w-4 h-4" />
                                Add email address
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Password */}
                    <Card className="border-gray-100 dark:border-gray-800/80 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-gray-900">
                        <CardHeader className="p-5 pb-1">
                            <CardTitle className="text-xl font-semibold font-aspekta tracking-tight">Security</CardTitle>
                            <CardDescription className="text-sm text-gray-400 font-medium">Update your password to keep your account safe.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-5 pt-3 space-y-3">
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-500 tracking-tight">Current password</label>
                                    <PasswordInput placeholder="********" className="h-11 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 border-gray-100 dark:border-gray-800 font-medium px-4 shadow-sm" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-500 tracking-tight">New password</label>
                                        <PasswordInput placeholder="********" className="h-11 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 border-gray-100 dark:border-gray-800 font-medium px-4 shadow-sm" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-500 tracking-tight">Confirm password</label>
                                        <PasswordInput placeholder="********" className="h-11 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 border-gray-100 dark:border-gray-800 font-medium px-4 shadow-sm" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5 mt-2">
                                <input type="checkbox" id="sign-out-all" className="w-4 h-4 rounded border-gray-200 dark:border-gray-800 text-black dark:text-white accent-black dark:accent-white" />
                                <label htmlFor="sign-out-all" className="text-[13px] font-medium text-gray-500 dark:text-gray-400 cursor-pointer">Sign out of all other devices</label>
                            </div>
                            <div className="flex justify-end">
                                <Button className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black font-semibold h-11 px-8 rounded-xl transition-all text-sm">
                                    Update password
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sign Out */}
                    <Card className="border-red-100/50 dark:border-red-900/20 bg-red-50/30 dark:bg-red-900/5 rounded-xl overflow-hidden shadow-sm">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="space-y-0.5">
                                <h3 className="text-lg font-semibold text-red-600 dark:text-rose-500 font-aspekta tracking-tight">Sign Out</h3>
                                <p className="text-xs text-red-500/60 dark:text-rose-500/50 font-medium italic">Sign out of your account on this device</p>
                            </div>
                            <Button onClick={handleSignOut} className="bg-red-600 hover:bg-red-700 text-white font-semibold h-10 px-6 rounded-xl gap-2 shadow-md transition-all text-sm">
                                <ArrowLeftOnRectangleIcon className="w-4 h-4" />
                                Logout
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Subscription Plans Tab */}
                <TabsContent value="plans" className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <Card className="border-gray-100 dark:border-gray-800 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-gray-900">
                        <CardHeader className="p-5 pb-1">
                            <CardTitle className="text-xl font-semibold font-aspekta tracking-tight">Usage Statistics</CardTitle>
                            <CardDescription className="text-sm text-gray-400 font-medium">Manage your billing and subscription plans</CardDescription>
                        </CardHeader>
                        <CardContent className="p-5 pt-3 grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* Overall Usage Chart */}
                            <div className="bg-gray-50/50 dark:bg-gray-800/20 p-5 rounded-xl border border-gray-100 dark:border-gray-800 flex flex-col items-center text-center">
                                <h4 className="text-xs font-semibold text-gray-400 tracking-wider mb-4">Overall usage</h4>
                                <div className="relative w-32 h-32 flex items-center justify-center">
                                    <svg className="w-full h-full -rotate-90">
                                        <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-gray-200 dark:text-gray-800" />
                                        <circle cx="64" cy="64" r="56" stroke="#365B80" strokeWidth="10" fill="transparent" strokeDasharray="352" strokeDashoffset={352 - (352 * 12.5) / 100} strokeLinecap="round" />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-3xl font-semibold text-gray-900 dark:text-white leading-none">15</span>
                                        <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 mt-1 tracking-tight">/ 120</span>
                                    </div>
                                </div>
                                <div className="mt-4 space-y-0.5">
                                    <p className="text-xs font-medium text-gray-900 dark:text-white">12.5% used</p>
                                    <div className="flex gap-2 items-center justify-center text-[10px] font-medium text-gray-400">
                                        <span>28 Days left</span>
                                        <span>•</span>
                                        <span>105 Remaining</span>
                                    </div>
                                </div>
                            </div>

                            {/* Usage Breakdown */}
                            <div className="bg-gray-50/50 dark:bg-gray-800/20 p-5 rounded-xl border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center">
                                <h4 className="text-xs font-semibold text-gray-400 tracking-wider mb-4">Breakdown</h4>
                                <div className="w-full space-y-4">
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between items-center text-[11px] font-medium">
                                            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-gray-900 dark:bg-white" /> Docs generation</span>
                                            <span className="text-gray-400">15 (12.5%)</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                                            <div className="h-full bg-gray-900 dark:bg-white w-[12.5%]" />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between items-center text-[11px] font-medium">
                                            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600" /> Softwarev2</span>
                                            <span className="text-gray-400">0 (0%)</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                                            <div className="h-full bg-gray-300 dark:bg-white/20 w-0" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Current Plan Card */}
                    <Card className="border-gray-100 dark:border-gray-800 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-gray-900">
                        <CardContent className="p-4">
                            <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4 bg-gray-50/30 dark:bg-gray-800/10 shadow-sm">
                                <div className="text-center md:text-left flex flex-col items-center md:items-start">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white font-aspekta">Free tier</h3>
                                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 font-semibold px-2 py-0.5 text-[11px]">Active</Badge>
                                    </div>
                                    <p className="text-xs font-medium text-gray-400 max-w-sm italic">
                                        Upgrade to Pro to unlock unlimited tasks and premium features.
                                    </p>
                                </div>
                                <Button className="h-10 px-6 rounded-xl bg-[#365B80] hover:bg-[#2d4d6d] text-white font-semibold shadow-md transition-all group text-sm border-none">
                                    Upgrade to Pro
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Data Usage Tab */}
                <TabsContent value="data" className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <Card className="border-gray-100 dark:border-gray-800 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-gray-900">
                        <CardHeader className="p-4 pb-0 text-center">
                            <CardTitle className="text-xl font-semibold font-aspekta tracking-tighter">Cloud Storage</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            <div className="p-5 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 relative overflow-hidden group flex flex-col items-center shadow-sm">
                                <div className="absolute top-3 right-3 p-1.5 rounded-lg bg-white dark:bg-gray-700 text-gray-400 shadow-sm transition-transform group-hover:scale-110">
                                    <FolderIcon className="w-4 h-4" />
                                </div>
                                <h4 className="text-[11px] font-semibold text-gray-400 tracking-wider mb-2">Projects</h4>
                                <span className="text-5xl font-semibold text-gray-900 dark:text-white tracking-tighter">1</span>
                                <Link href="/dashboard/analytics" className="mt-5 flex items-center justify-center gap-2 text-[11px] font-semibold text-gray-900 dark:text-white hover:opacity-70 transition-all uppercase tracking-tight">
                                    Explore <ChevronRightIcon className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </div>
                            <div className="p-5 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 relative overflow-hidden group flex flex-col items-center shadow-sm">
                                <div className="absolute top-3 right-3 p-1.5 rounded-lg bg-white dark:bg-gray-700 text-gray-400 shadow-sm transition-transform group-hover:scale-110">
                                    <DocumentIcon className="w-4 h-4" />
                                </div>
                                <h4 className="text-[11px] font-semibold text-gray-400 tracking-wider mb-2">Documents</h4>
                                <span className="text-5xl font-semibold text-gray-900 dark:text-white tracking-tighter">1</span>
                                <p className="mt-6 text-[11px] font-semibold text-gray-400 opacity-60">Synced</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-gray-100 dark:border-gray-800/80 shadow-sm rounded-xl overflow-hidden p-4 space-y-3 bg-white dark:bg-gray-900">
                        <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center justify-between gap-4 bg-gray-50/30 dark:bg-gray-800/10 group shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-white dark:bg-gray-700 text-gray-400 flex items-center justify-center shadow-sm border border-gray-100 dark:border-gray-600">
                                    <ArrowUpTrayIcon className="w-5 h-5 rotate-180" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white font-aspekta">Download ZIP</h4>
                                    <p className="text-xs font-medium text-gray-400 mt-0.5 italic">Export all projects as a ZIP file.</p>
                                </div>
                            </div>
                            <Button variant="outline" className="h-9 px-4 rounded-lg font-medium border-gray-200 dark:border-gray-700 gap-2 hover:bg-gray-900 hover:text-white transition-all text-xs">
                                Export
                            </Button>
                        </div>
                        
                        <div className="p-4 rounded-xl border border-red-100/50 dark:border-red-900/20 flex items-center justify-between gap-4 bg-red-50/20 dark:bg-red-900/5 group shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-white dark:bg-red-900/20 text-red-500 flex items-center justify-center shadow-sm border border-red-100 dark:border-red-900/20">
                                    <TrashIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-red-600 dark:text-rose-500 font-aspekta">Clear Cloud</h4>
                                    <p className="text-xs font-medium text-red-400 mt-0.5 italic">Permanently delete documents.</p>
                                </div>
                            </div>
                            <Button className="h-9 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium gap-2 shadow-md transition-all text-xs">
                                Delete
                            </Button>
                        </div>
                    </Card>
                </TabsContent>
            </div>
          </Tabs>
        </main>
      </div>
    </ThemeProvider>
  );
}
