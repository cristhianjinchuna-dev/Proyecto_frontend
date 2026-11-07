import { useCallback, useMemo, useState } from 'react';

export type FormErrors<T> = Partial<Record<keyof T, string>>;

export function useForm<T extends object>(
  initialValues: T,
  validate: (values: T) => FormErrors<T>,
) {
  const [values, setValues] = useState<T>(initialValues);
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [serverErrors, setServerErrors] = useState<FormErrors<T>>({});

  // Recalculated only when values change
  const validationErrors = useMemo(() => validate(values), [validate, values]);
  const isValid = useMemo(
    () => !Object.values(validationErrors).some(Boolean),
    [validationErrors],
  );

  const setValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: true }));
    setServerErrors((prev) => ({ ...prev, [field]: undefined })); // user fixed it
  }, []);

  // On submit: mark every field as touched so all errors show up
  const validateAll = useCallback(() => {
    const allTouched = Object.fromEntries(
      Object.keys(values).map((key) => [key, true]),
    ) as Partial<Record<keyof T, boolean>>;
    setTouched(allTouched);
    return isValid;
  }, [values, isValid]);

  // Server errors win; client errors only after the field was touched
  const getError = useCallback(
    (field: keyof T) =>
      serverErrors[field] ?? (touched[field] ? validationErrors[field] : undefined),
    [serverErrors, touched, validationErrors],
  );

  // Back to the initial state (e.g. after adding an image)
  const reset = useCallback(() => {
    setValues(initialValues);
    setTouched({});
    setServerErrors({});
  }, [initialValues]);

  return { values, setValue, getError, validateAll, setServerErrors, isValid, reset };
}