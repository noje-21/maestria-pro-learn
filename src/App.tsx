import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense, memo } from "react";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";

// Lazy load pages for better performance
const Landing = lazy(() => import("./pages/Landing"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Lesson = lazy(() => import("./pages/Lesson"));
const Exam = lazy(() => import("./pages/Exam"));
const Profile = lazy(() => import("./pages/Profile"));
const Certificate = lazy(() => import("./components/Certificate"));
const Admin = lazy(() => import("./pages/Admin"));
const Simposio = lazy(() => import("./pages/Simposio"));
const Courses = lazy(() => import("./pages/Courses"));
const CourseDetail = lazy(() => import("./pages/CourseDetail"));
const MyCourses = lazy(() => import("./pages/MyCourses"));
const EnrollmentSuccess = lazy(() => import("./pages/EnrollmentSuccess"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Optimized QueryClient with proper caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (previously cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Memoized loading fallback component
const PageLoader = memo(() => (
  <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
    <div className="text-center space-y-4">
      <div className="relative">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary/20 border-t-primary mx-auto"></div>
      </div>
      <p className="text-muted-foreground text-sm animate-pulse">Cargando...</p>
    </div>
  </div>
));

PageLoader.displayName = "PageLoader";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider delayDuration={300}>
      <Toaster />
      <Sonner position="top-center" richColors closeButton />
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/simposio" element={<Simposio />} />
              <Route path="/enrollment-success" element={<EnrollmentSuccess />} />
              <Route
                path="/courses" 
                element={
                  <ProtectedRoute>
                    <Courses />
                  </ProtectedRoute>
                } 
              />
              <Route
                path="/course/:id" 
                element={
                  <ProtectedRoute>
                    <CourseDetail />
                  </ProtectedRoute>
                } 
              />
              <Route
                path="/dashboard/courses" 
                element={
                  <ProtectedRoute>
                    <MyCourses />
                  </ProtectedRoute>
                } 
              />
              <Route
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/lesson/:id" 
                element={
                  <ProtectedRoute>
                    <Lesson />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/exam/:id" 
                element={
                  <ProtectedRoute>
                    <Exam />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/certificate" 
                element={
                  <ProtectedRoute>
                    <Certificate />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute>
                    <Admin />
                  </ProtectedRoute>
                } 
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
