import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { BookOpen } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Redirect, Link } from "wouter";
import { z } from "zod";

// Dynamic schema based on language
const createSchemas = (t: (key: string) => string) => {
  const loginSchema = z.object({
    username: z.string().min(1, t("error.required")),
    password: z.string().min(1, t("error.required")),
  });

  const registerSchema = insertUserSchema
    .extend({
      confirmPassword: z.string().min(1, t("error.required")),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("error.password.match"),
      path: ["confirmPassword"],
    });
    
  return { loginSchema, registerSchema };
};

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  // Create dynamic schemas based on current language
  const schemas = createSchemas(t);
  
  type LoginFormValues = z.infer<typeof schemas.loginSchema>;
  type RegisterFormValues = z.infer<typeof schemas.registerSchema>;

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(schemas.loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(schemas.registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      name: "",
      email: "",
      role: "reader",
    },
  });

  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterFormValues) => {
    // Remove confirmPassword field before submitting
    const { confirmPassword, ...registerData } = data;
    registerMutation.mutate(registerData);
  };

  // Redirect if already logged in
  if (user) {
    return <Redirect to="/dashboard" />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Left column - Forms */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">МояБиблиотека</CardTitle>
              <div className="absolute top-4 right-4">
                <LanguageSwitcher />
              </div>
            </div>
            <CardDescription>
              {t('auth.login.subtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              defaultValue="login"
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as "login" | "register")}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">{t('auth.login.title')}</TabsTrigger>
                <TabsTrigger value="register">{t('auth.register.title')}</TabsTrigger>
              </TabsList>

              {/* Login Form */}
              <TabsContent value="login">
                <Form {...loginForm}>
                  <form
                    onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('auth.username')}</FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t('auth.username.placeholder')}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('auth.password')}</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder={t('auth.password.placeholder')}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? t('auth.login.button') + "..." : t('auth.login.button')}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              {/* Register Form */}
              <TabsContent value="register">
                <Form {...registerForm}>
                  <form
                    onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={registerForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('auth.name')}</FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t('auth.name.placeholder')}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('auth.email')}</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder={t('auth.email.placeholder')}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('auth.username')}</FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t('auth.username.placeholder')}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('auth.password')}</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder={t('auth.password.placeholder')}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('auth.password') + " " + t('auth.password.confirm')}</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder={t('auth.password.confirm.placeholder')}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={registerForm.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('auth.role')}</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t('auth.role.select')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="reader">{t('auth.role.reader')}</SelectItem>
                              <SelectItem value="librarian">
                                {t('auth.role.librarian')}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending
                        ? t('auth.register.button') + "..."
                        : t('auth.register.button')}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <p className="text-sm text-center w-full text-muted-foreground">
              {activeTab === "login"
                ? t('auth.register.link').split(' ')[0] + " "
                : t('auth.login.link').split(' ')[0] + " "}
              <button
                type="button"
                className="text-primary hover:underline"
                onClick={() =>
                  setActiveTab(activeTab === "login" ? "register" : "login")
                }
              >
                {activeTab === "login" 
                 ? t('auth.register.button') 
                 : t('auth.login.button')}
              </button>
            </p>
            <div className="border-t pt-2 w-full">
              <Link to="/" className="text-sm flex items-center justify-center gap-1 text-primary hover:underline">
                <BookOpen className="h-4 w-4" />
                {t('books.browse_public')}
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Right column - Hero */}
      <div className="flex-1 bg-gradient-to-br from-primary to-secondary text-white p-8 hidden lg:flex lg:flex-col lg:justify-center">
        <div className="max-w-md mx-auto">
          <h1 className="text-4xl font-bold mb-4">{t('auth.title')}</h1>
          <p className="text-lg mb-6">
            {t('auth.subtitle')}
          </p>
          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <div className="bg-white/10 p-2 rounded-full mt-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 11 12 14 22 4"></polyline>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">{t('auth.feature.book_management')}</h3>
                <p className="text-white/80 text-sm">
                  {t('auth.feature.book_management.desc')}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="bg-white/10 p-2 rounded-full mt-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">{t('auth.feature.search')}</h3>
                <p className="text-white/80 text-sm">
                  {t('auth.feature.search.desc')}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="bg-white/10 p-2 rounded-full mt-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">{t('auth.feature.borrowing')}</h3>
                <p className="text-white/80 text-sm">
                  {t('auth.feature.borrowing.desc')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
