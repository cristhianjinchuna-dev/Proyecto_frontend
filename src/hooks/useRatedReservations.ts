import { useMemo } from 'react';
import { getStudentRatings } from '../api/ratings';
import { useFetch } from './useFetch';

// The reservation DTO doesn't say if it was already rated, so we read the
// student's ratings (EP 029, up to 100) and collect their reservaId
export function useRatedReservations(studentId: number) {
  const { data, reload } = useFetch(
    (signal) => getStudentRatings(studentId, { page: 0, size: 100 }, signal),
    [studentId],
  );

  const ratedIds = useMemo(
    () => new Set(data?.content.map((rating) => rating.reservaId) ?? []),
    [data],
  );

  return { ratedIds, reload };
}