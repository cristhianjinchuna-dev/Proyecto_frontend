import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../api/auth';
import { getErrorMessage, mapFieldErrors } from '../api/errors';
import { AuthCard } from '../components/auth/AuthCard';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { TextField } from '../components/ui/TextField';
import { useForm, type FormErrors } from '../hooks/useForm';
import { PATHS } from '../routes/paths';
import { validateEmail } from '../utils/validators';

interface ForgotPasswordFormValues {
  email: string;
}

const INITIAL_VALUES: ForgotPasswordFormValues = { email: '' };

function validateForgotPasswordForm(
  values: ForgotPasswordFormValues,
): FormErrors<ForgotPasswordFormValues> {
  return { email: validateEmail(values.email) };
}

export default function ForgotPasswordPage() {
  const { values, setValue, getError, validateAll, setServerErrors } = useForm(
    INITIAL_VALUES,
    validateForgotPasswordForm,
  );
  const [submitting, setSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setGeneralError(null);
    if (!validateAll()) return;

    setSubmitting(true);
    try {
      await forgotPassword({ correo: values.email.trim().toLowerCase() });
      setSent(true);
    } catch (error) {
      setServerErrors(mapFieldErrors(error, { correo: 'email' }));
      setGeneralError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  const backToLogin = (
    <Link to={PATHS.login} className="font-medium text-blue-600 hover:underline">
      ← Volver a iniciar sesión
    </Link>
  );

  if (sent) {
    return (
      <AuthCard title="Revisa tu correo" footer={backToLogin}>
        <Alert variant="success">
          Si <strong>{values.email.trim()}</strong> está registrado, te enviamos un enlace para
          restablecer tu contraseña. Vence en 15 minutos. Revisa también tu carpeta de spam.
        </Alert>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="¿Olvidaste tu contraseña?"
      subtitle="Ingresa tu correo y te enviaremos un enlace para crear una nueva"
      footer={backToLogin}
    >
      {generalError && <Alert variant="error">{generalError}</Alert>}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <TextField
          label="Correo"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="tu@correo.com"
          value={values.email}
          onChange={(e) => setValue('email', e.target.value)}
          error={getError('email')}
        />
        <Button type="submit" loading={submitting}>
          {submitting ? 'Enviando...' : 'Enviar enlace'}
        </Button>
      </form>
    </AuthCard>
  );
}