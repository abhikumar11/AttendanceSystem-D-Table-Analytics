import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery,
  tagTypes: ["Attendance", "Overtime", "User", "Report"],
  endpoints: (builder) => ({
    
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
    }),
 assignManager: builder.mutation({
  query: (data) => ({
    url: '/admin/assign-manager',
    method: 'PUT',
    body: data,
  }),
  invalidatesTags: ['User'],
}),
    punchIn: builder.mutation({
      query: (data) => ({
        url: '/attendance/punch-in',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Attendance'],
    }),
    punchOut: builder.mutation({
      query: (data) => ({
        url: '/attendance/punch-out',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Attendance'],
    }),
    getMyAttendance: builder.query({
      query: () => '/attendance/me',
      providesTags: ['Attendance'],
    }),
    getTeamAttendance: builder.query({
      query: () => '/attendance/team',
      providesTags: ['Attendance'],
    }),
    validateAttendance: builder.mutation({
      query: ({ id, data }) => ({
        url: `/attendance/${id}/validate`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Attendance'],
    }),

    requestOvertime: builder.mutation({
      query: (data) => ({
        url: '/overtime/request',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Overtime', 'Attendance'],
    }),
    getPendingOvertime: builder.query({
      query: () => '/overtime/pending',
      providesTags: ['Overtime'],
    }),
    getMyOvertime: builder.query({
      query: () => '/overtime/mine',
      providesTags: ['Overtime'],
    }),
    reviewOvertime: builder.mutation({
      query: ({ id, status }) => ({
        url: `/overtime/${id}`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['Overtime', 'Attendance'],
    }),

    getDailyReport: builder.query({
      query: (params) => ({
        url: '/reports/daily',
        params,
      }),
      providesTags: ['Report'],
    }),

    getAllUsers: builder.query({
      query: () => '/admin/users',
      providesTags: ['User'],
    }),
    getSystemAttendance: builder.query({
      query: () => '/admin/attendance',
      providesTags: ['Attendance'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useAssignManagerMutation,
  usePunchInMutation,
  usePunchOutMutation,
  useGetMyAttendanceQuery,
  useGetTeamAttendanceQuery,
  useValidateAttendanceMutation,
  useRequestOvertimeMutation,
  useGetPendingOvertimeQuery,
  useGetMyOvertimeQuery,
  useReviewOvertimeMutation,
  useGetDailyReportQuery,
  useGetAllUsersQuery,
  useGetSystemAttendanceQuery,
} = apiSlice;
