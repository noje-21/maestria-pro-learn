import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface LearningSession {
  sessionId: string | null;
  startTime: number;
  lessonId: string | null;
  moduleId: string | null;
  courseId: string | null;
}

interface VideoProgress {
  videoId: string;
  watchedSeconds: number;
  totalSeconds: number;
  percentageWatched: number;
}

export function useLearningAnalytics(userId: string | undefined) {
  const [session, setSession] = useState<LearningSession>({
    sessionId: null,
    startTime: Date.now(),
    lessonId: null,
    moduleId: null,
    courseId: null,
  });
  const [videoProgress, setVideoProgress] = useState<Map<string, VideoProgress>>(new Map());
  const lastUpdateRef = useRef<number>(0);
  const sessionIdRef = useRef<string | null>(null);

  // Start a learning session
  const startSession = useCallback(async (
    lessonId: string, 
    moduleId: string, 
    courseId: string
  ) => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from("learning_analytics")
        .insert({
          user_id: userId,
          lesson_id: lessonId,
          module_id: moduleId,
          course_id: courseId,
          session_start: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (error) throw error;

      sessionIdRef.current = data.id;
      setSession({
        sessionId: data.id,
        startTime: Date.now(),
        lessonId,
        moduleId,
        courseId,
      });

      // Update user learning profile last_active_at
      await supabase
        .from("user_learning_profile")
        .upsert({
          user_id: userId,
          last_active_at: new Date().toISOString(),
        }, {
          onConflict: "user_id",
        });

    } catch (err) {
      console.error("Error starting learning session:", err);
    }
  }, [userId]);

  // End a learning session
  const endSession = useCallback(async () => {
    if (!userId || !sessionIdRef.current) return;

    const timeSpent = Math.floor((Date.now() - session.startTime) / 1000);
    
    try {
      // Update the session
      const videoViewsArray = Array.from(videoProgress.values()).map(v => ({
        videoId: v.videoId,
        watchedSeconds: v.watchedSeconds,
        totalSeconds: v.totalSeconds,
        percentageWatched: v.percentageWatched,
      }));
      
      await supabase
        .from("learning_analytics")
        .update({
          session_end: new Date().toISOString(),
          time_spent_seconds: timeSpent,
          video_views: videoViewsArray as unknown as any,
        })
        .eq("id", sessionIdRef.current);

      // Update daily session
      const today = new Date().toISOString().split("T")[0];
      const { data: existingSession } = await supabase
        .from("learning_sessions")
        .select("id, total_time_seconds, lessons_viewed")
        .eq("user_id", userId)
        .eq("course_id", session.courseId)
        .eq("session_date", today)
        .maybeSingle();

      if (existingSession) {
        await supabase
          .from("learning_sessions")
          .update({
            total_time_seconds: existingSession.total_time_seconds + timeSpent,
            lessons_viewed: existingSession.lessons_viewed + 1,
          })
          .eq("id", existingSession.id);
      } else {
        await supabase
          .from("learning_sessions")
          .insert({
            user_id: userId,
            course_id: session.courseId,
            session_date: today,
            total_time_seconds: timeSpent,
            lessons_viewed: 1,
          });
      }

      // Update user learning profile
      await updateLearningProfile(timeSpent);

      sessionIdRef.current = null;
      setSession({
        sessionId: null,
        startTime: Date.now(),
        lessonId: null,
        moduleId: null,
        courseId: null,
      });
      setVideoProgress(new Map());
    } catch (err) {
      console.error("Error ending learning session:", err);
    }
  }, [userId, session, videoProgress]);

  // Update learning profile with aggregated data
  const updateLearningProfile = async (additionalTime: number) => {
    if (!userId) return;

    try {
      const { data: profile } = await supabase
        .from("user_learning_profile")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      const currentHour = new Date().getHours();
      let preferredTimeSlot = "variable";
      if (currentHour >= 5 && currentHour < 12) preferredTimeSlot = "morning";
      else if (currentHour >= 12 && currentHour < 17) preferredTimeSlot = "afternoon";
      else if (currentHour >= 17 && currentHour < 22) preferredTimeSlot = "evening";
      else preferredTimeSlot = "night";

      const totalStudyMinutes = (profile?.total_study_time_minutes || 0) + Math.floor(additionalTime / 60);
      
      // Calculate streak
      const today = new Date().toISOString().split("T")[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
      
      const { data: yesterdaySession } = await supabase
        .from("learning_sessions")
        .select("id")
        .eq("user_id", userId)
        .eq("session_date", yesterday)
        .limit(1);

      let streakDays = profile?.streak_days || 0;
      let longestStreak = profile?.longest_streak || 0;

      if (yesterdaySession && yesterdaySession.length > 0) {
        streakDays += 1;
      } else {
        streakDays = 1;
      }

      if (streakDays > longestStreak) {
        longestStreak = streakDays;
      }

      // Determine learning pace
      let learningPace = "moderate";
      if (additionalTime < 300) learningPace = "quick";
      else if (additionalTime > 1800) learningPace = "thorough";

      await supabase
        .from("user_learning_profile")
        .upsert({
          user_id: userId,
          preferred_time_slot: preferredTimeSlot,
          total_study_time_minutes: totalStudyMinutes,
          avg_session_duration_minutes: Math.floor(additionalTime / 60),
          learning_pace: learningPace,
          last_active_at: new Date().toISOString(),
          streak_days: streakDays,
          longest_streak: longestStreak,
        }, {
          onConflict: "user_id",
        });
    } catch (err) {
      console.error("Error updating learning profile:", err);
    }
  };

  // Track video progress
  const trackVideoProgress = useCallback((
    videoId: string, 
    watchedSeconds: number, 
    totalSeconds: number
  ) => {
    const now = Date.now();
    // Throttle updates to once per 5 seconds
    if (now - lastUpdateRef.current < 5000) return;
    lastUpdateRef.current = now;

    setVideoProgress(prev => {
      const updated = new Map(prev);
      updated.set(videoId, {
        videoId,
        watchedSeconds,
        totalSeconds,
        percentageWatched: totalSeconds > 0 ? Math.round((watchedSeconds / totalSeconds) * 100) : 0,
      });
      return updated;
    });
  }, []);

  // Mark lesson completed with analytics
  const trackLessonCompleted = useCallback(async (lessonId: string) => {
    if (!userId || !session.courseId) return;

    try {
      const today = new Date().toISOString().split("T")[0];
      
      await supabase
        .from("learning_sessions")
        .upsert({
          user_id: userId,
          course_id: session.courseId,
          session_date: today,
          lessons_completed: 1,
        }, {
          onConflict: "user_id,course_id,session_date",
          ignoreDuplicates: false,
        });
    } catch (err) {
      console.error("Error tracking lesson completion:", err);
    }
  }, [userId, session.courseId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sessionIdRef.current) {
        endSession();
      }
    };
  }, []);

  return {
    startSession,
    endSession,
    trackVideoProgress,
    trackLessonCompleted,
    session,
    videoProgress,
  };
}

// Hook for fetching student analytics data
export function useStudentAnalyticsData(userId: string | undefined) {
  const [data, setData] = useState<{
    totalStudyMinutes: number;
    thisWeekMinutes: number;
    lastWeekMinutes: number;
    avgSessionMinutes: number;
    currentStreak: number;
    longestStreak: number;
    learningPace: string;
    preferredTime: string;
    recentActivity: Array<{ date: string; minutes: number; lessons: number }>;
    moduleTimes: Array<{ module_id: string; title: string; time_minutes: number }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [stagnationWarning, setStagnationWarning] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const loadAnalytics = async () => {
      try {
        const { data: analytics, error } = await supabase.rpc("get_student_analytics", {
          _user_id: userId,
        });

        if (error) throw error;

        if (analytics && analytics.length > 0) {
          const row = analytics[0] as any;
          setData({
            totalStudyMinutes: row.total_study_time_minutes || 0,
            thisWeekMinutes: row.this_week_minutes || 0,
            lastWeekMinutes: row.last_week_minutes || 0,
            avgSessionMinutes: row.avg_session_minutes || 0,
            currentStreak: row.current_streak || 0,
            longestStreak: row.longest_streak || 0,
            learningPace: row.learning_pace || "moderate",
            preferredTime: row.preferred_time || "variable",
            recentActivity: (row.recent_activity || []) as Array<{ date: string; minutes: number; lessons: number }>,
            moduleTimes: (row.module_times || []) as Array<{ module_id: string; title: string; time_minutes: number }>,
          });

          // Check for stagnation
          if (row.this_week_minutes === 0 && row.last_week_minutes > 0) {
            setStagnationWarning("No has estudiado esta semana. ¡Retoma tu ritmo!");
          } else if (row.this_week_minutes < row.last_week_minutes * 0.5) {
            setStagnationWarning("Tu ritmo de estudio ha bajado. ¿Necesitas ayuda?");
          }
        }
      } catch (err) {
        console.error("Error loading student analytics:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [userId]);

  return { data, loading, stagnationWarning };
}

// Hook for admin insights
export function useAdminLearningInsights() {
  const [insights, setInsights] = useState<{
    totalStudents: number;
    activeStudentsWeek: number;
    avgCompletionRate: number;
    avgTimePerCourseHours: number;
    coursesWithData: Array<{
      course_id: string;
      title: string;
      enrolled: number;
      completed: number;
      avg_progress: number;
    }>;
    difficultModules: Array<{
      module_id: string;
      title: string;
      course_title: string;
      avg_time_minutes: number;
    }>;
    stagnantUsers: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInsights = async () => {
      try {
        const { data, error } = await supabase.rpc("get_admin_learning_insights");

        if (error) throw error;

        if (data && data.length > 0) {
          const row = data[0] as any;
          setInsights({
            totalStudents: row.total_students || 0,
            activeStudentsWeek: row.active_students_week || 0,
            avgCompletionRate: row.avg_completion_rate || 0,
            avgTimePerCourseHours: row.avg_time_per_course_hours || 0,
            coursesWithData: (row.courses_with_data || []) as Array<{
              course_id: string;
              title: string;
              enrolled: number;
              completed: number;
              avg_progress: number;
            }>,
            difficultModules: (row.difficult_modules || []) as Array<{
              module_id: string;
              title: string;
              course_title: string;
              avg_time_minutes: number;
            }>,
            stagnantUsers: row.stagnant_users || 0,
          });
        }
      } catch (err) {
        console.error("Error loading admin insights:", err);
      } finally {
        setLoading(false);
      }
    };

    loadInsights();
  }, []);

  return { insights, loading };
}
