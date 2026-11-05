import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../api/auth';
import { getErrorMessage, getErrorStatus, mapFieldErrors } from '../api/errors';
import { AuthCard } from '../components/auth/AuthCard';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { TextField } from '../components/ui/TextField';
import { useForm, type FormErrors } from '../hooks/useForm';
import { PATHS } from '../routes/paths';
import { validatePassword } from '../utils/validators';

interface ResetPasswordFormValues {
  password: string;
  confirmPassword: string;
}

const INITIAL_VALUES: ResetPasswordFormValues = { password: '', confirmPassword: '' };

function validateResetPasswordForm(
  values: ResetPasswordFormValues,
): FormErrors<ResetPasswordFormValues> {
  let confirmPassword: string | undefined;
  if (!values.confirmPassword) confirmPassword = 'Confirma tu contraseña';
  else if (values.confirmPassword !== values.password) confirmPassword = 'Las contraseñas no coinciden';

  return { password: validatePassword(values.password), confirmPassword };
}

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token'); // comes from the email link: /reset-password?token=...

  const { values, setValue, getError, validateAll, setServerErrors } = useForm(
    INITIAL_VALUES,
    validateResetPasswordForm,
  );
  const [submitting, setSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [tokenExpired, setTokenExpired] = useState(false);

  const requestNewLink = (
    <Link to={PATHS.forgotPassword} className="font-medium text-blue-600 hover:underline">
      Solicitar un nuevo enlace
    </Link>
  );

  if (!token || tokenExpired) {
    return (
      <AuthCard title="Enlace inválido o expirado" footer={requestNewLink}>
        <Alert variant="error">
          Este enlace para restablecer la contraseña no es válido o ya venció (dura 15 minutos).
        </Alert>
      </AuthCard>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setGeneralError(null);
    if (!validateAll() || !token) return;

    setSubmitting(true);
    try {
      await resetPassword({ token, nuevaContrasena: values.password });
      navigate(PATHS.login, {
        replace: true,
        state: { message: 'Tu contraseña fue actualizada. Ya puedes iniciar sesión.' },
      });
    } catch (error) {
      if (getErrorStatus(error) === 401) {
        setTokenExpired(true); // invalid or expired token
        return;
      }
      setServerErrors(mapFieldErrors(error, { nuevaContrasena: 'password' }));
      setGeneralError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard title="Crea una nueva contraseña" subtitle="Elige una contraseña segura para tu cuenta">
      {generalError && <Alert variant="error">{generalError}</Alert>}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <TextField
          label="Nueva contraseña"
          name="password"
          type="password"
          autoComplete="new-password"
          hint="8 a 64 caracteres, con mayúscula, minúscula, número y símbolo"
          value={values.password}
          onChange={(e) => setValue('password', e.target.value)}
          error={getError('password')}
        />
        <TextField
          label="Confirmar contraseña"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={values.confirmPassword}
          onChange={(e) => setValue('confirmPassword', e.target.value)}
          error={getError('confirmPassword')}
        />
        <Button type="submit" loading={submitting}>
          {submitting ? 'Guardando...' : 'Cambiar contraseña'}
        </Button>
      </form>
    </AuthCard>
  );
}