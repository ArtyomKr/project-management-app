import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  IBoard,
  IBoardData,
  IColumn,
  IColumnData,
  ISignInRequest,
  ISignInResponse,
  ISignUpRequest,
  ITask,
  ITaskRequest,
  IUserData,
} from '../models';
import { authSlice } from '../store/reducers/auth';
import { RootState } from '../store';

const BASE_URL = 'https://cream-task-app.herokuapp.com/';

const appApi = createApi({
  reducerPath: 'appApi',
  tagTypes: ['Users', 'Boards', 'Columns', 'Tasks', 'Board'],
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).authSlice.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    signUp: builder.mutation<IUserData, ISignUpRequest>({
      query: (body) => ({
        url: '/signup',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Users'],
    }),
    signIn: builder.mutation<ISignInResponse, ISignInRequest>({
      query: (body) => ({
        url: '/signin',
        method: 'POST',
        body,
      }),
      async onQueryStarted({ login }, { dispatch }) {
        dispatch(authSlice.actions.changeLogin(login));
      },
    }),
    getAllUsers: builder.query<IUserData[], void>({
      query: () => ({ url: '/users' }),
      providesTags: ['Users'],
    }),
    getUser: builder.query<IUserData, string>({
      query: (id) => ({ url: `/users/${id}` }),
    }),
    deleteUser: builder.mutation<void, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Users'],
    }),
    editUser: builder.mutation<ISignUpRequest, { id: string; body: ISignUpRequest }>({
      query: ({ id, body }) => ({
        url: `/users/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Users'],
    }),
    getAllBoards: builder.query<IBoard[], void>({
      query: () => ({ url: '/boards' }),
      providesTags: ['Boards'],
    }),
    createBoard: builder.mutation<IBoard, Omit<IBoard, 'id'>>({
      query: (body) => ({
        url: '/boards',
        method: 'POST',
        body: body,
      }),
      async onQueryStarted({ title, description }, { dispatch, queryFulfilled }) {
        const addResult = dispatch(
          appApi.util.updateQueryData('getAllBoards', undefined, (draft) => {
            draft.push({ id: String(Date.now()), title, description });
          })
        );
        queryFulfilled.catch(addResult.undo);
      },
      invalidatesTags: ['Boards'],
    }),
    getBoard: builder.query<IBoardData, string>({
      query: (id: string) => ({ url: `/boards/${id}` }),
      providesTags: ['Board'],
    }),
    deleteBoard: builder.mutation<void, string>({
      query: (id: string) => ({
        url: `/boards/${id}`,
        method: 'DELETE',
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const deleteResult = dispatch(
          appApi.util.updateQueryData('getAllBoards', undefined, (draft) =>
            draft.filter((el) => el.id !== id)
          )
        );
        queryFulfilled.catch(deleteResult.undo);
      },
      invalidatesTags: ['Boards'],
    }),
    editBoard: builder.mutation<IBoard, IBoard>({
      query: ({ id, title, description }) => ({
        url: `/boards/${id}`,
        method: 'PUT',
        body: { title, description },
      }),
      async onQueryStarted({ id, title, description }, { dispatch, queryFulfilled }) {
        const editResult = dispatch(
          appApi.util.updateQueryData('getAllBoards', undefined, (draft) =>
            draft.map((el) => (el.id === id ? { id, title, description } : el))
          )
        );
        queryFulfilled.catch(editResult.undo);
      },
      invalidatesTags: ['Boards'],
    }),
    getAllColumns: builder.query<IColumn[], string>({
      query: (boardId) => ({ url: `/boards/${boardId}/columns` }),
      providesTags: ['Columns'],
    }),
    createColumn: builder.mutation<IColumn, { id: string; body: { title: string } }>({
      query: ({ id, body }) => ({
        url: `/boards/${id}/columns`,
        method: 'POST',
        body,
      }),
      async onQueryStarted({ id, body }, { dispatch, queryFulfilled }) {
        const addResult = dispatch(
          appApi.util.updateQueryData('getBoard', id, (draft) => {
            const id = String(Date.now());
            draft.columns.push({ id, order: 999, tasks: [], ...body });
          })
        );
        queryFulfilled.catch(addResult.undo);
      },
      invalidatesTags: ['Board'],
    }),
    getColumn: builder.query<IColumnData, { boardId: string; columnId: string }>({
      query: ({ boardId, columnId }) => ({ url: `/boards/${boardId}/columns/${columnId}` }),
    }),
    deleteColumn: builder.mutation<void, { boardId: string; columnId: string }>({
      query: ({ boardId, columnId }) => ({
        url: `/boards/${boardId}/columns/${columnId}`,
        method: 'DELETE',
      }),
      onQueryStarted({ boardId, columnId }, { dispatch, queryFulfilled }) {
        const deleteResult = dispatch(
          appApi.util.updateQueryData('getBoard', boardId, (draft) => {
            draft.columns = draft.columns.filter((el) => el.id !== columnId);
          })
        );
        queryFulfilled.catch(deleteResult.undo);
      },
      invalidatesTags: ['Board'],
    }),
    editColumn: builder.mutation<
      IColumn,
      { boardId: string; columnId: string; body: Omit<IColumn, 'id'> }
    >({
      query: ({ boardId, columnId, body }) => ({
        url: `/boards/${boardId}/columns/${columnId}`,
        method: 'PUT',
        body: body,
      }),
      onQueryStarted({ boardId, columnId, body }, { dispatch, queryFulfilled }) {
        const editResult = dispatch(
          appApi.util.updateQueryData('getBoard', boardId, (draft) => {
            const id = String(Date.now());
            const column = draft.columns.find((el) => el.id === columnId);
            const tasks = column?.tasks || [];
            draft.columns = draft.columns.map((el) =>
              el.id === columnId ? { id, tasks, ...body } : el
            );
          })
        );
        queryFulfilled.catch(editResult.undo);
      },
      invalidatesTags: ['Board'],
    }),
    getAllTasks: builder.query<ITask[], { boardId: string; columnId: string }>({
      query: ({ boardId, columnId }) => ({
        url: `/boards/${boardId}/columns/${columnId}/tasks`,
      }),
      providesTags: ['Tasks'],
    }),
    createTask: builder.mutation<ITask, { boardId: string; columnId: string; body: ITaskRequest }>({
      query: ({ boardId, columnId, body }) => ({
        url: `/boards/${boardId}/columns/${columnId}/tasks`,
        method: 'POST',
        body,
      }),
      onQueryStarted({ boardId, columnId, body }, { dispatch, queryFulfilled }) {
        const addResult = dispatch(
          appApi.util.updateQueryData('getBoard', boardId, (draft) => {
            const id = String(Date.now());
            draft.columns.forEach((el) => {
              if (el.id === columnId) el.tasks.push({ id, order: 999, files: [], ...body });
            });
          })
        );
        queryFulfilled.catch(addResult.undo);
      },
      invalidatesTags: ['Board'],
    }),
    getTask: builder.query<ITask, { boardId: string; columnId: string; taskId: string }>({
      query: ({ boardId, columnId, taskId }) => ({
        url: `/boards/${boardId}/columns/${columnId}/tasks/${taskId}`,
      }),
    }),
    deleteTask: builder.mutation<void, { boardId: string; columnId: string; taskId: string }>({
      query: ({ boardId, columnId, taskId }) => ({
        url: `/boards/${boardId}/columns/${columnId}/tasks/${taskId}`,
        method: 'DELETE',
      }),
      onQueryStarted({ boardId, columnId, taskId }, { dispatch, queryFulfilled }) {
        const deleteResult = dispatch(
          appApi.util.updateQueryData('getBoard', boardId, (draft) => {
            draft.columns.forEach((el) => {
              if (el.id === columnId) el.tasks = el.tasks.filter((task) => task.id !== taskId);
            });
          })
        );
        queryFulfilled.catch(deleteResult.undo);
      },
      invalidatesTags: ['Board'],
    }),
    editTask: builder.mutation<
      ITask,
      { boardId: string; columnId: string; taskId: string; body: Omit<ITask, 'id'> }
    >({
      query: ({ boardId, columnId, taskId, body }) => ({
        url: `/boards/${boardId}/columns/${columnId}/tasks/${taskId}`,
        method: 'PUT',
        body: body,
      }),
      onQueryStarted({ boardId, columnId, taskId, body }, { dispatch, queryFulfilled }) {
        const editResult = dispatch(
          appApi.util.updateQueryData('getBoard', boardId, (draft) => {
            const id = String(Date.now());
            draft.columns.forEach((el) => {
              if (el.id === columnId)
                el.tasks = el.tasks.map((task) =>
                  task.id === taskId ? { id, files: [], ...body } : task
                );
            });
          })
        );
        queryFulfilled.catch(editResult.undo);
      },
      invalidatesTags: ['Board'],
    }),
    uploadFile: builder.mutation<void, {  taskId: string, file: BinaryData }>({
      query: (body) => ({
        url: `/file`,
        headers: {
          'content-type': 'multipart/form-data',
        },
        method: 'POST',
        body: body,
      }),
    }),
    getFile: builder.query<BinaryData, { taskId: string; filename: string }>({
      query: ({ taskId, filename }) => ({
        url: `/file/${taskId}/${filename}`,
      }),
    }),
  }),
});

const {
  useSignUpMutation,
  useSignInMutation,
  useGetAllUsersQuery,
  useGetUserQuery,
  useDeleteUserMutation,
  useEditUserMutation,
  useGetAllBoardsQuery,
  useCreateBoardMutation,
  useGetBoardQuery,
  useDeleteBoardMutation,
  useEditBoardMutation,
  useGetAllColumnsQuery,
  useCreateColumnMutation,
  useGetColumnQuery,
  useDeleteColumnMutation,
  useEditColumnMutation,
  useGetAllTasksQuery,
  useCreateTaskMutation,
  useGetTaskQuery,
  useDeleteTaskMutation,
  useEditTaskMutation,
  useUploadFileMutation,
  useGetFileQuery,
} = appApi;

export {
  appApi,
  useSignUpMutation,
  useSignInMutation,
  useGetAllUsersQuery,
  useGetUserQuery,
  useDeleteUserMutation,
  useEditUserMutation,
  useGetAllBoardsQuery,
  useCreateBoardMutation,
  useGetBoardQuery,
  useDeleteBoardMutation,
  useEditBoardMutation,
  useGetAllColumnsQuery,
  useCreateColumnMutation,
  useGetColumnQuery,
  useDeleteColumnMutation,
  useEditColumnMutation,
  useGetAllTasksQuery,
  useCreateTaskMutation,
  useGetTaskQuery,
  useDeleteTaskMutation,
  useEditTaskMutation,
  useUploadFileMutation,
  useGetFileQuery,
};
