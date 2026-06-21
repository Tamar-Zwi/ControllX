import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = "http://localhost:8080/api";

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.token) {
          headers.set('Authorization', `Bearer ${user.token}`);
        }
      }
      return headers;
    },
  }),
  tagTypes: ['Agent', 'Mission', 'Chat'], 

  endpoints: (builder) => ({
    
    // ==========================================
    // QUERIES (שליפת נתונים - מקבילות ל-GET)
    // ==========================================
    getAgentsByDept: builder.query<any[], string>({
      query: (dept) => `/employees/department/${dept}`,
      providesTags: ['Agent'], // אומר: המידע פה קשור לסוכנים
    }),
    getMissionsByManager: builder.query<any[], number>({
      query: (managerId) => `/missions/manager/${managerId}`,
      providesTags: ['Mission'],
    }),
    getMissions: builder.query<any[], void>({
      query: () => `/missions`,
      providesTags: ['Mission'],
    }),
    getUnreadCount: builder.query<number, { missionId: number, senderId: number, myId: number }>({
      query: ({ missionId, senderId, myId }) => `/chat/mission/${missionId}/unread?senderId=${senderId}&myId=${myId}`,
      providesTags: ['Chat'],
    }),

    // ==========================================
    // MUTATIONS (שינוי נתונים - מקבילות ל-POST/DELETE)
    // ==========================================
    
    // --- סוכנים ---
    createAgent: builder.mutation<any, { agentData: any, managerId: number }>({
      query: ({ agentData, managerId }) => ({
        url: `/employees/recruit?managerId=${managerId}`,
        method: 'POST',
        body: { ...agentData, employee_type: "AGENT" },
      }),
      // מילת הקסם: "כשאתה מסיים להוסיף, תרענן את הסוכנים על המסך"
      invalidatesTags: ['Agent'], 
    }),
    deleteAgent: builder.mutation<void, number>({
      query: (id) => ({
        url: `/employees/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Agent'],
    }),

    // --- משימות ו-AI ---
    createMission: builder.mutation<any, any>({
      query: (missionData) => ({
        url: `/missions`,
        method: 'POST',
        body: missionData,
      }),
      invalidatesTags: ['Mission'],
    }),
    completeMission: builder.mutation<any, number>({
      query: (id) => ({
        url: `/missions/${id}/complete`,
        method: 'POST',
      }),
      invalidatesTags: ['Mission'],
    }),
    deleteMission: builder.mutation<void, number>({
      query: (id) => ({
        url: `/missions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Mission'],
    }),
    summarizeMissionAI: builder.mutation<any, number>({
      query: (id) => ({
        url: `/missions/${id}/summarize`,
        method: 'POST',
      }),
      invalidatesTags: ['Mission'], // מרענן אוטומטית כדי שנראה את הסיכום
    }),
    submitReport: builder.mutation<any, { missionId: number, agentId: number, text: string }>({
      query: ({ missionId, agentId, text }) => ({
        url: `/missions/${missionId}/report?agentId=${agentId}&text=${encodeURIComponent(text)}`,
        method: 'POST',
      }),
      invalidatesTags: ['Mission'], // מרענן משימה כדי שהדיווח יופיע
    }),

    // --- צ'אט ---
    markMessagesAsRead: builder.mutation<any, { missionId: number, senderId: number, myId: number }>({
      query: ({ missionId, senderId, myId }) => ({
        url: `/chat/mission/${missionId}/read?senderId=${senderId}&myId=${myId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Chat'],
    }),
    broadcastMessage: builder.mutation<any, { missionId: number, senderId: number, text: string }>({
      query: (body) => ({
        url: `/chat/broadcast`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Chat'],
    }),

  }),
});

// Redux מייצר לנו פונקציות Hook חכמות לכל פעולה שהגדרנו:
export const { 
    useGetAgentsByDeptQuery, 
    useGetMissionsByManagerQuery,
    useGetMissionsQuery,
    useGetUnreadCountQuery,
    useCreateAgentMutation,
    useDeleteAgentMutation,
    useCreateMissionMutation,
    useCompleteMissionMutation,
    useDeleteMissionMutation,
    useSummarizeMissionAIMutation,
    useSubmitReportMutation,
    useMarkMessagesAsReadMutation,
    useBroadcastMessageMutation
} = apiSlice;